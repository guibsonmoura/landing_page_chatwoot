'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import logger from '@/lib/logger';

/**
 * Busca todos os agentes disponíveis para o tenant atual
 */
export async function getAgentsForKnowledgeBase() {
  const supabase = await createClient();

  try {
    // Obter o usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Obter o tenant_id do usuário
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenantData) {
      return { data: null, error: 'Erro ao obter informações do tenant.' };
    }

    // Buscar todos os agentes do tenant
    const { data: agents, error: agentsError } = await supabase
      .from('tenant_agents')
      .select('id, agent_name')
      .eq('tenant_id', tenantData.id)
      .eq('is_active', true)
      .order('agent_name');

    if (agentsError) {
      return { data: null, error: 'Erro ao buscar agentes.' };
    }

    return { data: agents, error: null };
  } catch (error: any) {
    logger.error('Failed to fetch agents for knowledge base', error);
    return { data: null, error: error.message || 'Erro desconhecido ao buscar agentes.' };
  }
}

/**
 * Atualiza o vínculo entre uma base de conhecimento e um agente
 */
export async function updateKnowledgeBaseAgent(knowledgeBaseId: number, agentId: string | null) {
  const supabase = await createClient();

  try {
    // Obter o usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Obter o tenant_id do usuário
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenantData) {
      return { error: 'Erro ao obter informações do tenant.' };
    }

    // Atualizar o registro da base de conhecimento
    const { error: updateError } = await supabase
      .from('tenant_agents_rag')
      .update({ agent_id: agentId })
      .eq('id', knowledgeBaseId)
      .eq('tenant_id', tenantData.id); // Garantir que o registro pertence ao tenant

    if (updateError) {
      return { error: 'Erro ao atualizar vínculo com agente.' };
    }

    // Revalidar o caminho para atualizar a UI
    revalidatePath('/dashboard/knowledge-base');
    return { success: true, error: null };
  } catch (error: any) {
    logger.error('Failed to update agent knowledge base link', error);
    return { error: error.message || 'Erro desconhecido ao atualizar vínculo.' };
  }
}
