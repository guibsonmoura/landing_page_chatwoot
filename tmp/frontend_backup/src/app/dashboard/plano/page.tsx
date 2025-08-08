import { getAgents } from '@/lib/actions/agent.actions';
import { getChannels } from '@/lib/actions/channel.actions';
import { getAttendants } from '@/lib/actions/attendant.actions';
import { getConversationHeatmap, getConversationHeatmapTotal } from '@/lib/actions/analytics.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Users, Bot, MessageSquare, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ValueMetricsCard from '@/components/analytics/ValueMetricsCard';

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

interface Attendant {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  [key: string]: any;
}

export default async function PlanoPage() {
  // Busca os dados em paralelo no servidor
  const [agentsResult, channelsResult, attendantsResult, heatmapData7Days, heatmapData30Days, heatmapDataTotal] = await Promise.all([
    getAgents(),
    getChannels(),
    getAttendants(),
    getConversationHeatmap(7),
    getConversationHeatmap(30),
    getConversationHeatmapTotal()
  ]);
  
  // Obter usuário autenticado
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Variáveis para dados do plano
  let tenantData: any = null;
  let planName = 'Plano Básico';
  let planFeatures: any = null;
  let maxAgents = 0;
  let maxChannels = 0;
  let maxAttendants = 0;
  let allowedChannels: string[] = [];
  let features: any = {};
  
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
        planData = tenantData.plans as any;
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

  // Normalizar nomes das features
  const normalizeFeatureName = (key: string, value: any) => {
    switch (key) {
      case 'rag_enabled':
        return value ? 'Base conhecimento' : null;
      case 'reporting_level':
        return `Nível de relatório: ${value}`;
      case 'hybrid_search_enabled':
        return value ? 'Pesquisa híbrida' : null;
      case 'long_term_memory_enabled':
        return value ? 'Perfil do usuário' : null;
      default:
        return null;
    }
  };

  // Filtrar apenas features ativas
  const activeFeatures = Object.entries(features)
    .map(([key, value]) => normalizeFeatureName(key, value))
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Meu Plano
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Gerencie e visualize os detalhes do seu plano atual
          </p>
        </div>
      </div>

      {/* Card de Valor Gerado pela IA */}
      <ValueMetricsCard 
        data7Days={heatmapData7Days}
        data30Days={heatmapData30Days}
        dataTotal={heatmapDataTotal}
      />

      {/* Card do Plano - Largura Total */}
      <div className="w-full">
        <Card className="overflow-hidden border border-amber-200 dark:border-amber-900/50 shadow-sm bg-white dark:bg-slate-950">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-500 to-amber-600 z-10"
               style={{ marginTop: '-1px', width: 'calc(100% + 2px)', marginLeft: '-1px' }} />
          <CardContent className="p-5">
            {/* Layout de 3 Colunas com Tamanhos Diferentes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Coluna 1 - Identidade do Plano (4/12 colunas) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-6 py-6 bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-900/20 dark:to-orange-900/15 rounded-2xl border border-amber-100/50 dark:border-amber-800/30">
                <div className="relative">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg">
                    <Crown className="h-12 w-12" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {planName}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Seu plano atual
                  </p>
                  <div className="mt-4 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      ATIVO
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna 2 - Utilização (5/12 colunas) */}
              <div className="lg:col-span-5 space-y-6">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Utilização do Plano
                </h4>
                
                {/* Agentes */}
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Agentes</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">{activeAgents} ativos de {agentCount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {agentCount}/{maxAgents}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200/50 dark:bg-blue-800/30 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((agentCount / maxAgents) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Atendentes */}
                <div className="bg-green-50/50 dark:bg-green-950/20 p-4 rounded-xl border border-green-100/50 dark:border-green-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Atendentes</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Usuários cadastrados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {attendantCount}/{maxAttendants}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-green-200/50 dark:bg-green-800/30 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((attendantCount / maxAttendants) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Canais */}
                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-900 dark:text-purple-100">Canais</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">{activeChannels} ativos de {channelCount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {channelCount}/{maxChannels}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-purple-200/50 dark:bg-purple-800/30 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((channelCount / maxChannels) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Coluna 3 - Features e Plataformas (3/12 colunas) */}
              <div className="lg:col-span-3 space-y-6">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Recursos e Plataformas
                </h4>
                
                {/* Plataformas Disponíveis */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Plataformas Disponíveis
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {allowedChannels.map((platform, index) => (
                      <div 
                        key={index}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features Ativas */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Recursos Inclusos
                  </h5>
                  <div className="space-y-2">
                    {activeFeatures.map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm hover:shadow-md transition-all duration-200 animate-pulse"
                      >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                          {feature}
                        </span>
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
