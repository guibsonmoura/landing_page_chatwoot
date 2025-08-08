# Manual do Sistema de Logs - Nexus Agents

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Configuração de Ambiente](#configuração-de-ambiente)
4. [Níveis de Log](#níveis-de-log)
5. [Sistema de Sanitização](#sistema-de-sanitização)
6. [Proteção em Produção](#proteção-em-produção)
7. [Guia de Uso](#guia-de-uso)
8. [Exemplos Práticos](#exemplos-práticos)
9. [Troubleshooting](#troubleshooting)
10. [Melhores Práticas](#melhores-práticas)

---

## 🎯 Visão Geral

O sistema de logs do Nexus Agents foi projetado com **segurança em primeiro lugar**, implementando múltiplas camadas de proteção contra vazamento de dados sensíveis. O sistema utiliza:

- **Pino Logger**: Logger estruturado de alta performance
- **Sanitização Automática**: Remove dados sensíveis automaticamente
- **Proteção em Produção**: Desabilita logs não críticos em produção
- **Configuração por Ambiente**: Diferentes níveis para dev/staging/produção

### Benefícios Principais:
- ✅ **Zero vazamento** de dados sensíveis em produção
- ✅ **Performance otimizada** com logs condicionais
- ✅ **Debugging eficiente** em desenvolvimento
- ✅ **Auditoria completa** com logs estruturados
- ✅ **Conformidade LGPD/GDPR** com sanitização automática

---

## 🏗️ Arquitetura do Sistema

### Componentes Principais:

```
┌─────────────────────────────────────────────────────────────┐
│                    Sistema de Logs                          │
├─────────────────────────────────────────────────────────────┤
│  1. Logger Centralizado (Pino)                             │
│     ├── Níveis hierárquicos (debug → error)                │
│     ├── Formatação estruturada (JSON/Pretty)               │
│     └── Transport configurável por ambiente                │
│                                                             │
│  2. Sistema de Sanitização                                 │
│     ├── 34+ campos sensíveis identificados                 │
│     ├── Sanitização recursiva de objetos                   │
│     └── Redação de padrões sensíveis em strings            │
│                                                             │
│  3. Proteção em Produção                                   │
│     ├── Desabilitação de console.log/debug/info            │
│     ├── Sanitização de console.error/warn                  │
│     └── Ativação automática por NODE_ENV                   │
└─────────────────────────────────────────────────────────────┘
```

### Arquivos Principais:

- **`src/lib/logger.ts`**: Logger centralizado com Pino
- **`src/lib/security/disable-console-production.ts`**: Proteção em produção
- **`src/app/layout.tsx`**: Ativação global do sistema

---

## ⚙️ Configuração de Ambiente

### Variáveis de Ambiente Disponíveis:

```bash
# .env ou .env.local

# Nível de log (debug|info|warn|error)
LOG_LEVEL=debug

# Ambiente da aplicação
NODE_ENV=development

# Configurações opcionais
LOG_PRETTY=true          # Formatação legível (dev only)
LOG_TIMESTAMP=true       # Incluir timestamps
```

### Configuração por Ambiente:

#### **Desenvolvimento Local:**
```bash
# .env.local
NODE_ENV=development
LOG_LEVEL=debug
LOG_PRETTY=true
```

#### **Staging:**
```bash
# .env.staging
NODE_ENV=staging
LOG_LEVEL=info
LOG_PRETTY=false
```

#### **Produção:**
```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=error
LOG_PRETTY=false
```

---

## 📊 Níveis de Log

O sistema utiliza **4 níveis hierárquicos** de log, onde cada nível inclui os níveis superiores:

### Hierarquia de Níveis:

```
┌─────────────────────────────────────────────────────────────┐
│  DEBUG (10) ← Mais verboso                                  │
│    ├── Informações detalhadas de debugging                 │
│    ├── Fluxo de execução passo a passo                     │
│    └── Dados de desenvolvimento (sanitizados)              │
│                                                             │
│  INFO (20) ← Informações gerais                            │
│    ├── Operações importantes completadas                   │
│    ├── Estado da aplicação                                 │
│    └── Métricas e estatísticas                             │
│                                                             │
│  WARN (30) ← Avisos importantes                            │
│    ├── Situações que merecem atenção                       │
│    ├── Degradação de performance                           │
│    └── Configurações subótimas                             │
│                                                             │
│  ERROR (40) ← Apenas erros críticos                        │
│    ├── Falhas de sistema                                   │
│    ├── Exceções não tratadas                               │
│    └── Problemas que impedem funcionamento                 │
└─────────────────────────────────────────────────────────────┘
```

### Configuração Automática por Ambiente:

| Ambiente    | Nível Padrão | Console Ativo | Sanitização | Formato    |
|-------------|--------------|---------------|-------------|------------|
| development | `debug`      | ✅ Sim        | ❌ Não      | Pretty     |
| staging     | `info`       | ✅ Sim        | ✅ Sim      | JSON       |
| production  | `error`      | ❌ Não        | ✅ Sim      | JSON       |

---

## 🛡️ Sistema de Sanitização

### Campos Sensíveis Identificados (34+ campos):

```typescript
const SENSITIVE_FIELDS = [
  // Autenticação e Autorização
  'password', 'password_temp', 'token', 'api_key', 'apiKey',
  'secret', 'auth', 'authorization', 'access_token', 'refresh_token',
  'bearer', 'jwt', 'session_id', 'sessionId',
  
  // Identificadores Sensíveis
  'user_id', 'userId', 'tenant_id', 'tenantId', 'channel_id',
  'customer_id', 'agent_id', 'conversation_id',
  
  // Dados Pessoais (LGPD/GDPR)
  'email', 'phone', 'phone_number', 'cpf', 'cnpj',
  'address', 'full_name', 'name', 'surname',
  
  // Chaves de API Específicas
  'OPENAI_API_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
  'WHATSAPP_WEBHOOK_API_KEY', 'WHATSAPP_TOKEN',
  
  // Dados Binários
  'base64', 'image_data', 'file_content', 'blob'
];
```

### Tipos de Sanitização:

#### **1. Sanitização de Objetos:**
```typescript
// ANTES (inseguro):
{
  user_id: "usr_123456",
  email: "user@example.com",
  token: "eyJhbGciOiJIUzI1NiIs...",
  data: { count: 5 }
}

// DEPOIS (sanitizado):
{
  user_id: "[REDACTED]",
  email: "[REDACTED]",
  token: "[REDACTED]",
  data: { count: 5 }
}
```

#### **2. Sanitização de Strings:**
```typescript
// ANTES (inseguro):
"User tenant_id:123 logged in with token:abc123"

// DEPOIS (sanitizado):
"User tenant_id:[REDACTED] logged in with token:[REDACTED]"
```

#### **3. Sanitização de Arrays:**
```typescript
// ANTES (inseguro):
[
  { user_id: "123", name: "João" },
  { user_id: "456", name: "Maria" }
]

// DEPOIS (sanitizado):
[
  { user_id: "[REDACTED]", name: "João" },
  { user_id: "[REDACTED]", name: "Maria" }
]
```

### Sanitização Recursiva:

O sistema sanitiza objetos aninhados até **3 níveis de profundidade** para evitar recursão infinita:

```typescript
{
  level1: {
    level2: {
      level3: {
        user_id: "[REDACTED]"  // ✅ Sanitizado
      }
    }
  },
  level4: "[Object too deep]"  // 🛑 Limite atingido
}
```

---

## 🔒 Proteção em Produção

### Sistema disable-console-production.ts:

#### **Ativação Automática:**
```typescript
// Ativado automaticamente quando NODE_ENV=production
if (process.env.NODE_ENV === 'production') {
  // Desabilita logs não críticos
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}
```

#### **Sanitização de Logs Críticos:**
```typescript
// console.error e console.warn são mantidos mas sanitizados
console.error = (...args: any[]) => {
  const sanitizedArgs = args.map(arg => sanitizeForLogging(arg));
  originalError.apply(console, sanitizedArgs);
};
```

### Proteções Implementadas:

1. **🚫 Desabilitação Total**: `console.log`, `console.debug`, `console.info`
2. **🛡️ Sanitização Automática**: `console.error`, `console.warn`
3. **📋 Logs Estruturados**: Apenas através do logger centralizado
4. **🔍 Auditoria**: Todos os logs passam pela sanitização

---

## 📖 Guia de Uso

### Importação do Logger:

```typescript
import logger from '@/lib/logger';
```

### Métodos Disponíveis:

#### **1. logger.debug() - Debugging Detalhado:**
```typescript
// Uso básico
logger.debug('Function started');

// Com dados contextuais
logger.debug('Processing user data', { 
  hasUser: !!user,           // ✅ Metadados seguros
  recordCount: records.length // ✅ Estatísticas
});

// ❌ EVITAR - dados sensíveis:
logger.debug('User details', { user_id: user.id }); // Será sanitizado
```

#### **2. logger.info() - Informações Gerais:**
```typescript
// Operações importantes
logger.info('User authentication successful');

// Métricas e estatísticas
logger.info('Database query completed', {
  duration: 150,
  recordsFound: 42,
  cacheHit: true
});

// Estado da aplicação
logger.info('Service started', {
  port: 3000,
  environment: process.env.NODE_ENV
});
```

#### **3. logger.warn() - Avisos Importantes:**
```typescript
// Situações que merecem atenção
logger.warn('Rate limit approaching', {
  currentRequests: 95,
  limit: 100,
  timeWindow: '1min'
});

// Configurações subótimas
logger.warn('Using fallback configuration', {
  reason: 'Primary config unavailable',
  fallbackUsed: 'default'
});

// Performance degradada
logger.warn('Slow database query detected', {
  duration: 5000,
  threshold: 1000,
  query: 'getUserData' // ❌ Não incluir SQL completo
});
```

#### **4. logger.error() - Erros Críticos:**
```typescript
// Erros com contexto
logger.error('Database connection failed', {
  hasError: !!error,
  retryAttempt: 3,
  maxRetries: 5
});

// Erros com stack trace (sanitizado em produção)
logger.error('Authentication failed', error, {
  endpoint: '/api/auth',
  method: 'POST'
});

// Falhas críticas
logger.error('Service unavailable', {
  service: 'payment-gateway',
  downtime: '5min',
  impact: 'high'
});
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Autenticação de Usuário

```typescript
import logger from '@/lib/logger';

async function authenticateUser(email: string, password: string) {
  logger.debug('Authentication started', { 
    hasEmail: !!email,
    hasPassword: !!password 
  });
  
  try {
    const user = await authService.login(email, password);
    
    logger.info('User authenticated successfully', {
      hasUserId: !!user.id,
      userRole: user.role,
      loginTime: new Date().toISOString()
    });
    
    return user;
  } catch (error) {
    logger.error('Authentication failed', error, {
      hasEmail: !!email,
      errorType: error.name
    });
    throw error;
  }
}
```

### Exemplo 2: Processamento de Dados

```typescript
import logger from '@/lib/logger';

async function processUserData(userData: any[]) {
  logger.debug('Data processing started', {
    recordCount: userData.length,
    processingMode: 'batch'
  });
  
  let processed = 0;
  let errors = 0;
  
  for (const record of userData) {
    try {
      await processRecord(record);
      processed++;
      
      if (processed % 100 === 0) {
        logger.info('Processing progress', {
          processed,
          total: userData.length,
          percentage: Math.round((processed / userData.length) * 100)
        });
      }
    } catch (error) {
      errors++;
      logger.warn('Record processing failed', {
        hasRecordId: !!record.id,
        errorCount: errors,
        continueProcessing: true
      });
    }
  }
  
  logger.info('Data processing completed', {
    totalRecords: userData.length,
    successfullyProcessed: processed,
    errors,
    successRate: Math.round((processed / userData.length) * 100)
  });
}
```

### Exemplo 3: Integração com API Externa

```typescript
import logger from '@/lib/logger';

async function callExternalAPI(endpoint: string, data: any) {
  const startTime = Date.now();
  
  logger.debug('External API call started', {
    endpoint,
    hasData: !!data,
    method: 'POST'
  });
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      logger.warn('API call returned non-200 status', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        duration
      });
    }
    
    const result = await response.json();
    
    logger.info('External API call completed', {
      endpoint,
      status: response.status,
      duration,
      hasResult: !!result
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('External API call failed', error, {
      endpoint,
      duration,
      errorType: error.name
    });
    
    throw error;
  }
}
```

---

## 🔧 Troubleshooting

### Problemas Comuns:

#### **1. Logs não aparecem:**

**Sintoma:** Nenhum log é exibido no console
```bash
# Verificar configuração
echo $LOG_LEVEL
echo $NODE_ENV
```

**Solução:**
```bash
# Definir nível mais verboso
export LOG_LEVEL=debug
# ou no .env
LOG_LEVEL=debug
```

#### **2. Logs aparecem sanitizados em desenvolvimento:**

**Sintoma:** Dados aparecem como `[REDACTED]` em dev
```typescript
// Verificar se sanitização está ativa
const config = getLogConfig();
console.log('Sanitize enabled:', config.sanitize);
```

**Solução:**
```bash
# Garantir ambiente de desenvolvimento
NODE_ENV=development
```

#### **3. Performance impactada por logs:**

**Sintoma:** Aplicação lenta com muitos logs
```bash
# Reduzir verbosidade
LOG_LEVEL=warn  # ou error
```

#### **4. Logs não estruturados:**

**Sintoma:** Logs aparecem como texto simples
```typescript
// ❌ Incorreto:
console.log('User data:', userData);

// ✅ Correto:
logger.info('User data processed', { 
  hasUserData: !!userData,
  recordCount: userData.length 
});
```

### Debugging do Sistema de Logs:

```typescript
// Verificar configuração atual
import { getLogConfig } from '@/lib/security/disable-console-production';

const config = getLogConfig();
console.log('Log Configuration:', {
  level: config.level,
  enableConsole: config.enableConsole,
  sanitize: config.sanitize,
  environment: process.env.NODE_ENV
});
```

---

## ✅ Melhores Práticas

### DO's (Faça):

#### **1. Use o Logger Centralizado:**
```typescript
// ✅ CORRETO
import logger from '@/lib/logger';
logger.info('Operation completed', { success: true });
```

#### **2. Inclua Contexto Relevante:**
```typescript
// ✅ CORRETO
logger.error('Database query failed', error, {
  table: 'users',
  operation: 'SELECT',
  hasWhere: !!whereClause,
  duration: queryTime
});
```

#### **3. Use Metadados em vez de Dados Brutos:**
```typescript
// ✅ CORRETO
logger.debug('Processing user', {
  hasUserId: !!user.id,
  userRole: user.role,
  isActive: user.active
});
```

#### **4. Estruture Logs Hierarquicamente:**
```typescript
// ✅ CORRETO - Use níveis apropriados
logger.debug('Detailed debugging info');  // Desenvolvimento
logger.info('Important operation');       // Geral
logger.warn('Attention needed');          // Avisos
logger.error('Critical failure');         // Erros
```

### DON'Ts (Não Faça):

#### **1. Não Use console.log Diretamente:**
```typescript
// ❌ INCORRETO - Pode vazar dados sensíveis
console.log('User data:', userData);

// ✅ CORRETO
logger.info('User data processed', { recordCount: userData.length });
```

#### **2. Não Exponha Dados Sensíveis:**
```typescript
// ❌ INCORRETO
logger.info('User details', {
  user_id: user.id,      // Será sanitizado
  email: user.email,     // Será sanitizado
  password: user.pass    // Será sanitizado
});

// ✅ CORRETO
logger.info('User processed', {
  hasUserId: !!user.id,
  hasEmail: !!user.email,
  accountType: user.type
});
```

#### **3. Não Faça Logs Excessivos em Loops:**
```typescript
// ❌ INCORRETO - Impacta performance
for (const item of items) {
  logger.debug('Processing item', item); // Muitos logs
}

// ✅ CORRETO - Logs em lote
logger.debug('Starting batch processing', { itemCount: items.length });
items.forEach((item, index) => {
  processItem(item);
  if (index % 100 === 0) {
    logger.debug('Batch progress', { processed: index + 1, total: items.length });
  }
});
logger.info('Batch processing completed', { totalProcessed: items.length });
```

#### **4. Não Ignore Configuração de Ambiente:**
```typescript
// ❌ INCORRETO - Força nível específico
logger.level = 'debug'; // Ignora configuração

// ✅ CORRETO - Respeita configuração
// O nível é definido automaticamente por LOG_LEVEL
```

### Checklist de Segurança:

- [ ] ✅ **Logger centralizado** importado corretamente
- [ ] ✅ **Dados sensíveis** não expostos diretamente
- [ ] ✅ **Metadados** usados em vez de dados brutos
- [ ] ✅ **Níveis apropriados** para cada tipo de log
- [ ] ✅ **Contexto relevante** incluído nos logs
- [ ] ✅ **Performance** considerada em loops
- [ ] ✅ **Configuração de ambiente** respeitada
- [ ] ✅ **Sanitização** funcionando corretamente

---

## 📚 Referências Técnicas

### Arquivos do Sistema:
- **Logger Principal**: `src/lib/logger.ts`
- **Proteção Produção**: `src/lib/security/disable-console-production.ts`
- **Ativação Global**: `src/app/layout.tsx`
- **Configuração**: Variáveis de ambiente (.env)

### Dependências:
- **Pino**: Logger estruturado de alta performance
- **Pino-Pretty**: Formatação legível para desenvolvimento

### Documentação Adicional:
- [Pino Documentation](https://getpino.io/)
- [Structured Logging Best Practices](https://www.loggly.com/ultimate-guide/structured-logging/)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

---

## 📝 Changelog

### v1.0.0 (2025-01-08)
- ✅ Implementação inicial do sistema de logs
- ✅ Sanitização automática de 34+ campos sensíveis
- ✅ Proteção em produção com disable-console-production
- ✅ Configuração por ambiente via LOG_LEVEL
- ✅ Integração com Pino logger
- ✅ Documentação completa do sistema

---

**Documento criado em:** 08/01/2025  
**Versão:** 1.0.0  
**Autor:** Sistema de Auditoria de Segurança - SEC-004  
**Projeto:** Nexus Agents - Sistema de Logs Seguros
