# Estas são as regras fundamentais que você, Windsurf AI, deve seguir para este projeto.
# Sempre consulte este arquivo no início de cada sessão e ao iniciar novas tarefas.

### 🔄 Consciência e Contexto do Projeto (`#windsurfrules_context`)

- **Sempre leia `PLANNING.MD` integralmente** no início de uma nova conversa ou ao retomar o trabalho para (re)entender a arquitetura, objetivos, stack tecnológica específica, estilo visual e restrições do projeto. Preste atenção especial às seções "Arquitetura e Stack Tecnológica" e "Estrutura de Dados Detalhada".
- **Verifique `TASK.MD`** para identificar a tarefa atual. Se a tarefa não estiver clara ou parecer muito grande, peça esclarecimentos antes de prosseguir.
- **Se uma tarefa em `TASK.MD` não estiver listada, NÃO a adicione automaticamente.** Pergunte ao humano se deve ser adicionada.
- **Use convenções de nomenclatura, estrutura de arquivos e padrões de arquitetura consistentes** conforme descrito em `PLANNING.MD` e reforçado nestas regras. Em caso de conflito, as especificações do `PLANNING.MD` para *este projeto* têm precedência sobre regras genéricas, a menos que seja uma regra de segurança ou qualidade fundamental.

### 🧱 Estrutura e Modularidade do Código (`#windsurfrules_structure`)

- **Regra de Limite de Arquivo:** Esforce-se para manter arquivos de código concisos. Se um arquivo de código se aproximar de **300-400 linhas** (excluindo comentários e imports), sinalize e sugira refatoração para dividi-lo em módulos ou arquivos auxiliares. Justifique a sugestão de refatoração. **Nunca exceda 500 linhas sem aprovação explícita.**
- **Organize o código em módulos claramente separados**, agrupados por funcionalidade (feature-based) ou responsabilidade (layer-based), conforme a estrutura de pastas sugerida em `PLANNING.MD` (Seção 8).
- **Use imports absolutos para módulos do projeto** (ex: `from src.components.button import Button`) e imports relativos apenas para arquivos dentro do mesmo módulo/diretório imediato.

### 🧪 Testes e Confiabilidade (`#windsurfrules_tests`)
# Para este projeto, estamos usando [Framework de Teste - ex: Pytest para Python, Jest para JS/TS].

- **Sempre crie testes unitários para novas funcionalidades de backend e lógica de frontend complexa.** A localização dos testes deve ser em uma pasta `__tests__` adjacente ao arquivo testado (para JS/TS com Jest) ou em uma pasta `/tests` espelhando a estrutura do `src` (para Python com Pytest). Confirme a estrutura de testes no `PLANNING.MD`.
- **Cobertura de Teste Mínima para Novas Funções/Componentes:**
    - 1 teste para o "caminho feliz" (uso esperado).
    - Pelo menos 1 teste para um caso de borda ou entrada inesperada (ex: input vazio, nulo, formato incorreto).
    - Pelo menos 1 teste para um caso de falha esperado (ex: como o sistema lida com uma exceção controlada).
- **Atualize os testes existentes** se a lógica coberta por eles for modificada.

### ✅ Conclusão da Tarefa (`#windsurfrules_task_completion`)

- **Ao concluir uma tarefa de `TASK.MD`, atualize seu status para `[x]`** e adicione um breve comentário sobre a conclusão, se relevante (ex: "Implementado e testado").
- Se novas subtarefas ou TODOs forem descobertos durante o desenvolvimento, **adicione-os a `TASK.MD`** sob a tarefa principal ou em uma seção "Descobertas Recentes", prefixando com `[ ] (NEW-ID)`. Pergunte se uma nova ID formal deve ser criada.

### 📎 Estilo e Convenções de Código (`#windsurfrules_style`)
# As seguintes convenções são específicas para a stack deste projeto (ver `PLANNING.MD` para detalhes da stack).

- **Linguagem Principal:** [Ex: TypeScript para Frontend, Python para n8n/Backend Functions].
- **Formatação:** Use [Ex: Prettier para TS/JS, Black para Python] com as configurações padrão do projeto. Execute o formatador antes de apresentar o código.
- **Linting:** Siga as regras do [Ex: ESLint para TS/JS, Flake8/Pylint para Python] configurado no projeto.
- **Validação de Dados:** Use [Ex: Zod para TS, Pydantic para Python] para toda validação de entrada de API, formulários e dados de configuração.
- **Frameworks Específicos:**
    - Para [Ex: Next.js]: Seguir as convenções do App Router, usar Server Components por padrão onde aplicável.
    - Para [Ex: Supabase]: Encapsular chamadas ao SDK em funções de serviço em `src/lib/supabase`.
    - Para [Ex: n8n]: Fornecer o JSON do workflow n8n ou uma descrição passo-a-passo detalhada dos nós e suas configurações.
