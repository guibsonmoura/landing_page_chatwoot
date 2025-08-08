
# TASK.MD - Backlog de Desenvolvimento do Nexus Agents (Versão Final)

## 1. Backlog Geral de Tarefas

### Épico: Configuração e Autenticação (SETUP)
- [x] (INFRA-001) Configurar projeto Supabase, ativar extensão `vector` e executar o script SQL final. (Concluído manualmente pelo usuário)
- [x] (INFRA-002) Configurar RLS em todas as tabelas para isolamento de tenants. (Concluído manualmente pelo usuário)
- [x] (INFRA-003) Criar trigger no DB para criar um `tenant` com plano default no cadastro de usuário. (Script SQL para trigger e função criado e pronto para execução no Supabase)
- [x] (FE-001) Inicializar projeto Next.js com TypeScript, Tailwind, ShadCN/UI. (Projeto criado, Tailwind e ShadCN/UI integrados e validados na UI)
- [x] (FE-002) Configurar clientes Supabase e variáveis de ambiente. (Client criado em src/lib/supabase.ts, instrução de variáveis fornecida para .env.local)
- [x] (FE-003) Implementar lógicas de Cadastro, Login e Logout. (Páginas e formulários de login/cadastro criados, rotas protegidas com middleware e botão de logout funcional)
- [x] (FE-004) Implementar layout do Dashboard com rotas protegidas. (Layout com sidebar e header criado e aplicado às rotas do dashboard)
- [x] (BE-001) Criar um hook/contexto global (Zustand) para prover `plan_features` para a aplicação. (Store Zustand criada, dados são buscados no layout e limpos no logout)


### Épico: Gestão de Agentes e "Gerador de Alma" (AGENTS-V2)

**Descrição:** Implementar o fluxo completo de CRUD para Agentes, incluindo o novo modal de criação com três modos: "Avançado", "Templates" e o wizard "Gerador de Alma".

-   [x] (BE-101) Criar Server Actions básicas (Read, Update, Delete) para `tenant_agents`. A Server Action de `Create` será expandida nas tarefas abaixo. (CRUD básico existente)
-   [x] (SEC-101) Criar RLS policy para `tenant_agents` para garantir isolamento de dados. (Concluído)
-   [x] (FE-101) Criar a página `/dashboard/agents` para listar agentes. (Página existente)
-   [x] (FE-102) Criar a página de Detalhes do Agente (`/dashboard/agents/[id]`). (Página existente)

#### Sub-Épico: Fundação dos Templates (WIZARD-DB)
-   [ ] **(DB-101)** Executar o novo script SQL para criar as tabelas de templates: `agent_archetypes`, `personality_traits`, `conversation_flows`, `dialogue_examples`, e `wizard_generations`.
-   [ ] **(DB-102)** Popular as tabelas de templates com dados iniciais de alta qualidade (mínimo de 3 exemplos para `agent_archetypes`, `personality_traits`, e `conversation_flows`).
-   [x] **(BE-102)** Criar as Server Actions para buscar os templates:
    -   [x] `getAgentArchetypes(niche?: string, use_case?: string)`
    -   [x] `getPersonalityTraits()`
    -   [x] `getConversationFlows(niche?: string)`

#### Sub-Épico: Refatoração do Modal de Criação (WIZARD-FE-SETUP)
-   [ ] **(FE-103)** Refatorar o componente `CreateAgentDialog.tsx` para se tornar um wizard condicional.
    -   [ ] **(FE-103a)** Implementar a tela inicial com o campo `agent_name` e o seletor de modo ("Avançado", "Template", "Guiado").
    -   [ ] **(FE-103b)** Implementar a lógica de estado (Zustand) para gerenciar o estado do wizard (passo atual, dados coletados em cada etapa).
    -   [ ] **(FE-103c)** Construir o layout base do wizard (coluna de instrução à esquerda, área de ação à direita, botões de navegação).

#### Sub-Épico: Implementação do Modo "Template" (WIZARD-FE-TEMPLATE)
-   [ ] **(FE-104)** Implementar a UI para o modo "Template".
    -   [ ] **(FE-104a)** Criar uma view de galeria para exibir os `agent_archetypes` buscados pela Server Action. Incluir filtros por `niche` e `use_case`.
    -   [ ] **(FE-104b)** Ao selecionar um arquétipo, a área de texto `system_prompt` do modal deve ser preenchida com o campo `final_prompt_template`.
    -   [ ] **(FE-104c)** Integrar com o botão "Criar Agente" para submeter o prompt final.

