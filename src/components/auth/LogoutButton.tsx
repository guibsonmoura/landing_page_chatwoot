// src/components/auth/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { usePlanStore } from '@/stores/planStore';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  variant?: 'default' | 'icon' | 'text';
  className?: string;
}

export default function LogoutButton({ variant = 'default', className }: LogoutButtonProps) {
  const supabase = createClient();
  const router = useRouter();
  const { clearPlanFeatures } = usePlanStore();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    console.log('Logout error:', error);  
    if (!error) {
      clearPlanFeatures(); // Limpa os dados do plano da store
      router.push('/login');
      router.refresh(); // Garante que o estado do servidor seja atualizado
    }
  };

  if (variant === 'icon') {
    return (
      <Button 
        onClick={handleLogout} 
        variant="ghost" 
        size="icon"
        className={cn("text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500", className)}
        aria-label="Sair"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    );
  }
  
  if (variant === 'text') {
    return (
      <Button 
        onClick={handleLogout} 
        variant="ghost"
        size="sm"
        className={cn("text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-500 px-2 py-1 h-auto", className)}
      >
        Sair
      </Button>
    );
  }
  
  return (
    <Button 
      onClick={handleLogout} 
      variant="destructive"
      size="sm"
      className={cn("shadow-sm", className)}
    >
      <LogOut className="h-4 w-4 mr-1" />
      Sair
    </Button>
  );
}
