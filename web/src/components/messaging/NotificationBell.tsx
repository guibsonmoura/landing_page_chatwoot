'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, AlertTriangle, MessageSquare, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Message, NotificationSummary, MESSAGE_TYPES, MESSAGE_PRIORITIES } from '@/types/message';
import { getNotificationSummary, markMessageAsRead, markAllMessagesAsRead } from '@/lib/actions/message.actions';

interface NotificationBellProps {
  className?: string;
  onMessageClick?: (message: Message) => void;
}

export function NotificationBell({ className, onMessageClick }: NotificationBellProps) {
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar resumo de notificações
  const loadNotificationSummary = async () => {
    try {
      setLoading(true);
      const result = await getNotificationSummary();
      if (result.data) {
        setSummary(result.data);
      } else if (result.error) {
        console.error('Erro ao carregar notificações:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadNotificationSummary();
  }, []);

  // Recarregar a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadNotificationSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  // Marcar mensagem como lida
  const handleMarkAsRead = async (messageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await markMessageAsRead(messageId);
      await loadNotificationSummary();
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllMessagesAsRead();
      await loadNotificationSummary();
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao marcar todas as mensagens como lidas:', error);
    }
  };

  // Clique na mensagem
  const handleMessageClick = (message: Message) => {
    onMessageClick?.(message);
    setIsOpen(false);
  };

  // Obter ícone da mensagem
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'notification':
        return <Bell className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    const colors = MESSAGE_PRIORITIES[priority as keyof typeof MESSAGE_PRIORITIES]?.color || 'gray';
    return colors;
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const unreadCount = summary?.unread_count || 0;
  const urgentCount = summary?.urgent_count || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative h-9 w-9 p-0",
            className
          )}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center",
                urgentCount > 0 ? "animate-pulse" : ""
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        sideOffset={5}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notificações</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 px-2 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : summary?.recent_messages && summary.recent_messages.length > 0 ? (
          <ScrollArea className="max-h-96">
            <div className="p-2">
              {summary.recent_messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                    message.priority === 'urgent' && "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                  )}
                  onClick={() => handleMessageClick(message)}
                >
                  <div className={cn(
                    "p-1.5 rounded-full flex-shrink-0",
                    getPriorityColor(message.priority) === 'red' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                    getPriorityColor(message.priority) === 'orange' && "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                    getPriorityColor(message.priority) === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                    getPriorityColor(message.priority) === 'gray' && "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
                  )}>
                    {getMessageIcon(message.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">
                        {message.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleMarkAsRead(message.id, e)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {message.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </span>
                      
                      {message.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          Urgente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação
            </p>
          </div>
        )}

        {summary?.recent_messages && summary.recent_messages.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                onClick={() => {
                  // Navegar para página de mensagens
                  window.location.href = '/dashboard/messages';
                }}
              >
                Ver todas as mensagens
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
