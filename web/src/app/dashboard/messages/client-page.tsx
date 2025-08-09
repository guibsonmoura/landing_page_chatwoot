'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Inbox, 
  Archive, 
  Plus, 
  Filter,
  Search,
  Bell,
  Users,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageList } from '@/components/messaging/MessageList';
import { MessageForm } from '@/components/messaging/MessageForm';
import { 
  getMessages, 
  getMyMessages, 
  getMessageStats,
  markMessageAsRead,
  deleteMessage
} from '@/lib/actions/message.actions';
import { 
  Message, 
  MessageRecipient, 
  MessageStats, 
  MessageFilters,
  MESSAGE_TYPES,
  MESSAGE_PRIORITIES 
} from '@/types/message';

export function MessagesClientPage() {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedMessages, setReceivedMessages] = useState<MessageRecipient[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MessageFilters>({});
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);

  // Carregar mensagens recebidas
  const loadReceivedMessages = async () => {
    try {
      const result = await getMyMessages(filters);
      if (result.data) {
        setReceivedMessages(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens recebidas:', error);
    }
  };

  // Carregar mensagens enviadas
  const loadSentMessages = async () => {
    try {
      const result = await getMessages(filters);
      if (result.data) {
        setSentMessages(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens enviadas:', error);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const result = await getMessageStats();
      if (result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Carregar dados iniciais
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadReceivedMessages(),
        loadSentMessages(),
        loadStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // Marcar mensagem como lida
  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
      await loadReceivedMessages();
      await loadStats();
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };

  // Deletar mensagem
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
    }
  };

  // Sucesso ao criar mensagem
  const handleMessageSuccess = () => {
    setShowNewMessageForm(false);
    loadData();
  };

  // Aplicar filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value && value !== '') {
        newFilters[key as keyof MessageFilters] = value as any;
      } else {
        delete newFilters[key as keyof MessageFilters];
      }
      return newFilters;
    });
  };

  // Busca
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      search: query || undefined
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            Mensagens
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Sistema de mensagens e notificações internas
          </p>
        </div>
        
        {/* Botão de Nova Mensagem ocultado para clientes */}
        {/* 
        <Button 
          onClick={() => setShowNewMessageForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Mensagem
        </Button>
        */}
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold">{stats.total_messages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Não Lidas</p>
                  <p className="text-xl font-semibold">{stats.unread_messages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Esta Semana</p>
                  <p className="text-xl font-semibold">{stats.recent_activity.this_week}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                  <p className="text-xl font-semibold">{stats.recent_activity.today}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar mensagens..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(MESSAGE_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('priority', value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(MESSAGE_PRIORITIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Nova Mensagem - Ocultado para clientes */}
      {/* 
      {showNewMessageForm && (
        <MessageForm
          onSuccess={handleMessageSuccess}
          onCancel={() => setShowNewMessageForm(false)}
        />
      )}
      */}

      {/* Tabs de Mensagens */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Recebidas
            {stats && stats.unread_messages > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {stats.unread_messages > 99 ? '99+' : stats.unread_messages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          <MessageList
            messages={receivedMessages.map(r => r.message).filter((msg): msg is Message => Boolean(msg))}
            loading={loading}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDeleteMessage}
            viewMode="received"
          />
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <MessageList
            messages={sentMessages}
            loading={loading}
            onDelete={handleDeleteMessage}
            viewMode="sent"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
