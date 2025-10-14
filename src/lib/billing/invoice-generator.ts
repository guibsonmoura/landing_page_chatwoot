import { createClient } from '@/lib/supabase/server';
import { createInvoice } from '@/lib/actions/invoice.actions';
import type { CreateInvoiceData } from '@/lib/types/payment.types';

/**
 * Configurações para geração automática de faturas
 */
export interface InvoiceGenerationConfig {
  auto_generate: boolean;
  days_before_due: number;
  default_description: string;
  include_taxes: boolean;
  tax_rate: number;
  late_fee_rate: number;
  grace_period_days: number;
}

/**
 * Gera fatura automática para um tenant baseado no seu plano
 */
export async function generateInvoiceForTenant(
  tenant_id: string,
  billing_period: 'monthly' | 'yearly' = 'monthly'
) {
  try {
    const supabase = await createClient();
    
    // Buscar dados do tenant e plano
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        id,
        name,
        plan_id,
        plan:plans(name, plan_features)
      `)
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      console.error('Erro ao buscar tenant:', tenantError);
      return { success: false, error: 'Tenant não encontrado' };
    }

    if (!tenant.plan || !tenant.plan.plan_features) {
      return { success: false, error: 'Plano não configurado para o tenant' };
    }

    // Calcular valor baseado no plano e período
    const planFeatures = tenant.plan.plan_features;
    let amount = 0;

    // Valores base por plano (exemplo - ajustar conforme necessário)
    const planPricing = {
      'Trial': { monthly: 0, yearly: 0 },
      'Basic': { monthly: 29.90, yearly: 299.90 },
      'Pro': { monthly: 99.90, yearly: 999.90 },
      'Enterprise': { monthly: 299.90, yearly: 2999.90 }
    };

    const planName = tenant.plan.name;
    if (planPricing[planName as keyof typeof planPricing]) {
      amount = planPricing[planName as keyof typeof planPricing][billing_period];
    }

    // Se é plano Trial, não gerar fatura
    if (planName === 'Trial' || amount === 0) {
      return { success: false, error: 'Plano Trial não gera faturas' };
    }

    // Calcular data de vencimento
    const dueDate = new Date();
    if (billing_period === 'monthly') {
      dueDate.setMonth(dueDate.getMonth() + 1);
    } else {
      dueDate.setFullYear(dueDate.getFullYear() + 1);
    }
    dueDate.setDate(dueDate.getDate() + 7); // 7 dias para pagamento

    // Verificar se já existe fatura pendente para este período
    const startOfPeriod = new Date();
    if (billing_period === 'monthly') {
      startOfPeriod.setDate(1);
    } else {
      startOfPeriod.setMonth(0, 1);
    }

    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('billing_period', billing_period)
      .gte('created_at', startOfPeriod.toISOString())
      .eq('status', 'pending')
      .single();

    if (existingInvoice) {
      return { success: false, error: 'Já existe fatura pendente para este período' };
    }

    // Criar dados da fatura
    const invoiceData: CreateInvoiceData = {
      tenant_id,
      plan_id: tenant.plan_id,
      amount,
      currency: 'BRL',
      due_date: dueDate.toISOString(),
      description: `Assinatura ${billing_period === 'monthly' ? 'Mensal' : 'Anual'} - Plano ${planName}`,
      billing_period,
    };

    // Criar fatura
    const result = await createInvoice(invoiceData);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Erro ao gerar fatura automática:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Gera faturas para todos os tenants ativos
 */
export async function generateInvoicesForAllTenants(billing_period: 'monthly' | 'yearly' = 'monthly') {
  try {
    const supabase = await createClient();
    
    // Buscar todos os tenants ativos com planos pagos
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select(`
        id,
        name,
        plan:plans(name)
      `)
      .not('plan_id', 'is', null);

    if (error) {
      console.error('Erro ao buscar tenants:', error);
      return { success: false, error: error.message };
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const tenant of tenants) {
      // Pular planos Trial
      if (tenant.plan?.name === 'Trial') {
        continue;
      }

      const result = await generateInvoiceForTenant(tenant.id, billing_period);
      results.push({
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        ...result
      });

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    return {
      success: true,
      data: {
        total_processed: tenants.length,
        success_count: successCount,
        error_count: errorCount,
        results
      }
    };
  } catch (error) {
    console.error('Erro ao gerar faturas em lote:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Marca faturas vencidas como overdue
 */
export async function markOverdueInvoices() {
  try {
    const supabase = await createClient();
    
    const now = new Date().toISOString();
    
    const { data: overdueInvoices, error } = await supabase
      .from('invoices')
      .update({ status: 'overdue' })
      .eq('status', 'pending')
      .lt('due_date', now)
      .select();

    if (error) {
      console.error('Erro ao marcar faturas vencidas:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        updated_count: overdueInvoices.length,
        invoices: overdueInvoices
      }
    };
  } catch (error) {
    console.error('Erro ao processar faturas vencidas:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Calcula taxas de atraso para faturas vencidas
 */
export async function calculateLateFees(late_fee_rate: number = 0.02) {
  try {
    const supabase = await createClient();
    
    // Buscar faturas vencidas há mais de 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: overdueInvoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'overdue')
      .lt('due_date', sevenDaysAgo.toISOString());

    if (error) {
      console.error('Erro ao buscar faturas vencidas:', error);
      return { success: false, error: error.message };
    }

    const updates = [];
    
    for (const invoice of overdueInvoices) {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysOverdue > 7) {
        const lateFee = Number(invoice.amount) * late_fee_rate;
        const newAmount = Number(invoice.amount) + lateFee;
        
        updates.push({
          id: invoice.id,
          amount: newAmount,
          description: `${invoice.description} (Multa por atraso: R$ ${lateFee.toFixed(2)})`
        });
      }
    }

    // Aplicar atualizações
    for (const update of updates) {
      await supabase
        .from('invoices')
        .update({
          amount: update.amount,
          description: update.description
        })
        .eq('id', update.id);
    }

    return {
      success: true,
      data: {
        processed_count: updates.length,
        updates
      }
    };
  } catch (error) {
    console.error('Erro ao calcular multas:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

/**
 * Obtém próximas faturas a vencer (para lembretes)
 */
export async function getUpcomingInvoices(days_ahead: number = 7) {
  try {
    const supabase = await createClient();
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days_ahead);
    
    const { data: upcomingInvoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        tenant:tenants(name, user_id),
        plan:plans(name)
      `)
      .eq('status', 'pending')
      .gte('due_date', today.toISOString())
      .lte('due_date', futureDate.toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar faturas próximas do vencimento:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: upcomingInvoices };
  } catch (error) {
    console.error('Erro ao buscar faturas próximas:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
