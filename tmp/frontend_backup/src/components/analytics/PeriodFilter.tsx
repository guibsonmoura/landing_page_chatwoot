'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { PeriodFilter as PeriodFilterType } from '@/lib/utils/analytics';

interface PeriodFilterProps {
  selectedPeriod: PeriodFilterType;
  customStartDate?: Date;
  customEndDate?: Date;
  onPeriodChange: (
    period: PeriodFilterType,
    customStart?: Date,
    customEnd?: Date
  ) => void;
  className?: string;
}

const PERIOD_OPTIONS = [
  { value: '7d' as const, label: 'Últimos 7 dias', description: 'Uma semana' },
  { value: '30d' as const, label: 'Últimos 30 dias', description: 'Um mês' },
  { value: '180d' as const, label: 'Últimos 180 dias', description: '6 meses' },
  { value: 'custom' as const, label: 'Período personalizado', description: 'Escolher datas' },
];

export function PeriodFilter({
  selectedPeriod,
  customStartDate,
  customEndDate,
  onPeriodChange,
  className
}: PeriodFilterProps) {
  const [tempStartDate, setTempStartDate] = useState<string>(
    customStartDate ? customStartDate.toISOString().split('T')[0] : ''
  );
  const [tempEndDate, setTempEndDate] = useState<string>(
    customEndDate ? customEndDate.toISOString().split('T')[0] : ''
  );
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const selectedOption = PERIOD_OPTIONS.find(option => option.value === selectedPeriod);

  const handlePeriodSelect = (period: PeriodFilterType) => {
    if (period !== 'custom') {
      onPeriodChange(period);
    } else {
      setIsCustomOpen(true);
    }
  };

  const handleCustomDateApply = () => {
    if (tempStartDate && tempEndDate) {
      const startDate = new Date(tempStartDate);
      const endDate = new Date(tempEndDate);
      
      if (startDate <= endDate) {
        onPeriodChange('custom', startDate, endDate);
        setIsCustomOpen(false);
      }
    }
  };

  const formatDateRange = () => {
    if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
      const start = customStartDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      const end = customEndDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      return `${start} - ${end}`;
    }
    return selectedOption?.description || '';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-9 px-3 gap-2 text-sm font-medium border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700 dark:text-slate-300">
              {selectedOption?.label || 'Selecionar período'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {PERIOD_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handlePeriodSelect(option.value)}
              className={cn(
                "flex flex-col items-start gap-1 p-3 cursor-pointer",
                selectedPeriod === option.value && "bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {option.label}
                </span>
                {selectedPeriod === option.value && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {option.value === 'custom' && selectedPeriod === 'custom' 
                  ? formatDateRange() 
                  : option.description
                }
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Date Picker Modal */}
      {isCustomOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <Calendar className="h-4 w-4 text-blue-500" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Período Personalizado
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Data Inicial
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Data Final
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomOpen(false)}
                  className="flex-1 h-8 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleCustomDateApply}
                  disabled={!tempStartDate || !tempEndDate}
                  className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
