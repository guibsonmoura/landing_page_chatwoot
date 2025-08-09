// src/app/dashboard/layout.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Users, Bot, MessageSquare, Settings, Menu, X, Database, Crown, Mail } from 'lucide-react';
import Header from '@/components/layout/Header';
import { usePlanStore } from '@/stores/planStore';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchPlanFeatures, planFeatures } = usePlanStore();
  // Em dispositivos móveis, a sidebar começa fechada
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  
  // Detecta mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const checkUserAndFetchFeatures = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Busca as features apenas se tivermos um usuário e elas ainda não foram carregadas.
      if (user && !planFeatures) {
        fetchPlanFeatures(user.id);
      }
    };

    checkUserAndFetchFeatures();
  }, [fetchPlanFeatures, planFeatures]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Overlay para fechar a sidebar em dispositivos móveis */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile sidebar toggle */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 md:hidden bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
        aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        <span className={cn("text-sm font-medium", sidebarOpen ? "" : "")}>
          {sidebarOpen ? "Fechar" : "Menu"}
        </span>
      </button>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:sticky md:top-0 z-40 h-screen transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 border-r border-slate-200 dark:border-gray-700",
          "flex flex-col shadow-xl md:shadow-none",
          sidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full md:w-20 md:translate-x-0"
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
              <img 
                src="/images/logos/logo_64x64.png" 
                alt="Nexus Agents Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className={cn(
              "font-bold text-gray-900 dark:text-white transition-all duration-300",
              sidebarOpen ? "text-xl opacity-100" : "text-xl opacity-0 md:hidden"
            )}>Nexus Agents</h1>
          </Link>
        </div>

        <nav className="mt-8 px-4 flex-1 flex flex-col">
          <NavLink href="/dashboard/plano" icon={<Crown className="h-6 w-6" />} label="Meu Plano" isCollapsed={!sidebarOpen} />
          <NavLink href="/dashboard/agents" icon={<Bot className="h-6 w-6" />} label="Agentes IA" isCollapsed={!sidebarOpen} />
          <NavLink href="/dashboard/knowledge-base" icon={<Database className="h-6 w-6" />} label="Conhecimento" isCollapsed={!sidebarOpen} />
          <NavLink href="/dashboard/channels" icon={<MessageSquare className="h-6 w-6" />} label="Canais" isCollapsed={!sidebarOpen} />
          <NavLink href="/dashboard/messages" icon={<Mail className="h-6 w-6" />} label="Mensagens" isCollapsed={!sidebarOpen} />
          <NavLink href="/dashboard/attendants" icon={<Users className="h-6 w-6" />} label="Atendentes" isCollapsed={!sidebarOpen} />
          <NavLink href="/dashboard/analytics" icon={<Home className="h-6 w-6" />} label="Analytics" isCollapsed={!sidebarOpen} />
          {/* <NavLink href="/dashboard/settings" icon={<Settings className="h-6 w-6" />} label="Configurações" isCollapsed={!sidebarOpen} /> */}
          
          <div className="mt-auto mb-6 px-3">
            <div className="flex items-center justify-center py-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-100 dark:border-blue-900">
              <span className="text-xs text-center text-blue-600 dark:text-blue-400">
                Powered by Nexus Agents
              </span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        sidebarOpen ? "md:ml-0" : "md:ml-0"
      )}>
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={cn(
          "flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full transition-all duration-300",
          sidebarOpen ? "" : ""
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

type NavLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
};

function NavLink({ href, icon, label, isCollapsed }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center rounded-xl px-4 py-3 mb-3 transition-all duration-200",
        "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50", 
        "dark:hover:from-gray-800 dark:hover:to-gray-700",
        "hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm",
        isCollapsed ? "justify-center md:px-3" : "px-4"
      )}
    >
      <div className={cn(
        "flex items-center justify-center", 
        isCollapsed ? "" : "mr-3",
        "text-blue-500 dark:text-blue-400"
      )}>
        {icon}
      </div>
      <span className={cn(
        "font-medium transition-all duration-300 text-base",
        isCollapsed ? "hidden" : "block"
      )}>{label}</span>
    </Link>
  );
}
