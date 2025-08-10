import { getAgents } from '@/lib/actions/agent.actions';
import { getChannels } from '@/lib/actions/channel.actions';
import { getAttendants } from '@/lib/actions/attendant.actions';
import { getConversationHeatmap, getConversationHeatmapTotal } from '@/lib/actions/analytics.actions';
import { getInvoicesByTenant, getInvoiceStats } from '@/lib/actions/invoice.actions';
import { getPaymentMethodsByTenant } from '@/lib/actions/payment-method.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Users, Bot, MessageSquare, Check, CreditCard, Receipt, FileText, TrendingUp, BrainCircuit, Search, UserCheck, BarChart3 } from 'lucide-react';
import { getPlanIcon } from '@/lib/plan-icons';
import { createClient } from '@/lib/supabase/server';
import ValueMetricsCard from '@/components/analytics/ValueMetricsCard';
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
  
  // Variáveis para dados de billing
  let invoices: any[] = [];
  let invoiceStats: any = null;
  let paymentMethods: any[] = [];
  
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
      
      // Buscar dados de billing se tenant existe
      if (tenantData?.id) {
        const [invoicesResult, statsResult, paymentMethodsResult] = await Promise.all([
          getInvoicesByTenant(tenantData.id),
          getInvoiceStats(tenantData.id),
          getPaymentMethodsByTenant(tenantData.id)
        ]);
        
        invoices = invoicesResult.success ? invoicesResult.data || [] : [];
        invoiceStats = statsResult.success ? statsResult.data : null;
        paymentMethods = paymentMethodsResult.success ? paymentMethodsResult.data || [] : [];
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

  // Normalizar nomes das features com ícones
  const normalizeFeatureName = (key: string, value: any) => {
    switch (key) {
      case 'rag_enabled':
        return value ? { 
          name: 'Base de Conhecimento', 
          icon: BrainCircuit, 
          color: 'text-purple-700 dark:text-purple-300', 
          bg: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/30',
          special: true
        } : null;
      case 'reporting_level':
        return { name: `Relatórios: ${value}`, icon: BarChart3, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
      case 'hybrid_search_enabled':
        return value ? { name: 'Pesquisa Híbrida', icon: Search, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' } : null;
      case 'long_term_memory_enabled':
        return value ? { name: 'Perfil do Usuário', icon: UserCheck, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' } : null;
      default:
        return null;
    }
  };

  // Filtrar apenas features ativas
  const activeFeatures = Object.entries(features)
    .map(([key, value]) => normalizeFeatureName(key, value))
    .filter((feature): feature is { name: string; icon: any; color: string; bg: string; special?: boolean } => feature !== null);
  // Dividir features em duas colunas (zebra) para equilibrar alturas
  const featuresCol1 = activeFeatures.filter((_, i) => i % 2 === 0);
  const featuresCol2 = activeFeatures.filter((_, i) => i % 2 !== 0);

  return (
    <div className="space-y-6">
      {/* Set dynamic header (moved to global Header via context) */}
      <HeaderSetter title="Meu Plano" subtitle="Gerencie e visualize os detalhes do seu plano atual" />

      {/* Tabs para organizar conteúdo */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 font-medium"
          >
            <Crown className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 font-medium"
          >
            <TrendingUp className="h-4 w-4" />
            Economia
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 font-medium"
          >
            <Receipt className="h-4 w-4" />
            Faturamento
          </TabsTrigger>
          <TabsTrigger 
            value="payment-methods" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 font-medium"
          >
            <CreditCard className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Card Principal do Plano */}
          <div className="w-full">
            <Card className="border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900">
              <CardContent className="p-8">
                {/* Grid Layout Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Coluna 1 - Identidade do Plano (4/12 colunas) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-5 py-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="relative">
                  {(() => {
                    const planIconConfig = getPlanIcon(planName);
                    const IconComponent = planIconConfig.icon;
                    return (
                      <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${planIconConfig.iconBg} ${planIconConfig.iconColor} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="h-10 w-10" />
                      </div>
                    );
                  })()}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {planName}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Seu plano atual
                  </p>
                  <div className="inline-block px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold shadow-sm">
                    ATIVO
                  </div>
                </div>
              </div>

              {/* Coluna 2 - Utilização (8/12 colunas) */}
              <div className="lg:col-span-8 space-y-5">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Utilização do Plano
                </h4>
                
                {/* Agentes */}
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Agentes</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">{activeAgents} ativos de {agentCount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        {agentCount}/{maxAgents}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200/50 dark:bg-blue-800/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((agentCount / maxAgents) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Atendentes */}
                <div className="bg-green-50/50 dark:bg-green-950/20 p-3 rounded-xl border border-green-100/50 dark:border-green-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">Atendentes</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Usuários cadastrados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-700 dark:text-green-300">
                        {attendantCount}/{maxAttendants}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-green-200/50 dark:bg-green-800/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((attendantCount / maxAttendants) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Canais */}
                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-900 dark:text-purple-100">Canais</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">{activeChannels} ativos de {channelCount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                        {channelCount}/{maxChannels}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-purple-200/50 dark:bg-purple-800/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((channelCount / maxChannels) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Seção inferior em largura total: Recursos e Plataformas */}
              <div className="lg:col-span-12 mt-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-900">

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {/* Plataformas Disponíveis */}
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
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
                    {/* Recursos Inclusos - Coluna 1 */}
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Recursos Inclusos
                      </h5>
                      <div className="space-y-3">
                        {featuresCol1.map((feature, index) => {
                          const IconComponent = feature.icon;
                          const isSpecial = feature.special;
                          return (
                            <div 
                              key={index}
                              className={`flex items-center gap-3 p-4 rounded-xl border min-h-[72px] shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[1px] ${
                                isSpecial 
                                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-700/50 ring-1 ring-purple-200/50 dark:ring-purple-700/30'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className={`p-3 rounded-xl shadow-sm ${feature.bg} ${
                                isSpecial ? 'ring-2 ring-purple-300/50 dark:ring-purple-600/30' : ''
                              }`}>
                                <IconComponent className={`${isSpecial ? 'h-6 w-6' : 'h-5 w-5'} ${feature.color}`} />
                              </div>
                              <div className="flex-1">
                                <span className={`font-semibold ${
                                  isSpecial 
                                    ? 'text-base text-purple-900 dark:text-purple-100' 
                                    : 'text-sm text-slate-900 dark:text-slate-100'
                                }`}>
                                  {feature.name}
                                </span>
                                {isSpecial && (
                                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    IA Avançada • RAG Enabled
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className={`${isSpecial ? 'h-6 w-6' : 'h-5 w-5'} text-green-500 dark:text-green-400`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recursos Inclusos - Coluna 2 */}
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 opacity-0" aria-hidden="true">
                        Recursos Inclusos
                      </h5>
                      <div className="space-y-3">
                        {featuresCol2.map((feature, index) => {
                          const IconComponent = feature.icon;
                          const isSpecial = feature.special;
                          return (
                            <div 
                              key={index}
                              className={`flex items-center gap-3 p-4 rounded-xl border min-h-[72px] shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-[1px] ${
                                isSpecial 
                                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-700/50 ring-1 ring-purple-200/50 dark:ring-purple-700/30'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className={`p-3 rounded-xl shadow-sm ${feature.bg} ${
                                isSpecial ? 'ring-2 ring-purple-300/50 dark:ring-purple-600/30' : ''
                              }`}>
                                <IconComponent className={`${isSpecial ? 'h-6 w-6' : 'h-5 w-5'} ${feature.color}`} />
                              </div>
                              <div className="flex-1">
                                <span className={`font-semibold ${
                                  isSpecial 
                                    ? 'text-base text-purple-900 dark:text-purple-100' 
                                    : 'text-sm text-slate-900 dark:text-slate-100'
                                }`}>
                                  {feature.name}
                                </span>
                                {isSpecial && (
                                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                    IA Avançada • RAG Enabled
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className={`${isSpecial ? 'h-6 w-6' : 'h-5 w-5'} text-green-500 dark:text-green-400`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Métricas de Valor Gerado pela IA */}
          <ValueMetricsCard 
            data7Days={heatmapData7Days}
            data30Days={heatmapData30Days}
            dataTotal={heatmapDataTotal}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Faturado</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      R$ {invoiceStats?.total_amount?.toFixed(2) || '0,00'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Valor Pago</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {invoiceStats?.paid_amount?.toFixed(2) || '0,00'}
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pendente</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      R$ {invoiceStats?.pending_amount?.toFixed(2) || '0,00'}
                    </p>
                  </div>
                  <Receipt className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Em Atraso</p>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {invoiceStats?.overdue_amount?.toFixed(2) || '0,00'}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Faturas */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Suas Faturas</h3>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {invoices.length} fatura(s) encontrada(s)
                </div>
              </div>
              
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">Nenhuma fatura encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30' :
                          invoice.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          invoice.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          <FileText className={`h-5 w-5 ${
                            invoice.status === 'paid' ? 'text-green-600 dark:text-green-400' :
                            invoice.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                            invoice.status === 'overdue' ? 'text-red-600 dark:text-red-400' :
                            'text-slate-600 dark:text-slate-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {invoice.invoice_number}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {invoice.description}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            Vencimento: {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          R$ {Number(invoice.amount).toFixed(2)}
                        </p>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {invoice.status === 'paid' ? 'Pago' :
                           invoice.status === 'pending' ? 'Pendente' :
                           invoice.status === 'overdue' ? 'Vencido' :
                           invoice.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
    </TabsContent>

    <TabsContent value="payment-methods" className="space-y-6">
      {/* Métodos de Pagamento */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Métodos de Pagamento</h3>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {paymentMethods.length} método(s) cadastrado(s)
            </div>
          </div>
          
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Nenhum método de pagamento cadastrado</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                Adicione um cartão ou chave Pix para facilitar seus pagamentos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method: any) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {method.type === 'credit_card' ? 'Cartão de Crédito' : 'Pix'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {method.type === 'credit_card' 
                          ? `**** ${method.card_last_four} (${method.card_brand})`
                          : method.pix_key
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.is_default && (
                      <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                        Padrão
                      </div>
                    )}
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {new Date(method.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
    </div>
  );
}
