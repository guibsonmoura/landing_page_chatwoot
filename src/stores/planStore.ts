// src/stores/planStore.ts
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import logger from '@/lib/logger';


interface Features {
  rag_enabled: boolean;
  reporting_level: string;
  hybrid_search_enabled: boolean;
  long_term_memory_enabled: boolean;
  [key: string]: any; 
}


interface PlanFeatures {
  max_agents: number;
  max_channel: number; 
  plan_name: string;
  allowed_channels: string[];
  max_documents_per_rag: number;
  features: Features;
  [key: string]: any; 
}


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

  
  fetchPlanFeatures: async (userId: string) => {
    if (!userId || get().planFeatures) return;
    set({ isLoading: true });
    logger.debug('Fetching tenant for authenticated user');
    try {
      
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id, plan_id')
        .eq('user_id', userId)
        .single();

      
      logger.debug('Tenant query completed', { hasData: !!tenantData, hasError: !!tenantError });

      if (tenantError) throw new Error(`Erro ao buscar tenant: ${tenantError.message}`);
      if (!tenantData) throw new Error('Nenhum tenant encontrado para o usuário. A query não retornou dados.');

      logger.debug('Tenant found, fetching plan data');

      
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('plan_features')
        .eq('id', tenantData.plan_id)
        .single();

      
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

  
  clearPlanFeatures: () => {
    set({ planFeatures: null, tenantId: null, isLoading: false });
  },
}));


