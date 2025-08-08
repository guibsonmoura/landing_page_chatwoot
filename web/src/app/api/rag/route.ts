import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    const { tenant_agents_rag_id } = await request.json();
    if (!tenant_agents_rag_id) {
      logger.warn('[RAG_API] tenant_agents_rag_id não foi fornecido no corpo da requisição.');
      return NextResponse.json({ error: 'ID do RAG do agente não fornecido' }, { status: 400 });
    }
    logger.info(`[RAG_API] Iniciando processo de RAG para o agente: ${tenant_agents_rag_id}`);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error({ err: authError }, '[RAG_API] Falha na autenticação.');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    logger.debug(`[RAG_API] Usuário autenticado: ${user.id}`);

    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenantData) {
      logger.error({ err: tenantError }, '[RAG_API] Erro ao buscar tenant para o usuário.');
      return NextResponse.json({ error: 'Tenant não encontrado para este usuário.' }, { status: 500 });
    }
    const tenant_id = tenantData.id;
    logger.debug(`[RAG_API] Tenant ID obtido: ${tenant_id}`);

    const { data: documentData, error: documentError } = await supabase
      .from('tenant_agents_rag')
      .select('id')
      .eq('id', tenant_agents_rag_id)
      .eq('tenant_id', tenant_id) // Garante que o documento pertence ao tenant
      .single();

    if (documentError || !documentData) {
      logger.error({ err: documentError }, '[RAG_API] Agente RAG não encontrado ou sem permissão.');
      return NextResponse.json({ error: 'Agente RAG não encontrado ou sem permissão' }, { status: 404 });
    }
    logger.info(`[RAG_API] Agente RAG validado com sucesso: ${documentData.id}`);

    const { error: updateError } = await supabase
      .from('tenant_agents_rag')
      .update({ status: 'processing' })
      .eq('id', tenant_agents_rag_id);

    if (updateError) {
      logger.error({ err: updateError }, '[RAG_API] Erro ao atualizar status para processing.');
      return NextResponse.json({ error: 'Erro ao atualizar status do agente RAG' }, { status: 500 });
    }
    logger.info(`[RAG_API] Status do agente RAG atualizado para "processing".`);

    const baseUrl = process.env.WHATSAPP_WEBHOOK_URL;
    const apiKey = process.env.WHATSAPP_WEBHOOK_API_KEY;

    if (!baseUrl || !apiKey) {
      logger.error('[RAG_API_ERROR] Variáveis de ambiente para o webhook não configuradas.');
      // Reverte o status para 'pending' se a configuração do webhook falhar
      await supabase.from('tenant_agents_rag').update({ status: 'pending' }).eq('id', tenant_agents_rag_id);
      return NextResponse.json({ error: 'Configuração do servidor para o webhook está incompleta.' }, { status: 500 });
    }

    const webhookUrl = `${baseUrl}/rag`;
    const webhookPayload = { tenant_id, tenant_agent_id: tenant_agents_rag_id };
    logger.info({ webhookUrl, webhookPayload }, '[RAG_API] Disparando webhook.');

    // Dispara o webhook sem esperar pela resposta (fire-and-forget)
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify(webhookPayload),
    }).catch(fetchError => {
      logger.error({ err: fetchError }, '[RAG_API] Falha na chamada fetch ao webhook. O processamento pode não ocorrer.');
    });

    logger.info('[RAG_API] Webhook invocado. Retornando 202 Accepted para o cliente.');
    return NextResponse.json({ message: 'Solicitação de processamento recebida.' }, { status: 202 });

  } catch (error) {
    logger.error({ err: error }, '[RAG_API_ERROR] Erro inesperado no handler da rota.');
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}