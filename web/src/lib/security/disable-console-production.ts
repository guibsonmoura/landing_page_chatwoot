/**
 * SEC-004: Desabilita console.log em produção para prevenir exposição de dados sensíveis
 * 
 * Este utilitário deve ser importado no início da aplicação (layout.tsx ou _app.tsx)
 * para garantir que console.log seja desabilitado em produção.
 */

export function disableConsoleInProduction() {
  if (process.env.NODE_ENV === 'production') {
    // Desabilitar console.log, console.debug, console.info em produção
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    
    // Manter console.error e console.warn para debugging crítico
    // mas sanitizar dados sensíveis
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      originalError.apply(console, sanitizedArgs);
    };
    
    console.warn = (...args: any[]) => {
      const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
      originalWarn.apply(console, sanitizedArgs);
    };
  }
}

/**
 * Sanitiza dados sensíveis para logging seguro
 */
function sanitizeForLogging(data: any): any {
  if (typeof data === 'string') {
    // Redact common sensitive patterns
    return data
      .replace(/tenant_id['":\s]*['"]*([^'",\s}]+)['"]*/, 'tenant_id: "[REDACTED]"')
      .replace(/user_id['":\s]*['"]*([^'",\s}]+)['"]*/, 'user_id: "[REDACTED]"')
      .replace(/channel_id['":\s]*['"]*([^'",\s}]+)['"]*/, 'channel_id: "[REDACTED]"')
      .replace(/phone['":\s]*['"]*([^'",\s}]+)['"]*/, 'phone: "[REDACTED]"')
      .replace(/email['":\s]*['"]*([^'",\s}]+)['"]*/, 'email: "[REDACTED]"')
      .replace(/password['":\s]*['"]*([^'",\s}]+)['"]*/, 'password: "[REDACTED]"')
      .replace(/token['":\s]*['"]*([^'",\s}]+)['"]*/, 'token: "[REDACTED]"')
      .replace(/api_?key['":\s]*['"]*([^'",\s}]+)['"]*/, 'apikey: "[REDACTED]"')
      .replace(/bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
      .replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, 'data:image/[REDACTED];base64,[REDACTED]');
  }
  
  if (typeof data === 'object' && data !== null) {
    const sensitiveFields = [
      'tenant_id', 'user_id', 'channel_id', 'phone_number', 'phone',
      'email', 'password', 'token', 'api_key', 'apikey', 'base64',
      'authorization', 'bearer', 'secret', 'key'
    ];
    
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeForLogging(sanitized[key]);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

/**
 * Configuração de logging por ambiente
 */
export const LOG_CONFIG = {
  development: {
    level: 'debug',
    enableConsole: true,
    sanitize: false
  },
  staging: {
    level: 'info',
    enableConsole: true,
    sanitize: true
  },
  production: {
    level: 'error',
    enableConsole: false,
    sanitize: true
  }
} as const;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type Environment = keyof typeof LOG_CONFIG;

/**
 * Obtém a configuração de logging para o ambiente atual
 */
export function getLogConfig(): typeof LOG_CONFIG[Environment] {
  const env = (process.env.NODE_ENV || 'development') as Environment;
  return LOG_CONFIG[env] || LOG_CONFIG.development;
}
