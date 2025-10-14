import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function Loading({ 
  size = 'md', 
  text = 'Carregando...', 
  className,
  fullScreen = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={cn('animate-spin text-primary', sizeClasses.lg)} />
          <p className={cn('text-muted-foreground font-medium', textSizeClasses.lg)}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center gap-3 p-8', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      <p className={cn('text-muted-foreground font-medium', textSizeClasses[size])}>
        {text}
      </p>
    </div>
  );
}

// Componente para skeleton loading de cards
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="space-y-4">
        <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
        <div className="h-8 bg-muted animate-pulse rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted animate-pulse rounded w-full"></div>
          <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

// Componente para skeleton loading de listas
export function ListSkeleton({ items = 3, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border bg-card">
          <div className="h-10 w-10 bg-muted animate-pulse rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
          </div>
          <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
        </div>
      ))}
    </div>
  );
}

// Componente para skeleton loading de tabelas
export function TableSkeleton({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="p-4 border-b">
        <div className="h-6 bg-muted animate-pulse rounded w-1/4"></div>
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
