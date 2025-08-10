# Documentação Técnica - Nexus Agents v2.0

## 📋 **Índice**

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura e Stack Tecnológico](#arquitetura-e-stack-tecnológico)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Autenticação e Segurança](#autenticação-e-segurança)
6. [Sistema Multi-Tenant](#sistema-multi-tenant)
7. [APIs e Server Actions](#apis-e-server-actions)
8. [Sistema de Mensageria](#sistema-de-mensageria)
9. [Sistema de Pagamentos](#sistema-de-pagamentos)
10. [Deployment e DevOps](#deployment-e-devops)
11. [Configuração de Desenvolvimento](#configuração-de-desenvolvimento)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 **Visão Geral do Sistema**

O **Nexus Agents** é uma plataforma SaaS multi-tenant para criação e gerenciamento de agentes de IA conversacionais. O sistema permite que empresas criem, configurem e monitorem chatbots inteligentes integrados a múltiplos canais de comunicação.

### **Características Principais:**
- **Multi-tenant**: Isolamento completo de dados por cliente
- **Escalável**: Arquitetura preparada para crescimento horizontal
- **Seguro**: RLS (Row Level Security) em todas as tabelas
- **Modular**: Componentes reutilizáveis e bem organizados
- **Real-time**: Notificações e mensagens em tempo real

---

## 🏗️ **Arquitetura e Stack Tecnológico**

### **Frontend:**
- **Next.js 15.4.1** (App Router)
- **React 19.1.0** (Server/Client Components)
- **TypeScript** (Type Safety)
- **Tailwind CSS** (Styling)
- **Radix UI** (Component Library)
- **Zustand** (State Management)
- **React Hook Form + Zod** (Form Validation)

### **Backend:**
- **Supabase** (Database + Auth + Real-time)
- **PostgreSQL 17** (Database)
- **Row Level Security** (Data Isolation)
- **Server Actions** (API Layer)

### **Infraestrutura:**
- **Docker** (Containerization)
- **Docker Hub** (Image Registry)
- **Portainer** (Container Management)
- **Traefik** (Reverse Proxy + SSL)

### **Integrações:**
- **OpenAI API** (LLM Processing)
- **WhatsApp Business API** (Messaging)
- **Supabase Auth** (Authentication)

---

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Principais:**

#### **1. tenants**
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    plan_id UUID REFERENCES plans(id),
    phone TEXT,
    chat_url TEXT,
    chat_empresa TEXT,
    chat_id SMALLINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Função:** Armazena informações dos clientes (tenants) e suas configurações de plano.

#### **2. tenant_agents**
```sql
CREATE TABLE tenant_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    agent_name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    llm_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Função:** Define as personalidades e configurações de cada agente de IA.

#### **3. tenant_channels**
```sql
CREATE TABLE tenant_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    platform TEXT NOT NULL,
    account TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Função:** Gerencia canais de comunicação (WhatsApp, Instagram, WebChat).

#### **4. messages (Sistema de Mensageria)**
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    sender_id UUID REFERENCES auth.users(id),
    type VARCHAR(50) DEFAULT 'notification',
    scope VARCHAR(50) DEFAULT 'individual',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'active',
    scheduled_for TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **5. message_recipients**
```sql
CREATE TABLE message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    read_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMPTZ,
    is_acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **6. payments (Sistema de Pagamentos)**
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    gateway_transaction_id TEXT,
    gateway_response JSONB,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Row Level Security (RLS)**

Todas as tabelas implementam RLS para garantir isolamento multi-tenant:

```sql
-- Exemplo de política RLS para tenant_agents
CREATE POLICY "tenant_agents_tenant_isolation" 
ON tenant_agents 
FOR ALL 
USING (
    tenant_id IN (
        SELECT id FROM tenants WHERE user_id = auth.uid()
    )
);
```

---

## 📁 **Estrutura do Projeto**

```
web/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── (auth)/            # Grupo de rotas de autenticação
│   │   │   ├── login/         # Página de login
│   │   │   └── signup/        # Página de cadastro
│   │   ├── dashboard/         # Dashboard principal
│   │   │   ├── agents/        # Gestão de agentes IA
│   │   │   ├── channels/      # Gestão de canais
│   │   │   ├── knowledge-base/ # Base de conhecimento
│   │   │   ├── messages/      # Sistema de mensageria
│   │   │   ├── analytics/     # Analytics e métricas
│   │   │   ├── attendants/    # Gestão de atendentes
│   │   │   └── plano/         # Gestão de planos e pagamentos
│   │   ├── api/               # API Routes
│   │   └── globals.css        # Estilos globais
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   ├── auth/             # Componentes de autenticação
│   │   ├── dashboard/        # Componentes do dashboard
│   │   ├── agents/           # Componentes de agentes
│   │   ├── channels/         # Componentes de canais
│   │   ├── messaging/        # Componentes de mensageria
│   │   ├── analytics/        # Componentes de analytics
│   │   ├── landing/          # Componentes da landing page
│   │   └── layout/           # Componentes de layout
│   ├── lib/                  # Utilitários e configurações
│   │   ├── actions/          # Server Actions
│   │   ├── supabase/         # Configuração Supabase
│   │   ├── utils/            # Funções utilitárias
│   │   ├── types/            # Definições de tipos
│   │   └── billing/          # Lógica de cobrança
│   └── types/                # Tipos TypeScript globais
├── migrations/               # Migrações do banco de dados
├── public/                   # Assets estáticos
├── Dockerfile               # Configuração Docker
├── docker-stack.yml         # Stack Docker Swarm
└── package.json            # Dependências e scripts
```

---

## 🔐 **Autenticação e Segurança**

### **Fluxo de Autenticação:**

1. **Signup/Login** via Supabase Auth
2. **Trigger automático** cria tenant para novo usuário
3. **Middleware** protege rotas do dashboard
4. **RLS** garante isolamento de dados

### **Middleware de Proteção:**
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}
```

### **Trigger de Criação de Tenant:**
```sql
CREATE OR REPLACE FUNCTION create_tenant_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO tenants (name, user_id, plan_id)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.id,
        (SELECT id FROM plans WHERE name = 'Trial' LIMIT 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🏢 **Sistema Multi-Tenant**

### **Arquitetura Multi-Tenant:**

O sistema implementa **multi-tenancy por linha** (row-level), onde:

1. **Cada usuário** possui um `tenant_id`
2. **Todas as tabelas** referenciam `tenant_id`
3. **RLS** filtra automaticamente os dados
4. **Server Actions** sempre incluem verificação de tenant

### **Exemplo de Server Action Multi-Tenant:**
```typescript
export async function getAgents() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  // Busca tenant do usuário
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('user_id', user.id)
    .single();
    
  if (!tenant) throw new Error('Tenant not found');
  
  // Busca agentes do tenant (RLS aplica filtro automático)
  const { data: agents } = await supabase
    .from('tenant_agents')
    .select('*')
    .eq('tenant_id', tenant.id);
    
  return { data: agents };
}
```

---

## 🔌 **APIs e Server Actions**

### **Estrutura das Server Actions:**

```
src/lib/actions/
├── agent.actions.ts         # CRUD de agentes
├── channel.actions.ts       # CRUD de canais
├── analytics.actions.ts     # Métricas e analytics
├── message.actions.ts       # Sistema de mensageria
├── payment.actions.ts       # Sistema de pagamentos
├── invoice.actions.ts       # Gestão de faturas
└── cms.actions.ts          # CMS da landing page
```

### **Padrão das Server Actions:**
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';

export async function createAgent(formData: FormData) {
  const supabase = createClient();
  
  // 1. Autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  
  // 2. Validação
  const agentName = formData.get('agent_name') as string;
  if (!agentName) return { error: 'Agent name required' };
  
  // 3. Busca tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('user_id', user.id)
    .single();
    
  if (!tenant) return { error: 'Tenant not found' };
  
  // 4. Operação no banco
  const { data, error } = await supabase
    .from('tenant_agents')
    .insert({
      tenant_id: tenant.id,
      agent_name: agentName,
      system_prompt: formData.get('system_prompt') as string
    })
    .select()
    .single();
    
  if (error) return { error: error.message };
  return { data };
}
```

---

## 💬 **Sistema de Mensageria**

### **Arquitetura do Sistema:**

O sistema de mensageria permite comunicação interna entre administradores e clientes:

#### **Componentes Principais:**

1. **NotificationBell** - Sino de notificações no header
2. **MessagesPage** - Página principal de mensagens
3. **MessageForm** - Formulário de envio (oculto para clientes)
4. **MessageFilters** - Filtros de tipo, prioridade, status

#### **Fluxo de Mensagens:**

```typescript
// 1. Criação de mensagem
const message = await createMessage({
  type: 'notification',
  scope: 'individual',
  title: 'Título da mensagem',
  content: 'Conteúdo da mensagem',
  priority: 'normal'
});

// 2. Criação de destinatários
await createMessageRecipients(message.id, [user1.id, user2.id]);

// 3. Notificação em tempo real (via Supabase Realtime)
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'message_recipients'
  }, handleNewMessage)
  .subscribe();
```

#### **Filtros Client-Side:**

Devido às limitações do Supabase com relacionamentos aninhados, os filtros são aplicados no client:

```typescript
const filteredMessages = messages.filter(recipient => {
  const message = recipient.message;
  
  // Filtro por tipo
  if (filters.type !== 'all' && message.type !== filters.type) {
    return false;
  }
  
  // Filtro por prioridade
  if (filters.priority !== 'all' && message.priority !== filters.priority) {
    return false;
  }
  
  // Filtro por status
  if (filters.status !== 'all' && message.status !== filters.status) {
    return false;
  }
  
  // Filtro por busca
  if (filters.search && !message.title.toLowerCase().includes(filters.search.toLowerCase())) {
    return false;
  }
  
  return true;
});
```

---

## 💳 **Sistema de Pagamentos**

### **Estrutura do Sistema:**

#### **Tabelas Relacionadas:**
- `payments` - Registros de pagamentos
- `invoices` - Faturas geradas
- `payment_methods` - Métodos de pagamento do cliente

#### **Interface de Pagamentos:**

Localizada em `/dashboard/plano` com abas:

1. **Visão Geral** - Status do plano atual
2. **Faturamento** - Histórico de pagamentos e faturas
3. **Métodos de Pagamento** - Cartões e formas de pagamento
4. **Métricas** - Analytics de economia gerada pela IA

#### **Fluxo de Pagamento:**
```typescript
// 1. Criação de fatura
const invoice = await createInvoice({
  tenant_id: tenantId,
  amount: planPrice,
  due_date: nextMonth,
  items: [{ description: 'Plano Pro', amount: planPrice }]
});

// 2. Processamento de pagamento (futuro)
const payment = await processPayment({
  invoice_id: invoice.id,
  payment_method: 'credit_card',
  gateway: 'stripe' // ou 'mercadopago'
});

// 3. Atualização de status
await updateInvoiceStatus(invoice.id, 'paid');
```

---

## 🚀 **Deployment e DevOps**

### **Docker Configuration:**

#### **Dockerfile:**
```dockerfile
FROM node:20-alpine AS base

# Instalar dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

# Build da aplicação
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_SKIP_BUILD_STATIC_GENERATION=true

RUN npm run build

# Produção
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

#### **Docker Stack (docker-stack.yml):**
```yaml
version: '3.8'

services:
  nexus-agents:
    image: frmilani/nexus-agents:v2.0
    networks:
      - traefik-public
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    deploy:
      replicas: 1
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.nexus-agents.rule=Host(`app.nexusagents.com.br`)"
        - "traefik.http.routers.nexus-agents.tls=true"
        - "traefik.http.routers.nexus-agents.tls.certresolver=letsencrypt"
        - "traefik.http.services.nexus-agents.loadbalancer.server.port=3000"

networks:
  traefik-public:
    external: true
```

### **CI/CD Process:**

1. **Desenvolvimento** → Commit no GitHub
2. **Build** → `docker build -t nexus-agents:v2.0`
3. **Push** → `docker push frmilani/nexus-agents:v2.0`
4. **Deploy** → Portainer pull da nova imagem
5. **Rollout** → Atualização zero-downtime

---

## ⚙️ **Configuração de Desenvolvimento**

### **Pré-requisitos:**
- Node.js 20+
- Docker Desktop
- Conta Supabase
- Conta OpenAI

### **Setup Local:**

1. **Clone do repositório:**
```bash
git clone https://github.com/frmilani/nexus-agents.git
cd nexus-agents/web
```

2. **Instalação de dependências:**
```bash
npm install
```

3. **Configuração de ambiente:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

4. **Execução das migrações:**
```sql
-- Execute no Supabase SQL Editor
-- migrations/001_initial_schema.sql
-- migrations/002_create_plans.sql
-- migrations/003_create_messaging_system.sql
```

5. **Desenvolvimento:**
```bash
npm run dev
```

### **Scripts Disponíveis:**
```json
{
  "dev": "next dev",           // Desenvolvimento
  "build": "next build",       // Build de produção
  "start": "next start",       // Servidor de produção
  "lint": "next lint"          // Linting
}
```

---

## 🔧 **Troubleshooting**

### **Problemas Comuns:**

#### **1. Erro de Build - next/headers**
```
Error: You're importing a component that needs "next/headers"
```
**Solução:** Remover páginas de teste que usam server components incorretamente.

#### **2. RLS Policy Error**
```
Error: new row violates row-level security policy
```
**Solução:** Verificar se o usuário tem tenant associado e as policies estão corretas.

#### **3. Supabase Connection Error**
```
Error: Invalid API key
```
**Solução:** Verificar variáveis de ambiente e chaves do Supabase.

#### **4. Docker Build Fails**
```
Error: ENOENT: no such file or directory
```
**Solução:** Verificar .dockerignore e estrutura de arquivos.

### **Logs e Debugging:**

#### **Logs do Container:**
```bash
docker logs container_name
```

#### **Logs do Supabase:**
```sql
SELECT * FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour';
```

#### **Debug de RLS:**
```sql
-- Testar policy manualmente
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid"}';
SELECT * FROM tenant_agents;
```

---

## 📚 **Recursos Adicionais**

### **Documentação de Referência:**
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)

### **Ferramentas de Desenvolvimento:**
- **VS Code Extensions:**
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Prettier - Code formatter

### **Monitoramento:**
- **Supabase Dashboard** - Métricas de banco de dados
- **Portainer** - Status dos containers
- **Traefik Dashboard** - Proxy e SSL status

---

## 🔄 **Versionamento**

### **Versão Atual: v2.0**

#### **Changelog v2.0:**
- ✅ Sistema de mensageria completo
- ✅ Interface de pagamentos implementada
- ✅ Dashboard UX otimizado
- ✅ Sistema de loading global
- ✅ Marca valorizada
- ✅ Menu reorganizado

#### **Próximas Versões:**
- **v2.1** - Integração com gateways de pagamento
- **v2.2** - Sistema de templates de agentes
- **v2.3** - Analytics avançados
- **v3.0** - API pública para integrações

---

**Documentação criada em:** Janeiro 2025  
**Última atualização:** v2.0  
**Mantenedor:** Equipe Nexus Agents  
**Contato:** dev@nexusagents.com.br
