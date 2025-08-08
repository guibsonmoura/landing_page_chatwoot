import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import logger from '@/lib/logger';

interface Agent {
  id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  type?: string;
  metadata?: any;
}

interface AgentStore {
  agents: Agent[];
  selectedAgent: Agent | null;
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  selectAgent: (agent: Agent | null) => void;
  createAgent: (agent: Partial<Agent>) => Promise<Agent | null>;
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<Agent | null>;
  deleteAgent: (id: string) => Promise<boolean>;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  selectedAgent: null,
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tenant_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ agents: data || [], isLoading: false });
    } catch (error: any) {
      logger.error('Failed to fetch agents', error);
      set({ error: error.message, isLoading: false });
    }
  },

  selectAgent: (agent) => {
    set({ selectedAgent: agent });
  },

  createAgent: async (agent) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tenant_agents')
        .insert(agent)
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar a lista de agentes
      const { agents } = get();
      set({ 
        agents: [data, ...agents], 
        isLoading: false 
      });
      
      return data;
    } catch (error: any) {
      logger.error('Failed to create agent', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateAgent: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tenant_agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar a lista de agentes
      const { agents, selectedAgent } = get();
      const updatedAgents = agents.map(agent => 
        agent.id === id ? { ...agent, ...data } : agent
      );
      
      set({ 
        agents: updatedAgents, 
        // Se o agente selecionado for o que foi atualizado, atualize-o também
        selectedAgent: selectedAgent?.id === id ? { ...selectedAgent, ...data } : selectedAgent,
        isLoading: false 
      });
      
      return data;
    } catch (error: any) {
      logger.error('Failed to update agent', error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  deleteAgent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('tenant_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar a lista de agentes
      const { agents, selectedAgent } = get();
      set({ 
        agents: agents.filter(agent => agent.id !== id),
        // Se o agente selecionado for o que foi excluído, limpe a seleção
        selectedAgent: selectedAgent?.id === id ? null : selectedAgent,
        isLoading: false 
      });
      
      return true;
    } catch (error: any) {
      logger.error('Failed to delete agent', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  }
}));
