import { createClient } from '@/lib/supabase/server';

// Função para inserir dados de teste de mensagens
export async function insertTestMessages() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    // Buscar tenant do usuário
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!tenant) {
      return { error: 'Tenant não encontrado' };
    }

    console.log('Inserindo dados de teste para:', user.email, 'Tenant:', tenant.id);

    // Limpar dados antigos
    await supabase.from('message_recipients').delete().eq('tenant_id', tenant.id);
    await supabase.from('messages').delete().eq('tenant_id', tenant.id);

    // Inserir mensagens de teste
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .insert([
        {
          tenant_id: tenant.id,
          sender_id: user.id,
          type: 'notification',
          scope: 'individual',
          title: 'Bem-vindo ao Sistema!',
          content: 'Sua conta foi criada com sucesso. Explore todas as funcionalidades disponíveis.',
          priority: 'normal',
          status: 'active',
          metadata: { category: 'welcome' }
        },
        {
          tenant_id: tenant.id,
          sender_id: user.id,
          type: 'announcement',
          scope: 'broadcast',
          title: 'Nova Funcionalidade Disponível',
          content: 'Acabamos de lançar o sistema de mensagens interno! Agora você pode receber notificações importantes diretamente no painel.',
          priority: 'high',
          status: 'active',
          metadata: { category: 'feature', version: '1.0' }
        },
        {
          tenant_id: tenant.id,
          sender_id: user.id,
          type: 'alert',
          scope: 'individual',
          title: 'Ação Necessária - Urgente',
          content: 'Por favor, verifique as configurações de segurança da sua conta. Detectamos uma atividade suspeita.',
          priority: 'urgent',
          status: 'active',
          metadata: { category: 'security', ip: '192.168.1.100' }
        },
        {
          tenant_id: tenant.id,
          sender_id: user.id,
          type: 'message',
          scope: 'individual',
          title: 'Atualização do Sistema',
          content: 'O sistema foi atualizado com melhorias de performance e novas funcionalidades.',
          priority: 'normal',
          status: 'active',
          metadata: { category: 'update', version: '2.1.0' }
        }
      ])
      .select();

    if (messagesError) {
      console.error('Erro ao inserir mensagens:', messagesError);
      return { error: messagesError.message };
    }

    console.log('Mensagens inseridas:', messages?.length);

    // Inserir destinatários para todas as mensagens
    const recipients = messages?.map(message => ({
      message_id: message.id,
      recipient_id: user.id,
      tenant_id: tenant.id,
      is_read: message.priority === 'urgent' ? false : Math.random() > 0.5, // Urgentes sempre não lidas
      is_acknowledged: false
    })) || [];

    const { error: recipientsError } = await supabase
      .from('message_recipients')
      .insert(recipients);

    if (recipientsError) {
      console.error('Erro ao inserir destinatários:', recipientsError);
      return { error: recipientsError.message };
    }

    console.log('Destinatários inseridos:', recipients.length);

    return { 
      success: true, 
      data: { 
        messages: messages?.length || 0, 
        recipients: recipients.length 
      } 
    };
  } catch (error) {
    console.error('Erro ao inserir dados de teste:', error);
    return { error: 'Erro interno do servidor' };
  }
}

// Função para verificar dados existentes
export async function checkExistingMessages() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    // Buscar tenant do usuário
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!tenant) {
      return { error: 'Tenant não encontrado' };
    }

    // Contar mensagens
    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id);

    // Contar destinatários
    const { count: recipientsCount } = await supabase
      .from('message_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id);

    // Contar não lidas
    const { count: unreadCount } = await supabase
      .from('message_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    return {
      success: true,
      data: {
        user_email: user.email,
        tenant_id: tenant.id,
        messages_count: messagesCount || 0,
        recipients_count: recipientsCount || 0,
        unread_count: unreadCount || 0
      }
    };
  } catch (error) {
    console.error('Erro ao verificar dados:', error);
    return { error: 'Erro interno do servidor' };
  }
}
