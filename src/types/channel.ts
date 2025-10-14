// Definição baseada na tabela 'tenant_channels' e nas queries relacionadas

export type KnowledgeBase = {
  id: string;
  name: string;
  description: string | null;
  // Outros campos relevantes da tabela tenant_agents_rag podem ser adicionados aqui
};

export type Channel = {
  id: string;
  platform: string;
  account: string;
  config: Record<string, any> | string; // Representa o tipo JSONB do Supabase ou string serializada
  agent_id: string | null;
  is_active: boolean;
  created_at: string; // Data de criação do canal
  // A query em getChannels faz um join com a tabela de agentes
  agent: {
    agent_name: string;
    knowledge_bases: KnowledgeBase[];
  } | null;
};
