// Types para o sistema de pagamentos

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethodType = 'credit_card' | 'pix' | 'bank_transfer';
export type BillingPeriod = 'monthly' | 'yearly';

export interface Invoice {
  id: string;
  tenant_id: string;
  invoice_number: string;
  plan_id?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  due_date: string;
  paid_at?: string;
  description?: string;
  billing_period: BillingPeriod;
  created_at: string;
  updated_at: string;
  // Relations
  plan?: {
    name: string;
    plan_features: any;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethodType;
  gateway_transaction_id?: string;
  status: PaymentStatus;
  paid_at: string;
  gateway_response?: any;
  created_at: string;
  // Relations
  invoice?: {
    invoice_number: string;
    description?: string;
    amount: number;
  };
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

// DTOs para criação e atualização
export interface CreateInvoiceData {
  tenant_id: string;
  plan_id?: string;
  amount: number;
  currency?: string;
  due_date: string;
  description?: string;
  billing_period?: BillingPeriod;
}

export interface UpdateInvoiceStatusData {
  invoice_id: string;
  status: InvoiceStatus;
  paid_at?: string;
}

export interface CreatePaymentData {
  tenant_id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethodType;
  gateway_transaction_id?: string;
  gateway_response?: any;
}

export interface UpdatePaymentStatusData {
  payment_id: string;
  status: PaymentStatus;
  gateway_response?: any;
}

export interface PaymentMethodData {
  tenant_id: string;
  type: 'credit_card' | 'pix';
  card_last_four?: string;
  card_brand?: string;
  pix_key?: string;
  is_default?: boolean;
}

// Estatísticas e relatórios
export interface InvoiceStats {
  total_invoices: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  completed_amount: number;
  failed_amount: number;
  this_month_amount: number;
  last_month_amount: number;
  by_method: {
    credit_card: number;
    pix: number;
    bank_transfer: number;
  };
  by_status: {
    completed: number;
    processing: number;
    failed: number;
    refunded: number;
  };
}

// Filtros para consultas
export interface InvoiceFilters {
  status?: InvoiceStatus;
  start_date?: string;
  end_date?: string;
  plan_id?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  payment_method?: PaymentMethodType;
  start_date?: string;
  end_date?: string;
  invoice_id?: string;
}

// Webhook data from payment gateways
export interface PaymentWebhookData {
  transaction_id: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string;
  gateway_data: any;
  timestamp: string;
}

// Validação de chave Pix
export interface PixKeyValidation {
  isValid: boolean;
  type?: 'CPF' | 'CNPJ' | 'Email' | 'Telefone' | 'Chave Aleatória';
}

// Response patterns
export interface PaymentActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Card brands supported
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'diners' | 'discover';

// Gateway providers (for future integration)
export type PaymentGateway = 'stripe' | 'mercadopago' | 'pagseguro' | 'cielo' | 'getnet';

export interface GatewayConfig {
  provider: PaymentGateway;
  api_key: string;
  secret_key: string;
  webhook_url: string;
  environment: 'sandbox' | 'production';
}

// Invoice generation settings
export interface InvoiceGenerationSettings {
  auto_generate: boolean;
  days_before_due: number;
  default_description: string;
  include_taxes: boolean;
  tax_rate: number;
  late_fee_rate: number;
  grace_period_days: number;
}

// Notification preferences for payments
export interface PaymentNotificationSettings {
  email_on_payment_received: boolean;
  email_on_payment_failed: boolean;
  email_reminder_days_before: number[];
  sms_notifications: boolean;
  webhook_notifications: boolean;
}
