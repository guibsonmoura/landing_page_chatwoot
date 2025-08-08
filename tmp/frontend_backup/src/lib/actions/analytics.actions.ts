'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import logger from '@/lib/logger';
import { AnalyticsDataPoint, DateRange, PeriodFilter, getDateRange } from '@/lib/utils/analytics';

// Interfaces para os totalizadores
export interface TotalizadorData {
  total: number;
  error?: string;
}

// Interface para dados do heatmap
export interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD
  count: number;
  level: number; // 0-4 (intensidade)
}

export interface HeatmapData {
  data: HeatmapDataPoint[];
  maxCount: number;
  totalDays: number;
  error?: string;
}

// Buscar dados de clientes cadastrados por período
export async function getCustomersAnalytics(
  period: PeriodFilter = '7d',
  customStart?: Date,
  customEnd?: Date
) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  try {
    // Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Buscar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Calcular range de datas
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);
    
    logger.debug('Fetching customers analytics', {
      period,
      hasTenant: !!tenant.id,
      hasCustomDates: !!(customStart && customEnd)
    });

    // Query otimizada para buscar clientes por dia
    logger.debug('Executing customers analytics query', {
      table: 'customers',
      dateRange: { start: startDate.toISOString(), end: endDate.toISOString() }
    });
    
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('created_at')
      .eq('tenant_id', tenant.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });
    
    if (customersError) {
      logger.error('Customers query failed - RLS policy issue detected', customersError);
      logger.warn('RLS policy needs update for customers table');
    } else {
      logger.debug('Customers query completed', { recordCount: customersData?.length || 0 });
    }
    
    // Since RLS is blocking, return empty data with clear message
    if (customersError) {
      logger.warn('Returning empty results due to RLS policy blocking data access');
    }

    if (customersError) {
      logger.error('Failed to fetch customers data', customersError);
      return {
        data: [],
        error: `Erro ao buscar dados de clientes: ${customersError.message}`
      };
    }

    // Agrupar por dia
    const dataMap = new Map<string, number>();
    
    // Inicializar todos os dias do período com 0
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dataMap.set(dateKey, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Contar clientes por dia
    customersData?.forEach(customer => {
      const dateKey = customer.created_at.split('T')[0];
      const currentCount = dataMap.get(dateKey) || 0;
      dataMap.set(dateKey, currentCount + 1);
    });

    // Converter para array ordenado
    const analyticsData: AnalyticsDataPoint[] = Array.from(dataMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calcular total e comparação com período anterior
    const totalCustomers = customersData?.length || 0;
    
    logger.debug('Processing customers analytics data', {
      totalCustomers,
      dataPoints: analyticsData.length
    });
    
    // Buscar dados do período anterior para comparação
    const previousStartDate = new Date(startDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    previousStartDate.setDate(startDate.getDate() - daysDiff);
    
    const { data: previousData } = await supabase
      .from('customers')
      .select('id')
      .eq('tenant_id', tenant.id)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    const previousTotal = previousData?.length || 0;
    const percentageChange = previousTotal > 0 
      ? Math.round(((totalCustomers - previousTotal) / previousTotal) * 100)
      : totalCustomers > 0 ? 100 : 0;

    const result = {
      data: analyticsData,
      total: totalCustomers,
      percentageChange,
      period: { startDate, endDate }
    };
    
    logger.debug('Customers analytics completed', {
      total: result.total,
      percentageChange: result.percentageChange,
      dataPoints: result.data.length
    });
    
    return result;

  } catch (error: any) {
    logger.error('Failed to fetch customers analytics', error);
    return {
      error: error.message,
      data: [],
      total: 0,
      percentageChange: 0
    };
  }
}

// Buscar dados de atendimentos (sessões únicas) por período
export async function getChatAnalytics(
  period: PeriodFilter = '7d',
  customStart?: Date,
  customEnd?: Date
) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  try {
    // Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Buscar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Calcular range de datas
    const { startDate, endDate } = getDateRange(period, customStart, customEnd);
    
    logger.debug('Fetching chat analytics', {
      period,
      hasTenant: !!tenant.id,
      hasCustomDates: !!(customStart && customEnd)
    });

    // Query para buscar sessões únicas por dia
    const { data: chatData, error: chatError } = await supabase
      .from('chat_histories')
      .select('session_id, created_at')
      .eq('tenant_id', tenant.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });
    
    logger.debug('Chat analytics query completed', {
      hasError: !!chatError,
      recordsFound: chatData?.length || 0
    });

    if (chatError) throw new Error(`Erro ao buscar histórico de chat: ${chatError.message}`);

    // Agrupar sessões únicas por dia
    const sessionsByDay = new Map<string, Set<string>>();
    
    // Inicializar todos os dias do período
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      sessionsByDay.set(dateKey, new Set());
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Contar sessões únicas por dia
    chatData?.forEach(chat => {
      const dateKey = chat.created_at.split('T')[0];
      const sessionsSet = sessionsByDay.get(dateKey) || new Set();
      sessionsSet.add(chat.session_id);
      sessionsByDay.set(dateKey, sessionsSet);
    });

    // Converter para array de analytics
    const analyticsData: AnalyticsDataPoint[] = Array.from(sessionsByDay.entries())
      .map(([date, sessions]) => ({ date, count: sessions.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calcular total de atendimentos únicos
    const uniqueSessions = new Set(chatData?.map(chat => chat.session_id) || []);
    const totalSessions = uniqueSessions.size;
    
    logger.debug('Processing chat analytics data', {
      totalSessions,
      uniqueSessions: uniqueSessions.size,
      dataPoints: analyticsData.length
    });

    // Buscar dados do período anterior para comparação
    const previousStartDate = new Date(startDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    previousStartDate.setDate(startDate.getDate() - daysDiff);
    
    const { data: previousData } = await supabase
      .from('chat_histories')
      .select('session_id')
      .eq('tenant_id', tenant.id)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    const previousUniqueSessions = new Set(previousData?.map(chat => chat.session_id) || []);
    const previousTotal = previousUniqueSessions.size;
    const percentageChange = previousTotal > 0 
      ? Math.round(((totalSessions - previousTotal) / previousTotal) * 100)
      : totalSessions > 0 ? 100 : 0;

    const result = {
      data: analyticsData,
      total: totalSessions,
      percentageChange,
      period: { startDate, endDate }
    };
    
    logger.debug('Chat analytics completed', {
      total: result.total,
      percentageChange: result.percentageChange,
      dataPoints: result.data.length
    });
    
    return result;

  } catch (error: any) {
    logger.error('Failed to fetch chat analytics', error);
    return {
      error: error.message,
      data: [],
      total: 0,
      percentageChange: 0
    };
  }
}

// ===== TOTALIZADORES =====

// 1. Total de Clientes
export async function getTotalCustomers(): Promise<TotalizadorData> {
  try {
    const supabase = await createClient();
    
    // Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Buscar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Contar total de clientes
    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id);

    if (error) throw new Error(`Erro ao buscar clientes: ${error.message}`);

    logger.debug('Total customers calculated', { count: count || 0 });
    return { total: count || 0 };

  } catch (error: any) {
    logger.error('Failed to fetch total customers', error);
    return { total: 0, error: error.message };
  }
}

// 2. Total de Atendimentos (sessões únicas)
export async function getTotalAtendimentos(): Promise<TotalizadorData> {
  try {
    const supabase = await createClient();
    
    // Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Buscar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Buscar todas as sessões únicas
    const { data: sessions, error } = await supabase
      .from('chat_histories')
      .select('session_id')
      .eq('tenant_id', tenant.id);

    if (error) throw new Error(`Erro ao buscar atendimentos: ${error.message}`);

    // Contar sessões únicas
    const uniqueSessions = new Set(sessions?.map(s => s.session_id) || []);
    const total = uniqueSessions.size;

    logger.debug('Total conversations calculated', { total });
    return { total };

  } catch (error: any) {
    logger.error('Failed to fetch total conversations', error);
    return { total: 0, error: error.message };
  }
}

// 3. Total de Mensagens Enviadas (AI)
export async function getTotalMensagensEnviadas(): Promise<TotalizadorData> {
  try {
    const supabase = await createClient();
    
    // Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Buscar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Contar mensagens da IA (type = 'ai')
    const { count, error } = await supabase
      .from('chat_histories')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .contains('message', { type: 'ai' });

    if (error) throw new Error(`Erro ao buscar mensagens enviadas: ${error.message}`);

    logger.debug('Total AI messages calculated', { count: count || 0 });
    return { total: count || 0 };

  } catch (error: any) {
    logger.error('Failed to fetch total AI messages', error);
    return { total: 0, error: error.message };
  }
}

// 4. Total de Mensagens Recebidas (Human)
export async function getTotalMensagensRecebidas(): Promise<TotalizadorData> {
  try {
    const supabase = await createClient();
    
    // Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Buscar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Contar mensagens do usuário (type = 'human')
    const { count, error } = await supabase
      .from('chat_histories')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .contains('message', { type: 'human' });

    if (error) throw new Error(`Erro ao buscar mensagens recebidas: ${error.message}`);

    logger.debug('Total human messages calculated', { count: count || 0 });
    return { total: count || 0 };

  } catch (error: any) {
    logger.error('Failed to fetch total human messages', error);
    return { total: 0, error: error.message };
  }
}

// ===== HEATMAP =====

// Buscar dados para heatmap de conversas
export async function getConversationHeatmap(days: number = 30): Promise<HeatmapData> {
  try {
    const supabase = await createClient();
    
    // Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Buscar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    // Calcular data de início (X dias atrás)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    logger.debug('Fetching heatmap data', {
      days,
      hasTenant: !!tenant.id
    });

    // Buscar todas as conversas no período
    const { data: conversations, error } = await supabase
      .from('chat_histories')
      .select('created_at, session_id')
      .eq('tenant_id', tenant.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Erro ao buscar conversas: ${error.message}`);

    logger.debug('Heatmap conversations found', { count: conversations?.length || 0 });

    // Agrupar conversas por data e contar sessões únicas
    const conversationsByDate = new Map<string, Set<string>>();
    
    // Inicializar todos os dias do período com 0
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      conversationsByDate.set(dateKey, new Set());
    }

    // Processar conversas
    conversations?.forEach(conv => {
      const date = new Date(conv.created_at);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!conversationsByDate.has(dateKey)) {
        conversationsByDate.set(dateKey, new Set());
      }
      
      // Adicionar session_id ao set (para contar sessões únicas por dia)
      conversationsByDate.get(dateKey)!.add(conv.session_id);
    });

    // Converter para array e calcular níveis de intensidade
    const dataPoints: HeatmapDataPoint[] = [];
    let maxCount = 0;

    conversationsByDate.forEach((sessions, date) => {
      const count = sessions.size;
      if (count > maxCount) maxCount = count;
      
      dataPoints.push({
        date,
        count,
        level: 0 // Será calculado depois
      });
    });

    // Calcular níveis de intensidade (0-4)
    const processedData = dataPoints.map(point => ({
      ...point,
      level: maxCount === 0 ? 0 : Math.min(4, Math.floor((point.count / maxCount) * 4))
    }));

    logger.debug('Heatmap data processed', {
      totalDays: processedData.length,
      maxCount
    });

    return {
      data: processedData,
      maxCount,
      totalDays: processedData.length,
    };

  } catch (error: any) {
    logger.error('Failed to fetch heatmap data', error);
    return {
      data: [],
      maxCount: 0,
      totalDays: 0,
      error: error.message
    };
  }
}

// Interface para parâmetros do sistema
export interface SystemParams {
  hourlyRateAttendant: number;
  hourlyRateOvertime: number;
  hourlyRateWeekend: number;
  hourlyRateNight: number;
  businessHoursStart: string;
  businessHoursEnd: string;
  nightHoursStart: string;
  nightHoursEnd: string;
  avgConversationDuration: number;
  aiResponseTime: number;
  humanResponseTime: number;
}

// Buscar parâmetros de métricas de valor da nova tabela dedicada
export async function getValueMetricsParams(): Promise<SystemParams> {
  try {
    const supabase = await createClient();
    
    // Buscar parâmetros da tabela value_metrics_config
    const { data: params, error } = await supabase
      .from('value_metrics_config')
      .select('key, value')
      .eq('is_active', true)
      .in('key', [
        'hourly_rate_attendant',
        'hourly_rate_overtime', 
        'hourly_rate_weekend',
        'hourly_rate_night',
        'business_hours_start',
        'business_hours_end',
        'night_hours_start',
        'night_hours_end',
        'avg_conversation_duration',
        'ai_response_time',
        'human_response_time'
      ]);

    if (error) {
      logger.warn('Failed to fetch value metrics parameters, using defaults', error);
    }

    // Converter array para objeto com valores padrão
    const paramMap = new Map(params?.map(p => [p.key, p.value.toString()]) || []);
    
    // Função helper para converter horas decimais para formato HH:MM
    const formatHour = (decimalHour: string, defaultValue: string) => {
      const hour = parseFloat(decimalHour);
      if (isNaN(hour)) return defaultValue;
      const hours = Math.floor(hour);
      const minutes = Math.round((hour - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    return {
      hourlyRateAttendant: parseFloat(paramMap.get('hourly_rate_attendant') || '25.00'),
      hourlyRateOvertime: parseFloat(paramMap.get('hourly_rate_overtime') || '37.50'),
      hourlyRateWeekend: parseFloat(paramMap.get('hourly_rate_weekend') || '50.00'),
      hourlyRateNight: parseFloat(paramMap.get('hourly_rate_night') || '62.50'),
      businessHoursStart: formatHour(paramMap.get('business_hours_start') || '8.00', '08:00'),
      businessHoursEnd: formatHour(paramMap.get('business_hours_end') || '18.00', '18:00'),
      nightHoursStart: formatHour(paramMap.get('night_hours_start') || '22.00', '22:00'),
      nightHoursEnd: formatHour(paramMap.get('night_hours_end') || '6.00', '06:00'),
      avgConversationDuration: parseInt(paramMap.get('avg_conversation_duration') || '15'),
      aiResponseTime: parseInt(paramMap.get('ai_response_time') || '2'),
      humanResponseTime: parseInt(paramMap.get('human_response_time') || '300')
    };

  } catch (error: any) {
    logger.error('Failed to fetch value metrics parameters', error);
    
    // Retornar valores padrão em caso de erro
    return {
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
    };
  }
}

// Manter função antiga para compatibilidade (deprecated)
export const getSystemParams = getValueMetricsParams;

// Buscar dados históricos totais para heatmap (desde o início)
export async function getConversationHeatmapTotal(): Promise<HeatmapData> {
  try {
    const supabase = await createClient();
    
    // Obter usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado.');

    // Buscar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (tenantError || !tenant) throw new Error('Tenant não encontrado.');

    logger.debug('Fetching complete historical heatmap data', {
      hasTenant: !!tenant.id
    });

    // Buscar TODAS as conversas históricas (sem limite de data)
    const { data: conversations, error } = await supabase
      .from('chat_histories')
      .select('created_at, session_id')

    if (!conversations || conversations.length === 0) {
      return {
        data: [],
        maxCount: 0,
        totalDays: 0,
      };
    }

    // Encontrar primeira e última data
    const firstDate = new Date(conversations[0].created_at);
    const lastDate = new Date(conversations[conversations.length - 1].created_at);
    
    logger.debug('Historical heatmap period:');
    logger.debug('  - First conversation:', firstDate.toISOString());
    logger.debug('  - Last conversation:', lastDate.toISOString());
    logger.debug('  - Total days:', Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Agrupar conversas por data e contar sessões únicas
    const conversationsByDate = new Map<string, Set<string>>();
    
    // Processar conversas
    conversations.forEach(conv => {
      const date = new Date(conv.created_at);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!conversationsByDate.has(dateKey)) {
        conversationsByDate.set(dateKey, new Set());
      }
      
      // Adicionar session_id ao set (para contar sessões únicas por dia)
      conversationsByDate.get(dateKey)!.add(conv.session_id);
    });

    // Converter para array e calcular níveis de intensidade
    const dataPoints: HeatmapDataPoint[] = [];
    let maxCount = 0;

    conversationsByDate.forEach((sessions, date) => {
      const count = sessions.size;
      if (count > maxCount) maxCount = count;
      
      dataPoints.push({
        date,
        count,
        level: 0 // Será calculado depois
      });
    });

    // Calcular níveis de intensidade (0-4)
    const processedData = dataPoints.map(point => ({
      ...point,
      level: maxCount === 0 ? 0 : Math.min(4, Math.floor((point.count / maxCount) * 4))
    }));

    logger.debug('Historical heatmap data processed', {
      totalDays: processedData.length,
      maxCount,
      hasData: processedData.length > 0
    });

    return {
      data: processedData,
      maxCount,
      totalDays: processedData.length,
    };

  } catch (error: any) {
    logger.error('Failed to fetch historical heatmap data', error);
    return {
      data: [],
      maxCount: 0,
      totalDays: 0,
      error: error.message
    };
  }
}
