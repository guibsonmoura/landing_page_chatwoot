// src/lib/actions/agent.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import logger from '@/lib/logger';
import { z } from 'zod';

// Esquema de validação para a criação de um agente
const createAgentSchema = z.object({
  agent_name: z.string().min(3, 'O nome do agente deve ter pelo menos 3 caracteres.'),
  system_prompt: z.string().min(10, 'O prompt do sistema deve ter pelo menos 10 caracteres.'),
  // Dados opcionais do wizard
  wizardData: z.any().optional(),
});

export async function createAgent(formData: FormData | { agent_name: string, system_prompt: string, wizardData?: any }) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  // 1. Validar e extrair dados do formulário
  let validatedFields;
  
  if (formData instanceof FormData) {
    validatedFields = createAgentSchema.safeParse({
      agent_name: formData.get('agent_name'),
      system_prompt: formData.get('system_prompt'),
      wizardData: formData.get('wizardData') ? JSON.parse(String(formData.get('wizardData'))) : undefined,
    });
  } else {
    validatedFields = createAgentSchema.safeParse({
      agent_name: formData.agent_name,
      system_prompt: formData.system_prompt,
      wizardData: formData.wizardData,
    });
  }

  if (!validatedFields.success) {
    return {
      error: 'Dados inválidos.',
      errorDetails: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { agent_name, system_prompt, wizardData } = validatedFields.data;

  try {
    // 2. Obter o usuário e o tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('id, plans ( plan_features )')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenantData) {
      return { error: 'Erro ao obter informações do plano.' };
    }

    // 3. Validar o limite de agentes de forma robusta
    // Lida com a inconsistência entre o tipo (array) e o retorno em tempo de execução (objeto).
    let planFeatures = null;
    let planData = null;
    
    if (Array.isArray(tenantData.plans)) {
      // O tipo está correto, pegamos o primeiro elemento do array.
      planData = tenantData.plans[0];
    } else if (tenantData.plans) {
      // O tipo está incorreto, mas o valor é um objeto. Usamos diretamente.
      planData = tenantData.plans as any; // Type assertion para evitar erros de tipagem
    }
    
    if (planData) {
      planFeatures = planData.plan_features;
    }
    
    // Usar a nova estrutura do plano
    const max_agents = planFeatures?.max_agents;

    if (typeof max_agents !== 'number') {
      return { error: 'Não foi possível determinar o limite de agentes para o seu plano.' };
    }

    // 4. Verificar o número de agentes existentes
    const { count, error: countError } = await supabase
      .from('tenant_agents')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantData.id);

    if (countError) {
      throw new Error('Erro ao contar o número de agentes existentes.');
    }

    if (count !== null && count >= max_agents) {
      return {
        error: `Limite de ${max_agents} agentes atingido. Faça um upgrade do seu plano para criar mais.`,
      };
    }

    // 5. Criar o novo agente
    const { data: newAgent, error: createError } = await supabase
      .from('tenant_agents')
      .insert({
        tenant_id: tenantData.id,
        agent_name,
        system_prompt,
        llm_config: {},
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Erro ao criar o agente: ${createError.message}`);
    }
    
    // 6. Se temos dados do wizard, registrar na tabela wizard_generations
    if (wizardData && newAgent) {
      const generationMethod = wizardData.generation_method || 'manual';
      const archetypeUsedId = wizardData.archetype_used_id;
      
      const { error: wizardError } = await supabase
        .from('wizard_generations')
        .insert({
          tenant_id: tenantData.id,
          agent_id: newAgent.id,
          generation_method: generationMethod,
          archetype_used_id: archetypeUsedId,
          customizations: wizardData,
        });
      
      if (wizardError) {
        logger.error('Failed to register wizard data', wizardError);
        // Não falhar a operação principal se o registro de analytics falhar
      }
    }

    revalidatePath('/dashboard/agents');
    return { success: true, data: newAgent };

  } catch (error: any) {
    logger.error('Failed to create agent', error);
    return {
      error: error.message || 'Ocorreu um erro inesperado.',
    };
  }
}

export async function getAgents() {
  const cookieStore = await cookies();
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    const { data: agents, error: agentsError } = await supabase
      .from('tenant_agents')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (agentsError) throw new Error(`Erro ao buscar agentes: ${agentsError.message}`);

    return { data: agents };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function getAgentsWithRelations() {
  const cookieStore = await cookies();
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Buscar agentes com canais e RAGs vinculados
    const { data: agents, error: agentsError } = await supabase
      .from('tenant_agents')
      .select(`
        *,
        channels:tenant_channels (*),
        knowledge_bases:tenant_agents_rag (*)
      `)
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (agentsError) throw new Error(`Erro ao buscar agentes: ${agentsError.message}`);

    return { data: agents };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function getAgentById(agentId: string) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  try {
    // Validar usuário autenticado e tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Buscar agente com filtro explícito de tenant
    const { data: agent, error } = await supabase
      .from('tenant_agents')
      .select('id, agent_name, system_prompt, tenant_id')
      .eq('id', agentId)
      .eq('tenant_id', tenant.id) // Filtro explícito de tenant
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Agente não encontrado.' };
      }
      throw new Error(error.message);
    }

    logger.debug('Agent retrieved successfully', {
      userId: user.id,
      tenantId: tenant.id,
      agentId
    });

    return { data: agent };

  } catch (error: any) {
    logger.error('Failed to get agent by ID', { agentId, error });
    return {
      error: error.message,
    };
  }
}

// Esquema para atualização, estende o de criação + ID
const updateAgentSchema = createAgentSchema.extend({
  id: z.string().uuid('ID do agente inválido.'),
});

export async function updateAgent(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  const validatedFields = updateAgentSchema.safeParse({
    id: formData.get('id'),
    agent_name: formData.get('agent_name'),
    system_prompt: formData.get('system_prompt'),
  });

  if (!validatedFields.success) {
    return { 
      error: 'Dados inválidos para atualização.',
      errorDetails: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, agent_name, system_prompt } = validatedFields.data;

  try {
    // Validar usuário autenticado e tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Validar propriedade do agente
    const { data: agent, error: agentError } = await supabase
      .from('tenant_agents')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (agentError) {
      if (agentError.code === 'PGRST116') {
        return { error: 'Agente não encontrado.' };
      }
      throw new Error('Erro ao buscar agente.');
    }
    
    if (agent.tenant_id !== tenant.id) {
      logger.warn('Attempted unauthorized agent update', {
        userId: user.id,
        agentId: id,
        userTenantId: tenant.id,
        agentTenantId: agent.tenant_id
      });
      throw new Error('Acesso negado. Agente não pertence ao seu tenant.');
    }

    // Atualizar com filtro duplo de segurança
    const { data: updatedAgent, error } = await supabase
      .from('tenant_agents')
      .update({ agent_name, system_prompt })
      .eq('id', id)
      .eq('tenant_id', tenant.id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar o agente: ${error.message}`);

    logger.info('Agent updated successfully', {
      userId: user.id,
      tenantId: tenant.id,
      agentId: id
    });

    revalidatePath('/dashboard/agents');
    return { success: true, data: updatedAgent };

  } catch (error: any) {
    logger.error('Failed to update agent', { agentId: id, error });
    return { error: error.message };
  }
}

