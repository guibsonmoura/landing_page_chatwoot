// src/lib/actions/attendant.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import logger from '@/lib/logger';

// Esquema de validação para a criação de um atendente
// Baseado na tabela tenant_attendant e no planning.md
const createAttendantSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('Email inválido.'),
  password_temp: z.string().min(6, 'A senha temporária deve ter pelo menos 6 caracteres.'),
  profile: z.enum(['atendente', 'administrador']).refine(val => val === 'atendente' || val === 'administrador', {
    message: 'O perfil deve ser "atendente" ou "administrador".'
  }),
});

export async function createAttendant(formData: FormData) {
  const supabase = await createClient();

  try {
    // 1. Validar e extrair dados
    const validatedFields = createAttendantSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password_temp: formData.get('password_temp'),
      profile: formData.get('profile'),
    });

    if (!validatedFields.success) {
      throw new Error('Dados do formulário inválidos.');
    }

    const { name, email, password_temp, profile } = validatedFields.data;

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
    
    // 4. Verificar limite de atendentes
    const max_attendants = planFeatures?.max_attendants;
    if (typeof max_attendants !== 'number') {
      throw new Error('Não foi possível determinar o limite de atendentes para o seu plano.');
    }
    
    // Contar atendentes existentes
    const { count, error: countError } = await supabase
      .from('tenant_attendant')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantData.id);
      
    if (countError) {
      throw new Error('Erro ao contar o número de atendentes existentes.');
    }
    
    if (count !== null && count >= max_attendants) {
      throw new Error(`Limite de ${max_attendants} atendentes atingido. Faça um upgrade do seu plano para criar mais.`);
    }

    // 5. Criar o atendente
    const { data: newAttendant, error: createError } = await supabase
      .from('tenant_attendant')
      .insert({
        tenant_id: tenantData.id,
        name,
        email,
        password_temp,
        profile,
      })
      .select()
      .single();

    if (createError) throw new Error(`Erro ao criar o atendente no DB: ${createError.message}`);
    if (!newAttendant) throw new Error('A criação do atendente não retornou os dados esperados.');

    // 6. Acionar webhook (opcional)
    const webhookUrl = process.env.N8N_ATTENDANT_MANAGEMENT_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAttendant.name,
          email: newAttendant.email,
          password_temp: newAttendant.password_temp,
          profile: newAttendant.profile,
          tenant_id: newAttendant.tenant_id,
        }),
      }).catch(err => logger.error('Non-blocking webhook error', err));
    }

    // 7. Revalidar cache
    revalidatePath('/dashboard/attendants');

    return { success: true, data: newAttendant };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

const updateAttendantSchema = createAttendantSchema.extend({
  id: z.string().uuid('ID do atendente inválido.'),
});

export async function updateAttendant(formData: FormData) {
  const supabase = await createClient();

  try {
    // 1. Validar dados
    const validatedFields = updateAttendantSchema.safeParse({
      id: formData.get('id'),
      name: formData.get('name'),
      email: formData.get('email'),
      password_temp: formData.get('password_temp'),
      profile: formData.get('profile'),
    });

    if (!validatedFields.success) {
      throw new Error('Dados do formulário inválidos para atualização.');
    }

    const { id, name, email, password_temp, profile } = validatedFields.data;

    // 2. Verificar propriedade (segurança extra)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    const { data: attendantData } = await supabase
      .from('tenant_attendant')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (!attendantData || !attendantData.tenant_id) throw new Error('Atendente não encontrado.');

    const { data: tenantData } = await supabase
      .from('tenants')
      .select('user_id')
      .eq('id', attendantData.tenant_id)
      .single();

    if (tenantData?.user_id !== user.id) {
      throw new Error('Acesso negado.');
    }

    // 3. Atualizar o atendente
    const { data: updatedAttendant, error: updateError } = await supabase
      .from('tenant_attendant')
      .update({
        name,
        email,
        password_temp,
        profile,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(`Erro ao atualizar o atendente: ${updateError.message}`);

    // 4. Revalidar cache
    revalidatePath('/dashboard/attendants');

    return { success: true, data: updatedAttendant };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function deleteAttendant(id: string) {
  const supabase = await createClient();

  try {
    // 1. Validar o ID
    if (!id || !z.string().uuid().safeParse(id).success) {
      throw new Error('ID do atendente inválido.');
    }

    // 2. Obter o usuário para garantir a propriedade
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // 3. Verificar a propriedade do atendente (segurança extra)
    // A RLS do Supabase já protege contra acesso indevido, mas esta verificação explícita é uma boa prática.
    const { data: attendantData, error: attendantError } = await supabase
      .from('tenant_attendant')
      .select('tenant_id')
      .eq('id', id)
      .single();

    if (attendantError) throw new Error(`Erro ao buscar o atendente: ${attendantError.message}`);
    if (!attendantData || !attendantData.tenant_id) throw new Error('Atendente ou tenant associado não encontrado.');

    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('user_id')
      .eq('id', attendantData.tenant_id)
      .single();

    if (tenantError) throw new Error(`Erro ao buscar o tenant: ${tenantError.message}`);
    if (!tenantData) throw new Error('Tenant não encontrado.');

    if (tenantData.user_id !== user.id) {
      throw new Error('Acesso negado. Você não tem permissão para deletar este atendente.');
    }

    // 4. Deletar o atendente
    const { error: deleteError } = await supabase
      .from('tenant_attendant')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Erro ao deletar o atendente: ${deleteError.message}`);
    }

    // 5. Revalidar o cache da página para refletir a mudança
    revalidatePath('/dashboard/attendants');

    return { success: true };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function getAttendants() {
  const supabase = await createClient();

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

    // Buscar todos os atendentes do tenant
    const { data: attendants, error: attendantsError } = await supabase
      .from('tenant_attendant')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (attendantsError) throw new Error(`Erro ao buscar atendentes: ${attendantsError.message}`);

    return { data: attendants };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function getAttendant(id: string) {
  const supabase = await createClient();

  try {
    // Validar ID
    if (!id || !z.string().uuid().safeParse(id).success) {
      throw new Error('ID do atendente inválido.');
    }

    // A RLS já garante a segurança, mas a consulta explícita é uma boa prática.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Buscar o atendente específico
    const { data: attendant, error: attendantError } = await supabase
      .from('tenant_attendant')
      .select('*')
      .eq('id', id)
      .single();

    if (attendantError) throw new Error(`Erro ao buscar atendente: ${attendantError.message}`);
    if (!attendant) throw new Error('Atendente não encontrado.');

    // Verificar se o atendente pertence ao tenant do usuário atual
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    if (attendant.tenant_id !== tenant.id) {
      throw new Error('Acesso negado. Você não tem permissão para visualizar este atendente.');
    }

    return { data: attendant };

  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}
