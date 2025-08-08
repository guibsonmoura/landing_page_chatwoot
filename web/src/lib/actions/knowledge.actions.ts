// src/lib/actions/knowledge.actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';

const documentSchema = z.object({
  tenant_id: z.string().uuid('ID de tenant inválido.'),
  agent_id: z.string().uuid('ID de agente inválido.'),
  file_name: z.string().min(1, 'O nome do arquivo não pode estar vazio.'),
  storage_path: z.string().min(1, 'O caminho de armazenamento não pode estar vazio.'),
});

export async function createDocumentRecord(params: {
  tenantId: string;
  agentId: string;
  fileName: string;
  storagePath: string;
}) {
  const supabase = await createClient();

  // 1. Validar os dados
  const validatedFields = documentSchema.safeParse({
    tenant_id: params.tenantId,
    agent_id: params.agentId,
    file_name: params.fileName,
    storage_path: params.storagePath,
  });

  if (!validatedFields.success) {
    return {
      error: 'Dados inválidos para criar o registro do documento.',
      errorDetails: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { tenant_id, agent_id, file_name, storage_path } = validatedFields.data;

  try {
    // 2. Verificar se o usuário tem permissão (a RLS fará isso automaticamente)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // 3. Inserir o registro na tabela agent_documents
    const { data, error } = await supabase
      .from('agent_documents')
      .insert({
        tenant_id,
        agent_id,
        file_name,
        storage_path,
        status: 'uploaded', // Status inicial
      })
      .select()
      .single();

    if (error) {
      // Tratar possíveis erros, como caminhos de armazenamento duplicados
      if (error.code === '23505') { // unique_violation
        return { error: 'Um arquivo com este nome já existe para este agente.' };
      }
      throw new Error(`Erro ao salvar registro do documento: ${error.message}`);
    }

    // 4. Revalidar o cache da página do agente para mostrar o novo documento
    revalidatePath(`/dashboard/agents/${agent_id}`);

    return { data };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function getDocumentsByAgentId(agentId: string) {
  const supabase = await createClient();

  try {
    // 1. Validar o ID do agente
    if (!agentId || typeof agentId !== 'string') {
      return { error: 'ID do agente inválido.' };
    }

    // 2. Validar usuário autenticado e tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // 3. Validar se o agente pertence ao tenant do usuário
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
      logger.warn('Attempted unauthorized access to agent documents', {
        userId: user.id,
        agentId,
        userTenantId: tenant.id,
        agentTenantId: agent.tenant_id
      });
      throw new Error('Acesso negado. Agente não pertence ao seu tenant.');
    }

    // 4. Buscar os documentos do agente com filtro de tenant
    const { data: documents, error } = await supabase
      .from('agent_documents')
      .select('*')
      .eq('agent_id', agentId)
      .eq('tenant_id', tenant.id) // Filtro explícito de tenant
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar documentos: ${error.message}`);
    }

    logger.debug('Agent documents retrieved successfully', {
      userId: user.id,
      tenantId: tenant.id,
      agentId,
      documentCount: documents?.length || 0
    });

    return { data: documents };

  } catch (error: any) {
    logger.error('Failed to get documents by agent ID', { agentId, error });
    return {
      error: error.message,
    };
  }
}
