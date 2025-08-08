// src/stores/planStore.ts
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import logger from '@/lib/logger';

// Definindo a interface para as features internas do plano
interface Features {
  rag_enabled: boolean;
  reporting_level: string;
  hybrid_search_enabled: boolean;
  long_term_memory_enabled: boolean;
  [key: string]: any; // Permite outras chaves que não conhecemos
}

// Definindo a interface para as features do plano para termos tipagem forte
interface PlanFeatures {
  max_agents: number;
  max_channel: number; // Novo campo conforme atualização
  plan_name: string;
  allowed_channels: string[];
  max_documents_per_rag: number;
  features: Features;
  [key: string]: any; // Permite outras chaves que não conhecemos
}

// Definindo a interface para o estado da nossa store
interface PlanState {
  planFeatures: PlanFeatures | null;
  tenantId: string | null;
  isLoading: boolean;
  fetchPlanFeatures: (userId: string) => Promise<void>;
  clearPlanFeatures: () => void;
}

const supabase = createClient();

export const usePlanStore = create<PlanState>((set, get) => ({
  planFeatures: null,
  tenantId: null,
  isLoading: true,

  // Ação para buscar os dados do plano
  fetchPlanFeatures: async (userId: string) => {
    if (!userId || get().planFeatures) return;
    set({ isLoading: true });
    logger.debug('Fetching tenant for authenticated user');
    try {
      // 1. Encontrar o tenant_id para o usuario logado
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id, plan_id')
        .eq('user_id', userId)
        .single();

      // Log do resultado da primeira query
      logger.debug('Tenant query completed', { hasData: !!tenantData, hasError: !!tenantError });

      if (tenantError) throw new Error(`Erro ao buscar tenant: ${tenantError.message}`);
      if (!tenantData) throw new Error('Nenhum tenant encontrado para o usuário. A query não retornou dados.');

      logger.debug('Tenant found, fetching plan data');

      // 2. Com o plan_id, buscar as features do plano
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('plan_features')
        .eq('id', tenantData.plan_id)
        .single();

      // Log do resultado da segunda query
      logger.debug('Plan query completed', { hasData: !!planData, hasError: !!planError });

      if (planError) throw new Error(`Erro ao buscar plano: ${planError.message}`);
      if (!planData) throw new Error('Nenhum plano encontrado para o plan_id. A query não retornou dados.');

      logger.info('Plan features loaded successfully');

      set({ 
        planFeatures: planData.plan_features as PlanFeatures, 
        tenantId: tenantData.id,
        isLoading: false 
      });

    } catch (error: any) {
      logger.error('Failed to fetch plan features', error);
      set({ isLoading: false, planFeatures: null, tenantId: null });
    }
  },

  // Ação para limpar a store (ex: no logout)
  clearPlanFeatures: () => {
    set({ planFeatures: null, tenantId: null, isLoading: false });
  },
}));