- **Docstrings/Comentários:**
    - Escreva docstrings para todas as funções públicas, classes e módulos no estilo [Ex: JSDoc para TS, Google Style para Python].
    ```typescript
    /**
     * Breve resumo da função.
     * @param param1 Descrição do param1.
     * @returns Descrição do valor de retorno.
     */
    function exemplo(param1: string): boolean {
      // ...
    }
    ```
    - **Comente código não óbvio** ou decisões de design importantes. Use `// REASON:` ou `# REASON:` para explicar o *porquê* de uma implementação específica, especialmente se ela parecer contraintuitiva ou complexa.

### 📚 Documentação e Explicabilidade (`#windsurfrules_docs`)

- Se uma alteração de código impactar a configuração, dependências ou o processo de build/deploy, **sugira uma atualização para `PLANNING.MD` (Seção 8) ou `README.MD`**.
- Ao apresentar código complexo, **forneça uma breve explicação** da lógica e das decisões tomadas.

### 🧠 Regras de Comportamento da IA (`#windsurfrules_behavior`)

- **Nunca assuma contexto ausente ou ambiguidades na tarefa.** Sempre faça perguntas claras e concisas para obter esclarecimentos antes de prosseguir com suposições.
- **Restrinja-se às bibliotecas e versões especificadas no `PLANNING.MD` ou já presentes no projeto.** Se precisar de uma nova biblioteca, peça aprovação e justifique a necessidade.
- **Sempre confirme se os caminhos de arquivo, nomes de módulo e nomes de funções/variáveis referenciados existem e estão corretos** antes de gerar código que dependa deles. Use o contexto do projeto para verificar.
- **Nunca exclua ou sobrescreva código ou arquivos existentes sem instrução explícita ou se fizer parte de uma tarefa claramente definida em `TASK.MD` que implique refatoração.** Se uma refatoração significativa for necessária, proponha o plano antes de executar.
- **Ao gerar código, forneça-o em blocos de código formatados corretamente** com a linguagem especificada (ex: ```typescript ... ```).
- **Se você não puder atender a uma solicitação completamente ou se encontrar uma limitação, explique claramente o motivo.**


# Regras técnicas e de estilo específicas para o projeto CertificaMais

### 🧪 Testes e Confiabilidade (Específico do Projeto)
# Baseado na Stack definida no PLANNING.MD

- **Framework de Teste Escolhido:**
    - **Frontend (Next.js/React):** Jest com React Testing Library.
        - **Justificativa:** Padrão da indústria para testes de componentes React e lógica de UI.
    - **API Routes (Next.js):** Jest com `supertest` ou mocks do Next.js para `req`/`res`.
        - **Justificativa:** Testar a lógica dos endpoints.
    - **n8n Workflows:** Teste manual para o MVP. Para fluxos complexos, pode-se exportar o JSON do workflow e validar sua estrutura, ou criar testes e2e que disparem o webhook e verifiquem o resultado no Supabase.
- **Estrutura de Pastas de Teste:**
    - Para componentes React/Next.js com Jest: `src/**/__tests__/**/*.test.ts` ou `src/**/*.test.tsx`.
    - Arquivos de mock em `src/**/__mocks__`.
- **Diretrizes Adicionais de Teste (se houver):**
    - Priorizar testes de integração para API endpoints que interagem com Supabase (usando um Supabase de teste ou mocks robustos).
    - Testar validações de entrada em formulários e API endpoints.
    - Para n8n, cada nó crítico deve ter seu comportamento de sucesso e falha testado manualmente durante o desenvolvimento do workflow.

### 📎 Estilo e Convenções de Código (Específico do Projeto)
# Baseado na Stack definida no PLANNING.MD

- **Linguagem(ns) Principal(is) do Projeto:** TypeScript (Frontend/Next.js API Routes), JSON/JavaScript (para expressões em n8n).
- **Ferramenta de Formatação de Código e Configuração Principal:** Prettier (configuração padrão ou com `printWidth: 100`, `singleQuote: true`, `trailingComma: 'all'`). Integrado com ESLint (`eslint-config-prettier`).
- **Ferramenta de Linting e Configuração Principal:** ESLint com `eslint-config-next/core-web-vitals`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `@typescript-eslint/eslint-plugin`.
- **Ferramenta de Validação de Dados e Padrão de Uso:**
    - **Zod:** Para validação de schemas de entrada em API Routes e formulários do frontend.
      ```typescript
      // Exemplo de schema Zod para API route
      import { z } from 'zod';
      export const CreateEventSchema = z.object({
        title: z.string().min(3).max(255),
        workload_hours: z.number().positive(),
        event_start_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida" }),
        event_end_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida" }),
      });
      ```