#### Sub-Épico: Implementação do Modo "Gerador de Alma" (WIZARD-FE-GUIDED)
-   [x] **(FE-105)** Implementar os passos do wizard guiado.
    -   [x] **(FE-105a)** **Passo 1 (Identidade):** Criar a UI que busca e permite selecionar um `agent_archetype` para pré-preencher a personalidade e missão a partir do `base_template_structured`.
    -   [x] **(FE-105b)** **Passo 2 (Tom de Voz):** Criar a UI que busca e permite selecionar múltiplos `personality_traits`.
    -   [x] **(FE-105c)** **Passo 3 (Estratégia):** Criar a UI que busca e permite selecionar um `conversation_flow`, filtrado pelo nicho do arquétipo.
    -   [x] **(FE-105d)** **Passo 4 (Instruções Personalizadas):** Criar a UI para adicionar instruções personalizadas.
    -   [x] **(FE-105e)** **Passo 5 (Geração e Revisão):**
        -   Criar a UI de revisão.
        -   Ao chegar a este passo, chamar a nova Server Action `generateAgentPrompt` (ver BE-104), passando os dados coletados.
        -   Exibir o prompt gerado pela IA em uma área de texto (somente leitura).
        -   O botão final deve ser "Gerar Alma e Criar Agente".

#### Sub-Épico: Lógica de Backend do Wizard (WIZARD-BE)
-   [ ] **(BE-103)** Modificar a Server Action `createAgent` para ser mais robusta.
    -   [ ] **(BE-103a)** A action deve aceitar `agent_name` e `system_prompt` como argumentos principais.
    -   [ ] **(BE-103b)** Adicionar um argumento opcional `wizardData: json` para a action.
    -   [ ] **(BE-103c)** Após criar o agente com sucesso, se `wizardData` for fornecido, criar um registro correspondente na tabela `wizard_generations` para fins de analytics.
-   [x] **(BE-104)** Criar a nova Server Action `generateAgentPrompt(wizardData: json)`.
    -   **Responsabilidade:** Receber os dados estruturados dos passos do wizard.
    -   Construir um **meta-prompt** otimizado.
    -   Fazer a chamada para a API da OpenAI (GPT-4 ou superior).
    -   Retornar o `system_prompt` gerado em formato de string.


### Épico: Gestão de Canais (CHANNELS)
- [x] (DB-002) Criar a tabela `tenant_channels` e sua respectiva RLS policy. (Tabela e RLS criadas via migrações 003 e 004)
- [x] (BE-201) Criar Server Action para `POST /api/channels` que valida o plano e aciona o webhook de provisionamento do n8n com o payload correto. (Server Action implementada e variáveis de ambiente documentadas)
- [x] (FE-201) Criar a UI para CRUD de Canais, com o formulário populando o dropdown de "Plataforma" a partir das `plan_features`. (Página de listagem e diálogo de criação implementados e com bugs de lint corrigidos)

### Épico: Configuração e Manutenção (SYS)
- [x] (SYS-001) Configurar e documentar variáveis de ambiente para desenvolvimento local (`.env.local.example`). (Arquivo de exemplo criado e .gitignore ajustado)

### Épico: Gestão da Base de Conhecimento por Agente (RAG)
- [x] (FE-401) Implementar a aba "Base de Conhecimento" na página de detalhes do agente, visível apenas se `plan.features.rag_enabled`. (Página refatorada para Client Component com renderização condicional da aba)
- [x] (FE-402) Implementar componente de upload de arquivos para o Supabase Storage que recebe `agent_id` para construir o caminho correto. (Componente de upload criado e integrado na página de detalhes do agente)
- [x] (BE-401) Criar Server Action para listar documentos, filtrando por `agent_id`. (Estimativa: 2h, Prioridade: Média, Módulo: Backend, Depende de: FE-002)
- [x] (FE-403) Implementar tabela na UI para listar documentos do agente com status e o botão "Processar". (Estimativa: 4h, Prioridade: Média, Módulo: Frontend, Depende de: FE-402, BE-401)
- [x] (BE-402) Criar Server Action para "Processar" que aciona o webhook do n8n com o payload `{ document_id, tenant_id, agent_id, storage_path }`. (Estimativa: 3h, Prioridade: Média, Módulo: Backend, Depende de: FE-002)

