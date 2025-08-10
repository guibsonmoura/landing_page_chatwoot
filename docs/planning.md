# PLANNING.MD - Nexus Agents (Versão Final)

## 1. Visão Geral do Projeto

*   **Nome da Aplicação:** Nexus Agents
*   **Plataforma Principal:** Web App Responsivo (Painel de Controle SAAS para clientes)
*   **Resumo Conciso:** Uma plataforma SAAS que permite a empresas configurar agentes de IA especializados, cada um com sua própria base de conhecimento (RAG), e implantá-los em múltiplos canais de comunicação.
*   **Propósito Detalhado:** O projeto visa fornecer um painel de controle (frontend) para que os clientes da Nexus Agents (os "tenants") possam criar agentes de IA, definir suas personalidades, conectá-los a canais como WhatsApp, e gerenciar uma base de conhecimento exclusiva para cada agente, garantindo respostas contextuais e precisas.
*   **Público-Alvo:** Clientes da plataforma SAAS (empresas de pequeno, médio e grande porte), especificamente administradores de sistemas, gerentes de marketing ou chefes de suporte ao cliente.
*   **Principais Casos de Uso:**
    *   Um novo cliente se cadastra na plataforma, associado a um plano de assinatura.
    *   O cliente cadastra um novo Agente de IA.
    *   O cliente decide criar um novo Agente de IA e escolhe entre:
        *   Modo Avançado: Escrever/colar um prompt do sistema manualmente.
        *   Modo Template: Selecionar um "Arquétipo de Agente" pré-construído e testado (ex: "Suporte para E-commerce").
        *   Modo Guiado: Usar o wizard "Gerador de Alma" para construir a personalidade do agente passo a passo.
    *   O cliente navega até a página de detalhes de um agente específico para gerenciar sua base de conhecimento.
    *   O cliente faz upload de arquivos (PDFs, TXT) que serão associados exclusivamente àquele agente.
    *   O cliente aciona o processamento dos arquivos para que sejam usados pela IA (RAG) daquele agente.
    *   O cliente conecta um canal de comunicação, associando-o a um agente específico.
    *   O cliente visualiza o histórico de conversas e os perfis de clientes gerados pela IA.

## 2. Arquitetura e Stack Tecnológica

*   **Modelo Arquitetural:** BaaS (Backend as a Service) com Workflow Externo.

*   **Frontend:**
    *   **Framework/Biblioteca Principal:** React com Next.js (App Router)
    *   **Linguagem:** TypeScript
    *   **Biblioteca de UI/Componentes:** ShadCN/UI sobre Tailwind CSS
    *   **Gerenciamento de Estado:** Zustand

*   **Backend (Lógica de Negócio e IA):**
    *   **Linguagem/Framework:** n8n (Workflows)
    *   **Tipo de API (para comunicação Frontend -> Backend):** RESTful (via Server Actions do Next.js)

*   **Banco de Dados (BaaS):**
    *   **Tecnologia:** Supabase (utilizando PostgreSQL com a extensão `vector` ativada).

*   **Autenticação e Autorização:**
    *   **Método:** Supabase Auth.
    *   **Níveis de Acesso:** Admin de Tenant, com funcionalidades controladas pelo objeto `plan_features` e isolamento de dados garantido por Row Level Security (RLS).

*   **Armazenamento de Arquivos:**
    *   **Serviço:** Supabase Storage. Usado para os documentos da base de conhecimento (RAG). A estrutura de pastas será `/bucket/{tenant_id}/{agent_id}/document.pdf` para garantir o isolamento do conhecimento de cada agente.

*   **Ferramentas de Automação/Workflow:**
    *   **Ferramenta:** n8n
    *   **Propósito:**
        1.  **Provisionamento de Canais:** Um workflow é acionado pelo backend para configurar webhooks na Evolution API.
        2.  **Processamento RAG:** Um workflow é acionado para ler arquivos do Supabase Storage, processá-los (chunking, embedding) e salvar os dados na tabela `documents`, associando o conhecimento ao `agent_id` correto.
        3.  **Operação do Agente:** O workflow principal que recebe mensagens do cliente final, executa a lógica de IA (filtrando a base de conhecimento pelo `agent_id`), e envia respostas.

