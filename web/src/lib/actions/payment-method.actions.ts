'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { validatePixKey, maskPixKey } from '@/lib/utils/payment.utils';

// Types
export interface PaymentMethodData {
  tenant_id: string;
  type: 'credit_card' | 'pix';
  card_last_four?: string;
  card_brand?: string;
  pix_key?: string;
  is_default?: boolean;
}

export interface PaymentMethod {
  id: string;
  tenant_id: string;
  type: 'credit_card' | 'pix';
  is_default: boolean;
  card_last_four?: string;
  card_brand?: string;
  pix_key?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Busca todos os métodos de pagamento de um tenant
 */
export async function getPaymentMethodsByTenant(tenant_id: string) {
  try {
    const supabase = await createClient();
    
    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: paymentMethods as PaymentMethod[] };
  } catch (error) {
    console.error('Erro interno ao buscar métodos de pagamento:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Adiciona um novo método de pagamento
 */
export async function addPaymentMethod(data: PaymentMethodData) {
  try {
    const supabase = await createClient();
    
    // Se este método está sendo definido como padrão, remover padrão dos outros
    if (data.is_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('tenant_id', data.tenant_id);
    }

    // Validações específicas por tipo
    if (data.type === 'credit_card') {
      if (!data.card_last_four || !data.card_brand) {
        return { success: false, error: 'Dados do cartão são obrigatórios' };
      }
    } else if (data.type === 'pix') {
      if (!data.pix_key) {
        return { success: false, error: 'Chave Pix é obrigatória' };
      }
    }

    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar método de pagamento:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/billing/payment-methods');
    return { success: true, data: paymentMethod };
  } catch (error) {
    console.error('Erro interno ao adicionar método de pagamento:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Define um método de pagamento como padrão
 */
export async function setDefaultPaymentMethod(method_id: string, tenant_id: string) {
  try {
    const supabase = await createClient();
    
    // Remover padrão de todos os métodos do tenant
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('tenant_id', tenant_id);

    // Definir o método específico como padrão
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', method_id)
      .eq('tenant_id', tenant_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao definir método padrão:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/billing/payment-methods');
    return { success: true, data: paymentMethod };
  } catch (error) {
    console.error('Erro interno ao definir método padrão:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Remove um método de pagamento (marca como inativo)
 */
export async function deletePaymentMethod(method_id: string, tenant_id: string) {
  try {
    const supabase = await createClient();
    
    // Verificar se é o método padrão
    const { data: method, error: fetchError } = await supabase
      .from('payment_methods')
      .select('is_default')
      .eq('id', method_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar método de pagamento:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Marcar como inativo ao invés de deletar (para manter histórico)
    const { data: deletedMethod, error } = await supabase
      .from('payment_methods')
      .update({ is_active: false, is_default: false })
      .eq('id', method_id)
      .eq('tenant_id', tenant_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao remover método de pagamento:', error);
      return { success: false, error: error.message };
    }

    // Se era o método padrão, definir outro como padrão
    if (method.is_default) {
      const { data: otherMethods } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('tenant_id', tenant_id)
        .eq('is_active', true)
        .limit(1);

      if (otherMethods && otherMethods.length > 0) {
        await supabase
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', otherMethods[0].id);
      }
    }

    revalidatePath('/dashboard/billing/payment-methods');
    return { success: true, data: deletedMethod };
  } catch (error) {
    console.error('Erro interno ao remover método de pagamento:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Busca o método de pagamento padrão de um tenant
 */
export async function getDefaultPaymentMethod(tenant_id: string) {
  try {
    const supabase = await createClient();
    
    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar método padrão:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: paymentMethod as PaymentMethod | null };
  } catch (error) {
    console.error('Erro interno ao buscar método padrão:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Atualiza informações de um método de pagamento
 */
export async function updatePaymentMethod(
  method_id: string, 
  tenant_id: string, 
  updates: Partial<PaymentMethodData>
) {
  try {
    const supabase = await createClient();
    
    // Se está definindo como padrão, remover padrão dos outros
    if (updates.is_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('tenant_id', tenant_id);
    }

    const { data: paymentMethod, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', method_id)
      .eq('tenant_id', tenant_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar método de pagamento:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/billing/payment-methods');
    return { success: true, data: paymentMethod };
  } catch (error) {
    console.error('Erro interno ao atualizar método de pagamento:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Mascara dados sensíveis para exibição
 */
export async function maskSensitiveData(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
  const masked = { ...paymentMethod };
  
  if (masked.type === 'credit_card' && masked.card_last_four) {
    // Já está mascarado, apenas garantir formato
    masked.card_last_four = `****${masked.card_last_four.slice(-4)}`;
  }
  
  if (masked.type === 'pix' && masked.pix_key) {
    const validation = validatePixKey(masked.pix_key);
    
    if (validation.type) {
      masked.pix_key = maskPixKey(masked.pix_key, validation.type);
    }
  }
  
  return masked;
}
