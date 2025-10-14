'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  Message, 
  MessageRecipient, 
  MessageTemplate,
  CreateMessageDTO, 
  UpdateMessageDTO,
  CreateMessageTemplateDTO,
  UpdateMessageTemplateDTO,
  MessageFilters,
  MessageTemplateFilters,
  MessageStats,
  NotificationSummary
} from '@/types/message';

// Função auxiliar para obter o tenant_id do usuário autenticado
async function getCurrentTenantId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!tenant) {
    throw new Error('Usuário não associado a nenhum tenant');
  }

  return { user, tenantId: tenant.id };
}

// ==================== MENSAGENS ====================

export async function getMessages(filters: MessageFilters = {}) {
  try {
    const { tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    let query = supabase
      .from('messages')
      .select(`
        *,
        recipients:message_recipients(
          id,
          recipient_id,
          is_read,
          is_acknowledged,
          read_at,
          acknowledged_at
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.scope) {
      query = query.eq('scope', filters.scope);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.sender_id) {
      query = query.eq('sender_id', filters.sender_id);
    }
    if (filters.created_after) {
      query = query.gte('created_at', filters.created_after);
    }
    if (filters.created_before) {
      query = query.lte('created_at', filters.created_before);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return { data: [], error: error.message };
    }

    // Adicionar contadores aos dados
    const messagesWithCounts = data?.map(message => ({
      ...message,
      recipient_count: message.recipients?.length || 0,
      read_count: message.recipients?.filter(r => r.is_read).length || 0,
      unread_count: message.recipients?.filter(r => !r.is_read).length || 0,
    })) || [];

    return { data: messagesWithCounts, error: null };
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return { data: [], error: 'Erro interno do servidor' };
  }
}

export async function getMessageById(messageId: string) {
  try {
    const { tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        recipients:message_recipients(
          id,
          recipient_id,
          is_read,
          is_acknowledged,
          read_at,
          acknowledged_at
        )
      `)
      .eq('id', messageId)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Erro ao buscar mensagem:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar mensagem:', error);
    return { data: null, error: 'Erro interno do servidor' };
  }
}

export async function createMessage(messageData: CreateMessageDTO) {
  try {
    const { user, tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    // Criar a mensagem
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        tenant_id: tenantId,
        sender_id: user.id,
        type: messageData.type,
        scope: messageData.scope,
        title: messageData.title,
        content: messageData.content,
        priority: messageData.priority || 'normal',
        scheduled_for: messageData.scheduled_for,
        expires_at: messageData.expires_at,
        metadata: messageData.metadata || {}
      })
      .select()
      .single();

    if (messageError) {
      console.error('Erro ao criar mensagem:', messageError);
      return { data: null, error: messageError.message };
    }

    // Determinar destinatários baseado no escopo
    let recipientIds: string[] = [];

    if (messageData.scope === 'individual' && messageData.recipient_ids) {
      recipientIds = messageData.recipient_ids;
    } else if (messageData.scope === 'broadcast') {
      // Para broadcast, usar o próprio usuário do tenant (estrutura atual)
      // Em uma implementação futura, isso pode ser expandido para múltiplos usuários
      const { data: tenant } = await supabase
        .from('tenants')
        .select('user_id')
        .eq('id', tenantId)
        .single();
      
      recipientIds = tenant?.user_id ? [tenant.user_id] : [];
    }

    // Criar registros de destinatários
    if (recipientIds.length > 0) {
      const recipients = recipientIds.map(recipientId => ({
        message_id: message.id,
        recipient_id: recipientId,
        tenant_id: tenantId
      }));

      const { error: recipientsError } = await supabase
        .from('message_recipients')
        .insert(recipients);

      if (recipientsError) {
        console.error('Erro ao criar destinatários:', recipientsError);
        // Não falhar a operação, apenas logar o erro
      }
    }

    revalidatePath('/dashboard/messages');
    return { data: message, error: null };
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    return { data: null, error: 'Erro interno do servidor' };
  }
}

