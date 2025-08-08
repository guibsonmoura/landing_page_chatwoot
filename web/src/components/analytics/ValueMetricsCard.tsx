'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Zap, 
  Moon, 
  Calendar,
  Users,
  Target,
  Award,
  Sparkles
} from 'lucide-react';
import { HeatmapData, getValueMetricsParams, SystemParams } from '@/lib/actions/analytics.actions';
import logger from '@/lib/logger';

interface ValueMetricsProps {
  data7Days: HeatmapData;
  data30Days: HeatmapData;
  dataTotal?: HeatmapData;
}

interface ValueMetrics {
  totalHours: number;
  totalSavings: number;
  overtimeHours: number;
  overtimeSavings: number;
  weekendHours: number;
  weekendSavings: number;
  nightHours: number;
  nightSavings: number;
  totalConversations: number;
  avgResponseTime: number;
  efficiency: number;
  roi: number;
}

// Interface movida para analytics.actions.ts

export default function ValueMetricsCard({ data7Days, data30Days, dataTotal }: ValueMetricsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'total'>('7d');
  const [metrics, setMetrics] = useState<ValueMetrics | null>(null);
  const [params, setParams] = useState<SystemParams | null>(null);
  const [loading, setLoading] = useState(true);

  const currentData = selectedPeriod === '7d' ? data7Days : 
                      selectedPeriod === '30d' ? data30Days : 
                      dataTotal || data30Days;

  const calculateValueMetrics = (data: HeatmapData, params: SystemParams): ValueMetrics => {
    if (!data || !data.data || data.data.length === 0) {
      return {
        totalHours: 0,
        totalSavings: 0,
        overtimeHours: 0,
        overtimeSavings: 0,
        weekendHours: 0,
        weekendSavings: 0,
        nightHours: 0,
        nightSavings: 0,
        totalConversations: 0,
        avgResponseTime: params.aiResponseTime,
        efficiency: 0,
        roi: 0
      };
    }

    let totalConversations = 0;
    let totalHours = 0;
    let overtimeHours = 0;
    let weekendHours = 0;
    let nightHours = 0;

    // Processar cada dia dos dados
    data.data.forEach(dayData => {
      const date = new Date(dayData.date);
      const dayOfWeek = date.getDay(); // 0 = domingo, 6 = sábado
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      totalConversations += dayData.count;
      
      // Calcular horas baseado na duração média das conversas
      const dayHours = (dayData.count * params.avgConversationDuration) / 60;
      totalHours += dayHours;

      // Classificar por tipo de horário
      if (isWeekend) {
        weekendHours += dayHours;
      } else {
        // Simular distribuição por horários (seria mais preciso com dados reais por hora)
        const businessHours = dayHours * 0.7; // 70% no horário comercial
        const afterHours = dayHours * 0.25;   // 25% após expediente
        const nightHoursDay = dayHours * 0.05; // 5% madrugada
        
        overtimeHours += afterHours;
        nightHours += nightHoursDay;
      }
    });

    // Calcular economias
    const regularHours = totalHours - overtimeHours - weekendHours - nightHours;
    const totalSavings = 
      (regularHours * params.hourlyRateAttendant) +
      (overtimeHours * params.hourlyRateOvertime) +
      (weekendHours * params.hourlyRateWeekend) +
      (nightHours * params.hourlyRateNight);

    const overtimeSavings = overtimeHours * params.hourlyRateOvertime;
    const weekendSavings = weekendHours * params.hourlyRateWeekend;
    const nightSavings = nightHours * params.hourlyRateNight;

    // Calcular eficiência (IA vs Humano)
    const efficiency = ((params.humanResponseTime - params.aiResponseTime) / params.humanResponseTime) * 100;

    // Calcular ROI (assumindo custo mensal da IA de R$ 500)
    const monthlyCost = 500;
    const monthlyMultiplier = selectedPeriod === '7d' ? 4.3 : 1;
    const roi = ((totalSavings * monthlyMultiplier - monthlyCost) / monthlyCost) * 100;

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalSavings: Math.round(totalSavings * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      overtimeSavings: Math.round(overtimeSavings * 100) / 100,
      weekendHours: Math.round(weekendHours * 10) / 10,
      weekendSavings: Math.round(weekendSavings * 100) / 100,
      nightHours: Math.round(nightHours * 10) / 10,
      nightSavings: Math.round(nightSavings * 100) / 100,
      totalConversations,
      avgResponseTime: params.aiResponseTime,
      efficiency: Math.round(efficiency * 10) / 10,
      roi: Math.round(roi * 10) / 10
    };
  };

  // Carregar parâmetros do banco na inicialização
  useEffect(() => {
    const loadParams = async () => {
      try {
        const loadedParams = await getValueMetricsParams();
        setParams(loadedParams);
        logger.debug('ValueMetricsCard parameters loaded', { hasParams: !!loadedParams });
      } catch (error) {
        logger.error('ValueMetricsCard failed to load parameters', { hasError: !!error });
        // Usar parâmetros padrão em caso de erro
        setParams({
          hourlyRateAttendant: 25.00,
          hourlyRateOvertime: 37.50,
          hourlyRateWeekend: 50.00,
          hourlyRateNight: 62.50,
          businessHoursStart: '08:00',
          businessHoursEnd: '18:00',
          nightHoursStart: '22:00',
          nightHoursEnd: '06:00',
          avgConversationDuration: 15,
          aiResponseTime: 2,
          humanResponseTime: 300
        });
      }
    };
    
    loadParams();
  }, []);

  // Recalcular métricas quando dados ou parâmetros mudarem
  useEffect(() => {
    if (!params) return;
    
    setLoading(true);
    const calculatedMetrics = calculateValueMetrics(currentData, params);
    setMetrics(calculatedMetrics);
    setLoading(false);
    
    logger.debug('ValueMetricsCard metrics calculated', {
      period: selectedPeriod,
      totalSavings: calculatedMetrics.totalSavings,
      totalHours: calculatedMetrics.totalHours,
      roi: calculatedMetrics.roi
    });
  }, [currentData, selectedPeriod, params]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    }
    return `${hours.toFixed(1)}h`;
  };

  if (loading || !metrics) {
    return (
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Sparkles className="h-5 w-5" />
            Valor Gerado pela IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            💰 Valor Gerado pela IA
            <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-bold">
              ECONOMIA
            </span>
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedPeriod === '7d' ? 'default' : 'ghost'}
              onClick={() => setSelectedPeriod('7d')}
              className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${
                selectedPeriod === '7d' 
                  ? 'bg-yellow-500 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400'
              }`}
            >
              Últimos 7 dias
            </Button>
            <Button
              size="sm"
              variant={selectedPeriod === '30d' ? 'default' : 'ghost'}
              onClick={() => setSelectedPeriod('30d')}
              className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${
                selectedPeriod === '30d' 
                  ? 'bg-yellow-500 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400'
              }`}
            >
              Últimos 30 dias
            </Button>
            <Button
              size="sm"
              variant={selectedPeriod === 'total' ? 'default' : 'ghost'}
              onClick={() => setSelectedPeriod('total')}
              className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${
                selectedPeriod === 'total' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              📊 Total
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Economia Total - Destaque Principal */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                    Economia Total Gerada
                  </span>
                </div>
                <div className="text-4xl font-bold text-green-800 dark:text-green-200">
                  {formatCurrency(metrics.totalSavings)}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {formatHours(metrics.totalHours)} de atendimento automatizado
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl">💰</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                  vs Atendente Humano
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Métricas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Atendimento Extra */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Horário Extra
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(metrics.overtimeSavings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {formatHours(metrics.overtimeHours)} após 18h
              </div>
            </div>

            {/* Fim de Semana */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Fins de Semana
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(metrics.weekendSavings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {formatHours(metrics.weekendHours)} sáb/dom
              </div>
            </div>

            {/* Madrugada */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Madrugada
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(metrics.nightSavings)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {formatHours(metrics.nightHours)} 22h-6h
              </div>
            </div>

            {/* ROI */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  ROI
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {metrics.roi > 0 ? '+' : ''}{metrics.roi.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Retorno do investimento
              </div>
            </div>
          </div>

          {/* Métricas de Eficiência */}
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Eficiência Operacional
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics.totalConversations.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Conversas Atendidas
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metrics.avgResponseTime}s
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Tempo de Resposta
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {metrics.efficiency.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Mais Rápido que Humano
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">
                  🚀 Sua IA está gerando valor real!
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedPeriod === 'total' 
                    ? `Economia histórica total acumulada`
                    : `Economia projetada anual: ${formatCurrency(metrics.totalSavings * (365 / (selectedPeriod === '7d' ? 7 : 30)))}`
                  }
                </div>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
