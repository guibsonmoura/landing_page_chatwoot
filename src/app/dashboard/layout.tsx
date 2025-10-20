'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, Users, Bot, MessageSquare, Menu, X, Settings,  Crown,  } from 'lucide-react';
import {useRouter, usePathname} from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import { HeaderProvider } from '@/components/layout/HeaderContext';
import { usePlanStore } from '@/stores/planStore';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {Loading } from "@/components/layout/loading";


const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { fetchPlanFeatures, planFeatures } = usePlanStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  const [chatUrl, setChatUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAnimation, setLoadingAnimation] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
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
    fetch('/lottie/Sandy Loading.json')
      .then(res => res.json())
      .then(data => setLoadingAnimation(data))
      .catch(err => console.error('Erro ao carregar animação:', err));
  },[]);


  useEffect(() => {
    const supabase = createClient();
    const checkUserAndFetchFeatures = async () => {
      const { data: { user } } = await supabase.auth.getUser();
  
      if (user && !planFeatures) {
        await fetchPlanFeatures(user.id);
      }
      
      if (user) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('chat_url')
          .eq('user_id', user.id)
          .single();
        setChatUrl(tenant?.chat_url ?? null);
      } else {
        setChatUrl(null);
      }
    };
    checkUserAndFetchFeatures();
  }, [fetchPlanFeatures, planFeatures]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleClickLink = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage('Carregando...');
    setTimeout(() => {
      router.push(href);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <HeaderProvider>
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      
      
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
            )}>365IA </h1>
          </Link>
        </div>

        <nav className="mt-8 px-4 flex-1 flex flex-col">
          <NavLink 
            href="/dashboard/plano" 
            clicko={handleClickLink('/dashboard/plano')}
            icon={<Crown className="h-6 w-6" />} 
            label="Meu Plano" 
            isCollapsed={!sidebarOpen}
            isActive={pathname === '/dashboard/plano'} />
          {/* <NavLink href="/dashboard/agents" icon={<Bot className="h-6 w-6" />} label="Agentes IA" isCollapsed={!sidebarOpen} />
          <NavLink href="/dashboard/knowledge-base" icon={<Database className="h-6 w-6" />} label="Conhecimento" isCollapsed={!sidebarOpen} />
          <NavLink href="/dashboard/channels" icon={<MessageSquare className="h-6 w-6" />} label="Canais" isCollapsed={!sidebarOpen} />
          <NavLink href="/dashboard/messages" icon={<Mail className="h-6 w-6" />} label="Mensagens" isCollapsed={!sidebarOpen} /> */}
          {/* <NavLink href="/dashboard/attendants" icon={<Users className="h-6 w-6" />} label="Atendentes" isCollapsed={!sidebarOpen} /> */}
          <NavLink 
            href="/dashboard/analytics" 
            clicko={handleClickLink('/dashboard/analytics')}
            icon={<Home className="h-6 w-6" />} 
            label="Analytics" 
            isCollapsed={!sidebarOpen}
            isActive={pathname === '/dashboard/analytics'} />
          <NavLink 
            href="/dashboard/config" 
            clicko={handleClickLink('/dashboard/config')}
            icon={<Settings className="h-6 w-6" />} 
            label="Configurações" 
            isCollapsed={!sidebarOpen}
            isActive={pathname === '/dashboard/config'} />
          
          <div className="mt-auto mb-6 px-3">
            {chatUrl ? (
              sidebarOpen ? (
                <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                  <Button className="cursor-pointer w-full h-11 px-4 text-[15px] font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-700 hover:via-purple-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
                    
                    <span className="block w-full text-center whitespace-nowrap">Plataforma de Atendimentos</span>
                  </Button>
                </a>
              ) : (
                <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer" title="Plataforma de Atendimentos">
                  <Button className="cursor-pointer w-12 h-12 rounded-xl p-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-700 hover:via-purple-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
                    
                  </Button>
                </a>
              )
            ) : (
              <div className="flex items-center justify-center py-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-100 dark:border-blue-900">
                <span className="text-xs text-center text-blue-600 dark:text-blue-400">
                  Desenvolvido por 365IA
                </span>
              </div>
            )}
          </div>
        </nav>
      </aside>


      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        sidebarOpen ? "md:ml-0" : "md:ml-0"
      )}>
        <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={cn(
          "flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full transition-all duration-300",
          sidebarOpen ? "" : ""
        )}>
          {isLoading && loadingAnimation && (
              <Loading loadingAnimation={loadingAnimation} Lottie={Lottie} message={loadingMessage}/>
            )}
      
          {children}
        </main>
      </div>
    </div>
    </HeaderProvider>
  );
}

type NavLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  clicko: any;
  isActive?: boolean;
};

function NavLink({ href, icon, label, isCollapsed, clicko, isActive = false }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      onClick={clicko}
      className={cn(
        "flex items-center rounded-xl px-4 py-3 mb-3 transition-all duration-200",
        "hover:shadow-sm active:scale-95",
        isActive 
          ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 text-blue-700 dark:text-blue-300 shadow-sm font-semibold" 
          : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 active:bg-gradient-to-r active:from-blue-100 active:to-indigo-100 dark:active:from-gray-700 dark:active:to-gray-600",
        isCollapsed ? "justify-center md:px-3" : "px-4"
      )}
    >
      <div className={cn(
        "flex items-center justify-center", 
        isCollapsed ? "" : "mr-3",
        isActive ? "text-blue-700 dark:text-blue-300" : "text-blue-500 dark:text-blue-400"
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