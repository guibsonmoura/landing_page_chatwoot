// Configuração de ambiente
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
const isProduction = NODE_ENV === 'production';

// Lista de campos sensíveis que devem ser sanitizados
const SENSITIVE_FIELDS = [
  // IDs e identificadores
  'tenant_id', 'user_id', 'customer_id', 'agent_id', 'channel_id', 'attendant_id',
  'id', 'uuid', 'guid', 'session_id', 'conversation_id', 'message_id',
  
  // Credenciais e tokens
  'password', 'password_temp', 'token', 'access_token', 'refresh_token',
  'api_key', 'secret', 'private_key', 'webhook_key', 'auth_token',
  'bearer_token', 'jwt', 'session_token', 'csrf_token',
  
  // Dados pessoais
  'email', 'phone', 'phone_number', 'cpf', 'cnpj', 'document',
  'name', 'full_name', 'first_name', 'last_name', 'address',
  
  // Dados de WhatsApp
  'whatsapp_number', 'wa_id', 'profile_name', 'contact_name',
  
  // Chaves de API específicas
  'OPENAI_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'WEBHOOK_API_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY',
  
  // Dados de imagem e arquivos
  'base64', 'image_data', 'file_content', 'media_data',
  
  // Outros dados sensíveis
  'credit_card', 'bank_account', 'social_security', 'authorization',
  'credentials', 'login', 'username'
];

// Função para sanitizar objetos recursivamente
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    // Verificar se é um campo sensível baseado no conteúdo
    if (obj.length > 20 && (obj.includes('Bearer ') || obj.includes('sk-') || obj.includes('eyJ'))) {
      return '[REDACTED_TOKEN]';
    }
    return obj;
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Verificar se a chave é sensível
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      lowerKey.includes(field.toLowerCase()) || 
      lowerKey === field.toLowerCase()
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeObject(value);
    }
  }
  
  return sanitized;
}

// Logger simples e seguro baseado em console nativo
const safeLogger = {
  debug: (msg: string, data?: any) => {
    if (LOG_LEVEL === 'debug' && !isProduction) {
      console.debug(`[DEBUG] ${msg}`, data ? sanitizeObject(data) : '');
    }
  },
  info: (msg: string, data?: any) => {
    if (['debug', 'info'].includes(LOG_LEVEL) && !isProduction) {
      console.info(`[INFO] ${msg}`, data ? sanitizeObject(data) : '');
    }
  },
  warn: (msg: string, data?: any) => {
    if (['debug', 'info', 'warn'].includes(LOG_LEVEL)) {
      console.warn(`[WARN] ${msg}`, data ? sanitizeObject(data) : '');
    }
  },
  error: (msg: string, error?: any, data?: any) => {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: isProduction ? '[REDACTED]' : error.stack,
      name: error.name
    } : error;
    
    console.error(`[ERROR] ${msg}`, errorData ? sanitizeObject(errorData) : '', data ? sanitizeObject(data) : '');
  }
};

// Log de inicialização
if (!isProduction) {
  safeLogger.debug('Logger initialized', {
    environment: NODE_ENV,
    level: LOG_LEVEL,
    sanitization: 'enabled'
  });
}

// Exportar como default
export default safeLogger;
export { sanitizeObject };
