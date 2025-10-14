// src/types/agent.ts

export interface Agent {
  id: string;
  created_at: string;
  tenant_id: string;
  agent_name: string;
  system_prompt: string;
  llm_config: any; // Pode ser refinado depois se houver uma estrutura específica
  is_active: boolean;
  // Relacionamentos opcionais (quando buscados com getAgentsWithRelations)
  channels?: {
    id: string;
    platform: string;
    account: string;
    is_active: boolean;
    created_at: string;
  }[];
  knowledge_bases?: {
    id: string;
    file_name: string;
    status: string;
    created_at: string;
  }[];
}
