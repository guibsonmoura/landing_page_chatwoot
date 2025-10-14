'use client';

import { useState } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Megaphone, 
  AlertTriangle, 
  User, 
  Users, 
  Clock, 
  Eye, 
  EyeOff,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Message, MESSAGE_TYPES, MESSAGE_PRIORITIES, MESSAGE_SCOPES } from '@/types/message';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  onMessageClick?: (message: Message) => void;
  onMarkAsRead?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  showActions?: boolean;
  viewMode?: 'received' | 'sent';
}

export function MessageList({ 
  messages, 
  loading = false, 
  onMessageClick, 
  onMarkAsRead, 
  onDelete, 
  showActions = true,
  viewMode = 'received'
}: MessageListProps) {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

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

  // Obter ícone do escopo
  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'individual':
        return <User className="h-3 w-3" />;
      case 'broadcast':
        return <Users className="h-3 w-3" />;
      case 'role_based':
        return <Users className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // Obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    const priorityConfig = MESSAGE_PRIORITIES[priority as keyof typeof MESSAGE_PRIORITIES];
    return priorityConfig?.color || 'gray';
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
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Truncar conteúdo
  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma mensagem</h3>
          <p className="text-muted-foreground">
            {viewMode === 'received' 
              ? 'Você não possui mensagens no momento.' 
              : 'Nenhuma mensagem foi enviada ainda.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const typeConfig = MESSAGE_TYPES[message.type as keyof typeof MESSAGE_TYPES];
        const priorityConfig = MESSAGE_PRIORITIES[message.priority as keyof typeof MESSAGE_PRIORITIES];
        const scopeConfig = MESSAGE_SCOPES[message.scope as keyof typeof MESSAGE_SCOPES];
        
        return (
          <Card 
            key={message.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              message.priority === 'urgent' && "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10",
              message.priority === 'high' && "border-orange-200 dark:border-orange-900"
            )}
            onClick={() => onMessageClick?.(message)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Ícone da mensagem */}
                <div className={cn(
                  "p-2.5 rounded-full flex-shrink-0",
                  getPriorityColor(message.priority) === 'red' && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                  getPriorityColor(message.priority) === 'orange' && "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                  getPriorityColor(message.priority) === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                  getPriorityColor(message.priority) === 'gray' && "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
                )}>
                  {getMessageIcon(message.type)}
                </div>

                {/* Conteúdo da mensagem */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 truncate">
                        {message.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {/* Badges de tipo, prioridade e escopo */}
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs px-2 py-0.5",
                            typeConfig?.color === 'blue' && "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400",
                            typeConfig?.color === 'green' && "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400",
                            typeConfig?.color === 'purple' && "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400",
                            typeConfig?.color === 'red' && "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400"
                          )}
                        >
                          {typeConfig?.label || message.type}
                        </Badge>

                        {message.priority !== 'normal' && (
                          <Badge 
                            variant={message.priority === 'urgent' ? 'destructive' : 'secondary'}
                            className="text-xs px-2 py-0.5"
                          >
                            {priorityConfig?.label || message.priority}
                          </Badge>
                        )}

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getScopeIcon(message.scope)}
                          <span>{scopeConfig?.label || message.scope}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    {showActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {viewMode === 'received' && onMarkAsRead && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(message.id);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Marcar como lida
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(message.id);
                              }}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Conteúdo da mensagem */}
                  <p className="text-sm text-muted-foreground mb-3">
                    {truncateContent(message.content)}
                  </p>

                  {/* Informações adicionais */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(message.created_at)}</span>
                      </div>
                      
                      {message.sender && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{message.sender.full_name || message.sender.email}</span>
                        </div>
                      )}

                      {viewMode === 'sent' && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {message.recipient_count || 0} destinatários
                            {message.read_count !== undefined && ` • ${message.read_count} lidas`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Indicadores de status */}
                    {message.scheduled_for && new Date(message.scheduled_for) > new Date() && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Agendada
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
