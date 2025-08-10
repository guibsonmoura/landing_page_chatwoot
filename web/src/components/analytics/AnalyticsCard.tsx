'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Users, MessageSquare, BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AnalyticsDataPoint, PeriodFilter } from '@/lib/utils/analytics';

export type ChartType = 'line' | 'bar' | 'area';

interface AnalyticsCardProps {
  title: string;
  description: string;
  icon: 'users' | 'messages';
  data: AnalyticsDataPoint[];
  total: number;
  percentageChange: number;
  isLoading?: boolean;
  error?: string;
  period: PeriodFilter;
  className?: string;
}

const ICON_MAP = {
  users: Users,
  messages: MessageSquare,
};

const COLOR_MAP = {
  users: {
    primary: '#3b82f6', // blue-500
    light: '#dbeafe', // blue-100
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-200 dark:border-blue-900/50',
  },
  messages: {
    primary: '#8b5cf6', // violet-500
    light: '#ede9fe', // violet-100
    gradient: 'from-violet-500 to-violet-600',
    border: 'border-violet-200 dark:border-violet-900/50',
  },
};

const CHART_TYPE_CONFIG = {
  line: {
    icon: LineChartIcon,
    label: 'Linha',
    description: 'Visualizar tendência ao longo do tempo'
  },
  bar: {
    icon: BarChart3,
    label: 'Barras',
    description: 'Comparar valores por período'
  },
  area: {
    icon: AreaChartIcon,
    label: 'Área',
    description: 'Visualizar volume acumulado'
  }
};

export function AnalyticsCard({
  title,
  description,
  icon,
  data,
  total,
  percentageChange,
  isLoading = false,
  error,
  period,
  className
}: AnalyticsCardProps) {
  const [chartType, setChartType] = useState<ChartType>(() => {
    if (icon === 'users') return 'bar';
    if (icon === 'messages') return 'area';
    return 'line';
  });
  const IconComponent = ICON_MAP[icon];
  const colors = COLOR_MAP[icon];
  
  const formatXAxisLabel = (dateString: string) => {
    const date = new Date(dateString);
    
    if (period === '7d') {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else if (period === '30d') {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {formattedDate}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
            {payload[0].value} {icon === 'users' ? 'clientes' : 'atendimentos'}
          </p>
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = () => {
    if (percentageChange > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (percentageChange < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTrendColor = () => {
    if (percentageChange > 0) return 'text-green-600 dark:text-green-400';
    if (percentageChange < 0) return 'text-red-600 dark:text-red-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  if (error) {
    return (
      <Card className={cn("overflow-hidden shadow-sm bg-white dark:bg-slate-950", colors.border, className)}>
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl ${colors.light} dark:bg-slate-800 flex items-center justify-center`}>
                <IconComponent className={`h-6 w-6`} style={{ color: colors.primary }} />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <div className="flex items-center justify-center h-48 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
                <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Erro ao carregar dados
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {error}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden shadow-sm bg-white dark:bg-slate-950", colors.border, className)}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
      
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl ${colors.light} dark:bg-slate-800 flex items-center justify-center`}>
              {isLoading ? (
                <Skeleton className="h-6 w-6 rounded" />
              ) : (
                <IconComponent className={`h-6 w-6`} style={{ color: colors.primary }} />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
            </div>
          </div>
          
          {/* Chart Type Toggle */}
          {!isLoading && !error && (
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-1">
              {(Object.keys(CHART_TYPE_CONFIG) as ChartType[]).map((type) => {
                const config = CHART_TYPE_CONFIG[type];
                const Icon = config.icon;
                const isActive = chartType === type;
                
                return (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    onClick={() => setChartType(type)}
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-200",
                      isActive 
                        ? "bg-white dark:bg-slate-700 shadow-sm" 
                        : "hover:bg-white/50 dark:hover:bg-slate-700/50"
                    )}
                    title={`${config.label} - ${config.description}`}
                  >
                    <Icon 
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive 
                          ? "text-slate-900 dark:text-slate-100" 
                          : "text-slate-500 dark:text-slate-400"
                      )} 
                      style={isActive ? { color: colors.primary } : undefined}
                    />
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            {/* Métricas principais */}
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <p className="text-3xl font-bold" style={{ color: colors.primary }}>
                  {total.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total no período
                </p>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800">
                {getTrendIcon()}
                <span className={cn("text-sm font-medium", getTrendColor())}>
                  {percentageChange > 0 ? '+' : ''}{percentageChange}%
                </span>
              </div>
            </div>

            {/* Gráfico */}
            <div className="h-48">
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {(() => {
                    const commonProps = {
                      data,
                      margin: { top: 5, right: 5, left: 5, bottom: 5 }
                    };
                    
                    const commonAxisProps = {
                      tick: { fontSize: 12, fill: '#64748b' },
                      axisLine: false,
                      tickLine: false
                    };
                    
                    switch (chartType) {
                      case 'line':
                        return (
                          <LineChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="date" tickFormatter={formatXAxisLabel} {...commonAxisProps} />
                            <YAxis {...commonAxisProps} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              stroke={colors.primary}
                              strokeWidth={3}
                              dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2 }}
                            />
                          </LineChart>
                        );
                      
                      case 'bar':
                        return (
                          <BarChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="date" tickFormatter={formatXAxisLabel} {...commonAxisProps} />
                            <YAxis {...commonAxisProps} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="count" 
                              fill={colors.primary}
                              radius={[4, 4, 0, 0]}
                              opacity={0.8}
                            />
                          </BarChart>
                        );
                      
                      case 'area':
                        return (
                          <AreaChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="date" tickFormatter={formatXAxisLabel} {...commonAxisProps} />
                            <YAxis {...commonAxisProps} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="count" 
                              stroke={colors.primary}
                              strokeWidth={2}
                              fill={colors.primary}
                              fillOpacity={0.1}
                              dot={{ fill: colors.primary, strokeWidth: 2, r: 3 }}
                              activeDot={{ r: 5, stroke: colors.primary, strokeWidth: 2 }}
                            />
                          </AreaChart>
                        );
                      
                      default:
                        return (
                          <LineChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="date" tickFormatter={formatXAxisLabel} {...commonAxisProps} />
                            <YAxis {...commonAxisProps} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              stroke={colors.primary}
                              strokeWidth={3}
                              dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2 }}
                            />
                          </LineChart>
                        );
                    }
                  })()
                  }
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                      <IconComponent className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Nenhum dado encontrado
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Dados aparecerão aqui quando houver atividade
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
