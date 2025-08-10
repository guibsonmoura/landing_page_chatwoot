// src/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/messaging/NotificationBell';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useHeader } from '@/components/layout/HeaderContext';

type HeaderProps = {
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
};

export default function Header({ sidebarOpen, toggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userInitials, setUserInitials] = useState<string>('NA');
  const { title, subtitle } = useHeader();
  
  // Após a montagem do componente, podemos renderizar com segurança elementos dependentes do tema
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const email = user.email || '';
        const name = email.split('@')[0] || 'User';
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        
        // Generate initials from email
        const initials = email
          .split('@')[0]
          .split('.')
          .map(part => part[0]?.toUpperCase() || '')
          .join('')
          .slice(0, 2);
        
        setUserInitials(initials || 'NA');
      }
    };

    fetchUserProfile();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-4 md:px-6 py-5 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="md:hidden h-9 w-9 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={sidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Mobile Logo */}
        <div className={cn(
          "md:hidden flex items-center gap-3 transition-all duration-300",
          sidebarOpen ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
        )}>
          <div className="h-10 w-10 rounded-lg overflow-hidden shadow-lg">
            <img 
              src="/images/logos/logo_64x64.png" 
              alt="Nexus Agents Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Nexus Agents</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{title}</span>
          </div>
        </div>
        
        {/* Desktop Title */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="h-9 w-9 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Alternar tema"
        >
          {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        
        {/* Notifications */}
        <NotificationBell 
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          onMessageClick={(message) => {
            // Navegar para a página de mensagens quando clicar em uma notificação
            window.location.href = '/dashboard/messages';
          }}
        />
        
        {/* User Profile Section */}
        <div className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="hidden sm:flex flex-col text-right">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{userName || 'Usuário'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Administrador</p>
          </div>
          
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
          </div>
          
          {/* Logout Button */}
          <div className="hidden sm:block">
            <LogoutButton variant="default" />
          </div>
        </div>
      </div>
    </header>
  );
}
