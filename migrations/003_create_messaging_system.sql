-- Migração para Sistema de Mensageria/Notificações
-- Criação das tabelas para mensagens internas e notificações

-- Tabela de mensagens/notificações
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Tipo de mensagem
    type VARCHAR(50) NOT NULL DEFAULT 'notification', -- 'notification', 'message', 'announcement', 'alert'
    
    -- Escopo da mensagem
    scope VARCHAR(50) NOT NULL DEFAULT 'individual', -- 'individual', 'broadcast', 'role_based'
    
    -- Conteúdo da mensagem
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    
    -- Prioridade
    priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'archived', 'deleted'
    
    -- Agendamento
    scheduled_for TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    CONSTRAINT valid_type CHECK (type IN ('notification', 'message', 'announcement', 'alert')),
    CONSTRAINT valid_scope CHECK (scope IN ('individual', 'broadcast', 'role_based')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'deleted'))
);

-- Tabela de destinatários de mensagens
CREATE TABLE IF NOT EXISTS message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Status de leitura
    read_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Status de interação
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint única para evitar duplicatas
    UNIQUE(message_id, recipient_id)
);

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Identificação do template
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    
    -- Conteúdo do template
    title_template VARCHAR(255) NOT NULL,
    content_template TEXT NOT NULL,
    
    -- Configurações
    default_priority VARCHAR(20) DEFAULT 'normal',
    default_type VARCHAR(50) DEFAULT 'notification',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_template_priority CHECK (default_priority IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT valid_template_type CHECK (default_type IN ('notification', 'message', 'announcement', 'alert'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_tenant_id ON messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_scope ON messages(scope);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_scheduled_for ON messages(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_message_recipients_message_id ON message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient_id ON message_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_tenant_id ON message_recipients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_read ON message_recipients(is_read);
CREATE INDEX IF NOT EXISTS idx_message_recipients_acknowledged ON message_recipients(is_acknowledged);

CREATE INDEX IF NOT EXISTS idx_message_templates_tenant_id ON message_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_recipients_updated_at BEFORE UPDATE ON message_recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) para isolamento de tenants
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para messages
CREATE POLICY "Users can view messages from their tenant" ON messages
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages for their tenant" ON messages
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages from their tenant" ON messages
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

-- Políticas RLS para message_recipients
CREATE POLICY "Users can view message recipients from their tenant" ON message_recipients
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create message recipients for their tenant" ON message_recipients
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update message recipients from their tenant" ON message_recipients
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

-- Políticas RLS para message_templates
CREATE POLICY "Users can view message templates from their tenant" ON message_templates
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create message templates for their tenant" ON message_templates
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update message templates from their tenant" ON message_templates
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid()
        )
    );

-- Comentários para documentação
COMMENT ON TABLE messages IS 'Tabela principal para armazenar mensagens e notificações do sistema';
COMMENT ON TABLE message_recipients IS 'Tabela para rastrear destinatários e status de leitura das mensagens';
COMMENT ON TABLE message_templates IS 'Tabela para armazenar templates reutilizáveis de mensagens';

COMMENT ON COLUMN messages.type IS 'Tipo da mensagem: notification, message, announcement, alert';
COMMENT ON COLUMN messages.scope IS 'Escopo da mensagem: individual, broadcast, role_based';
COMMENT ON COLUMN messages.priority IS 'Prioridade da mensagem: low, normal, high, urgent';
COMMENT ON COLUMN messages.metadata IS 'Dados adicionais em formato JSON para extensibilidade';
