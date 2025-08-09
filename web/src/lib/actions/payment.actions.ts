'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Types
export interface CreatePaymentData {
  tenant_id: string;
  invoice_id: string;
  amount: number;
  payment_method: 'credit_card' | 'pix' | 'bank_transfer';
  gateway_transaction_id?: string;
  gateway_response?: any;
}

export interface UpdatePaymentStatusData {
  payment_id: string;
  status: 'processing' | 'completed' | 'failed' | 'refunded';
  gateway_response?: any;
}

export interface Payment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  amount: number;
  payment_method: 'credit_card' | 'pix' | 'bank_transfer';
  gateway_transaction_id?: string;
  status: 'processing' | 'completed' | 'failed' | 'refunded';
  paid_at: string;
  gateway_response?: any;
  created_at: string;
  // Relations
  invoice?: {
    invoice_number: string;
    description?: string;
  };
}

/**
 * Busca todos os pagamentos de um tenant
 */
export async function getPaymentsByTenant(tenant_id: string) {
  try {
    const supabase = await createClient();
    
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(invoice_number, description)
      `)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pagamentos:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: payments as Payment[] };
  } catch (error) {
    console.error('Erro interno ao buscar pagamentos:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Busca pagamentos de uma fatura específica
 */
export async function getPaymentsByInvoice(invoice_id: string) {
  try {
    const supabase = await createClient();
    
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoice_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pagamentos da fatura:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: payments as Payment[] };
  } catch (error) {
    console.error('Erro interno ao buscar pagamentos:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Cria um novo pagamento
 */
export async function createPayment(data: CreatePaymentData) {
  try {
    const supabase = await createClient();
    
    const { data: payment, error } = await supabase
      .from('payments')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pagamento:', error);
      return { success: false, error: error.message };
    }

    // Se o pagamento foi completado, atualizar status da fatura
    if (data.gateway_response?.status === 'completed') {
      await updateInvoiceStatusFromPayment(data.invoice_id, data.amount);
    }

    revalidatePath('/dashboard/billing');
    revalidatePath(`/dashboard/billing/${data.invoice_id}`);
    return { success: true, data: payment };
  } catch (error) {
    console.error('Erro interno ao criar pagamento:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Atualiza o status de um pagamento
 */
export async function updatePaymentStatus(data: UpdatePaymentStatusData) {
  try {
    const supabase = await createClient();
    
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status: data.status,
        gateway_response: data.gateway_response,
      })
      .eq('id', data.payment_id)
      .select(`
        *,
        invoice:invoices(id, amount)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      return { success: false, error: error.message };
    }

    // Se o pagamento foi completado, atualizar status da fatura
    if (data.status === 'completed' && payment.invoice) {
      await updateInvoiceStatusFromPayment(payment.invoice.id, payment.amount);
    }

    revalidatePath('/dashboard/billing');
    revalidatePath(`/dashboard/billing/${payment.invoice_id}`);
    return { success: true, data: payment };
  } catch (error) {
    console.error('Erro interno ao atualizar pagamento:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Busca um pagamento específico por ID
 */
export async function getPaymentById(payment_id: string) {
  try {
    const supabase = await createClient();
    
    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(invoice_number, description, amount)
      `)
      .eq('id', payment_id)
      .single();

    if (error) {
      console.error('Erro ao buscar pagamento:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: payment };
  } catch (error) {
    console.error('Erro interno ao buscar pagamento:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Busca estatísticas de pagamentos de um tenant
 */
export async function getPaymentStats(tenant_id: string) {
  try {
    const supabase = await createClient();
    
    const { data: payments, error } = await supabase
      .from('payments')
      .select('status, amount, payment_method, created_at')
      .eq('tenant_id', tenant_id);

    if (error) {
      console.error('Erro ao buscar estatísticas de pagamentos:', error);
      return { success: false, error: error.message };
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const summary = {
      total_payments: payments.length,
      total_amount: payments.reduce((sum, pay) => sum + Number(pay.amount), 0),
      completed_amount: payments
        .filter(pay => pay.status === 'completed')
        .reduce((sum, pay) => sum + Number(pay.amount), 0),
      failed_amount: payments
        .filter(pay => pay.status === 'failed')
        .reduce((sum, pay) => sum + Number(pay.amount), 0),
      this_month_amount: payments
        .filter(pay => new Date(pay.created_at) >= thisMonth)
        .reduce((sum, pay) => sum + Number(pay.amount), 0),
      last_month_amount: payments
        .filter(pay => {
          const payDate = new Date(pay.created_at);
          return payDate >= lastMonth && payDate < thisMonth;
        })
        .reduce((sum, pay) => sum + Number(pay.amount), 0),
      by_method: {
        credit_card: payments.filter(pay => pay.payment_method === 'credit_card').length,
        pix: payments.filter(pay => pay.payment_method === 'pix').length,
        bank_transfer: payments.filter(pay => pay.payment_method === 'bank_transfer').length,
      },
      by_status: {
        completed: payments.filter(pay => pay.status === 'completed').length,
        processing: payments.filter(pay => pay.status === 'processing').length,
        failed: payments.filter(pay => pay.status === 'failed').length,
        refunded: payments.filter(pay => pay.status === 'refunded').length,
      },
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error('Erro interno ao buscar estatísticas:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Função auxiliar para atualizar status da fatura baseado no pagamento
 */
async function updateInvoiceStatusFromPayment(invoice_id: string, payment_amount: number) {
  try {
    const supabase = await createClient();
    
    // Buscar a fatura e todos os pagamentos completados
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('amount, status')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      console.error('Erro ao buscar fatura para atualização:', invoiceError);
      return;
    }

    const { data: completedPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoice_id)
      .eq('status', 'completed');

    if (paymentsError) {
      console.error('Erro ao buscar pagamentos completados:', paymentsError);
      return;
    }

    const totalPaid = completedPayments.reduce((sum, pay) => sum + Number(pay.amount), 0);
    const invoiceAmount = Number(invoice.amount);

    // Se o valor total pago é igual ou maior que o valor da fatura, marcar como paga
    if (totalPaid >= invoiceAmount && invoice.status !== 'paid') {
      await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', invoice_id);
    }
  } catch (error) {
    console.error('Erro ao atualizar status da fatura:', error);
  }
}

/**
 * Processa webhook de gateway de pagamento
 */
export async function processPaymentWebhook(webhookData: any) {
  try {
    const supabase = await createClient();
    
    // Buscar pagamento pelo transaction_id do gateway
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('gateway_transaction_id', webhookData.transaction_id)
      .single();

    if (error || !payment) {
      console.error('Pagamento não encontrado para webhook:', webhookData.transaction_id);
      return { success: false, error: 'Pagamento não encontrado' };
    }

    // Mapear status do gateway para nosso sistema
    let status: 'processing' | 'completed' | 'failed' | 'refunded' = 'processing';
    
    switch (webhookData.status) {
      case 'approved':
      case 'paid':
      case 'completed':
        status = 'completed';
        break;
      case 'rejected':
      case 'failed':
      case 'cancelled':
        status = 'failed';
        break;
      case 'refunded':
        status = 'refunded';
        break;
      default:
        status = 'processing';
    }

    // Atualizar status do pagamento
    await updatePaymentStatus({
      payment_id: payment.id,
      status,
      gateway_response: webhookData,
    });

    return { success: true, data: { payment_id: payment.id, status } };
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