*   **Infraestrutura e Deploy:**
    *   **Frontend:** Vercel
    *   **Backend/DB:** Supabase Cloud
    *   **Workflow:** Instância n8n (Cloud ou auto-hospedada)

## 3. Estrutura de Dados Detalhada (Esquema do Banco de Dados)

```sql
-- É mandatório ativar a extensão pg_vector no Supabase.
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de Tenants (Organizações)
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chat_histories (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tenant_id uuid NOT NULL,
  session_id text NOT NULL,
  message jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_histories_pkey PRIMARY KEY (id),
  CONSTRAINT chat_histories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.customer_preferences (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tenant_id uuid NOT NULL,
  customer_id bigint NOT NULL,
  subject text,
  type text,
  value text,
  context text,
  source text,
  confidence real,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT customer_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT customer_preferences_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT customer_preferences_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.customer_profiles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tenant_id uuid NOT NULL,
  customer_id bigint NOT NULL,
  summary text,
  last_updated_at timestamp with time zone NOT NULL,
  CONSTRAINT customer_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT customer_profiles_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT customer_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.customers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tenant_id uuid NOT NULL,
  origin text,
  account text UNIQUE,
  name text,
  phone_number text,
  email text,
  custom_attributes jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.default_plan_id (
  id bigint
);
CREATE TABLE public.documents (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tenant_id uuid NOT NULL,
  content text,
  metadata jsonb,
  fts tsvector DEFAULT to_tsvector('portuguese'::regconfig, content),
  embedding USER-DEFINED,
  text text,
  rag_id bigint,
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_rag_id_fkey FOREIGN KEY (rag_id) REFERENCES public.tenant_agents_rag(id),
  CONSTRAINT documents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.plans (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  plan_features jsonb,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  webhook text,
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tenant_agents (
  tenant_id uuid NOT NULL,
  agent_name text NOT NULL,
  system_prompt text NOT NULL,
  llm_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT tenant_agents_pkey PRIMARY KEY (id),
  CONSTRAINT tenant_agents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.tenant_agents_rag (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  file_name text,
  file_url text,
  status text,
  metadata jsonb,
  processed_at timestamp without time zone,
  agent_id uuid,
  tenant_id uuid,
  description text,
  CONSTRAINT tenant_agents_rag_pkey PRIMARY KEY (id),
  CONSTRAINT tenant_agents_rag_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.tenant_agents(id),
  CONSTRAINT tenant_agents_rag_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.tenant_attendant (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid,
  name text,
  email text,
  password_temp text,
  profile text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tenant_attendant_pkey PRIMARY KEY (id),
  CONSTRAINT tenant_attendant_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.tenant_channels (
  tenant_id uuid NOT NULL,
  platform text NOT NULL,
  account text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agent_id uuid,
  a smallint,
  config jsonb,
  profile_picture_url text,
  CONSTRAINT tenant_channels_pkey PRIMARY KEY (id),
  CONSTRAINT tenant_channels_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.tenant_agents(id),
  CONSTRAINT tenant_channels_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  plan_id uuid,
  phone text,
  CONSTRAINT tenants_pkey PRIMARY KEY (id),
  CONSTRAINT tenants_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id),
  CONSTRAINT tenants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- É mandatório ativar a extensão pg_vector no Supabase.
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabelas principais (tenants, tenant_agents, tenant_channels, etc.)
-- ... (schema da sua última versão) ...

-- >>> NOVAS TABELAS PARA O "GERADOR DE ALMA" <<<

-- Tabela principal de templates/arquétipos de agentes
CREATE TABLE public.agent_archetypes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  niche text NOT NULL,
  use_case text NOT NULL,
  final_prompt_template text, -- Para o Modo Template
  base_template_structured jsonb, -- Para o Modo Guiado (Wizard)
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT agent_archetypes_pkey PRIMARY KEY (id)
);

-- Tabela de componentes modulares de personalidade
CREATE TABLE public.personality_traits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  language_style_config jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT personality_traits_pkey PRIMARY KEY (id)
);

-- Tabela de padrões de fluxo conversacional
CREATE TABLE public.conversation_flows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  niche text NOT NULL,
  description text,
  conversation_flow_config jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversation_flows_pkey PRIMARY KEY (id)
);

-- Tabela de histórico de agentes criados via wizard (para analytics)
CREATE TABLE public.wizard_generations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  agent_id uuid NOT NULL REFERENCES tenant_agents(id) UNIQUE,
  generation_method text NOT NULL, -- 'wizard', 'template', ou 'manual'
  archetype_used_id uuid REFERENCES agent_archetypes(id),
  customizations jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wizard_generations_pkey PRIMARY KEY (id)
);

-- Tabela para Exemplos de Diálogos (Few-Shot Prompting)
CREATE TABLE public.dialogue_examples (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  archetype_id uuid NOT NULL, -- Vinculado a um arquétipo para relevância
  scenario text NOT NULL, -- Ex: "Primeiro Contato", "Objeção de Preço"
  user_message text NOT NULL,
  agent_response text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT dialogue_examples_pkey PRIMARY KEY (id),
  CONSTRAINT dialogue_examples_archetype_id_fkey FOREIGN KEY (archetype_id) REFERENCES public.agent_archetypes(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.dialogue_examples IS 'Exemplos de "few-shot" para treinar a IA, associados a um arquétipo.';

-- NOTA: Todas as tabelas que contêm dados de tenants DEVEM ter políticas de RLS ativadas.

-- NOTA: Todas as tabelas que contêm `tenant_id` DEVEM ter políticas de Row Level Security (RLS)
-- ativadas para garantir o isolamento de dados entre os clientes.
```

