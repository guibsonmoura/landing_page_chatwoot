'use client';

import { useState, useEffect } from 'react';
import { getAgents } from '@/lib/actions/agent.actions';
import { getChannels } from '@/lib/actions/channel.actions';
import { getAttendants } from '@/lib/actions/attendant.actions';
import { getCustomersAnalytics, getChatAnalytics, getTotalCustomers, getTotalAtendimentos, getTotalMensagensEnviadas, getTotalMensagensRecebidas, getConversationHeatmap } from '@/lib/actions/analytics.actions';
import { PeriodFilter } from '@/lib/utils/analytics';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, Bot, Waypoints, MessageSquare, Database, Check, CheckCircle2, BadgePlus, Crown } from 'lucide-react';
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { PeriodFilter as PeriodFilterComponent } from '@/components/analytics/PeriodFilter';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { TotalizadoresGrid } from '@/components/dashboard/TotalizadoresGrid';
import ConversationHeatmap from '@/components/analytics/ConversationHeatmap';
import { Loading, CardSkeleton } from '@/components/ui/loading';

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

export function AnalyticsClientPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>('7d');
  const [data, setData] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados em paralelo
      const [
        agentsResult,
        channelsResult,
        attendantsResult,
        customersAnalytics,
        chatAnalytics,
        totalCustomers,
        totalAtendimentos,
        totalMensagensEnviadas,
        totalMensagensRecebidas,
        heatmapData7Days,
        heatmapData30Days
      ] = await Promise.all([
        getAgents(),
        getChannels(),
        getAttendants(),
        getCustomersAnalytics(period),
        getChatAnalytics(period),
        getTotalCustomers(),
        getTotalAtendimentos(),
        getTotalMensagensEnviadas(),
        getTotalMensagensRecebidas(),
        getConversationHeatmap(7),
        getConversationHeatmap(30)
      ]);

      setData({
        agents: agentsResult.data || [],
        channels: channelsResult.data || [],
        attendants: attendantsResult.data || [],
        customersAnalytics,
        chatAnalytics,
        totalCustomers,
        totalAtendimentos,
        totalMensagensEnviadas,
        totalMensagensRecebidas,
        heatmapData7Days,
        heatmapData30Days
      });
    } catch (error) {
      console.error('Erro ao carregar dados do analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  if (loading) {
    return <Loading text="Carregando analytics..." />;
  }

  if (!data) {
    return <div>Erro ao carregar dados</div>;
  }

  const agents = data.agents as Agent[];
  const channels = data.channels as Channel[];
  const attendants = data.attendants || [];

  const agentCount = agents.length;
  const attendantCount = attendants.length;
  const channelCount = channels.length;
  const activeAgents = agents.filter((a: Agent) => a.is_active).length;
  const activeChannels = channels.filter((c: Channel) => c.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Métricas e análises de performance dos seus agentes de IA
          </p>
        </div>
        
        <PeriodFilterComponent 
          selectedPeriod={period} 
          onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
        />
      </div>

      {/* Totalizadores Grid */}
      <TotalizadoresGrid 
        clientes={data.totalCustomers}
        atendimentos={data.totalAtendimentos}
        mensagensEnviadas={data.totalMensagensEnviadas}
        mensagensRecebidas={data.totalMensagensRecebidas}
      />

      {/* Analytics Dashboard */}
      <AnalyticsDashboard 
        customersData={{
          data: data.customersAnalytics.data || [],
          total: data.customersAnalytics.total || 0,
          percentageChange: data.customersAnalytics.percentageChange || 0,
          error: 'error' in data.customersAnalytics ? data.customersAnalytics.error : undefined
        }}
        chatData={{
          data: data.chatAnalytics.data || [],
          total: data.chatAnalytics.total || 0,
          percentageChange: data.chatAnalytics.percentageChange || 0,
          error: 'error' in data.chatAnalytics ? data.chatAnalytics.error : undefined
        }}
        initialPeriod={period}
      />

      {/* Heatmap de Conversas */}
      <ConversationHeatmap 
        data7Days={data.heatmapData7Days} 
        data30Days={data.heatmapData30Days} 
      />
    </div>
  );
}
