'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsCard } from './AnalyticsCard';
import { PeriodFilter as PeriodFilterComponent } from './PeriodFilter';
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>(initialPeriod);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(customStart);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(customEnd);

  const handlePeriodChange = (
    period: PeriodFilter,
    customStart?: Date,
    customEnd?: Date
  ) => {
    setSelectedPeriod(period);
    setCustomStartDate(customStart);
    setCustomEndDate(customEnd);

    startTransition(() => {
      const params = new URLSearchParams();
      params.set('period', period);
      
      if (period === 'custom' && customStart && customEnd) {
        params.set('start', customStart.toISOString().split('T')[0]);
        params.set('end', customEnd.toISOString().split('T')[0]);
      }

      router.push(`/dashboard?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Acompanhe o desempenho dos seus agentes e atendimentos
          </p>
        </div>
        
        <PeriodFilterComponent
          selectedPeriod={selectedPeriod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* Cards de Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCard
          title="Novos Clientes"
          description="Clientes cadastrados no período"
          icon="users"
          data={customersData.data}
          total={customersData.total}
          percentageChange={customersData.percentageChange}
          isLoading={isPending}
          error={customersData.error}
          period={selectedPeriod}
        />
        
        <AnalyticsCard
          title="Atendimentos"
          description="Sessões de atendimento realizadas"
          icon="messages"
          data={chatData.data}
          total={chatData.total}
          percentageChange={chatData.percentageChange}
          isLoading={isPending}
          error={chatData.error}
          period={selectedPeriod}
        />
      </div>
    </div>
  );
}
