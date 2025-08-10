'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { TotalizadorData } from '@/lib/actions/analytics.actions';

interface TotalizadorCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
  error?: string;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-50/70 to-white/40 dark:from-blue-950/30 dark:to-slate-900/30',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'from-blue-500/10 to-blue-500/0',
    ring: 'ring-blue-200/60 dark:ring-blue-800/60',
    glow: 'bg-blue-400/20 dark:bg-blue-500/10',
    text: 'text-blue-900 dark:text-blue-100',
    number: 'text-blue-700 dark:text-blue-300'
  },
  green: {
    bg: 'from-green-50/70 to-white/40 dark:from-green-950/30 dark:to-slate-900/30',
    border: 'border-green-200/60 dark:border-green-800/40',
    icon: 'text-green-600 dark:text-green-400',
    iconBg: 'from-green-500/10 to-green-500/0',
    ring: 'ring-green-200/60 dark:ring-green-800/60',
    glow: 'bg-green-400/20 dark:bg-green-500/10',
    text: 'text-green-900 dark:text-green-100',
    number: 'text-green-700 dark:text-green-300'
  },
  purple: {
    bg: 'from-purple-50/70 to-white/40 dark:from-purple-950/30 dark:to-slate-900/30',
    border: 'border-purple-200/60 dark:border-purple-800/40',
    icon: 'text-purple-600 dark:text-purple-400',
    iconBg: 'from-purple-500/10 to-purple-500/0',
    ring: 'ring-purple-200/60 dark:ring-purple-800/60',
    glow: 'bg-purple-400/20 dark:bg-purple-500/10',
    text: 'text-purple-900 dark:text-purple-100',
    number: 'text-purple-700 dark:text-purple-300'
  },
  orange: {
    bg: 'from-orange-50/70 to-white/40 dark:from-orange-950/30 dark:to-slate-900/30',
    border: 'border-orange-200/60 dark:border-orange-800/40',
    icon: 'text-orange-600 dark:text-orange-400',
    iconBg: 'from-orange-500/10 to-orange-500/0',
    ring: 'ring-orange-200/60 dark:ring-orange-800/60',
    glow: 'bg-orange-400/20 dark:bg-orange-500/10',
    text: 'text-orange-900 dark:text-orange-100',
    number: 'text-orange-700 dark:text-orange-300'
  }
};

export function TotalizadorCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  loading = false, 
  error 
}: TotalizadorCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className={`group relative overflow-hidden rounded-2xl border ${colors.border} bg-white/60 dark:bg-slate-900/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}>
      {/* decor */}
      <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-2xl ${colors.glow}`} />
      <div className={`pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full opacity-30 blur-3xl ${colors.glow}`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className={`text-sm font-medium tracking-wide ${colors.text}`}>
              {title}
            </p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : error ? (
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                --
              </p>
            ) : (
              <p className={`text-4xl md:text-5xl font-semibold tracking-tight ${colors.number} transition-all duration-500`}>
                {value.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
          <div className={`relative p-3 rounded-xl bg-gradient-to-br ${colors.iconBg} ring-1 ${colors.ring} shadow-sm transition-transform duration-300 group-hover:scale-105`}> 
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
