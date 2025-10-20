'use client';

import { useState, useEffect } from 'react';
import { getAgents } from '@/lib/actions/agent.actions';
import { getChannels } from '@/lib/actions/channel.actions';
import { getAttendants } from '@/lib/actions/attendant.actions';
import { getCustomersAnalytics, getChatAnalytics, getTotalCustomers, getTotalAtendimentos, getTotalMensagensEnviadas, getTotalMensagensRecebidas, getConversationHeatmap } from '@/lib/actions/analytics.actions';
import { PeriodFilter } from '@/lib/utils/analytics';

import { PeriodFilter as PeriodFilterComponent } from '@/components/analytics/PeriodFilter';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { TotalizadoresGrid } from '@/components/dashboard/TotalizadoresGrid';
import ConversationHeatmap from '@/components/analytics/ConversationHeatmap';
import { Loading, CardSkeleton } from '@/components/ui/loading';
import { HeaderSetter } from '@/components/layout/HeaderSetter';

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
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Carregar dados estáticos/independentes do período apenas uma vez
  useEffect(() => {
    const loadBaseData = async () => {
      try {
        setLoading(true);
        const [
          agentsResult,
          channelsResult,
          attendantsResult,
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
          getTotalCustomers(),
          getTotalAtendimentos(),
          getTotalMensagensEnviadas(),
          getTotalMensagensRecebidas(),
          getConversationHeatmap(7),
          getConversationHeatmap(30)
        ]);

        setData(prev => ({
          ...(prev || {}),
          agents: agentsResult.data || [],
          channels: channelsResult.data || [],
          attendants: attendantsResult.data || [],
          totalCustomers,
          totalAtendimentos,
          totalMensagensEnviadas,
          totalMensagensRecebidas,
          heatmapData7Days,
          heatmapData30Days
        }));
      } catch (error) {
        console.error('Erro ao carregar dados base do analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBaseData();
  }, []);

  // Carregar apenas dados dependentes do período quando o período mudar
  useEffect(() => {
    const loadPeriodData = async () => {
      try {
        setAnalyticsLoading(true);
        const [customersAnalytics, chatAnalytics] = await Promise.all([
          getCustomersAnalytics(period),
          getChatAnalytics(period)
        ]);

        setData(prev => ({
          ...(prev || {}),
          customersAnalytics,
          chatAnalytics
        }));
      } catch (error) {
        console.error('Erro ao carregar dados por período do analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadPeriodData();
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
  
  // Fallbacks para evitar undefined enquanto dados por período carregam
  const customersAnalyticsData = data.customersAnalytics ?? { data: [], total: 0, percentageChange: 0 };
  const chatAnalyticsData = data.chatAnalytics ?? { data: [], total: 0, percentageChange: 0 };

  return (
    <div className="space-y-6">
      <HeaderSetter title="Analytics" subtitle="Métricas e análises de performance dos seus agentes de IA" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div />
        
        <PeriodFilterComponent 
          selectedPeriod={period} 
          onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
        />
      </div>

      
      <TotalizadoresGrid 
        clientes={data.totalCustomers}
        atendimentos={data.totalAtendimentos}
        mensagensEnviadas={data.totalMensagensEnviadas}
        mensagensRecebidas={data.totalMensagensRecebidas}
      />
      
      <AnalyticsDashboard 
        customersData={{
          data: customersAnalyticsData.data || [],
          total: customersAnalyticsData.total || 0,
          percentageChange: customersAnalyticsData.percentageChange || 0,
          error: 'error' in customersAnalyticsData ? (customersAnalyticsData as any).error : undefined
        }}
        chatData={{
          data: chatAnalyticsData.data || [],
          total: chatAnalyticsData.total || 0,
          percentageChange: chatAnalyticsData.percentageChange || 0,
          error: 'error' in chatAnalyticsData ? (chatAnalyticsData as any).error : undefined
        }}
        initialPeriod={period}
      />

      <ConversationHeatmap 
        data7Days={data.heatmapData7Days} 
        data30Days={data.heatmapData30Days} 
      />
    </div>
  );
}
