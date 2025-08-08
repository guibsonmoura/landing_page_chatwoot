-- Script para criar as tabelas do "Gerador de Alma" (Soul Generator)
-- Tabelas: agent_archetypes, personality_traits, conversation_flows, dialogue_examples, e wizard_generations

-- Tabela de Arquetipos de Agentes
CREATE TABLE IF NOT EXISTS public.agent_archetypes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    niche TEXT NOT NULL,
    use_case TEXT NOT NULL,
    final_prompt_template TEXT NULL,
    base_template_structured JSONB NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Traços de Personalidade
CREATE TABLE IF NOT EXISTS public.personality_traits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    prompt_fragment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Fluxos de Conversação
CREATE TABLE IF NOT EXISTS public.conversation_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    niche VARCHAR(100),
    prompt_fragment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Exemplos de Diálogo
CREATE TABLE IF NOT EXISTS public.dialogue_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archetype_id UUID REFERENCES public.agent_archetypes(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    agent_response TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Gerações do Wizard
CREATE TABLE IF NOT EXISTS public.wizard_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    agent_id UUID,
    archetype_id UUID REFERENCES public.agent_archetypes(id),
    selected_traits JSONB,
    selected_flows JSONB,
    generated_prompt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar RLS (Row Level Security) para a tabela wizard_generations
ALTER TABLE public.wizard_generations ENABLE ROW LEVEL SECURITY;

-- Política para wizard_generations - apenas o tenant proprietário pode ver suas gerações
CREATE POLICY wizard_generations_tenant_isolation ON public.wizard_generations
    USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- Comentários nas tabelas
COMMENT ON TABLE public.agent_archetypes IS 'Arquetipos predefinidos para agentes de IA';
COMMENT ON TABLE public.personality_traits IS 'Traços de personalidade que podem ser aplicados aos agentes';
COMMENT ON TABLE public.conversation_flows IS 'Fluxos de conversação que os agentes podem gerenciar';
COMMENT ON TABLE public.dialogue_examples IS 'Exemplos de diálogos para cada arquetipo de agente';
COMMENT ON TABLE public.wizard_generations IS 'Registro de gerações de prompts pelo wizard';

-- Índices para melhorar a performance de consultas comuns
CREATE INDEX IF NOT EXISTS idx_archetypes_niche ON public.agent_archetypes(niche);
CREATE INDEX IF NOT EXISTS idx_archetypes_use_case ON public.agent_archetypes(use_case);
CREATE INDEX IF NOT EXISTS idx_conversation_flows_niche ON public.conversation_flows(niche);
CREATE INDEX IF NOT EXISTS idx_wizard_generations_tenant ON public.wizard_generations(tenant_id);
