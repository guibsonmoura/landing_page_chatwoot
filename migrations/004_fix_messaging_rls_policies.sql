-- Migração para corrigir políticas RLS do sistema de mensageria
-- Substitui referências a tenant_users por tenants.user_id

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view messages from their tenant" ON messages;
DROP POLICY IF EXISTS "Users can create messages for their tenant" ON messages;
DROP POLICY IF EXISTS "Users can update messages from their tenant" ON messages;
DROP POLICY IF EXISTS "Users can view message recipients from their tenant" ON message_recipients;
DROP POLICY IF EXISTS "Users can create message recipients for their tenant" ON message_recipients;
DROP POLICY IF EXISTS "Users can update message recipients from their tenant" ON message_recipients;
DROP POLICY IF EXISTS "Users can view message templates from their tenant" ON message_templates;
DROP POLICY IF EXISTS "Users can create message templates for their tenant" ON message_templates;
DROP POLICY IF EXISTS "Users can update message templates from their tenant" ON message_templates;

-- Políticas RLS corrigidas para messages
CREATE POLICY "Users can view messages from their tenant" ON messages
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages for their tenant" ON messages
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages from their tenant" ON messages
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE user_id = auth.uid()
        )
    );

-- Políticas RLS corrigidas para message_recipients
CREATE POLICY "Users can view message recipients from their tenant" ON message_recipients
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create message recipients for their tenant" ON message_recipients
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update message recipients from their tenant" ON message_recipients
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE user_id = auth.uid()
        )
    );

-- Políticas RLS corrigidas para message_templates
CREATE POLICY "Users can view message templates from their tenant" ON message_templates
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create message templates for their tenant" ON message_templates
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update message templates from their tenant" ON message_templates
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants 
            WHERE user_id = auth.uid()
        )
    );

-- Inserir dados de teste corrigidos para o usuário frmilani@gmail.com
-- Primeiro, vamos buscar o tenant_id correto e inserir mensagens de teste

DO $$
DECLARE
    user_uuid UUID;
    tenant_uuid UUID;
    message_uuid UUID;
    template_uuid UUID;
BEGIN
    -- Buscar o UUID do usuário frmilani@gmail.com
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'frmilani@gmail.com';
    
    IF user_uuid IS NULL THEN
        RAISE NOTICE 'Usuário frmilani@gmail.com não encontrado';
        RETURN;
    END IF;
    
    -- Buscar o tenant_id do usuário
    SELECT id INTO tenant_uuid 
    FROM tenants 
    WHERE user_id = user_uuid;
    
    IF tenant_uuid IS NULL THEN
        RAISE NOTICE 'Tenant não encontrado para o usuário frmilani@gmail.com';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuário UUID: %, Tenant UUID: %', user_uuid, tenant_uuid;
    
    -- Limpar dados de teste antigos se existirem
    DELETE FROM message_recipients WHERE tenant_id = tenant_uuid;
    DELETE FROM messages WHERE tenant_id = tenant_uuid;
    DELETE FROM message_templates WHERE tenant_id = tenant_uuid;
    
    -- Inserir templates de mensagem
    INSERT INTO message_templates (id, tenant_id, name, type, scope, title, content, priority, metadata, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), tenant_uuid, 'Boas-vindas', 'notification', 'individual', 'Bem-vindo ao Nexus Agents!', 'Seja bem-vindo à plataforma Nexus Agents. Estamos aqui para ajudá-lo a criar agentes de IA incríveis!', 'normal', '{"category": "onboarding"}', NOW(), NOW()),
        (gen_random_uuid(), tenant_uuid, 'Manutenção', 'announcement', 'broadcast', 'Manutenção Programada', 'Informamos que haverá uma manutenção programada no sistema no dia {{date}} às {{time}}.', 'high', '{"category": "maintenance"}', NOW(), NOW()),
        (gen_random_uuid(), tenant_uuid, 'Alerta Urgente', 'alert', 'broadcast', 'Ação Necessária', 'Detectamos uma atividade que requer sua atenção imediata. Por favor, verifique sua conta.', 'urgent', '{"category": "security"}', NOW(), NOW());
    
    -- Inserir mensagens de teste
    INSERT INTO messages (id, tenant_id, sender_id, type, scope, title, content, priority, status, scheduled_for, expires_at, metadata, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), tenant_uuid, user_uuid, 'notification', 'individual', 'Bem-vindo ao Sistema!', 'Sua conta foi criada com sucesso. Explore todas as funcionalidades disponíveis.', 'normal', 'active', NULL, NULL, '{"category": "welcome"}', NOW() - INTERVAL '1 hour', NOW()),
        (gen_random_uuid(), tenant_uuid, user_uuid, 'announcement', 'broadcast', 'Nova Funcionalidade Disponível', 'Acabamos de lançar o sistema de mensagens interno! Agora você pode receber notificações importantes diretamente no painel.', 'high', 'active', NULL, NULL, '{"category": "feature", "version": "1.0"}', NOW() - INTERVAL '30 minutes', NOW()),
        (gen_random_uuid(), tenant_uuid, user_uuid, 'alert', 'individual', 'Ação Necessária - Urgente', 'Por favor, verifique as configurações de segurança da sua conta. Detectamos uma tentativa de acesso suspeita.', 'urgent', 'active', NULL, NULL, '{"category": "security", "ip": "192.168.1.100"}', NOW() - INTERVAL '15 minutes', NOW()),
        (gen_random_uuid(), tenant_uuid, user_uuid, 'message', 'individual', 'Atualização do Sistema', 'O sistema foi atualizado com melhorias de performance e novas funcionalidades.', 'normal', 'active', NULL, NULL, '{"category": "update", "version": "2.1.0"}', NOW() - INTERVAL '5 minutes', NOW());
    
    -- Inserir destinatários para as mensagens (todas para o próprio usuário)
    INSERT INTO message_recipients (id, message_id, recipient_id, tenant_id, is_read, is_acknowledged, read_at, acknowledged_at, created_at, updated_at)
    SELECT 
        gen_random_uuid(),
        m.id,
        user_uuid,
        tenant_uuid,
        CASE WHEN m.priority = 'urgent' THEN false ELSE (random() > 0.5) END, -- Mensagens urgentes sempre não lidas
        false,
        CASE WHEN (random() > 0.5) AND m.priority != 'urgent' THEN NOW() - INTERVAL '10 minutes' ELSE NULL END,
        NULL,
        NOW(),
        NOW()
    FROM messages m 
    WHERE m.tenant_id = tenant_uuid;
    
    RAISE NOTICE 'Dados de teste inseridos com sucesso!';
END $$;
