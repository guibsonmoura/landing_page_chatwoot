import { Suspense } from 'react';
import { Metadata } from 'next';
import { AnalyticsClientPage } from './client-page';
import { Loading, CardSkeleton } from '@/components/ui/loading';

export const metadata: Metadata = {
  title: 'Analytics | Nexus Agents',
  description: 'Métricas e análises de performance dos seus agentes de IA',
};

// Componente de loading específico para Analytics
function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-96"></div>
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton className="h-80" />
        <CardSkeleton className="h-80" />
      </div>

      {/* Heatmap Skeleton */}
      <CardSkeleton className="h-64" />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsClientPage />
    </Suspense>
  );
}
