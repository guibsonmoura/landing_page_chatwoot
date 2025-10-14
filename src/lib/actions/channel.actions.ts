// src/lib/actions/channel.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import logger from '@/lib/logger';

// Esquema de validação para a criação de um canal
// Baseado na tabela e no planning.md
const createChannelSchema = z.object({
  platform: z.string().min(1, 'A plataforma é obrigatória.'),
  account: z.string().min(1, 'A conta é obrigatória.'),
  config: z.string().min(2, 'A configuração JSON é obrigatória.').refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: 'A configuração deve ser um JSON válido.' }),
  agent_id: z.string().uuid().optional(), // Opcional
});

export async function createChannel(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  try {
    // 1. Validar e extrair dados
    const validatedFields = createChannelSchema.safeParse({
      platform: formData.get('platform'),
      account: formData.get('account'),
      config: formData.get('config'),
      agent_id: formData.get('agent_id') || undefined,
    });

    if (!validatedFields.success) {
      throw new Error('Dados do formulário inválidos.');
    }

    const { platform, account, agent_id } = validatedFields.data;
    const config = JSON.parse(validatedFields.data.config);

    // 2. Obter usuário e tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id, plans(plan_features)')
      .eq('user_id', user.id)
      .single();

    if (tenantError) throw new Error(`Erro ao buscar tenant: ${tenantError.message}`);
    if (!tenantData) throw new Error('Tenant não encontrado para o usuário.');

    // 3. Extrair dados do plano
    let planFeatures = null;
    let planData = null;
    
    if (Array.isArray(tenantData.plans)) {
      planData = tenantData.plans[0];
    } else if (tenantData.plans) {
      planData = tenantData.plans as any; // Type assertion para evitar erros de tipagem
    }
    
    if (planData) {
      planFeatures = planData.plan_features;
    }
    
    // Verificar canais permitidos
    const allowed_channels = planFeatures?.allowed_channels as string[];
    if (!allowed_channels || !Array.isArray(allowed_channels)) {
      throw new Error('Não foi possível determinar os canais permitidos para o seu plano.');
    }
    
    if (!allowed_channels.includes(platform)) {
      throw new Error(`Seu plano não permite a criação de canais da plataforma "${platform}".`);
    }
    
    // 4. Verificar limite de canais
    const max_channel = planFeatures?.max_channel;
    if (typeof max_channel !== 'number') {
      throw new Error('Não foi possível determinar o limite de canais para o seu plano.');
    }
    
    // Contar canais existentes
    const { count, error: countError } = await supabase
      .from('tenant_channels')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantData.id);
      
    if (countError) {
      throw new Error('Erro ao contar o número de canais existentes.');
    }
    
    if (count !== null && count >= max_channel) {
      throw new Error(`Limite de ${max_channel} canais atingido. Faça um upgrade do seu plano para criar mais.`);
    }

    // 5. Criar o canal
    const { data: newChannel, error: createError } = await supabase
      .from('tenant_channels')
      .insert({
        tenant_id: tenantData.id,
        platform,
        account,
        config,
        agent_id: agent_id || null,
      })
      .select()
      .single();

    if (createError) {
      logger.error('Failed to create channel', createError);
      throw new Error(`Erro ao criar o canal no DB: ${createError.message}`);
    }
    if (!newChannel) throw new Error('A criação do canal não retornou os dados esperados.');

    // 5. Acionar webhook (opcional)
    const webhookUrl = process.env.N8N_PROVISIONING_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: newChannel.id,
          channel_name: `${platform} - ${account}`,
          tenant_id: newChannel.tenant_id,
          config: newChannel.config,
        }),
      }).catch(err => logger.error('[Action] Erro não bloqueante no webhook:', err));
    }

    return { success: true, data: newChannel };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}


const updateChannelSchema = createChannelSchema.extend({
  id: z.string().uuid('ID do canal inválido.'),
});

export async function updateChannel(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  try {
    // 1. Validar dados
    const validatedFields = updateChannelSchema.safeParse({
      id: formData.get('id'),
      platform: formData.get('platform'),
      account: formData.get('account'),
      config: formData.get('config'),
      agent_id: formData.get('agent_id') || undefined,
    });

    if (!validatedFields.success) {
      throw new Error('Dados do formulário inválidos para atualização.');
    }

    const { id, account, agent_id } = validatedFields.data;
    const config = JSON.parse(validatedFields.data.config);

    // 2. Verificar propriedade (mesma lógica do delete)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: channelData } = await supabase
      .from('tenant_channels')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (!channelData || !channelData.tenant_id) throw new Error('Canal não encontrado.');

    const { data: tenantData } = await supabase
      .from('tenants')
      .select('user_id')
      .eq('id', channelData.tenant_id)
      .single();

    if (tenantData?.user_id !== user.id) {
      throw new Error('Acesso negado.');
    }

    // 3. Atualizar o canal
    const { data: updatedChannel, error: updateError } = await supabase
      .from('tenant_channels')
      .update({
        account,
        config,
        agent_id: agent_id || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update channel', updateError);
      throw new Error(`Erro ao atualizar o canal: ${updateError.message}`);
    }

    // 4. Revalidar cache
    revalidatePath('/dashboard/channels');

    return { success: true, data: updatedChannel };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

const deleteChannelSchema = z.object({
  id: z.string().uuid('ID do canal inválido.'),
});

export async function deleteChannel(id: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  try {
    // 1. Validar o ID
    const validatedFields = deleteChannelSchema.safeParse({ id });
    if (!validatedFields.success) {
      throw new Error('ID do canal inválido.');
    }

    // 2. Obter o usuário para garantir a propriedade
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // 3. Verificar a propriedade do canal (segurança extra)
    // A RLS do Supabase já protege contra acesso indevido, mas esta verificação explícita é uma boa prática.
    const { data: channelData, error: channelError } = await supabase
      .from('tenant_channels')
      .select('tenant_id')
      .eq('id', validatedFields.data.id)
      .single();

    if (channelError) throw new Error(`Erro ao buscar o canal: ${channelError.message}`);
    if (!channelData || !channelData.tenant_id) throw new Error('Canal ou tenant associado não encontrado.');

    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('user_id')
      .eq('id', channelData.tenant_id)
      .single();

    if (tenantError) throw new Error(`Erro ao buscar o tenant: ${tenantError.message}`);
    if (!tenantData) throw new Error('Tenant não encontrado.');

    if (tenantData.user_id !== user.id) {
      throw new Error('Acesso negado. Você não tem permissão para deletar este canal.');
    }

    // 4. Deletar o canal
    const { error: deleteError } = await supabase
      .from('tenant_channels')
      .delete()
      .eq('id', validatedFields.data.id);

    if (deleteError) {
      logger.error('Failed to delete channel', deleteError);
      throw new Error(`Erro ao deletar o canal: ${deleteError.message}`);
    }

    // 5. Revalidar o cache da página para refletir a mudança
    revalidatePath('/dashboard/channels');

    return { success: true };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function getChannels() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  try {
    // A RLS já garante a segurança, mas a consulta explícita é uma boa prática.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // A consulta também popula o nome do agente associado
    const { data: channels, error: channelsError } = await supabase
      .from('tenant_channels')
      .select(`
        *,
        agent:tenant_agents (*,
          knowledge_bases:tenant_agents_rag (*)
        )
      `)
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (channelsError) {
      logger.error('Failed to fetch channels', channelsError);
      throw new Error(`Erro ao buscar canais: ${channelsError.message}`);
    }

    return { data: channels };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}
