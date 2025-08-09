import { Zap, Shield, Crown, Sparkles } from "lucide-react";

export interface PlanIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  bgGradient: string;
}

export const planIcons: Record<string, PlanIconConfig> = {
  Trial: {
    icon: Sparkles,
    iconColor: "text-purple-500",
    iconBg: "from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
    bgGradient: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
  Basic: {
    icon: Zap,
    iconColor: "text-blue-500",
    iconBg: "from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
    bgGradient: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  Pro: {
    icon: Shield,
    iconColor: "text-green-500",
    iconBg: "from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
    bgGradient: "bg-gradient-to-r from-green-500 to-green-600",
  },
  Enterprise: {
    icon: Crown,
    iconColor: "text-amber-500",
    iconBg: "from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800",
    bgGradient: "bg-gradient-to-r from-amber-500 to-amber-600",
  },
};

export function getPlanIcon(planName: string): PlanIconConfig {
  return planIcons[planName] || planIcons.Basic;
}