### Épico: Gestão de Atendentes (ATTENDANTS)
- [x] (DB-003) Criar a tabela `tenant_attendant` e sua respectiva RLS policy. (Estimativa: 2h, Prioridade: Alta, Módulo: DB)
- [x] (BE-501) Criar Server Actions (CRUD) para `/api/attendants`, incluindo validação de `max_attendants` no `POST`. (Estimativa: 4h, Prioridade: Alta, Módulo: Backend, Depende de: DB-003)
- [ ] (BE-502) Criar Server Action para acionar o webhook do n8n no `POST` de um novo atendente. (Estimativa: 2h, Prioridade: Média, Módulo: Backend, Depende de: BE-501)
- [x] (FE-501) Criar a página `/dashboard/attendants` para listar os atendentes em cards, seguindo o estilo de `/dashboard/channels`. (Estimativa: 3h, Prioridade: Alta, Módulo: Frontend, Depende de: BE-501)
- [x] (FE-502) Implementar o diálogo (modal) para criar/editar um atendente com os campos: nome, email e perfil. (Estimativa: 3h, Prioridade: Alta, Módulo: Frontend, Depende de: FE-501)
- [x] (FE-503) Criar a página de detalhes do atendente `/dashboard/attendants/[id]`. (Estimativa: 2h, Prioridade: Baixa, Módulo: Frontend, Depende de: FE-501)

### Épico: Visualização de Clientes (CUSTOMERS)
- [ ] (BE-301) Criar Server Actions para listar clientes e obter detalhes de um cliente (com seu histórico e perfil). (Estimativa: 5h, Prioridade: Baixa, Módulo: Backend, Depende de: FE-002)
- [ ] (FE-301) Implementar a UI para listar clientes e a página de detalhes para exibir perfil, preferências e histórico de chat. (Estimativa: 6h, Prioridade: Baixa, Módulo: Frontend, Depende de: BE-301)


### Épico: Wizard "Gerador de Alma" (AGENT-WIZARD)

- [ ] **(DB-101)** Criar as tabelas de templates no Supabase: `prompt_templates_roles`, `prompt_templates_styles`, e `prompt_templates_flows`. Executar o script SQL correspondente.
- [ ] **(DB-102)** Popular as tabelas de templates com dados iniciais (pelo menos 2-3 exemplos para cada tabela) para servir de base para os usuários.
- [ ] **(BE-102)** Criar Server Actions `GET` para buscar os templates das novas tabelas. Ex: `getPromptTemplateRoles()`, `getPromptTemplateStyles()`, `getPromptTemplateFlows(niche: string)`. A action de fluxos deve aceitar um `niche` para filtragem.
- [ ] **(FE-103)** Refatorar o componente `CreateAgentDialog.tsx` para implementar a lógica do wizard condicional.
    - [ ] **(FE-103a)** Adicionar o seletor de modo ("Avançado" vs. "Guiado") e a lógica de exibição condicional inicial.
    - [ ] **(FE-103b)** Construir a estrutura de UI do wizard multi-passos (layout de duas colunas, botões de navegação, gerenciamento de estado entre os passos - Zustand ou React Context são boas opções).
    - [ ] **(FE-103c)** Implementar o **Passo 1 (Identidade e Missão):**
        - [ ] **(FE-103c1)** Chamar a Server Action `getPromptTemplateRoles()` para popular o dropdown.
        - [ ] **(FE-103c2)** Implementar a lógica de preenchimento automático e edição dos campos `persona_description` e `mission_objective`.
    - [ ] **(FE-103d)** Implementar o **Passo 2 (Tom de Voz):**
        - [ ] **(FE-103d1)** Chamar a Server Action `getPromptTemplateStyles()` para popular o dropdown.
        - [ ] **(FE-103d2)** Implementar a lógica de preenchimento automático dos controles de estilo (slider, toggles, tags).
    -   [ ] **(FE-103e)** Implementar o **Passo 3 (Estratégia de Conversa):**
        -   Chamar a Server Action `getPromptTemplateFlows()` com o nicho selecionado no passo 1.
        -   Implementar a lógica de preenchimento automático dos campos de saudação, meio e fim.
    -   [ ] **(FE-103f)** Implementar o **Passo 4 (Regras e Limites):**
        -   Implementar o campo de input de tags para as `guardrails`.
    -   [ ] **(FE-103g)** Implementar o **Passo 5 (Revisão e Geração):**
        -   Criar uma função no frontend que monta a string do `system_prompt` final com base nos dados coletados em todos os passos para a pré-visualização.
-   [ ] **(BE-103)** Modificar a Server Action `createAgent` (e `updateAgent`) para lidar com a nova estrutura de dados.
    -   A action deve aceitar os dados estruturados do wizard (opcionalmente).
    -   Ela será responsável por reconstruir o `system_prompt` final no backend (para segurança e consistência) e salvá-lo junto com o `agent_name`.


