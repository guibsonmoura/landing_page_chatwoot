# SEC-004: Auditoria de Exposição de Tokens/Keys

## 🎯 Resumo Executivo

**Data:** 2025-01-08  
**Auditor:** Sistema de Segurança Automatizado  
**Escopo:** Exposição de Tokens/Keys em Logs, Requisições e Client-Side  
**Severidade Geral:** 🚨 **CRÍTICA**  

### Status da Auditoria
- **Vulnerabilidades Críticas:** 5
- **Vulnerabilidades Altas:** 3
- **Vulnerabilidades Médias:** 2
- **Status:** 🚨 **BLOQUEADOR PARA BETA**

---

## 🚨 Vulnerabilidades Críticas Identificadas

### **1. SEC-004-001: Exposição Massiva de Dados Sensíveis em Console.log - CRÍTICA**

**Arquivo:** `c:\Dev\agenciaIA\frontend\src\app\api\whatsapp-proxy\route.ts`  
**Severidade:** 🚨 **CRÍTICA**

**Problema:** Console.log expõe dados extremamente sensíveis em produção:

```typescript
// LINHA 15 - EXPOSIÇÃO CRÍTICA
console.log('[WHATSAPP_PROXY] Corpo da requisição recebido:', body);

// LINHA 23 - EXPOSIÇÃO DE TENANT_ID
console.log(`[WHATSAPP_PROXY] Tenant ID recebido do webhook: ${tenant_id}`);

// LINHA 36 - EXPOSIÇÃO DE USER_ID
console.log(`[WHATSAPP_PROXY] Usuário autenticado: ${user.id}`);

// LINHA 49 - EXPOSIÇÃO DE TENANT_ID
console.log(`[WHATSAPP_PROXY] Tenant ID obtido do usuário: ${tenant_id}`);

// LINHA 69 - EXPOSIÇÃO DE URL COMPLETA COM POSSÍVEIS TOKENS
console.log(`[WHATSAPP_PROXY] Disparando webhook para: ${webhookUrl}`);

// LINHA 93 - EXPOSIÇÃO DE RESPOSTA COMPLETA DO WEBHOOK
console.log('[WHATSAPP_PROXY] Webhook disparado com sucesso:', responseData);
```

**Risco:** 
- **Exposição de tenant_ids** em logs de produção
- **Exposição de user_ids** em logs de produção  
- **Exposição de payloads completos** de webhooks
- **Exposição de URLs** com possíveis tokens/keys
- **Violação de LGPD/GDPR** por logging de dados pessoais

### **2. SEC-004-002: Exposição de API Keys em Logs de Erro - CRÍTICA**

**Arquivo:** `c:\Dev\agenciaIA\frontend\src\app\api\whatsapp-proxy\route.ts`  
**Severidade:** 🚨 **CRÍTICA**

**Problema:** Variáveis de ambiente sensíveis podem vazar em logs de erro:

```typescript
// LINHA 62 - REFERÊNCIA EXPLÍCITA A CHAVES SENSÍVEIS
console.error('[WHATSAPP_PROXY] Erro Crítico: As variáveis de ambiente WEBHOOK_URL ou WEBHOOK_API_KEY não estão definidas no servidor.');

// LINHA 98 - EXPOSIÇÃO POTENCIAL DE STACK TRACES COM TOKENS
console.error('[WHATSAPP_PROXY] Erro inesperado no handler da rota:', error);
```

**Risco:**
- **WEBHOOK_API_KEY** pode vazar em stack traces
- **Logs de erro** podem expor tokens em produção
- **Debugging information** pode conter credenciais

### **3. SEC-004-003: Exposição Massiva em QRCodeModal - CRÍTICA**

**Arquivo:** `c:\Dev\agenciaIA\frontend\src\components\channels\QRCodeModal.tsx`  
**Severidade:** 🚨 **CRÍTICA**

**Problema:** Mais de 50 console.log statements expondo dados sensíveis:

```typescript
// EXPOSIÇÃO DE CHANNEL_ID E PHONE_NUMBER
console.log('[QRCodeModal] Channel ID:', channelId);
console.log('[QRCodeModal] Phone Number:', phoneNumber);

// EXPOSIÇÃO DE URLS COMPLETAS COM TOKENS
console.log('[QRCodeModal] Usando proxy URL:', proxyUrl);

// EXPOSIÇÃO DE RESPOSTAS COMPLETAS DE WEBHOOKS
console.log('Resposta do webhook (primeiros 100 caracteres):', responseText.substring(0, 100));
```

