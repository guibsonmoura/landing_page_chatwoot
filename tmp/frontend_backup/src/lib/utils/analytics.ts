export interface AnalyticsDataPoint {
  date: string;
  count: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type PeriodFilter = '7d' | '30d' | '180d' | 'custom';

// Função para calcular o range de datas baseado no filtro
export function getDateRange(period: PeriodFilter, customStart?: Date, customEnd?: Date): DateRange {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  let startDate: Date;
  
  switch (period) {
    case '7d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      break;
    case '180d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 180);
      break;
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom period requires start and end dates');
      }
      startDate = new Date(customStart);
      endDate.setTime(customEnd.getTime());
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
  }
  
  // Garantir que startDate seja início do dia
  startDate.setHours(0, 0, 0, 0);
  
  return { startDate, endDate };
}