## 3.5. Sistema de Gestão de Pagamentos

### 3.5.1. Visão Geral
*   **Propósito:** Sistema completo de controle financeiro para gerenciar faturas, pagamentos e métodos de pagamento dos tenants.
*   **Escopo:** Invoices visíveis aos clientes, controle administrativo completo, preparação para integração com gateways de pagamento (cartão e Pix).
*   **Isolamento:** Todos os dados financeiros são isolados por tenant usando RLS.

### 3.5.2. Estrutura de Dados

```sql
-- Faturas por tenant
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  plan_id uuid REFERENCES plans(id),
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'BRL',
  status text CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
  due_date timestamptz NOT NULL,
  paid_at timestamptz,
  description text,
  billing_period text CHECK (billing_period IN ('monthly', 'yearly')) DEFAULT 'monthly',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id)
);

-- Histórico de pagamentos
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_method text CHECK (payment_method IN ('credit_card', 'pix', 'bank_transfer')),
  gateway_transaction_id text,
  status text CHECK (status IN ('processing', 'completed', 'failed', 'refunded')) DEFAULT 'processing',
  paid_at timestamptz DEFAULT NOW(),
  gateway_response jsonb,
  created_at timestamptz DEFAULT NOW(),
  CONSTRAINT payments_pkey PRIMARY KEY (id)
);

-- Métodos de pagamento salvos por tenant
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type text CHECK (type IN ('credit_card', 'pix')) NOT NULL,
  is_default boolean DEFAULT FALSE,
  card_last_four text,
  card_brand text,
  pix_key text,
  is_active boolean DEFAULT TRUE,
  created_at timestamptz DEFAULT NOW(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id)
);

-- RLS para isolamento por tenant
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
```

### 3.5.3. Funcionalidades

#### Para Tenants (Clientes):
*   **Dashboard de Faturas:** Visualização de todas as faturas (pagas, pendentes, vencidas)
*   **Detalhes da Fatura:** Visualização completa com possibilidade de download em PDF
*   **Histórico de Pagamentos:** Timeline de todos os pagamentos realizados
*   **Métodos de Pagamento:** Gerenciar cartões salvos e chaves Pix
*   **Notificações:** Alertas de vencimento e confirmações de pagamento

#### Para Administradores:
*   **Gestão de Faturas:** Criar, editar, cancelar faturas manualmente
*   **Controle de Pagamentos:** Visualizar e confirmar pagamentos
*   **Relatórios Financeiros:** Dashboard com métricas e gráficos
*   **Configurações:** Definir valores de planos e períodos de cobrança