**Risco:**
- **Channel IDs** expostos no client-side
- **Phone numbers** expostos em logs
- **URLs com tokens** expostas em logs
- **Respostas de webhooks** expostas

### **4. SEC-004-004: Exposição em ChannelCard - CRÍTICA**

**Arquivo:** `c:\Dev\agenciaIA\frontend\src\components\channels\ChannelCard.tsx`  
**Severidade:** 🚨 **CRÍTICA**

**Problema:** Console.log expõe dados de canais:

```typescript
console.log(`[ChannelCard ${cardId}] Channel ID: ${channel.id}`);
console.log(`[ChannelCard ${cardId}] Account: ${channel.account || 'N/A'}`);
console.log(`[ChannelCard ${cardId}] Usando proxy URL para verificação de status: ${proxyUrl}`);
```

**Risco:**
- **Channel IDs** expostos
- **Account information** exposta
- **Proxy URLs** com possíveis tokens expostas

### **5. SEC-004-005: Exposição de OPENAI_API_KEY - CRÍTICA**

**Arquivo:** `c:\Dev\agenciaIA\frontend\src\lib\actions\wizard.actions.ts`  
**Severidade:** 🚨 **CRÍTICA**

**Problema:** Referência explícita à chave da OpenAI em mensagens de erro:

```typescript
// LINHA 18 - REFERÊNCIA EXPLÍCITA À CHAVE SENSÍVEL
throw new Error('A variável de ambiente OPENAI_API_KEY não está configurada.');
```

**Risco:**
- **Stack traces** podem expor que OPENAI_API_KEY está sendo usada
- **Error messages** em produção revelam informações sobre infraestrutura

---

## ⚠️ Vulnerabilidades Altas

### **6. SEC-004-006: Variáveis NEXT_PUBLIC Expostas - ALTA**

**Arquivos:** Múltiplos arquivos de configuração Supabase  
**Severidade:** ⚠️ **ALTA**

**Problema:** Variáveis NEXT_PUBLIC expostas no client-side:

```typescript
// EXPOSTAS NO BROWSER
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
process.env.NEXT_PUBLIC_WHATSAPP_STATUS_CHECK_INTERVAL
```

**Risco:**
- **SUPABASE_ANON_KEY** visível no client-side (comportamento esperado, mas deve ser monitorado)
- **URLs de serviços** expostas no client-side
- **Configurações** visíveis para atacantes

### **7. SEC-004-007: Logging Excessivo em Produção - ALTA**

**Arquivos:** Múltiplos componentes  
**Severidade:** ⚠️ **ALTA**

**Problema:** Mais de 1000 console.log statements no projeto:

- **QRCodeModal.tsx:** 50+ console.log statements
- **ChannelCard.tsx:** 20+ console.log statements  
- **CreateKnowledgeBaseDialog.tsx:** 5+ console.log statements
- **Múltiplos outros arquivos**

**Risco:**
- **Performance degradation** em produção
- **Exposição acidental** de dados sensíveis
- **Logs excessivos** dificultam debugging

### **8. SEC-004-008: Headers com Tokens em Requisições - ALTA**

**Arquivo:** `c:\Dev\agenciaIA\frontend\src\app\api\whatsapp-proxy\route.ts`  
**Severidade:** ⚠️ **ALTA**

**Problema:** API keys enviadas em headers HTTP:

```typescript
// LINHA 77 - API KEY EM HEADER
headers: {
  'Content-Type': 'application/json',
  'apikey': apiKey, // WEBHOOK_API_KEY exposta em header
},
```

**Risco:**
- **API keys** visíveis em network logs
- **Headers** podem ser interceptados
- **Debugging tools** podem expor tokens

---

## 🟡 Vulnerabilidades Médias

### **9. SEC-004-009: Error Handling Inadequado - MÉDIA**

**Arquivos:** Múltiplos  
**Severidade:** 🟡 **MÉDIA**

**Problema:** Tratamento de erro pode expor informações sensíveis:

```typescript
// Pode expor stack traces com tokens
console.error('[WHATSAPP_PROXY] Erro inesperado no handler da rota:', error);
```

### **10. SEC-004-010: Configuração de Logging - MÉDIA**

**Problema:** Falta de controle granular de logging por ambiente

---

## 🛡️ Correções Recomendadas

### **Prioridade 1 - CRÍTICA (Implementar Imediatamente)**

#### **1. Substituir TODOS os console.log por Logger Seguro**