- **Convenções para Frameworks/Bibliotecas Chave:**
    - **Next.js:**
        - Utilizar o App Router.
        - Preferir Server Components para buscar dados e lógica não interativa. Client Components (`'use client'`) apenas quando necessário (interatividade, hooks de estado/efeito).
        - API Routes em `src/app/api/.../route.ts`.
        - Gerenciamento de estado: Zustand para estado global complexo, React Context/useState para estado local/simples.
    - **Supabase SDK:**
        - Encapsular todas as chamadas ao Supabase Client em funções de serviço dentro de `src/lib/supabaseService.ts` ou arquivos específicos por entidade (ex: `src/services/eventService.ts`).
        - Utilizar os tipos gerados pelo Supabase CLI para type-safety com o schema do banco (`npx supabase gen types typescript --project-id <project-id> --schema public > src/lib/database.types.ts`).
    - **n8n:**
        - Nomear nós de forma clara e descritiva (ex: "Receber Dados Certificado", "Gerar PDF com pdfmake", "Atualizar Supabase: Emitido").
        - Usar sub-workflows (`Execute Workflow` node) para lógica reutilizável (ex: um sub-workflow para "Salvar PDF no Supabase Storage e Retornar URL").
        - Tratar erros em cada etapa crítica usando a saída "Error" dos nós e/ou o nó `Error Trigger`.
        - Adicionar anotações (`Sticky Notes`) para explicar partes complexas do workflow.
        - Usar o `Code` node com moderação, preferindo nós existentes. Se usar JavaScript, manter o código simples e bem comentado.
- **Estilo de Docstrings/Comentários e Exemplo:**
    - **Para TypeScript:** JSDoc.
      ```typescript
      /**
       * Cadastra um novo evento no sistema.
       *
       * @param eventData Os dados do evento a ser cadastrado.
       * @param eventData.title O título do evento.
       * @param eventData.workload_hours A carga horária em horas.
       * @param eventData.event_start_date Data de início do evento (YYYY-MM-DD).
       * @param eventData.event_end_date Data de término do evento (YYYY-MM-DD).
       * @returns Uma promessa que resolve para o evento criado ou null em caso de erro.
       * @throws Erro se a inserção no Supabase falhar.
       */
      async function createEvent(eventData: { title: string; workload_hours: number; /* ... */ }): Promise<EventType | null> {
        // Lógica da função
      }
      ```
- **Outras Convenções de Código Específicas do Projeto:**
    - Nomenclatura de variáveis e funções em `camelCase`.
    - Nomenclatura de componentes React e tipos/interfaces em `PascalCase`.
    - Constantes em `SCREAMING_SNAKE_CASE`.
    - Evitar `any` sempre que possível; usar `unknown` ou tipos específicos.
    - Organizar imports: primeiro os de bibliotecas externas, depois os do projeto (absolutos), depois relativos.
    - Usar `async/await` para código assíncrono.

### 🏗️ Estrutura de Pastas e Arquivos (Reforço/Detalhes)
# Detalhes ou reforços da estrutura de pastas proposta no PLANNING.MD (Seção 8)

- **`src/app/(admin)` e `src/app/(user)`:** Agrupamento de rotas por perfil de usuário para clareza e aplicação de layouts específicos.
- **`src/app/api/.../route.ts`:** Padrão do Next.js App Router para handlers de rota.
- **`src/components/ui/`:** Para componentes de UI "burros" e reutilizáveis, potencialmente vindos de Shadcn/ui ou similar (e.g., Button, Input, Card).
- **`src/components/forms/`:** Componentes de formulário mais complexos, com lógica de estado e validação (ex: `EventForm.tsx`, `CertificateSearchForm.tsx`).
- **`src/components/layout/`:** Componentes estruturais como `AdminLayout.tsx`, `UserLayout.tsx`, `Navbar.tsx`, `Footer.tsx`.
- **`src/lib/supabaseClient.ts`:** Configuração e exportação da instância do cliente Supabase para uso no frontend e backend (API routes).
- **`src/lib/database.types.ts`:** Arquivo gerado pelo Supabase CLI contendo os tipos do schema do banco de dados. *Não editar manualmente.*
- **`src/lib/validators/`:** (Opcional) Pode conter os schemas Zod para validação, se preferir separá-los de onde são usados.
- **`src/services/`:** Abstrações para interações com o backend/Supabase. Por exemplo, `eventService.ts` poderia ter funções como `getEventById(id)`, `createEvent(data)`, etc., encapsulando as chamadas ao `supabaseClient`.
- **`src/types/` ou `src/lib/types.ts`:** Definições de tipos e interfaces customizadas para o projeto (ex: `CertificateWithEventDetails`).
- **Variáveis de ambiente:** Devem ser prefixadas com `NEXT_PUBLIC_` para serem expostas ao browser. Variáveis sensíveis (como `SUPABASE_SERVICE_ROLE_KEY`) não devem ter esse prefixo e só são acessíveis no lado do servidor (API Routes, Server Components).