export async function updateMessage(messageId: string, updateData: UpdateMessageDTO) {
  try {
    const { tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', messageId)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar mensagem:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/dashboard/messages');
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar mensagem:', error);
    return { data: null, error: 'Erro interno do servidor' };
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const { tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('messages')
      .update({ status: 'deleted' })
      .eq('id', messageId)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Erro ao deletar mensagem:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/messages');
    return { error: null };
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    return { error: 'Erro interno do servidor' };
  }
}

// ==================== DESTINATÁRIOS ====================

export async function getMyMessages(filters: MessageFilters = {}) {
  try {
    const { user, tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    let query = supabase
      .from('message_recipients')
      .select(`
        *,
        message:message_id(
          id,
          type,
          scope,
          title,
          content,
          priority,
          status,
          scheduled_for,
          expires_at,
          created_at,
          sender_id
        )
      `)
      .eq('recipient_id', user.id)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    // Aplicar filtros de recipient
    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }
    if (filters.is_acknowledged !== undefined) {
      query = query.eq('is_acknowledged', filters.is_acknowledged);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar minhas mensagens:', error);
      return { data: [], error: error.message };
    }

    let filteredData = data || [];

    // Aplicar filtros nas mensagens (lado do cliente)
    if (filters.type) {
      filteredData = filteredData.filter(item => item.message?.type === filters.type);
    }
    if (filters.priority) {
      filteredData = filteredData.filter(item => item.message?.priority === filters.priority);
    }
    if (filters.status) {
      filteredData = filteredData.filter(item => item.message?.status === filters.status);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.message?.title?.toLowerCase().includes(searchLower) ||
        item.message?.content?.toLowerCase().includes(searchLower)
      );
    }

    return { data: filteredData, error: null };
  } catch (error) {
    console.error('Erro ao buscar minhas mensagens:', error);
    return { data: [], error: 'Erro interno do servidor' };
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    const { user, tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('message_recipients')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('message_id', messageId)
      .eq('recipient_id', user.id)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/messages');
    revalidatePath('/dashboard/notifications');
    return { error: null };
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    return { error: 'Erro interno do servidor' };
  }
}

export async function markMessageAsAcknowledged(messageId: string) {
  try {
    const { user, tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('message_recipients')
      .update({ 
        is_acknowledged: true, 
        acknowledged_at: new Date().toISOString() 
      })
      .eq('message_id', messageId)
      .eq('recipient_id', user.id)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Erro ao confirmar mensagem:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/messages');
    revalidatePath('/dashboard/notifications');
    return { error: null };
  } catch (error) {
    console.error('Erro ao confirmar mensagem:', error);
    return { error: 'Erro interno do servidor' };
  }
}

export async function markAllMessagesAsRead() {
  try {
    const { user, tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    const { error } = await supabase
      .from('message_recipients')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('recipient_id', user.id)
      .eq('tenant_id', tenantId)
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao marcar todas as mensagens como lidas:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/messages');
    revalidatePath('/dashboard/notifications');
    return { error: null };
  } catch (error) {
    console.error('Erro ao marcar todas as mensagens como lidas:', error);
    return { error: 'Erro interno do servidor' };
  }
}

// ==================== TEMPLATES ====================

export async function getMessageTemplates(filters: MessageTemplateFilters = {}) {
  try {
    const { tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    let query = supabase
      .from('message_templates')
      .select(`
        *,
        creator:created_by(id, email, full_name)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar templates:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return { data: [], error: 'Erro interno do servidor' };
  }
}

export async function createMessageTemplate(templateData: CreateMessageTemplateDTO) {
  try {
    const { user, tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('message_templates')
      .insert({
        tenant_id: tenantId,
        created_by: user.id,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category || 'general',
        title_template: templateData.title_template,
        content_template: templateData.content_template,
        default_priority: templateData.default_priority || 'normal',
        default_type: templateData.default_type || 'notification'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar template:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/dashboard/messages');
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return { data: null, error: 'Erro interno do servidor' };
  }
}

// ==================== ESTATÍSTICAS ====================

export async function getMessageStats(): Promise<{ data: MessageStats | null; error: string | null }> {
  try {
    const { user, tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    // Buscar estatísticas gerais
    const { data: messages } = await supabase
      .from('messages')
      .select('type, priority, created_at')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    // Buscar mensagens não lidas do usuário
    const { data: unreadMessages } = await supabase
      .from('message_recipients')
      .select('id')
      .eq('recipient_id', user.id)
      .eq('tenant_id', tenantId)
      .eq('is_read', false);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats: MessageStats = {
      total_messages: messages?.length || 0,
      unread_messages: unreadMessages?.length || 0,
      by_type: {
        notification: messages?.filter(m => m.type === 'notification').length || 0,
        message: messages?.filter(m => m.type === 'message').length || 0,
        announcement: messages?.filter(m => m.type === 'announcement').length || 0,
        alert: messages?.filter(m => m.type === 'alert').length || 0,
      },
      by_priority: {
        low: messages?.filter(m => m.priority === 'low').length || 0,
        normal: messages?.filter(m => m.priority === 'normal').length || 0,
        high: messages?.filter(m => m.priority === 'high').length || 0,
        urgent: messages?.filter(m => m.priority === 'urgent').length || 0,
      },
      recent_activity: {
        today: messages?.filter(m => new Date(m.created_at) >= today).length || 0,
        this_week: messages?.filter(m => new Date(m.created_at) >= thisWeek).length || 0,
        this_month: messages?.filter(m => new Date(m.created_at) >= thisMonth).length || 0,
      }
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { data: null, error: 'Erro interno do servidor' };
  }
}

export async function getNotificationSummary(): Promise<{ data: NotificationSummary | null; error: string | null }> {
  try {
    const { user, tenantId } = await getCurrentTenantId();
    const supabase = await createClient();

    // Buscar mensagens não lidas
    const { data: unreadData, error: queryError } = await supabase
      .from('message_recipients')
      .select(`
        message:message_id(
          id,
          type,
          title,
          content,
          priority,
          created_at,
          sender_id
        )
      `)
      .eq('recipient_id', user.id)
      .eq('tenant_id', tenantId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (queryError) {
      console.error('Erro na query de notificações:', queryError);
      return { data: null, error: queryError.message };
    }

    const unreadMessages = unreadData?.map(item => item.message).filter(Boolean) || [];
    const urgentMessages = unreadMessages.filter(m => m && m.priority === 'urgent');

    const summary: NotificationSummary = {
      unread_count: unreadMessages.length,
      urgent_count: urgentMessages.length,
      recent_messages: unreadMessages.slice(0, 5)
    };

    return { data: summary, error: null };
  } catch (error) {
    console.error('Erro ao buscar resumo de notificações:', error);
    return { data: null, error: 'Erro interno do servidor' };
  }
}
