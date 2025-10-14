import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink';
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  color = 'blue' 
}: StatCardProps) {
  const colorStyles = {
    blue: {
      iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      cardBorder: 'border-blue-100 dark:border-blue-900/50',
      valueColor: 'text-blue-700 dark:text-blue-400'
    },
    purple: {
      iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      cardBorder: 'border-purple-100 dark:border-purple-900/50',
      valueColor: 'text-purple-700 dark:text-purple-400'
    },
    green: {
      iconBg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30',
      iconColor: 'text-green-600 dark:text-green-400',
      cardBorder: 'border-green-100 dark:border-green-900/50',
      valueColor: 'text-green-700 dark:text-green-400'
    },
    orange: {
      iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      cardBorder: 'border-orange-100 dark:border-orange-900/50',
      valueColor: 'text-orange-700 dark:text-orange-400'
    },
    pink: {
      iconBg: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
      cardBorder: 'border-pink-100 dark:border-pink-900/50',
      valueColor: 'text-pink-700 dark:text-pink-400'
    }
  };

  const styles = colorStyles[color];

  return (
    <Card className={cn("border shadow-sm overflow-hidden", styles.cardBorder)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full", styles.iconBg)}>
          <Icon className={cn("h-7 w-7", styles.iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", styles.valueColor)}>{value}</div>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
