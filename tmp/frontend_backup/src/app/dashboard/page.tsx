import { getAgents } from '@/lib/actions/agent.actions';
import { getChannels } from '@/lib/actions/channel.actions';
import { getAttendants } from '@/lib/actions/attendant.actions';
import { getCustomersAnalytics, getChatAnalytics, getTotalCustomers, getTotalAtendimentos, getTotalMensagensEnviadas, getTotalMensagensRecebidas, getConversationHeatmap } from '@/lib/actions/analytics.actions';
import { PeriodFilter } from '@/lib/utils/analytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Bot, Waypoints, MessageSquare, Database, Check, CheckCircle2, BadgePlus, Crown } from 'lucide-react';
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { PeriodFilter as PeriodFilterComponent } from '@/components/analytics/PeriodFilter';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { TotalizadoresGrid } from '@/components/dashboard/TotalizadoresGrid';
import ConversationHeatmap from '@/components/analytics/ConversationHeatmap';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

interface Agent {
  id: string;
  agent_name: string;
  system_prompt: string;
  is_active: boolean;
  created_at: string;
  [key: string]: any;
}

interface Channel {
  id: string;
  platform: string;
  account: string;
  is_active: boolean;
  created_at: string;
  [key: string]: any;
}

interface Features {
  rag_enabled?: boolean;
  reporting_level?: string | number;
  hybrid_search_enabled?: boolean;
  long_term_memory_enabled?: boolean;
  plan_name?: string;
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ period?: string; start?: string; end?: string }>
}) {
  const cookieStore = cookies();
  const supabase = await createClient();

  // Busca os dados em paralelo no servidor
  // Determinar período para analytics (await searchParams for Next.js 15)
  const params = await searchParams;
  const period = (params.period as PeriodFilter) || '7d';
  const customStart = params.start ? new Date(params.start) : undefined;
  const customEnd = params.end ? new Date(params.end) : undefined;

  // Busca os dados em paralelo no servidor
  const [agentsResult, channelsResult, attendantsResult, customersAnalytics, chatAnalytics, totalCustomers, totalAtendimentos, totalMensagensEnviadas, totalMensagensRecebidas, heatmapData7Days, heatmapData30Days] = await Promise.all([
    getAgents(),
    getChannels(),
    getAttendants(),
    getCustomersAnalytics(period, customStart, customEnd),
    getChatAnalytics(period, customStart, customEnd),
    getTotalCustomers(),
    getTotalAtendimentos(),
    getTotalMensagensEnviadas(),
    getTotalMensagensRecebidas(),
    getConversationHeatmap(7), // Últimos 7 dias
    getConversationHeatmap(30) // Últimos 30 dias
  ]);
  
  // Obter usuário autenticado
  const { data: { user } } = await supabase.auth.getUser();

  // Buscar informações do plano
  let planName = 'Plano Básico';
  let planFeatures = null;
  let maxAgents = 0;
  let maxChannels = 0;
  let maxAttendants = 0;
  let allowedChannels: string[] = [];
  let features: Features = {};
  
  let tenantData = null;
  
  if (user) {
    // Buscar informações do tenant e plano
    const tenantResponse = await supabase
      .from('tenants')
      .select('id, plans(name, plan_features)')
      .eq('user_id', user.id)
      .single();
      
    tenantData = tenantResponse.data;
      
    if (tenantData?.plans) {
      // Tratar o caso em que plans pode ser um array ou um objeto
      let planData = null;
      
      if (Array.isArray(tenantData.plans)) {
        planData = tenantData.plans[0];
      } else if (tenantData.plans) {
        planData = tenantData.plans as any; // Usar type assertion para evitar erros de tipagem
      }
      
      if (planData) {
        planName = planData.name || 'Plano Básico';
        planFeatures = planData.plan_features;
      }
      
      // Extrair dados do plano conforme nova estrutura
      if (planFeatures) {
        // Usar o nome do plano do próprio JSON se disponível
        planName = planFeatures.plan_name || planName;
        maxAgents = planFeatures.max_agents || 0;
        maxChannels = planFeatures.max_channel || 0; 
        maxAttendants = planFeatures.max_attendants || 0; 
        allowedChannels = planFeatures.allowed_channels || [];
        features = planFeatures.features || {};
      }
    }
  }

  const agents = agentsResult.data as Agent[] || [];
  const channels = channelsResult.data as Channel[] || [];
  const attendants = attendantsResult.data || [];

  const agentCount = agents.length;
  const attendantCount = attendants.length;
  const channelCount = channels.length;
  const activeAgents = agents.filter((a: Agent) => a.is_active).length;
  const activeChannels = channels.filter((c: Channel) => c.is_active).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Totalizadores */}
      <TotalizadoresGrid
        clientes={totalCustomers}
        atendimentos={totalAtendimentos}
        mensagensEnviadas={totalMensagensEnviadas}
        mensagensRecebidas={totalMensagensRecebidas}
      />

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        customersData={{
          data: customersAnalytics.data || [],
          total: customersAnalytics.total || 0,
          percentageChange: customersAnalytics.percentageChange || 0,
          error: 'error' in customersAnalytics ? customersAnalytics.error : undefined
        }}
        chatData={{
          data: chatAnalytics.data || [],
          total: chatAnalytics.total || 0,
          percentageChange: chatAnalytics.percentageChange || 0,
          error: 'error' in chatAnalytics ? chatAnalytics.error : undefined
        }}
        initialPeriod={period}
        customStart={customStart}
        customEnd={customEnd}
      />

      {/* Heatmap de Conversas */}
      <ConversationHeatmap 
        data7Days={heatmapData7Days} 
        data30Days={heatmapData30Days} 
      />

      {/* Métricas de Valor Gerado pela IA */}

    </div>
  );
}