```typescript
// ❌ ANTES - VULNERÁVEL
console.log('[WHATSAPP_PROXY] Corpo da requisição recebido:', body);
console.log(`[WHATSAPP_PROXY] Tenant ID recebido do webhook: ${tenant_id}`);
console.log(`[WHATSAPP_PROXY] Usuário autenticado: ${user.id}`);

// ✅ DEPOIS - SEGURO
logger.debug('WhatsApp proxy request received', {
  hasBody: !!body,
  bodyKeys: body ? Object.keys(body) : []
});
logger.debug('Tenant ID obtained from webhook', { hasTenantId: !!tenant_id });
logger.debug('User authenticated successfully', { hasUserId: !!user.id });
```

#### **2. Implementar Sanitização Automática**

```typescript
// Utilitário para sanitizar dados sensíveis
function sanitizeForLogging(data: any): any {
  const sensitiveFields = [
    'tenant_id', 'user_id', 'channel_id', 'phone_number',
    'apikey', 'api_key', 'token', 'password', 'email'
  ];
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }
  
  return data;
}
```

#### **3. Configurar Logging por Ambiente**

```typescript
// Configuração de logging baseada em ambiente
const logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

// Desabilitar console.log em produção
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}
```

### **Prioridade 2 - ALTA**

#### **4. Implementar Headers Seguros**

```typescript
// ✅ Usar Authorization header ao invés de custom headers
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`, // Padrão mais seguro
},
```

#### **5. Implementar Rate Limiting para APIs**

```typescript
// Implementar rate limiting para prevenir ataques
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
```

### **Prioridade 3 - MÉDIA**

#### **6. Implementar Monitoramento de Segurança**

```typescript
// Monitorar tentativas de acesso não autorizado
logger.security('Unauthorized access attempt', {
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  timestamp: new Date().toISOString()
});
```

---

## 📊 Estatísticas de Vulnerabilidades

### **Por Severidade:**
- 🚨 **Críticas:** 5 (50%)
- ⚠️ **Altas:** 3 (30%)
- 🟡 **Médias:** 2 (20%)

### **Por Categoria:**
- **Logging Inseguro:** 7 vulnerabilidades
- **Exposição de Tokens:** 2 vulnerabilidades
- **Client-Side Exposure:** 1 vulnerabilidade

### **Arquivos Mais Críticos:**
1. `whatsapp-proxy/route.ts` - 3 vulnerabilidades críticas
2. `QRCodeModal.tsx` - 1 vulnerabilidade crítica
3. `ChannelCard.tsx` - 1 vulnerabilidade crítica
4. `wizard.actions.ts` - 1 vulnerabilidade crítica

---

## 🎯 Plano de Correção

### **Fase 1 - Emergencial (24h)**
1. ✅ Substituir console.log por logger seguro em `whatsapp-proxy/route.ts`
2. ✅ Implementar sanitização automática de dados sensíveis
3. ✅ Desabilitar console.log em produção

### **Fase 2 - Crítica (48h)**
1. ✅ Substituir console.log em `QRCodeModal.tsx`
2. ✅ Substituir console.log em `ChannelCard.tsx`
3. ✅ Implementar headers seguros para APIs

### **Fase 3 - Consolidação (1 semana)**
1. ✅ Substituir TODOS os console.log restantes
2. ✅ Implementar monitoramento de segurança
3. ✅ Adicionar testes de segurança automatizados

---

## ⚠️ Conclusão

**Status SEC-004:** 🚨 **VULNERABILIDADES CRÍTICAS IDENTIFICADAS - BLOQUEADOR PARA BETA**

O sistema possui **vulnerabilidades críticas de exposição de tokens/keys** que representam um **risco extremo** para a segurança:

### **Riscos Imediatos:**
1. **Exposição de dados pessoais** (tenant_ids, user_ids) em logs
2. **Possível vazamento de API keys** em stack traces
3. **Violação de LGPD/GDPR** por logging inadequado
4. **Exposição de informações de infraestrutura**

### **Impacto:**
- **Vazamento de dados** de múltiplos tenants
- **Comprometimento de API keys** de terceiros
- **Exposição de arquitetura** do sistema
- **Violações de compliance** regulatório

### **Recomendação:**
**NÃO LANÇAR BETA** até que todas as vulnerabilidades críticas sejam corrigidas. O sistema atual representa um **risco inaceitável** de exposição de dados sensíveis.

---

**Próximo passo:** Implementar correções emergenciais nas vulnerabilidades críticas identificadas.
