'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  children: React.ReactNode;
}

export function Stepper({ currentStep, className, children, ...props }: StepperProps) {
  const steps = React.Children.toArray(children);
  
  return (
    <div className={cn('flex items-center w-full', className)} {...props}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {step}
          {index < steps.length - 1 && (
            <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-700 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

interface StepProps {
  title: string;
  completed?: boolean;
  current?: boolean;
}

export function Step({ title, completed, current }: StepProps) {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all",
          completed ? "bg-green-500 text-white" : 
          current ? "bg-blue-500 text-white" : 
          "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
        )}
      >
        {completed ? (
          <Check className="h-4 w-4" />
        ) : (
          <span>{completed ? <Check className="h-4 w-4" /> : null}</span>
        )}
      </div>
      <span 
        className={cn(
          "mt-2 text-xs font-medium",
          current ? "text-blue-500" : 
          completed ? "text-green-500" : 
          "text-slate-500 dark:text-slate-400"
        )}
      >
        {title}
      </span>
    </div>
  );
}
