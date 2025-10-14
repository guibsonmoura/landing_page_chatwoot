// Tipos para o Sistema de Mensageria/Notificações

export type MessageType = 'notification' | 'message' | 'announcement' | 'alert';
export type MessageScope = 'individual' | 'broadcast' | 'role_based';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageStatus = 'active' | 'archived' | 'deleted';

// Interface principal para mensagens
export interface Message {
  id: string;
  tenant_id: string;
  sender_id: string | null;
  
  // Tipo e escopo
  type: MessageType;
  scope: MessageScope;
  
  // Conteúdo
  title: string;
  content: string;
  
  // Configurações
  priority: MessagePriority;
  status: MessageStatus;
  
  // Agendamento
  scheduled_for?: string | null;
  expires_at?: string | null;
  
  // Metadados
  metadata: Record<string, any>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relacionamentos (quando incluídos)
  sender?: {
    id: string;
    email: string;
    full_name?: string;
  };
  recipients?: MessageRecipient[];
  recipient_count?: number;
  read_count?: number;
  unread_count?: number;
}

// Interface para destinatários de mensagens
export interface MessageRecipient {
  id: string;
  message_id: string;
  recipient_id: string;
  tenant_id: string;
  
  // Status de leitura
  read_at?: string | null;
  is_read: boolean;
  
  // Status de confirmação
  acknowledged_at?: string | null;
  is_acknowledged: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relacionamentos (quando incluídos)
  recipient?: {
    id: string;
    email: string;
    full_name?: string;
  };
  message?: Message;
}

// Interface para templates de mensagens
export interface MessageTemplate {
  id: string;
  tenant_id: string;
  created_by: string | null;
  
  // Identificação
  name: string;
  description?: string;
  category: string;
  
  // Conteúdo do template
  title_template: string;
  content_template: string;
  
  // Configurações padrão
  default_priority: MessagePriority;
  default_type: MessageType;
  
  // Status
  is_active: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relacionamentos (quando incluídos)
  creator?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

// DTOs para criação e atualização

export interface CreateMessageDTO {
  type: MessageType;
  scope: MessageScope;
  title: string;
  content: string;
  priority?: MessagePriority;
  scheduled_for?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
  recipient_ids?: string[]; // Para mensagens individuais
}

export interface UpdateMessageDTO {
  title?: string;
  content?: string;
  priority?: MessagePriority;
  status?: MessageStatus;
  scheduled_for?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface CreateMessageTemplateDTO {
  name: string;
  description?: string;
  category?: string;
  title_template: string;
  content_template: string;
  default_priority?: MessagePriority;
  default_type?: MessageType;
}

export interface UpdateMessageTemplateDTO {
  name?: string;
  description?: string;
  category?: string;
  title_template?: string;
  content_template?: string;
  default_priority?: MessagePriority;
  default_type?: MessageType;
  is_active?: boolean;
}

// Interfaces para filtros e consultas

export interface MessageFilters {
  type?: MessageType;
  scope?: MessageScope;
  priority?: MessagePriority;
  status?: MessageStatus;
  sender_id?: string;
  recipient_id?: string;
  is_read?: boolean;
  is_acknowledged?: boolean;
  created_after?: string;
  created_before?: string;
  scheduled_after?: string;
  scheduled_before?: string;
  search?: string; // Busca no título e conteúdo
}

export interface MessageTemplateFilters {
  category?: string;
  is_active?: boolean;
  created_by?: string;
  search?: string; // Busca no nome e descrição
}

// Interfaces para estatísticas

export interface MessageStats {
  total_messages: number;
  unread_messages: number;
  by_type: Record<MessageType, number>;
  by_priority: Record<MessagePriority, number>;
  recent_activity: {
    today: number;
    this_week: number;
    this_month: number;
  };
}

export interface NotificationSummary {
  unread_count: number;
  urgent_count: number;
  recent_messages: Message[];
}

// Interfaces para componentes UI

export interface MessageFormData {
  type: MessageType;
  scope: MessageScope;
  title: string;
  content: string;
  priority: MessagePriority;
  scheduled_for?: string;
  expires_at?: string;
  recipient_ids: string[];
  template_id?: string;
}

export interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  onMessageClick?: (message: Message) => void;
  onMarkAsRead?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  showActions?: boolean;
}

export interface NotificationBellProps {
  unreadCount: number;
  recentMessages: Message[];
  onMarkAllAsRead?: () => void;
  onMessageClick?: (message: Message) => void;
}

// Constantes úteis

export const MESSAGE_TYPES: Record<MessageType, { label: string; icon: string; color: string }> = {
  notification: {
    label: 'Notificação',
    icon: 'Bell',
    color: 'blue'
  },
  message: {
    label: 'Mensagem',
    icon: 'MessageSquare',
    color: 'green'
  },
  announcement: {
    label: 'Comunicado',
    icon: 'Megaphone',
    color: 'purple'
  },
  alert: {
    label: 'Alerta',
    icon: 'AlertTriangle',
    color: 'red'
  }
};

export const MESSAGE_PRIORITIES: Record<MessagePriority, { label: string; color: string; weight: number }> = {
  low: {
    label: 'Baixa',
    color: 'gray',
    weight: 1
  },
  normal: {
    label: 'Normal',
    color: 'blue',
    weight: 2
  },
  high: {
    label: 'Alta',
    color: 'orange',
    weight: 3
  },
  urgent: {
    label: 'Urgente',
    color: 'red',
    weight: 4
  }
};

export const MESSAGE_SCOPES: Record<MessageScope, { label: string; description: string }> = {
  individual: {
    label: 'Individual',
    description: 'Enviar para usuários específicos'
  },
  broadcast: {
    label: 'Transmissão',
    description: 'Enviar para todos os usuários do tenant'
  },
  role_based: {
    label: 'Por Função',
    description: 'Enviar baseado em funções/permissões'
  }
};