*   **Atenção (Wizard):** O `system_prompt` final deve ser construído no backend (dentro da Server Action) a partir dos dados estruturados recebidos do wizard. Isso garante que o formato do prompt seja sempre consistente e seguro, mesmo que o frontend seja manipulado. O frontend pode montar uma pré-visualização para o usuário, mas a versão final é gerada no servidor.



## 2. Marcos (Milestones)

*   **M1: Fundação e Acesso (Data Alvo: Final da Semana 1)**
    *   **Entregável:** Conclusão do épico `SETUP`. Um usuário pode se cadastrar, ter um plano, e acessar o dashboard.

*   **M2: Gerenciamento Core (Data Alvo: Final da Semana 2)**
    *   **Entregável:** Conclusão dos épicos `AGENTS` e `CHANNELS`. O usuário pode configurar agentes e canais, e o sistema interage com o n8n para provisionamento.

*   **M3: Gestão de Conhecimento por Agente (Data Alvo: Final da Semana 3)**
    *   **Entregável:** Conclusão do épico `RAG`. O usuário pode gerenciar a base de conhecimento específica para cada agente.

*   **M4: MVP e Deploy (Data Alvo: Final da Semana 4)**
    *   **Entregável:** Conclusão do épico `CUSTOMERS`, testes ponta-a-ponta e deploy da versão 1.0.

## 3. Tarefas Iniciais (Sprint 0)

1.  `- [ ] (INFRA-001) Configurar projeto Supabase e executar script SQL.`
2.  `- [ ] (INFRA-002) Configurar RLS em todas as tabelas.`
3.  `- [ ] (FE-001) Inicializar projeto Next.js.`
4.  `- [ ] (FE-002) Configurar clientes Supabase e .env.`
5.  `- [ ] (FE-003) Implementar lógicas de Cadastro, Login e Logout.`
6.  `- [ ] (FE-004) Implementar layout do Dashboard.`
7.  `- [ ] (BE-001) Criar o provedor global para `plan_features`.`

## 4. Pontos de Atenção para a Equipe de Desenvolvimento

*   **Resolvido:** O payload para o webhook de provisionamento de canal é `{ "channel_id", "channel_name", "tenant_id", "config" }`.
*   **Resolvido:** A base de conhecimento (`documents`) é vinculada ao `agent_id`. O n8n receberá o `agent_id` no webhook de processamento RAG e é responsável por atualizar o status do documento.
*   **Atenção (N8N):** O workflow de **operação do agente** (que responde ao cliente final) deve ser implementado para filtrar a busca na tabela `documents` pelo `agent_id` do canal que recebeu a mensagem. Isso é crucial para manter o conhecimento de cada agente isolado.
*   **Atenção (Segurança):** Dados sensíveis no campo `config` da tabela `tenant_channels` nunca devem ser expostos ao frontend. Toda a manipulação deve ocorrer via Server Actions.

---

## 🔒 ÉPICO: AUDITORIA DE SEGURANÇA - BETA RELEASE (SECURITY-AUDIT)

**Descrição:** Correções críticas de segurança identificadas na auditoria para lançamento beta. Ver relatório completo em `docs/security-audit-report.md`.

### 🚨 FASE 1 - VULNERABILIDADES CRÍTICAS (BLOQUEADORAS)

- [ ] **(SEC-001)** Implementar logger centralizado Pino em substituição aos console.log
  - **Prioridade:** CRÍTICA
  - **Estimativa:** 1 dia
  - **Descrição:** Substituir todos os 265+ console.log por logger Pino controlado por LOG_LEVEL
  - **Arquivos:** Todos os arquivos em `src/lib/actions/`, `src/stores/`, `src/middleware.ts`
  - **Critério:** Logger deve respeitar LOG_LEVEL e não expor dados sensíveis em produção

- [ ] **(SEC-002)** Remover exposição de dados sensíveis em logs
  - **Prioridade:** CRÍTICA
  - **Estimativa:** 1 dia
  - **Descrição:** Sanitizar logs que expõem user_id, tenant_id, senhas, tokens, dados de sessão
  - **Exemplos críticos:**
    - `console.log('[Store] Resultado da query de tenants:', { tenantData, tenantError });`
    - `console.log('Buscando tenant para user_id: ${userId}');`
    - Logs de `password_temp` em attendant.actions.ts
  - **Critério:** Nenhum dado PII ou credencial deve aparecer em logs

