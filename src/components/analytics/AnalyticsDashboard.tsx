'use client';

import { AnalyticsCard } from './AnalyticsCard';
import { PeriodFilter, AnalyticsDataPoint } from '@/lib/utils/analytics';

interface AnalyticsDashboardProps {
  customersData: {
    data: AnalyticsDataPoint[];
    total: number;
    percentageChange: number;
    error?: string;
  };
  chatData: {
    data: AnalyticsDataPoint[];
    total: number;
    percentageChange: number;
    error?: string;
  };
  initialPeriod: PeriodFilter;
  customStart?: Date;
  customEnd?: Date;
}

export function AnalyticsDashboard({
  customersData,
  chatData,
  initialPeriod,
  customStart,
  customEnd
}: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Cards de Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard
          title="Novos Clientes"
          description="Clientes cadastrados no período"
          icon="users"
          data={customersData.data}
          total={customersData.total}
          percentageChange={customersData.percentageChange}
          isLoading={false}
          error={customersData.error}
          period={initialPeriod}
        />
        
        <AnalyticsCard
          title="Atendimentos"
          description="Sessões de atendimento realizadas"
          icon="messages"
          data={chatData.data}
          total={chatData.total}
          percentageChange={chatData.percentageChange}
          isLoading={false}
          error={chatData.error}
          period={initialPeriod}
        />
      </div>
    </div>
  );
}