### 3.5.4. Integração com Gateways (Futuro)
*   **Preparação para:** Stripe, Mercado Pago, PagSeguro
*   **Métodos Suportados:** Cartão de crédito, Pix, boleto bancário
*   **Webhooks:** Sistema para confirmação automática de pagamentos
*   **Segurança:** Tokenização de dados sensíveis, PCI compliance

## 3.6. Sistema de Mensagens/Notificações Internas

### 3.6.1. Visão Geral
*   **Propósito:** Sistema interno para envio de comunicados, notificações e mensagens para tenants de forma coletiva ou individual.
*   **Escopo:** Painel administrativo para criação e envio, interface do cliente para recebimento, templates personalizáveis.
*   **Segmentação:** Suporte a envio por plano, tenant específico ou broadcast geral.

### 3.6.2. Estrutura de Dados

```sql
-- Mensagens/comunicados
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text CHECK (type IN ('announcement', 'notification', 'alert', 'update', 'payment_reminder')) DEFAULT 'notification',
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  sender_id uuid REFERENCES auth.users(id), -- Admin que enviou
  target_type text CHECK (target_type IN ('all_tenants', 'specific_tenants', 'plan_based')) DEFAULT 'all_tenants',
  target_criteria jsonb, -- Filtros: planos específicos, etc
  is_published boolean DEFAULT FALSE,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- Destinatários específicos (tenant-based)
CREATE TABLE public.message_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  is_read boolean DEFAULT FALSE,
  read_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  CONSTRAINT message_recipients_pkey PRIMARY KEY (id)
);

-- Templates de mensagem
CREATE TABLE public.message_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject_template text NOT NULL,
  content_template text NOT NULL,
  type text CHECK (type IN ('welcome', 'payment_reminder', 'plan_upgrade', 'system_update')) NOT NULL,
  variables jsonb, -- {tenant_name}, {plan_name}, {amount}, etc
  is_active boolean DEFAULT TRUE,
  created_at timestamptz DEFAULT NOW(),
  CONSTRAINT message_templates_pkey PRIMARY KEY (id)
);

-- RLS para isolamento
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
```

### 3.6.3. Funcionalidades

#### Para Tenants (Clientes):
*   **Central de Notificações:** Lista todas as mensagens recebidas
*   **Filtros:** Por tipo, prioridade, lidas/não lidas, data
*   **Detalhes:** Visualização completa da mensagem com formatação
*   **Marcação:** Marcar como lida/não lida, arquivar mensagens
*   **Configurações:** Preferências de notificação por email/push

#### Para Administradores:
*   **Criar Mensagem:** Editor rico com suporte a markdown e templates
*   **Segmentação Avançada:** Escolher destinatários (todos, por plano, específicos)
*   **Agendamento:** Enviar imediatamente ou agendar para data/hora específica
*   **Templates:** Gerenciar modelos pré-definidos com variáveis dinâmicas
*   **Relatórios:** Métricas de entrega, abertura e engajamento

### 3.6.4. Tipos de Notificação
*   **Comunicados Gerais:** Atualizações do sistema, novidades, manutenções
*   **Alertas de Pagamento:** Lembretes de vencimento, confirmações, falhas
*   **Notificações de Plano:** Upgrades disponíveis, limites atingidos, recursos
*   **Mensagens Personalizadas:** Comunicação direta e específica com clientes
*   **Alertas de Sistema:** Problemas técnicos, downtime, recuperação

### 3.6.5. Integração com Sistema de Pagamentos
*   **Notificações Automáticas:** Geração automática de lembretes de vencimento
*   **Confirmações:** Mensagens de confirmação após pagamentos bem-sucedidos
*   **Alertas de Falha:** Notificações quando pagamentos falham
*   **Relatórios:** Mensagens sobre mudanças de plano e faturamento

## 4. Funcionalidades Principais Detalhadas

### 4.1. Gestão de Agentes de IA (Admin)
*   **Descrição:** Criar, visualizar, editar e deletar agentes, respeitando os limites do plano.
*   **Endpoints:** `GET`, `POST`, `PUT`, `DELETE` via Server Actions para `/api/agents`. O `POST` deve validar o `plan_features.max_agents`.
*   **UI:** A página `/dashboard/agents` lista os agentes. Clicar em um agente leva para sua página de detalhes (`/dashboard/agents/{agentId}`).