- [ ] **(SEC-003)** Corrigir política RLS quebrada da tabela customers
  - **Prioridade:** CRÍTICA
  - **Estimativa:** 4 horas
  - **Descrição:** RLS policy retorna null, bloqueando analytics
  - **Arquivo:** Políticas RLS no Supabase
  - **Evidência:** `analytics.actions.ts` linha 67-89
  - **Critério:** Analytics devem funcionar com isolamento correto entre tenants

- [ ] **(SEC-004)** Configurar controle de LOG_LEVEL em produção
  - **Prioridade:** CRÍTICA
  - **Estimativa:** 2 horas
  - **Descrição:** Garantir que LOG_LEVEL=ERROR em produção, DEBUG apenas em desenvolvimento
  - **Arquivos:** `src/lib/logger.ts`, variáveis de ambiente
  - **Critério:** Produção deve ter logs mínimos, desenvolvimento pode ter DEBUG

- [ ] **(SEC-005)** Sanitizar logs de credenciais e API keys
  - **Prioridade:** CRÍTICA
  - **Estimativa:** 4 horas
  - **Descrição:** Garantir que OPENAI_API_KEY, WHATSAPP_WEBHOOK_API_KEY nunca apareçam em logs
  - **Arquivos:** `wizard.actions.ts`, `whatsapp.actions.ts`, tratamento de erros
  - **Critério:** Nenhuma chave API deve ser logada, mesmo em erros

### ⚠️ FASE 2 - VULNERABILIDADES MÉDIAS

- [ ] **(SEC-006)** Implementar headers de segurança
  - **Prioridade:** MÉDIA
  - **Estimativa:** 4 horas
  - **Descrição:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options
  - **Arquivo:** `next.config.js` ou middleware
  - **Critério:** Headers de segurança padrão implementados

- [ ] **(SEC-007)** Adicionar rate limiting
  - **Prioridade:** MÉDIA
  - **Estimativa:** 1 dia
  - **Descrição:** Limitar requisições por usuário/IP para prevenir abuse
  - **Escopo:** Endpoints críticos (auth, API calls)
  - **Critério:** Rate limiting configurável por endpoint

- [ ] **(SEC-008)** Melhorar validação de entrada
  - **Prioridade:** MÉDIA
  - **Estimativa:** 1 dia
  - **Descrição:** Validação robusta além do RLS
  - **Arquivos:** Todas as Server Actions
  - **Critério:** Validação de schema em todas as entradas

- [ ] **(SEC-009)** Padronizar políticas RLS
  - **Prioridade:** MÉDIA
  - **Estimativa:** 6 horas
  - **Descrição:** Usar padrão consistente em todas as tabelas
  - **Escopo:** Todas as políticas RLS
  - **Critério:** Mesmo padrão de isolamento em todas as tabelas

- [ ] **(SEC-010)** Sanitizar logs de webhook
  - **Prioridade:** MÉDIA
  - **Estimativa:** 2 horas
  - **Descrição:** Logs de WhatsApp podem conter dados de clientes
  - **Arquivo:** `whatsapp.actions.ts`
  - **Critério:** Logs de webhook sem PII

### ℹ️ FASE 3 - MELHORIAS RECOMENDADAS

- [ ] **(SEC-011)** Implementar audit trail
  - **Prioridade:** BAIXA
  - **Estimativa:** 2 dias
  - **Descrição:** Log estruturado de ações críticas por tenant
  - **Escopo:** CRUD operations, login, mudanças de configuração

- [ ] **(SEC-012)** Monitoramento de segurança
  - **Prioridade:** BAIXA
  - **Estimativa:** 3 dias
  - **Descrição:** Alertas para tentativas de bypass RLS, padrões anômalos
  - **Ferramentas:** Supabase monitoring, alertas customizados

- [ ] **(SEC-013)** Sistema de rotação de chaves
  - **Prioridade:** BAIXA
  - **Estimativa:** 2 dias
  - **Descrição:** Rotação automática de API keys
  - **Escopo:** OPENAI_API_KEY, WHATSAPP keys

### 📋 CRITÉRIOS DE ACEITAÇÃO PARA BETA

**BLOQUEADORES (devem estar 100% completos):**
- ✅ SEC-001: Logger Pino implementado
- ✅ SEC-002: Dados sensíveis removidos dos logs
- ✅ SEC-003: RLS de customers corrigida
- ✅ SEC-004: LOG_LEVEL configurado
- ✅ SEC-005: Credenciais sanitizadas

**RECOMENDADOS (pelo menos 80% completos):**
- SEC-006 a SEC-010

**Status Atual:** 🔴 **BETA BLOQUEADO** - 0/5 críticas completas