export async function deleteAgent(agentId: string) {
  if (!agentId || !z.string().uuid().safeParse(agentId).success) {
    return { error: 'ID do agente inválido.' };
  }

  const cookieStore = await cookies();
  const supabase = await createClient();

  try {
    // Validar usuário autenticado e tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Validar propriedade do agente
    const { data: agent, error: agentError } = await supabase
      .from('tenant_agents')
      .select('tenant_id')
      .eq('id', agentId)
      .single();

    if (agentError) {
      if (agentError.code === 'PGRST116') {
        return { error: 'Agente não encontrado.' };
      }
      throw new Error('Erro ao buscar agente.');
    }
    
    if (agent.tenant_id !== tenant.id) {
      logger.warn('Attempted unauthorized agent deletion', {
        userId: user.id,
        agentId,
        userTenantId: tenant.id,
        agentTenantId: agent.tenant_id
      });
      throw new Error('Acesso negado. Agente não pertence ao seu tenant.');
    }

    // Deletar com filtro duplo de segurança
    const { error } = await supabase
      .from('tenant_agents')
      .delete()
      .eq('id', agentId)
      .eq('tenant_id', tenant.id);

    if (error) throw new Error(`Erro ao deletar o agente: ${error.message}`);

    logger.info('Agent deleted successfully', {
      userId: user.id,
      tenantId: tenant.id,
      agentId
    });

    revalidatePath('/dashboard/agents');
    return { success: true };

  } catch (error: any) {
    logger.error('Failed to delete agent', { agentId, error });
    return { error: error.message };
  }
}
