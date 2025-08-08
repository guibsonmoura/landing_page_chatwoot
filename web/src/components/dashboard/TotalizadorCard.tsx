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
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800/30',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-900 dark:text-blue-100',
    number: 'text-blue-700 dark:text-blue-300'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800/30',
    icon: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-900 dark:text-green-100',
    number: 'text-green-700 dark:text-green-300'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800/30',
    icon: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-900 dark:text-purple-100',
    number: 'text-purple-700 dark:text-purple-300'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800/30',
    icon: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
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
    <Card className={`${colors.bg} ${colors.border} shadow-sm hover:shadow-md transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className={`text-sm font-medium ${colors.text}`}>
              {title}
            </p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : error ? (
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                --
              </p>
            ) : (
              <p className={`text-3xl font-bold ${colors.number} transition-all duration-500`}>
                {value.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors.iconBg} shadow-sm`}>
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
