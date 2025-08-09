'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Types
export interface CreateInvoiceData {
  tenant_id: string;
  plan_id?: string;
  amount: number;
  currency?: string;
  due_date: string;
  description?: string;
  billing_period?: 'monthly' | 'yearly';
}

export interface UpdateInvoiceStatusData {
  invoice_id: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_at?: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  invoice_number: string;
  plan_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at?: string;
  description?: string;
  billing_period: 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
  // Relations
  plan?: {
    name: string;
    plan_features: any;
  };
}

/**
 * Busca todas as faturas de um tenant
 */
export async function getInvoicesByTenant(tenant_id: string) {
  try {
    const supabase = await createClient();
    
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        plan:plans(name, plan_features)
      `)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar faturas:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: invoices as Invoice[] };
  } catch (error) {
    console.error('Erro interno ao buscar faturas:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Busca uma fatura específica por ID
 */
export async function getInvoiceById(invoice_id: string) {
  try {
    const supabase = await createClient();
    
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        plan:plans(name, plan_features),
        payments(*)
      `)
      .eq('id', invoice_id)
      .single();

    if (error) {
      console.error('Erro ao buscar fatura:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: invoice };
  } catch (error) {
    console.error('Erro interno ao buscar fatura:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Cria uma nova fatura
 */
export async function createInvoice(data: CreateInvoiceData) {
  try {
    const supabase = await createClient();
    
    // Gerar número da fatura sequencial
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastInvoice?.invoice_number) {
      const lastNumber = parseInt(lastInvoice.invoice_number.replace(/\D/g, ''));
      nextNumber = lastNumber + 1;
    }

    const invoice_number = `INV-${nextNumber.toString().padStart(6, '0')}`;

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        ...data,
        invoice_number,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar fatura:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/billing');
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Erro interno ao criar fatura:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Atualiza o status de uma fatura
 */
export async function updateInvoiceStatus(data: UpdateInvoiceStatusData) {
  try {
    const supabase = await createClient();
    
    const updateData: any = {
      status: data.status,
    };

    if (data.paid_at) {
      updateData.paid_at = data.paid_at;
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', data.invoice_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status da fatura:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/billing');
    revalidatePath(`/dashboard/billing/${data.invoice_id}`);
    return { success: true, data: invoice };
  } catch (error) {
    console.error('Erro interno ao atualizar fatura:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Busca faturas com filtros avançados
 */
export async function getInvoicesWithFilters(
  tenant_id: string,
  filters: {
    status?: string;
    start_date?: string;
    end_date?: string;
    plan_id?: string;
  } = {}
) {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('invoices')
      .select(`
        *,
        plan:plans(name, plan_features)
      `)
      .eq('tenant_id', tenant_id);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    if (filters.plan_id) {
      query = query.eq('plan_id', filters.plan_id);
    }

    const { data: invoices, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar faturas com filtros:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: invoices as Invoice[] };
  } catch (error) {
    console.error('Erro interno ao buscar faturas:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Busca estatísticas financeiras de um tenant
 */
export async function getInvoiceStats(tenant_id: string) {
  try {
    const supabase = await createClient();
    
    const { data: stats, error } = await supabase
      .from('invoices')
      .select('status, amount')
      .eq('tenant_id', tenant_id);

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { success: false, error: error.message };
    }

    const summary = {
      total_invoices: stats.length,
      total_amount: stats.reduce((sum, inv) => sum + Number(inv.amount), 0),
      paid_amount: stats
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.amount), 0),
      pending_amount: stats
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + Number(inv.amount), 0),
      overdue_amount: stats
        .filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + Number(inv.amount), 0),
      paid_count: stats.filter(inv => inv.status === 'paid').length,
      pending_count: stats.filter(inv => inv.status === 'pending').length,
      overdue_count: stats.filter(inv => inv.status === 'overdue').length,
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error('Erro interno ao buscar estatísticas:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
