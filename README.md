# Nexus Agents — Web

Este diretório contém a aplicação web do projeto Nexus Agents — uma aplicação Next.js em TypeScript.

Resumo rápido
- Framework: Next.js 15 (App Router)
- React: 19
- TypeScript
- Estilização: Tailwind CSS
- Banco / Auth: Supabase
- Integração LLM: OpenAI (pacote `openai`)

## Scripts disponíveis

Os scripts definidos em `package.json` são:

- `dev` — inicia o Next.js em modo desenvolvimento (hot-reload)
- `build` — compila a aplicação para produção
- `start` — inicia o servidor Next.js em modo produção (após `build`)
- `lint` — executa o ESLint

Exemplos de uso (substitua `pnpm` por `npm` ou `yarn` se preferir):

```bash
# instalar dependências
pnpm install

# rodar em desenvolvimento
pnpm dev

# gerar build para produção
pnpm build

# iniciar em produção (após build)
pnpm start

# rodar linter
pnpm lint
```

## Variáveis de ambiente (principais)

O projeto utiliza as seguintes variáveis de ambiente (endereços e chaves):

- NEXT_PUBLIC_SUPABASE_URL — URL pública do Supabase
- NEXT_PUBLIC_SUPABASE_ANON_KEY — chave anônima do Supabase (pública no cliente)
- SUPABASE_SERVICE_ROLE_KEY — service role (somente server; mantenha secreto)
- OPENAI_API_KEY — chave da OpenAI (manter secreta)
- SUPABASE_URL / SUPABASE_ANON_KEY — variantes usadas em algumas rotas/serviços

Observações:
- Não comite chaves sensíveis no repositório.
- Para produção, coloque `SUPABASE_SERVICE_ROLE_KEY` e `OPENAI_API_KEY` como secrets no seu ambiente/container orchestrator.

Sugestão: crie um arquivo `.env.example` com as variáveis acima (sem valores) e copie para `.env` localmente.

## Docker / Deploy

Existem arquivos de orquestração prontos neste diretório:

- `docker-compose.yml` e `docker-compose.traefik.yml` — exemplos para executar via Docker Compose (com Traefik)
- `docker-stack.yml` — exemplo de stack para deploy (Docker Swarm / Portainer)
- `portainer-stack.yml` — template para Portainer

Esses arquivos já referenciam variáveis de ambiente (ex.: `NEXT_PUBLIC_SUPABASE_URL`, `OPENAI_API_KEY`). Configure as variáveis/secrets no host de deploy.

## Integrações importantes

- Supabase: Auth, Storage e banco (RLS). O projeto documenta a necessidade da extensão `pg_vector` para features de RAG.
- OpenAI: usado para tarefas de LLM (ver `src/lib` onde há wrappers/consumos).
- Logger: `pino` e `pino-pretty` são usados para logging.

## Estrutura relevante do projeto

- `src/app` — rotas e páginas (App Router do Next.js)
- `src/components` — componentes React organizados por domínio
- `src/lib` — integrações e helpers (ex.: `supabase`, `logger`, `openai`)
- `src/contexts` — contextos React (ex.: `AgentContext.tsx`)

## Requisitos

- Node.js 18+ (recomendado)
- pnpm / npm / yarn
- Conta Supabase configurada (com `pg_vector` ativado quando necessário)
- OpenAI API key (quando utilizar recursos de IA)

## Segurança e boas práticas

- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` ou `OPENAI_API_KEY` em repositórios públicos.
- Use secrets do ambiente (Portainer, Docker secrets, Vercel/Cloud provider secrets).
- Evite logar chaves sensíveis. Revise logger para não imprimir valores de `process.env` em produção.

## Próximos passos sugeridos

- Adicionar um arquivo `.env.example` listando todas as variáveis necessárias.
- Incluir instruções de CI (ex.: GitHub Actions) para rodar `pnpm build` e `pnpm lint` em PRs.
- Adicionar badges de status (build, node version) no topo do README se desejar.

---

Se quiser, eu posso:

- Gerar um `.env.example` automaticamente com as variáveis listadas (sem valores).
- Adicionar instruções de CI e exemplos de GitHub Actions.
- Criar um pequeno script Docker para facilitar o desenvolvimento local.