#### 4.1.1. Modo 1: "Digitar System Prompt" (Avançado)
*   **Fluxo:** O usuário seleciona esta opção, preenche o nome do agente e cola/escreve diretamente o `system_prompt` em uma área de texto. É um fluxo de passo único para usuários experientes.
*   **Backend:** A Server Action `createAgent` recebe os campos `agent_name` e `system_prompt` e cria o registro no banco.

#### 4.1.2. Modo 2: "Usar Template de Agente" (Rápido)
*   **Fluxo:** O usuário seleciona esta opção, o que revela uma galeria de "Arquétipos de Agente" (buscados da tabela `agent_archetypes`), filtrável por nicho e caso de uso. Ao selecionar um arquétipo, a área de texto `system_prompt` é preenchida com o `final_prompt_template` do arquétipo. O usuário pode então editar o prompt antes de salvar.
*   **Backend:** A Server Action `createAgent` opera da mesma forma que no modo avançado.

#### 4.1.3. Modo 3: "Gerador de Alma" (Guiado e Inteligente)
*   **Fluxo:** O usuário seleciona esta opção e inicia um wizard multi-passos:
    1.  **Identidade e Missão:** O usuário seleciona um arquétipo base, que pré-preenche a descrição e os objetivos do agente.
    2.  **Tom de Voz:** O usuário escolhe "Traços de Personalidade" (da tabela `personality_traits`) para definir o estilo de comunicação.
    3.  **Estratégia:** O usuário seleciona um "Fluxo de Conversa" (da tabela `conversation_flows`) para definir o roteiro do agente.
    4.  **Regras:** O usuário define regras e limites.
    5.  **Geração e Revisão:** No passo final, os dados estruturados coletados são enviados a uma Server Action.
*   **Backend (Server Action `generateAgentPrompt`):**
    1.  Recebe os dados estruturados do wizard.
    2.  Constrói um **meta-prompt** para uma LLM avançada (ex: GPT-4).
    3.  Chama a API da OpenAI, enviando os dados do usuário e instruindo a LLM a **sintetizar e escrever um `system_prompt` final, coeso e de alta qualidade**.
    4.  Retorna o prompt gerado para o frontend para a aprovação do usuário.
*   **Backend (Server Action `createAgent`):**
    1.  Após a aprovação, o frontend envia o `agent_name` e o `system_prompt` gerado para a ação de criação.

*   **Benefícios:**
    -   Aumenta a acessibilidade para usuários não-técnicos.
    -   Educa implicitamente sobre as melhores práticas de engenharia de prompt.
    -   Garante um padrão de qualidade para os prompts criados na plataforma.
    -   Mantém a flexibilidade para usuários avançados.


### 4.2. Gestão de Canais (Admin)
*   **Descrição:** Conectar canais de comunicação a agentes.
*   **Endpoints:** Server Actions para `/api/channels`. O `POST` deve validar o `plan_features.allowed_channels` e, em caso de sucesso, acionar o webhook de provisionamento do n8n.
*   **Webhook Payload (Provisionamento):** `POST` para `N8N_PROVISIONING_WEBHOOK_URL` com o corpo: `{ "channel_id": "uuid", "channel_name": "string", "tenant_id": "uuid", "config": { ... } }`.

### 4.3. Gestão da Base de Conhecimento por Agente (RAG)
*   **Descrição:** Uma interface dentro da página de detalhes de cada agente para gerenciar sua base de conhecimento.
*   **Disponibilidade:** A funcionalidade (UI e API) deve estar disponível apenas se `plan_features.features.rag_enabled` for `true`.
*   **Fluxo:**
    1.  O usuário navega para `/dashboard/agents/{agentId}` e abre a seção "Base de Conhecimento".
    2.  Faz upload de arquivos, que são salvos no Supabase Storage em `/{tenant_id}/{agent_id}`.
    3.  Um registro é criado na tabela `documents` com o `agent_id` correto.
    4.  O usuário clica em "Processar" em um documento da lista.
