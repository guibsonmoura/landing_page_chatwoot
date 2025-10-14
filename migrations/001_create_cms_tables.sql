-- Migration: Create CMS Tables for Dynamic Content Management
-- Description: Tables to manage landing page content dynamically

-- Tabela para páginas do CMS
CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  meta_title VARCHAR(200),
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para componentes/seções das páginas
CREATE TABLE IF NOT EXISTS cms_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  component_type VARCHAR(50) NOT NULL, -- 'hero', 'features', 'pricing', 'testimonials', etc.
  component_key VARCHAR(100) NOT NULL, -- identificador único do componente
  title VARCHAR(200),
  subtitle TEXT,
  content JSONB, -- conteúdo flexível em JSON
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, component_key)
);

-- Tabela para configurações globais do site
CREATE TABLE IF NOT EXISTS cms_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cms_components_page_id ON cms_components(page_id);
CREATE INDEX IF NOT EXISTS idx_cms_components_type ON cms_components(component_type);
CREATE INDEX IF NOT EXISTS idx_cms_components_order ON cms_components(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_settings_key ON cms_settings(setting_key);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_cms_pages_updated_at ON cms_pages;
CREATE TRIGGER update_cms_pages_updated_at 
  BEFORE UPDATE ON cms_pages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_components_updated_at ON cms_components;
CREATE TRIGGER update_cms_components_updated_at 
  BEFORE UPDATE ON cms_components 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_settings_updated_at ON cms_settings;
CREATE TRIGGER update_cms_settings_updated_at 
  BEFORE UPDATE ON cms_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais para a landing page
INSERT INTO cms_pages (slug, title, description, meta_title, meta_description) 
VALUES (
  'home',
  'Nexus Agents - Landing Page',
  'Página inicial do Nexus Agents com seções dinâmicas',
  'Nexus Agents - Agentes de IA Inteligentes',
  'Crie agentes de IA especializados com base de conhecimento personalizada. Setup em 5 minutos, RAG inteligente, ativo 24/7.'
) ON CONFLICT (slug) DO NOTHING;

-- Inserir componentes iniciais da landing page
WITH home_page AS (
  SELECT id FROM cms_pages WHERE slug = 'home'
)
INSERT INTO cms_components (page_id, component_type, component_key, title, subtitle, content, display_order) 
SELECT 
  home_page.id,
  component_type,
  component_key,
  title,
  subtitle,
  content::jsonb,
  display_order
FROM home_page, (
  VALUES 
    ('hero', 'hero_section', 'Crie agentes de IA inteligentes com', 'Nexus Agents', '{"description": "Transforme seu atendimento com agentes de IA especializados que aprendem com sua base de conhecimento e se adaptam ao seu negócio.", "cta_primary": "Começar Grátis", "cta_secondary": "Ver Demo", "stats": [{"value": "5 min", "label": "Setup em 5 min"}, {"value": "RAG", "label": "RAG Inteligente"}, {"value": "24/7", "label": "24/7 Ativo"}]}', 1),
    
    ('features', 'features_section', 'Recursos Poderosos', 'Tudo que você precisa para criar agentes excepcionais', '{"features": [{"title": "Gerador de Alma", "description": "Crie agentes com personalidades únicas através do nosso wizard inteligente", "benefits": ["Personalidade customizada", "Fluxos de conversação", "Adaptação ao negócio"]}, {"title": "RAG por Agente", "description": "Base de conhecimento individual para cada agente com busca semântica avançada", "benefits": ["Documentos especializados", "Busca inteligente", "Respostas precisas"]}, {"title": "Deploy Multi-Canal", "description": "Conecte seus agentes em WhatsApp, Instagram, site e outros canais", "benefits": ["Múltiplas plataformas", "Integração fácil", "Gestão centralizada"]}, {"title": "Perfis de Cliente", "description": "Sistema avançado de CRM com histórico e preferências de cada cliente", "benefits": ["Histórico completo", "Preferências salvas", "Atendimento personalizado"]}, {"title": "Multi-Tenant Seguro", "description": "Arquitetura isolada com Row Level Security para máxima proteção de dados", "benefits": ["Dados isolados", "Segurança avançada", "Compliance garantido"]}]}', 2),
    
    ('how_it_works', 'how_it_works_section', 'Como Funciona', 'Processo simples em 3 etapas', '{"steps": [{"title": "1. Crie seu Agente", "description": "Use nosso wizard para definir personalidade e objetivos", "details": ["Escolha o tipo de agente", "Defina personalidade", "Configure objetivos"]}, {"title": "2. Adicione Conhecimento", "description": "Faça upload dos documentos e materiais do seu negócio", "details": ["Upload de documentos", "Processamento automático", "Indexação inteligente"]}, {"title": "3. Conecte e Publique", "description": "Integre com WhatsApp, site ou outros canais", "details": ["Escolha os canais", "Configure integrações", "Publique e monitore"]}]}', 3),
    
    ('testimonials', 'testimonials_section', 'O que nossos clientes dizem', 'Empresas que já transformaram seu atendimento', '{"testimonials": [{"name": "Maria Silva", "role": "CEO", "company": "TechCorp", "content": "O Nexus Agents revolucionou nosso atendimento. Reduzimos 80% do tempo de resposta.", "rating": 5}, {"name": "João Santos", "role": "Gerente de Vendas", "company": "VendaMax", "content": "Nossos agentes de IA vendem 24/7. Aumentamos as conversões em 150%.", "rating": 5}, {"name": "Ana Costa", "role": "Diretora de Marketing", "company": "MarketPro", "content": "A personalização dos agentes é incrível. Cada cliente tem uma experiência única.", "rating": 5}], "stats": {"rating": "4.9", "total_reviews": "500+"}}', 4),
    
    ('pricing', 'pricing_section', 'Planos Flexíveis', 'Escolha o plano ideal para seu negócio', '{"plans": [{"name": "Básico", "price": "R$99", "period": "/mês", "description": "Ideal para pequenas empresas iniciando com IA", "features": ["2 agentes de IA", "Integração com WhatsApp", "Base de conhecimento RAG (5 documentos)", "Histórico de conversas (30 dias)", "Suporte por email"], "cta": "Começar Grátis", "popular": false}, {"name": "Pro", "price": "R$299", "period": "/mês", "description": "Para empresas em crescimento que precisam de mais recursos", "features": ["5 agentes de IA", "Integração com WhatsApp e Instagram", "Base de conhecimento RAG (20 documentos)", "Histórico de conversas (90 dias)", "Perfis de clientes", "Análise de desempenho", "Suporte prioritário"], "cta": "Escolher Pro", "popular": true}, {"name": "Enterprise", "price": "R$999", "period": "/mês", "description": "Solução completa para grandes empresas", "features": ["Agentes ilimitados", "Todos os canais disponíveis", "Base de conhecimento RAG ilimitada", "Histórico de conversas ilimitado", "Perfis de clientes avançados", "Análise de desempenho detalhada", "Suporte dedicado 24/7", "API personalizada", "Treinamento da equipe"], "cta": "Falar com Vendas", "popular": false}]}', 5)
) AS initial_data(component_type, component_key, title, subtitle, content, display_order)
ON CONFLICT (page_id, component_key) DO NOTHING;

-- Inserir configurações globais
INSERT INTO cms_settings (setting_key, setting_value, description) 
VALUES 
  ('site_name', '"Nexus Agents"', 'Nome do site'),
  ('site_description', '"Crie agentes de IA especializados com base de conhecimento personalizada"', 'Descrição do site'),
  ('contact_email', '"contato@nexusagents.com"', 'Email de contato'),
  ('social_links', '{"linkedin": "https://linkedin.com/company/nexusagents", "twitter": "https://twitter.com/nexusagents", "github": "https://github.com/nexusagents"}', 'Links das redes sociais'),
  ('theme_colors', '{"primary": "#00e980", "secondary": "#4d7cfe", "accent": "#e34ba9"}', 'Cores do tema')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- Comentários para documentação
COMMENT ON TABLE cms_pages IS 'Páginas gerenciáveis pelo CMS';
COMMENT ON TABLE cms_components IS 'Componentes/seções das páginas com conteúdo flexível em JSON';
COMMENT ON TABLE cms_settings IS 'Configurações globais do site';
COMMENT ON COLUMN cms_components.content IS 'Conteúdo flexível em formato JSON para diferentes tipos de componentes';
