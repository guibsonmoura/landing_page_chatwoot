import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const apiKey = process.env.WHATSAPP_WEBHOOK_API_KEY;
  const apiKeyHeader = request.headers.get('apikey');

  try {
    let tenant_id: string | null = null;
    const body = await request.json();
    logger.debug('WhatsApp proxy request received', {
      hasBody: !!body,
      bodyKeys: body ? Object.keys(body) : [],
      endpoint: body?.endpoint || 'unknown'
    });

    // Prioriza autenticação por API Key para webhooks externos
    if (apiKeyHeader && apiKeyHeader === apiKey) {
      logger.debug('API Key authentication successful');
      // Para webhooks, o tenant_id deve vir no corpo da requisição
      if (body.tenant_id) {
        tenant_id = body.tenant_id;
        logger.debug('Tenant ID obtained from webhook', { hasTenantId: !!tenant_id });
      } else {
        logger.warn('Webhook authenticated but missing tenant_id in body');
        // Dependendo da lógica, pode ser um erro
      }
    } else {
      // Fallback para autenticação de usuário (chamadas do frontend)
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        logger.error('User authentication failed', { hasError: !!authError });
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }
      logger.debug('User authenticated successfully', { hasUserId: !!user.id });

      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (tenantError || !tenantData) {
        logger.error('Failed to fetch tenant for user', { hasError: !!tenantError });
        return NextResponse.json({ error: 'Tenant não encontrado.' }, { status: 500 });
      }
      tenant_id = tenantData.id;
      logger.debug('Tenant ID obtained from user', { hasTenantId: !!tenant_id });
    }

    // Se nenhum método de autenticação funcionou ou tenant_id não foi encontrado
    if (!tenant_id) {
        logger.error('Unable to determine tenant_id - access denied');
        return NextResponse.json({ error: 'Não autorizado: tenant_id ausente.' }, { status: 401 });
    }

    const baseUrl = process.env.WHATSAPP_WEBHOOK_URL;

    // Validação crítica das variáveis de ambiente
    if (!baseUrl || !apiKey) {
      logger.error('Critical error: WhatsApp webhook environment variables not configured');
      return NextResponse.json({ error: 'Configuração do servidor incompleta para o serviço de WhatsApp.' }, { status: 500 });
    }

    logger.debug('WhatsApp webhook environment variables loaded');

    const webhookUrl = `${baseUrl}/${body.endpoint}`;
    logger.debug('Dispatching webhook request', { 
      hasWebhookUrl: !!webhookUrl,
      endpoint: body.endpoint || 'unknown'
    });
    const webhookPayload = { ...body, tenant_id };
    // logger.info({ webhookUrl, webhookPayload }, '[WHATSAPP_PROXY] Disparando webhook.');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('Webhook request failed', {
        status: response.status,
        statusText: response.statusText,
        hasErrorBody: !!errorBody
      });
      return NextResponse.json({ error: 'Falha ao comunicar com o serviço de WhatsApp.', details: errorBody }, { status: response.status });
    }

    const responseData = await response.json();
    logger.info('Webhook request completed successfully', {
      hasResponseData: !!responseData,
      responseKeys: responseData ? Object.keys(responseData) : []
    });

    return NextResponse.json(responseData);

  } catch (error) {
    logger.error('Unexpected error in route handler', { hasError: !!error });
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}