*   **Webhook Payload (Processamento RAG):** `POST` para `N8N_RAG_PROCESSING_WEBHOOK_URL` com o corpo: `{ "document_id": number, "tenant_id": "uuid", "agent_id": "uuid", "storage_path": "string" }`.
*   **Responsabilidade do N8N:** O workflow do n8n é responsável por atualizar o `status` e `error_message` do documento no banco de dados após o processamento.

### 4.4. Gestão de atendentes
*   **Descrição:** Criar, visualizar, editar e deletar atendentes (tenant_attendant), respeitando os limites do plano.
*   **Endpoints:** `GET`, `POST`, `PUT`, `DELETE` via Server Actions para `/api/attendants`. O `POST` deve validar o `plan_features.max_attendants`.
*   **UI:** A página `/dashboard/attendants` lista os atendentes. Clicar em um atendente leva para sua página de detalhes (`/dashboard/attendants/{attendantId}`).
*  **fluxo:**
    1.  O usuário navega para `/dashboard/attendants` e abre a seção "Atendentes".
    2.  O usuário clica em "Novo Atendente".
    3.  Um registro é criado na tabela `tenant_attendant` com o `tenant_id` correto.
    4.  O usuário informa os campos necessários como name, email, password_temp, profile(atendente ou administrador). 
    5.  O usuário clica em "Salvar" e o registro é salvo na tabela `tenant_attendant`.
*   **Webhook Payload (Gerenciamento de Atendentes):** `POST` para `N8N_ATTENDANT_MANAGEMENT_WEBHOOK_URL` com o corpo: `{ "name": string, "email": string, "password_temp": string, "profile": string, "tenant_id": "uuid" }`.
*   **Responsabilidade do N8N:** O workflow do n8n é responsável por criar o atendente no Chatwoot e enviar um email de confirmação para o email do atendente.


## 5. Ambiente de Desenvolvimento

*   **Pré-requisitos:** Node.js v18+, pnpm/npm/yarn, Conta Supabase.
*   **Variáveis de Ambiente (`.env.local`):**
    ```
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    SUPABASE_SERVICE_ROLE_KEY=...

    # n8n Webhooks
    N8N_PROVISIONING_WEBHOOK_URL=...
    N8N_RAG_PROCESSING_WEBHOOK_URL=...
    
    # Logging Configuration
    LOG_LEVEL=debug  # debug, info, warn, error
    ```

## 6. Diretrizes de Segurança para Logs

### 🔒 **Política de Logging Seguro**

Este projeto implementa um sistema de logging centralizado com foco em **segurança e conformidade**. Todos os desenvolvedores DEVEM seguir estas diretrizes:

#### **6.1 Uso Obrigatório do Logger Centralizado**

**❌ NUNCA FAÇA:**
```typescript
console.log('User logged in:', user.email);
console.error('Database error:', error);
console.log('Tenant ID:', tenant.id);
```

**✅ SEMPRE FAÇA:**
```typescript
import logger from '@/lib/logger';

logger.info('User authentication successful');
logger.error('Database operation failed', error);
logger.debug('Processing tenant data', { hasTenant: !!tenant.id });
```

#### **6.2 Campos Sensíveis - NUNCA LOGAR**

O sistema sanitiza automaticamente, mas **NUNCA** inclua diretamente:

- **Credenciais:** `password`, `token`, `api_key`, `secret`
- **Identificadores:** `user_id`, `tenant_id`, `session_id`, `customer_id`
- **Dados Pessoais:** `email`, `phone`, `cpf`, `address`
- **Chaves de Ambiente:** `OPENAI_API_KEY`, `SUPABASE_ANON_KEY`, etc.
- **Dados de Webhook:** Headers completos, payloads com dados sensíveis

#### **6.3 Níveis de Log por Ambiente**

**Desenvolvimento (`NODE_ENV=development`):**
```bash
LOG_LEVEL=debug  # Logs detalhados para debugging
```

**Produção (`NODE_ENV=production`):**
```bash
LOG_LEVEL=error  # Apenas erros críticos
```

**Staging/Homologação:**
```bash
LOG_LEVEL=info   # Logs informativos sem dados sensíveis
```

