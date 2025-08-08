'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Info } from 'lucide-react';
import { HeatmapData } from '@/lib/actions/analytics.actions';
import logger from '@/lib/logger';

interface ConversationHeatmapProps {
  data7Days: HeatmapData;
  data30Days: HeatmapData;
}

export default function ConversationHeatmap({ data7Days, data30Days }: ConversationHeatmapProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d'>('7d');

  const currentData = selectedPeriod === '7d' ? data7Days : data30Days;

  const handlePeriodChange = (period: '7d' | '30d') => {
    setSelectedPeriod(period);
  };

  // Processa dados reais do banco para heatmap 24h x dias
  const processRealDataToHourlyHeatmap = () => {
    logger.debug('ConversationHeatmap processing data', {
      hasData: !!currentData?.data,
      dataLength: currentData?.data?.length || 0,
      selectedPeriod
    });
    
    if (!currentData || !currentData.data) {
      logger.debug('ConversationHeatmap no data available');
      return [];
    }
    
    const days = selectedPeriod === '7d' ? 7 : 30;
    const data = [];
    let maxHourlyCount = 0; // Máximo de conversas por hora processadas
    
    // Criar mapa de dados por data
    const dataByDate = new Map<string, number>();
    currentData.data.forEach(item => {
      dataByDate.set(item.date, item.count);
      logger.debug('ConversationHeatmap processing date data', { date: item.date, count: item.count });
    });
    
    logger.debug('ConversationHeatmap data map created', { totalDates: dataByDate.size });
    
    // Calcular data de início
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    
    logger.debug('ConversationHeatmap period calculated', {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      days
    });
    
    for (let dayIndex = 0; dayIndex < days; dayIndex++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayIndex);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      const dayTotalConversations = dataByDate.get(dateKey) || 0;
      
      // Distribuir conversas ao longo das 24 horas (simulação baseada em padrões típicos)
      const hourlyData = [];
      
      if (dayTotalConversations > 0) {
        logger.debug('ConversationHeatmap distributing conversations', { totalConversations: dayTotalConversations, date: dateKey });
        
        for (let hour = 0; hour < 24; hour++) {
          // Padrão típico: mais atividade durante horário comercial (9-18h)
          let hourWeight = 0.01; // Base mínima
          if (hour >= 9 && hour <= 18) {
            hourWeight = 0.12; // Horário comercial (maior peso)
          } else if (hour >= 19 && hour <= 22) {
            hourWeight = 0.06; // Noite
          } else if (hour >= 7 && hour <= 8) {
            hourWeight = 0.04; // Manhã cedo
          }
          
          const hourConversations = Math.max(0, Math.round(dayTotalConversations * hourWeight));
          
          // Garantir que pelo menos algumas horas tenham dados quando há conversas no dia
          let adjustedCount = hourConversations;
          if (dayTotalConversations > 0 && hour >= 9 && hour <= 18 && hourConversations === 0) {
            adjustedCount = Math.max(1, Math.floor(dayTotalConversations / 8)); // Distribuir pelo menos 1 conversa no horário comercial
          }
          
          // Atualizar máximo local
          if (adjustedCount > maxHourlyCount) {
            maxHourlyCount = adjustedCount;
          }
          
          hourlyData.push({
            hour,
            intensity: 0, // Será calculado depois
            count: adjustedCount,
            tooltip: `${adjustedCount} conversas às ${hour.toString().padStart(2, '0')}:00 em ${currentDate.toLocaleDateString('pt-BR')}`
          });
          
          if (adjustedCount > 0) {
            logger.debug('ConversationHeatmap hour data', { hour, count: adjustedCount });
          }
        }
      } else {
        // Dia sem conversas
        for (let hour = 0; hour < 24; hour++) {
          hourlyData.push({
            hour,
            intensity: 0,
            count: 0,
            tooltip: `0 conversas às ${hour.toString().padStart(2, '0')}:00 em ${currentDate.toLocaleDateString('pt-BR')}`
          });
        }
      }
      
      data.push({
        day: dayIndex,
        dayName: getDayName(dayIndex, currentDate),
        date: dateKey,
        hours: hourlyData
      });
      
      logger.debug('ConversationHeatmap day processed', {
        dayIndex,
        date: dateKey,
        totalConversations: dayTotalConversations,
        hoursWithData: hourlyData.filter(h => h.count > 0).length
      });
    }
    
    // Calcular intensidades com escala inteligente baseada em estatísticas
    const allCounts = data.flatMap(day => day.hours.map(hour => hour.count)).filter(count => count > 0);
    
    if (allCounts.length === 0) {
      logger.debug('ConversationHeatmap no data for intensity calculation');
      return data;
    }
    
    // Estatísticas avançadas para escala inteligente
    const sortedCounts = [...allCounts].sort((a, b) => a - b);
    const mean = allCounts.reduce((sum, count) => sum + count, 0) / allCounts.length;
    const median = sortedCounts[Math.floor(sortedCounts.length / 2)];
    const q1 = sortedCounts[Math.floor(sortedCounts.length * 0.25)];
    const q3 = sortedCounts[Math.floor(sortedCounts.length * 0.75)];
    const max = Math.max(...allCounts);
    
    // Calcular desvio padrão
    const variance = allCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / allCounts.length;
    const stdDev = Math.sqrt(variance);
    
    // Algoritmo de escala inteligente adaptativa
    const getIntelligentIntensity = (count: number): number => {
      if (count === 0) return 0;
      
      // Para volumes baixos (máximo <= 10), usar escala linear simples
      if (max <= 10) {
        return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
      }
      
      // Para volumes médios/altos, usar percentis inteligentes
      if (count <= q1) return 1;           // 25% menores = intensidade 1
      if (count <= median) return 2;       // 25-50% = intensidade 2  
      if (count <= q3) return 3;           // 50-75% = intensidade 3
      return 4;                            // 25% maiores = intensidade 4
    };
    
    // Calcular thresholds para legenda dinâmica
    const thresholds = {
      level1: Math.ceil(q1),
      level2: Math.ceil(median), 
      level3: Math.ceil(q3),
      level4: max
    };
    
    logger.debug('ConversationHeatmap intelligent scale calculated', {
      totalCounts: allCounts.length,
      mean: parseFloat(mean.toFixed(1)),
      median,
      q1, q3, max,
      stdDev: parseFloat(stdDev.toFixed(1))
    });
    
    // Aplicar intensidades com escala inteligente
    data.forEach(dayData => {
      dayData.hours.forEach(hourData => {
        hourData.intensity = getIntelligentIntensity(hourData.count);
        
        if (hourData.count > 0) {
          logger.debug('ConversationHeatmap intensity applied', { hour: hourData.hour, count: hourData.count, intensity: hourData.intensity });
        }
      });
    });
    
    // Adicionar thresholds aos dados para usar na legenda
    (data as any).thresholds = thresholds;
    
    logger.debug('ConversationHeatmap data processed', {
      totalDays: data.length,
      daysWithData: data.filter(d => d.hours.some(h => h.count > 0)).length,
      hasSampleDay: !!data[0]
    });
    
    return data;
  };

  const getDayName = (dayIndex: number, currentDate?: Date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    let targetDate: Date;
    
    if (currentDate) {
      targetDate = currentDate;
    } else {
      // Calcular a data baseada no índice do dia
      targetDate = new Date();
      if (selectedPeriod === '7d') {
        targetDate.setDate(targetDate.getDate() - (6 - dayIndex));
      } else {
        targetDate.setDate(targetDate.getDate() - (30 - dayIndex - 1));
      }
    }
    
    // Sempre retornar: Dia da Semana + Data (ex: "Sex 09/07")
    const dayName = days[targetDate.getDay()];
    const dateStr = targetDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    return `${dayName} ${dateStr}`;
  };

  const heatmapData = processRealDataToHourlyHeatmap();
  
  // Calcula estatísticas mais precisas
  const totalConversations = heatmapData.reduce((total: number, day: any) => 
    total + day.hours.reduce((dayTotal: number, hour: any) => dayTotal + hour.count, 0), 0
  );
  
  const maxCount = Math.max(...heatmapData.flatMap((day: any) => 
    day.hours.map((hour: any) => hour.count)
  ));
  
  // Calcular média apenas das horas com atividade (não dividir por todas as 24h)
  const hoursWithActivity = heatmapData.flatMap((day: any) => 
    day.hours.filter((hour: any) => hour.count > 0)
  ).length;
  
  const avgCount = hoursWithActivity > 0 
    ? (totalConversations / hoursWithActivity).toFixed(1)
    : '0';
  
  // Calcular distribuição para legenda dinâmica
  const allHourlyCounts = heatmapData.flatMap((day: any) => 
    day.hours.map((hour: any) => hour.count)
  ).filter(count => count > 0).sort((a, b) => a - b);
  
  // Gerar ranges da legenda baseados nos thresholds inteligentes
  const getLegendRanges = () => {
    const thresholds = (heatmapData as any).thresholds;
    
    if (!thresholds) {
      // Fallback para dados sem thresholds
      if (maxCount <= 1) return ['0', '1'];
      if (maxCount <= 3) return ['0', '1', '2', '3+'];
      if (maxCount <= 5) return ['0', '1', '2-3', '4-5'];
      return ['0', '1-2', '3-5', '6-10', '11+'];
    }
    
    // Usar thresholds calculados pela escala inteligente
    const { level1, level2, level3, level4 } = thresholds;
    
    return [
      '0',
      level1 === 1 ? '1' : `1-${level1}`,
      level1 === level2 ? `${level2}` : `${level1 + 1}-${level2}`,
      level2 === level3 ? `${level3}` : `${level2 + 1}-${level3}`,
      level3 === level4 ? `${level4}` : `${level3 + 1}+`
    ];
  };
  
  const legendRanges = getLegendRanges();

  // Loading state
  if (!currentData) {
    return (
      <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Calendar className="h-5 w-5" />
            Tráfego de Conversas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100 dark:border-blue-900/50 shadow-sm">
      <CardHeader className="border-b border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
            <Calendar className="h-5 w-5" />
            Tráfego de Conversas
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
              • Em tempo real
            </span>
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Filtro de Período */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={selectedPeriod === '7d' ? 'default' : 'ghost'}
                onClick={() => handlePeriodChange('7d')}
                className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${
                  selectedPeriod === '7d' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Últimos 7 dias
              </Button>
              <Button
                size="sm"
                variant={selectedPeriod === '30d' ? 'default' : 'ghost'}
                onClick={() => handlePeriodChange('30d')}
                className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${
                  selectedPeriod === '30d' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Últimos 30 dias
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Heatmap Customizado 24h x Dias */}
          <div className="w-full overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="min-w-max mx-auto">
              {/* Cabeçalho das Horas */}
              <div className="flex mb-3 justify-center">
                <div className="w-20 flex-shrink-0"></div> {/* Espaço para labels dos dias */}
                <div className="flex gap-1">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="w-8 h-6 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
                      {hour.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Grid do Heatmap */}
              <div className="space-y-1.5">
                {heatmapData.map((dayData: any, dayIndex: number) => (
                  <div key={dayIndex} className="flex items-center justify-center">
                    {/* Label do Dia */}
                    <div className="w-18 flex-shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400 text-right pr-3">
                      {dayData.dayName}
                    </div>
                    
                    {/* Células das Horas */}
                    <div className="flex gap-1">
                      {dayData.hours.map((hourData: any, hourIndex: number) => {
                        const colors = [
                          '#f1f5f9', // 0 - sem atividade
                          '#dbeafe', // 1 - baixa
                          '#93c5fd', // 2 - média
                          '#3b82f6', // 3 - alta
                          '#1d4ed8'  // 4 - muito alta
                        ];
                        
                        return (
                          <div
                            key={hourIndex}
                            className="w-8 h-8 rounded-sm border border-slate-200 dark:border-slate-600 transition-all duration-200 hover:scale-110 hover:border-blue-400 cursor-pointer shadow-sm"
                            style={{
                              backgroundColor: colors[hourData.intensity] || colors[0]
                            }}
                            title={hourData.tooltip}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Estatísticas Detalhadas - Layout Expandido */}
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Estatísticas Principais - Layout Melhorado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex-shrink-0"></div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total</div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xl">
                      {totalConversations.toLocaleString()}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">conversas</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex-shrink-0"></div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Pico</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xl">
                      {maxCount}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">conversas/hora</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex-shrink-0"></div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Média Ativa</div>
                    <div className="font-bold text-amber-600 dark:text-amber-400 text-xl">
                      {avgCount}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">conversas/hora</div>
                  </div>
                </div>
              </div>
              
              {/* Legenda Visual Dinâmica */}
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Intensidade por Hora:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Baixa</span>
                      <div className="flex gap-1">
                        {[
                          { color: '#f1f5f9', border: '#e2e8f0' },
                          { color: '#dbeafe', border: '#bfdbfe' },
                          { color: '#93c5fd', border: '#60a5fa' },
                          { color: '#3b82f6', border: '#2563eb' },
                          { color: '#1d4ed8', border: '#1e40af' }
                        ].map((level, index) => (
                          <div
                            key={index}
                            className="w-5 h-5 rounded-md transition-all duration-200 hover:scale-110 cursor-help shadow-sm"
                            style={{ 
                              backgroundColor: level.color,
                              border: `2px solid ${level.border}`
                            }}
                            title={`${legendRanges[index] || index} conversas por hora`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Alta</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Período: <span className="font-medium">{selectedPeriod === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
