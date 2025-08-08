import { Bot, Edit, Trash2, Settings, QrCode, Loader2, PhoneOff, BrainCircuit } from 'lucide-react';
import { type Channel } from '@/types/channel';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import logger from '@/lib/logger';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QRCodeModal } from './QRCodeModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChannelCardProps {
  channel: Channel;
  onEdit: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
  onConnect?: (channel: Channel) => void;
}

// Função auxiliar para resumir a configuração do canal
const getConfigSummary = (config: Record<string, any> | string): string => {
  if (typeof config === 'object') {
    return JSON.stringify(config).slice(0, 50) + '...';
  } else if (typeof config === 'string') {
    return config.slice(0, 50) + '...';
  } else {
    return 'Configuração inválida';
  }
};

// Função para normalizar os nomes das plataformas
const normalizePlatformName = (platform: string): string => {
  if (platform.toLowerCase() === 'whatsapp_evolution_api') {
    return 'WhatsApp';
  }
  return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
};

export function ChannelCard({ channel, onEdit, onDelete, onConnect }: ChannelCardProps) {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<'open' | 'close' | 'connecting' | 'loading'>('loading');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  // Função para verificar o status da conexão WhatsApp
  const checkWhatsAppStatus = async () => {
    if (!channel || channel.platform !== 'whatsapp') return;

    // Identificador único para este card
    const cardId = `${channel.platform}-${channel.id}`;
    
    setIsCheckingStatus(true);
    try {
      logger.debug('ChannelCard checking WhatsApp status', {
        cardId: cardId.substring(0, 8) + '...',
        hasChannelId: !!channel.id,
        hasAccount: !!channel.account
      });
      
      // Usar o proxy de API local para contornar problemas de CORS
      const proxyUrl = '/api/whatsapp-proxy';
      logger.debug('ChannelCard using proxy URL for status check');
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: 'state',
          channelId: channel.id,
          phone: channel.account || ''
        })
      });
      
      logger.debug('ChannelCard status check response received', { status: response.status });

      if (!response.ok) {
        logger.error('ChannelCard failed to check WhatsApp status');
        setWhatsappStatus('close');
        setIsCheckingStatus(false);
        return;
      }

      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        logger.debug('ChannelCard status response processed', {
          hasData: !!data,
          statusType: data?.status || 'unknown'
        });
        
        // Verificar o status retornado
        if (data && data.status === 'open') {
          logger.debug('ChannelCard WhatsApp connected');
          setWhatsappStatus('open');
        } else if (data && data.status === 'close') {
          logger.debug('ChannelCard WhatsApp disconnected');
          setWhatsappStatus('close');
        } else {
          logger.debug('ChannelCard unknown status received', { status: data?.status });
          setWhatsappStatus('close');
        }
      } catch (error) {
        console.error(`[ChannelCard ${cardId}] Erro ao processar resposta do status:`, error);
        setWhatsappStatus('close');
      } finally {
        setIsCheckingStatus(false);
      }
    } catch (error) {
      console.error(`[ChannelCard ${cardId}] Erro ao verificar status do WhatsApp:`, error);
      setWhatsappStatus('close');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Função para lidar com o clique no botão do WhatsApp
  const handleWhatsAppButtonClick = async () => {
    if (!channel) return;
    
    if (whatsappStatus === 'open') {
      // Desconectar WhatsApp
      try {
        logger.debug('ChannelCard disconnecting WhatsApp', {
          hasChannelId: !!channel.id,
          hasAccount: !!channel.account
        });
        
        // Usar o proxy de API local para contornar problemas de CORS
        const proxyUrl = '/api/whatsapp-proxy';
        logger.debug('ChannelCard using proxy URL for disconnect');

        setIsCheckingStatus(true);
        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            endpoint: 'disconnect',
            channelId: channel.id,
            phone: channel.account || ''
          })
        });
        
        logger.debug('ChannelCard disconnect response received', { status: response.status });

        if (response.ok) {
          // Atualizar o status após desconexão
          setWhatsappStatus('close');
        }
      } catch (error) {
        logger.error('ChannelCard failed to disconnect WhatsApp', { hasError: !!error });
      } finally {
        setIsCheckingStatus(false);
      }
    } else {
      // Conectar WhatsApp (abrir modal QR Code)
      setIsQRModalOpen(true);
    }
  };
  
  // Verificar o status do WhatsApp quando o componente é montado e periodicamente se configurado
  useEffect(() => {
    if (!channel || !(channel.platform === 'whatsapp' || channel.platform === 'whatsapp_evolution_api')) {
      return;
    }
    
    // Identificador único para este card (para debug)
    const cardId = `${channel.platform}-${channel.id}`;
    logger.debug('ChannelCard component initializing', {
      cardId: cardId.substring(0, 8) + '...',
      platform: channel.platform
    });
    
    // Verificar status inicial
    checkWhatsAppStatus();
    
    // Verificar se a variável de ambiente para intervalo de verificação está definida
    const checkIntervalStr = process.env.NEXT_PUBLIC_WHATSAPP_STATUS_CHECK_INTERVAL;
    const checkInterval = checkIntervalStr ? parseInt(checkIntervalStr, 10) * 1000 : null;
    
    // Se o intervalo for válido, configurar verificação periódica
    let intervalId: NodeJS.Timeout | null = null;
    if (checkInterval && !isNaN(checkInterval) && checkInterval > 0) {
      logger.debug('ChannelCard configuring periodic status check', {
        intervalSeconds: checkInterval/1000
      });
      intervalId = setInterval(() => {
        logger.debug('ChannelCard executing periodic status check');
        checkWhatsAppStatus();
      }, checkInterval);
    } else {
      logger.debug('ChannelCard periodic check not configured - checking only on load');
    }
    
    // Limpar intervalo quando o componente for desmontado
    return () => {
      if (intervalId) {
        logger.debug('ChannelCard cleaning up periodic check interval');
        clearInterval(intervalId);
      }
    };
  }, [channel]);
  // Função para determinar o ícone e a cor da plataforma
  const getPlatformDetails = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'whatsapp':
      case 'whatsapp_evolution_api':
        return {
          icon: (
            <div className="h-12 w-12 flex items-center justify-center">
              <img 
                src="/images/platforms/whatsapp-logo.png" 
                alt="WhatsApp" 
                className="h-full w-full object-contain" 
              />
            </div>
          ),
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
        };
      case 'telegram':
        return {
          icon: (
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.834.941z"/>
              </svg>
            </div>
          ),
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
        };
      case 'instagram':
        return {
          icon: (
            <div className="h-12 w-12 flex items-center justify-center">
              <img 
                src="/images/platforms/instagram-logo.png" 
                alt="Instagram" 
                className="h-full w-full object-contain" 
              />
            </div>
          ),
          color: 'from-pink-500 to-purple-600',
          bgColor: 'bg-pink-50 dark:bg-pink-900/20',
          borderColor: 'border-pink-200 dark:border-pink-800',
        };
      case 'webchat':
        return {
          icon: (
            <div className="h-12 w-12 flex items-center justify-center">
              <img 
                src="/images/platforms/webchat_logo.png" 
                alt="Webchat" 
                className="h-full w-full object-contain" 
              />
            </div>
          ),
          color: 'from-purple-500 to-indigo-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
        };
      default:
        return {
          icon: (
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
          ),
          color: 'from-slate-500 to-slate-600',
          bgColor: 'bg-slate-50 dark:bg-slate-900/20',
          borderColor: 'border-slate-200 dark:border-slate-800',
        };
    }
  };

  const platformDetails = getPlatformDetails(channel.platform);

  const card = (
    <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
      <div 
        className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${platformDetails.color} z-10`} 
        style={{ marginTop: '-1px', width: 'calc(100% + 2px)', marginLeft: '-1px' }} 
      />
      
      <CardHeader className="p-5 pb-0 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {platformDetails.icon}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {normalizePlatformName(channel.platform)}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {channel.account}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-slate-200 dark:border-slate-700 shadow-lg">
                <DropdownMenuLabel className="text-slate-500 dark:text-slate-400">Ações</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => onEdit(channel)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="h-4 w-4 text-slate-500" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950 dark:focus:text-red-400 flex items-center gap-2 cursor-pointer"
                  onClick={() => onDelete(channel)}
                >
                  <Trash2 className="h-4 w-4" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-4">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col space-y-2">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {channel.agent ? "Agente associado:" : "Status do agente:"}
            </div>
            <div className="flex flex-col gap-3 p-3 rounded-md border bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
              {channel.agent ? (
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {channel.agent.agent_name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Agente ativo neste canal
                      </span>
                    </div>
                  </div>

                  {/* Seção para listar as bases de conhecimento */}
                  {channel.agent.knowledge_bases && channel.agent.knowledge_bases.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                        <BrainCircuit className="h-4 w-4" />
                        <h4 className="text-sm font-medium">Base de Conhecimento</h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {channel.agent.knowledge_bases.map((kb) => (
                          <Badge key={kb.id} variant="secondary" className="font-normal text-xs bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            {kb.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-200 dark:bg-slate-800 rounded-full">
                    <Bot className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nenhum agente associado
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Associe um agente para automatizar respostas
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0">
        {(channel.platform === 'whatsapp' || channel.platform === 'whatsapp_evolution_api') && (
          <Button
            variant="outline"
            size="default"
            onClick={handleWhatsAppButtonClick}
            disabled={isCheckingStatus}
            className={`w-full ${whatsappStatus === 'open' 
              ? 'border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-900 dark:hover:border-red-800 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-500' 
              : 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100 text-green-700 dark:border-green-900 dark:hover:border-green-800 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-500'}`}
          >
            {isCheckingStatus ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : whatsappStatus === 'open' ? (
              <>
                <PhoneOff className="mr-1.5 h-4 w-4" />
                Desconectar WhatsApp
              </>
            ) : (
              <>
                <QrCode className="mr-1.5 h-4 w-4" />
                Conectar WhatsApp
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );



  return (
    <>
      {channel && (channel.platform === 'whatsapp' || channel.platform === 'whatsapp_evolution_api') && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onOpenChange={(open) => {
            setIsQRModalOpen(open);
            if (!open) {
              // Verificar o status novamente quando o modal for fechado
              checkWhatsAppStatus();
            }
          }}
          channelId={channel.id}
          agentId={channel.agent_id}
          phoneNumber={channel.account}
        />
      )}
      {card}
    </>
  );
}