#### **6.4 Padrões de Logging Seguro**

**Para Operações de Banco:**
```typescript
// ❌ Expõe dados sensíveis
logger.info('Query executed', { query, params, user_id });

// ✅ Seguro e informativo
logger.debug('Database query completed', { 
  operation: 'select',
  table: 'customers',
  hasResults: !!data,
  resultCount: data?.length || 0
});
```

**Para Autenticação:**
```typescript
// ❌ Expõe email do usuário
logger.info('User login', { email: user.email });

// ✅ Seguro
logger.info('User authentication successful', { hasUser: !!user });
```

**Para APIs Externas:**
```typescript
// ❌ Expõe API key
logger.debug('OpenAI request', { apiKey, prompt });

// ✅ Seguro
logger.debug('AI request initiated', { 
  hasApiKey: !!process.env.OPENAI_API_KEY,
  promptLength: prompt?.length || 0
});
```

**Para Webhooks:**
```typescript
// ❌ Expõe headers e dados sensíveis
logger.info('Webhook received', { headers, body });

// ✅ Seguro
logger.info('Webhook received', {
  method: request.method,
  hasHeaders: !!request.headers,
  hasBody: !!body,
  contentType: request.headers.get('content-type')
});
```

#### **6.5 Tratamento de Erros**

**Para Erros de Sistema:**
```typescript
try {
  // operação
} catch (error) {
  // ✅ Logger sanitiza automaticamente o erro
  logger.error('Operation failed', error);
  
  // ✅ Contexto adicional sem dados sensíveis
  logger.error('Database connection failed', {
    operation: 'user_fetch',
    hasConnection: !!supabase,
    timestamp: new Date().toISOString()
  });
}
```

#### **6.6 Logs de Analytics e Métricas**

```typescript
// ✅ Métricas agregadas são seguras
logger.info('Analytics processed', {
  totalCustomers: count,
  period: '30d',
  dataPoints: analytics.length
});

// ✅ Contadores sem identificadores
logger.debug('Heatmap data processed', {
  totalDays: data.length,
  maxCount: maxValue,
  hasData: data.length > 0
});
```

#### **6.7 Configuração do Logger**

O logger está configurado em `/src/lib/logger.ts` com:

- **Sanitização Automática** de 50+ campos sensíveis
- **Níveis Customizados**: debug, info, warn, error
- **Formato Condicional**: Pretty print (dev) / JSON (prod)
- **Validação de Níveis**: Fallback seguro para níveis inválidos

#### **6.8 Auditoria e Compliance**

- **Logs são auditados** regularmente para vazamentos de dados
- **Produção usa nível ERROR** para minimizar exposição
- **Desenvolvimento permite DEBUG** para facilitar debugging
- **Sanitização é obrigatória** e não pode ser desabilitada

#### **6.9 Checklist para Code Review**

**Antes de aprovar qualquer PR, verificar:**

- [ ] Nenhum `console.log`, `console.error`, `console.warn` no código
- [ ] Todos os logs usam `import logger from '@/lib/logger'`
- [ ] Nenhum dado sensível sendo logado diretamente
- [ ] Contexto adequado sem expor identificadores
- [ ] Nível de log apropriado (debug/info/warn/error)
- [ ] Mensagens em inglês para consistência

#### **6.10 Violações de Segurança**

**Exemplos de violações que DEVEM ser rejeitadas:**

```typescript
// 🚨 CRÍTICO - Expõe credenciais
console.log('API Key:', process.env.OPENAI_API_KEY);

// 🚨 CRÍTICO - Expõe dados pessoais
logger.info('User data', { email: user.email, phone: user.phone });

// 🚨 ALTO - Expõe identificadores de tenant
logger.debug('Processing for tenant:', tenant.id);

// 🚨 MÉDIO - Headers de webhook podem conter tokens
logger.info('Webhook headers', request.headers);
```

---

**⚠️ IMPORTANTE:** Qualquer violação dessas diretrizes pode resultar em vazamento de dados sensíveis e comprometer a segurança de todos os tenants da plataforma. Em caso de dúvida, sempre opte pela abordagem mais restritiva.
