# Plano de Lançamento BETA - Nexus Agents
## Docker + Portainer Deployment Guide

---

## 📋 **Índice**

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Arquitetura de Deploy](#arquitetura-de-deploy)
4. [Fase 1: Preparação da Infraestrutura](#fase-1-preparação-da-infraestrutura)
5. [Fase 2: Dockerização da Aplicação](#fase-2-dockerização-da-aplicação)
6. [Fase 3: Configuração do Portainer](#fase-3-configuração-do-portainer)
7. [Fase 4: Deploy e Validação](#fase-4-deploy-e-validação)
8. [Fase 5: Configuração de Domínio e HTTPS](#fase-5-configuração-de-domínio-e-https)
9. [Checklist de Segurança](#checklist-de-segurança)
10. [Monitoramento e Rollback](#monitoramento-e-rollback)
11. [Documentação para Equipe](#documentação-para-equipe)

---

## 🎯 **Visão Geral**

### **Objetivo:**
Lançar o Nexus Agents em ambiente BETA externo usando Docker e Portainer para facilitar o gerenciamento e deploy contínuo.

### **Status Atual:**
- ✅ **Aplicação funcionando** localmente
- ✅ **Auditoria de segurança** concluída (SEC-001 a SEC-004)
- ✅ **Sistema de logs** seguro implementado
- ✅ **Sanitização** de dados sensíveis ativa
- ✅ **RLS e isolamento** multi-tenant validados

### **Arquitetura Alvo:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Servidor Cloud/VPS                       │
├─────────────────────────────────────────────────────────────┤
│  Docker Engine + Portainer                                 │
│  ├── Container: Nexus Agents Frontend (Next.js)            │
│  ├── Container: Nginx Proxy (HTTPS/SSL)                    │
│  └── Volumes: Logs, Configs, SSL Certificates             │
│                                                             │
│  Conexões Externas:                                        │
│  ├── Supabase (Database + Auth + Storage)                  │
│  ├── OpenAI API                                            │
│  └── WhatsApp Business API                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Pré-requisitos**

### **Servidor/Infraestrutura:**
- [ ] **VPS/Cloud Server** (mínimo 2GB RAM, 2 vCPUs, 20GB SSD)
  - Recomendado: DigitalOcean, AWS EC2, Google Cloud, ou Hetzner
  - Sistema: Ubuntu 22.04 LTS ou Debian 12
- [ ] **Domínio próprio** para o app (ex: `beta.nexusagents.com`)
- [ ] **Acesso root/sudo** ao servidor
- [ ] **Firewall configurado** (portas 80, 443, 9000 para Portainer)

### **Contas e Serviços:**
- [ ] **Supabase Project** configurado para produção
- [ ] **OpenAI API Key** com limites apropriados
- [ ] **WhatsApp Business API** configurado
- [ ] **Certificado SSL** (Let's Encrypt gratuito)

---

## 🏗️ **Arquitetura de Deploy**

### **Containers Principais:**

#### **1. Frontend Container (Next.js)**
```dockerfile
# Baseado em Node.js 20 Alpine
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### **2. Nginx Proxy Container**
```yaml
# Para HTTPS e proxy reverso
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./ssl:/etc/ssl/certs
```

#### **3. Portainer Stack**
```yaml
version: '3.8'
services:
  nexus-frontend:
    build: .
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=error
    ports:
      - "3000:3000"
    restart: unless-stopped
    
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - nexus-frontend
    restart: unless-stopped
```

---

## 📦 **Fase 1: Preparação da Infraestrutura**

### **1.1 Provisionar Servidor**

#### **Opção A: DigitalOcean (Recomendado para BETA)**
```bash
# Criar Droplet via CLI ou interface web
# Especificações mínimas:
# - 2GB RAM / 2 vCPUs / 50GB SSD
# - Ubuntu 22.04 LTS
# - Região mais próxima dos usuários
```

#### **Opção B: AWS EC2**
```bash
# t3.small ou t3.medium
# Ubuntu 22.04 LTS AMI
# Security Group: 22, 80, 443, 9000
```

### **1.2 Configuração Inicial do Servidor**

```bash
# Conectar via SSH
ssh root@SEU_SERVIDOR_IP

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git ufw

# Configurar firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 9000  # Portainer
ufw --force enable

# Criar usuário não-root (opcional mas recomendado)
adduser deploy
usermod -aG sudo deploy
```

### **1.3 Instalar Docker**

```bash
# Script oficial Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Adicionar usuário ao grupo docker
usermod -aG docker $USER
newgrp docker

# Testar instalação
docker --version
docker run hello-world
```

### **1.4 Instalar Portainer**

```bash
# Criar volume para dados do Portainer
docker volume create portainer_data

# Instalar Portainer Community Edition
docker run -d -p 8000:8000 -p 9000:9000 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# Verificar se está rodando
docker ps
```

### **1.5 Configurar Acesso ao Portainer**

1. **Acessar:** `http://SEU_SERVIDOR_IP:9000`
2. **Criar conta admin** na primeira execução
3. **Conectar ao Docker local** (opção padrão)
4. **Configurar senha forte** e **2FA se disponível**

---

## 🐳 **Fase 2: Dockerização da Aplicação**

### **2.1 Criar Dockerfile**

```dockerfile
# Dockerfile para Nexus Agents Frontend
FROM node:20-alpine AS base

# Instalar dependências apenas quando necessário
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependências baseado no gerenciador de pacotes preferido
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild do código fonte apenas quando necessário
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desabilitar telemetria do Next.js durante build
ENV NEXT_TELEMETRY_DISABLED 1

# Configurar variáveis de build
ENV NODE_ENV production
ENV LOG_LEVEL error

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Imagem de produção, copiar todos os arquivos e executar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV LOG_LEVEL error
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Definir as permissões corretas para cache pré-renderizado
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar automaticamente arquivos de saída baseado na detecção de trace
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para executar a aplicação
CMD ["node", "server.js"]
```

### **2.2 Criar docker-compose.yml**

```yaml
version: '3.8'

services:
  nexus-frontend:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: nexus-agents-frontend
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=error
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - WEBHOOK_API_KEY=${WEBHOOK_API_KEY}
    ports:
      - "3000:3000"
    restart: unless-stopped
    networks:
      - nexus-network
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx-proxy:
    image: nginx:alpine
    container_name: nexus-nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - nexus-frontend
    restart: unless-stopped
    networks:
      - nexus-network

networks:
  nexus-network:
    driver: bridge

volumes:
  logs:
  ssl-certs:
```

### **2.3 Criar .dockerignore**

```dockerignore
# Dependências
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Arquivos de desenvolvimento
.next
.env*.local
.env.development
.env.test

# Arquivos de sistema
.DS_Store
*.tsbuildinfo
next-env.d.ts

# Logs
logs
*.log

# Arquivos de IDE
.vscode
.idea
*.swp
*.swo

# Git
.git
.gitignore
README.md

# Docker
Dockerfile*
docker-compose*
.dockerignore

# Documentação
docs/
*.md
```

### **2.4 Configurar next.config.js para Docker**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar output standalone para Docker
  output: 'standalone',
  
  // Configurações de produção
  poweredByHeader: false,
  compress: true,
  
  // Configurações de imagem
  images: {
    domains: ['supabase.co', 'your-supabase-project.supabase.co'],
    unoptimized: false,
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configurações experimentais
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
};

module.exports = nextConfig;
```

---

## ⚙️ **Fase 3: Configuração do Portainer**

### **3.1 Criar Stack no Portainer**

1. **Acessar Portainer:** `http://SEU_SERVIDOR_IP:9000`
2. **Navegar para:** Stacks → Add Stack
3. **Nome do Stack:** `nexus-agents-beta`
4. **Método:** Upload ou Git Repository

### **3.2 Configurar Variáveis de Ambiente**

```bash
# No Portainer, seção Environment Variables:

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# WhatsApp
WEBHOOK_API_KEY=your-webhook-key

# Configurações de produção
NODE_ENV=production
LOG_LEVEL=error
NEXT_TELEMETRY_DISABLED=1
```

### **3.3 Configurar Nginx**

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream nexus_frontend {
        server nexus-frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name beta.nexusagents.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name beta.nexusagents.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Proxy to Next.js app
        location / {
            proxy_pass http://nexus_frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://nexus_frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Login rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://nexus_frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files caching
        location /_next/static/ {
            proxy_pass http://nexus_frontend;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## 🚀 **Fase 4: Deploy e Validação**

### **4.1 Teste Local**

```bash
# No diretório do projeto
cd /path/to/nexus-agents/frontend

# Criar arquivo .env.production.local (NÃO commitar)
cp .env.local .env.production.local

# Testar build Docker localmente
docker compose build

# Testar execução
docker compose up -d

# Verificar logs
docker compose logs -f

# Testar endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000
```

### **4.2 Upload para Servidor**

#### **Opção A: Git Repository (Recomendado)**
```bash
# No servidor
git clone https://github.com/seu-usuario/nexus-agents.git
cd nexus-agents/frontend

# Configurar variáveis de ambiente via Portainer
# NÃO incluir .env no repositório
```

#### **Opção B: Upload Manual**
```bash
# Local
tar -czf nexus-agents.tar.gz --exclude=node_modules --exclude=.next .
scp nexus-agents.tar.gz user@servidor:/home/deploy/

# Servidor
cd /home/deploy
tar -xzf nexus-agents.tar.gz
```

### **4.3 Deploy via Portainer**

1. **Criar Stack:**
   - Nome: `nexus-agents-beta`
   - Método: Upload docker-compose.yml
   - Configurar todas as variáveis de ambiente

2. **Deploy:**
   - Clicar em "Deploy the stack"
   - Monitorar logs em tempo real
   - Verificar status dos containers

3. **Validação:**
   - Acessar `http://SEU_SERVIDOR_IP:3000`
   - Testar login e funcionalidades principais
   - Verificar logs de segurança

---

## 🌐 **Fase 5: Configuração de Domínio e HTTPS**

### **5.1 Configurar DNS**

```bash
# Registrar domínio (ex: beta.nexusagents.com)
# Configurar DNS A record:
# beta.nexusagents.com → SEU_SERVIDOR_IP
```

### **5.2 Obter Certificado SSL (Let's Encrypt)**

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Parar nginx temporariamente
docker compose stop nginx-proxy

# Obter certificado
certbot certonly --standalone -d beta.nexusagents.com

# Certificados ficam em: /etc/letsencrypt/live/beta.nexusagents.com/
```

### **5.3 Configurar Auto-renovação**

```bash
# Criar script de renovação
cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
docker compose -f /path/to/docker-compose.yml restart nginx-proxy
EOF

chmod +x /usr/local/bin/renew-ssl.sh

# Configurar cron para renovação automática
crontab -e
# Adicionar linha:
0 3 * * 0 /usr/local/bin/renew-ssl.sh
```

---

## 🔒 **Checklist de Segurança**

### **Pré-Deploy:**
- [ ] **Variáveis de ambiente** configuradas via Portainer (não no código)
- [ ] **LOG_LEVEL=error** em produção
- [ ] **Sistema de logs** sanitizado ativo
- [ ] **RLS policies** validadas no Supabase
- [ ] **API keys** com limites apropriados
- [ ] **Firewall** configurado (apenas portas necessárias)

### **Pós-Deploy:**
- [ ] **HTTPS** funcionando corretamente
- [ ] **Headers de segurança** presentes
- [ ] **Rate limiting** ativo
- [ ] **Logs** sendo gerados sem dados sensíveis
- [ ] **Backup** das configurações
- [ ] **Monitoramento** básico configurado

### **Validação de Endpoints:**
```bash
# Testar endpoints críticos
curl -I https://beta.nexusagents.com
curl -I https://beta.nexusagents.com/api/health
curl -I https://beta.nexusagents.com/login

# Verificar headers de segurança
curl -I https://beta.nexusagents.com | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"
```

---

## 📊 **Monitoramento e Rollback**

### **6.1 Monitoramento Básico**

```bash
# Script de monitoramento simples
cat > /usr/local/bin/monitor-nexus.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/nexus-monitor.log"
URL="https://beta.nexusagents.com/api/health"

if curl -f -s $URL > /dev/null; then
    echo "$(date): OK - Nexus Agents is running" >> $LOG_FILE
else
    echo "$(date): ERROR - Nexus Agents is down!" >> $LOG_FILE
    # Opcional: enviar notificação
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"🚨 Nexus Agents BETA está fora do ar!"}' \
    #   YOUR_SLACK_WEBHOOK_URL
fi
EOF

chmod +x /usr/local/bin/monitor-nexus.sh

# Executar a cada 5 minutos
crontab -e
# Adicionar:
*/5 * * * * /usr/local/bin/monitor-nexus.sh
```

### **6.2 Logs Centralizados**

```yaml
# Adicionar ao docker-compose.yml
services:
  nexus-frontend:
    # ... outras configurações
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### **6.3 Plano de Rollback**

```bash
# Criar backup antes do deploy
docker compose down
docker tag nexus-agents-frontend:latest nexus-agents-frontend:backup-$(date +%Y%m%d)

# Em caso de problemas, fazer rollback
docker compose down
docker tag nexus-agents-frontend:backup-YYYYMMDD nexus-agents-frontend:latest
docker compose up -d

# Verificar funcionamento
curl https://beta.nexusagents.com/api/health
```

---

## 📚 **Documentação para Equipe**

### **7.1 Acesso ao Ambiente**

```markdown
# Nexus Agents BETA - Informações de Acesso

## URLs:
- **Aplicação:** https://beta.nexusagents.com
- **Portainer:** http://SEU_SERVIDOR_IP:9000

## Credenciais:
- **Portainer Admin:** [definir senha segura]
- **Servidor SSH:** deploy@SEU_SERVIDOR_IP

## Comandos Úteis:
```bash
# Ver logs da aplicação
docker compose logs -f nexus-frontend

# Reiniciar aplicação
docker compose restart nexus-frontend

# Atualizar aplicação
git pull origin main
docker compose build
docker compose up -d
```

### **7.2 Procedimentos de Deploy**

1. **Deploy de Nova Versão:**
   ```bash
   # Fazer backup
   docker tag nexus-agents-frontend:latest nexus-agents-frontend:backup-$(date +%Y%m%d)
   
   # Atualizar código
   git pull origin main
   
   # Rebuild e deploy
   docker compose build
   docker compose up -d
   
   # Verificar funcionamento
   curl https://beta.nexusagents.com/api/health
   ```

2. **Rollback:**
   ```bash
   docker compose down
   docker tag nexus-agents-frontend:backup-YYYYMMDD nexus-agents-frontend:latest
   docker compose up -d
   ```

3. **Verificar Logs:**
   ```bash
   # Logs da aplicação
   docker compose logs -f nexus-frontend
   
   # Logs do Nginx
   docker compose logs -f nginx-proxy
   
   # Logs do sistema
   tail -f /var/log/nexus-monitor.log
   ```

---

## ✅ **Checklist Final de Lançamento**

### **Infraestrutura:**
- [ ] Servidor provisionado e configurado
- [ ] Docker e Portainer instalados
- [ ] Firewall configurado
- [ ] Domínio configurado com DNS

### **Aplicação:**
- [ ] Dockerfile criado e testado
- [ ] docker-compose.yml configurado
- [ ] Variáveis de ambiente configuradas no Portainer
- [ ] Build local testado com sucesso

### **Deploy:**
- [ ] Stack criado no Portainer
- [ ] Containers rodando sem erros
- [ ] Aplicação acessível via HTTP
- [ ] Logs funcionando corretamente

### **Segurança:**
- [ ] HTTPS configurado com Let's Encrypt
- [ ] Headers de segurança presentes
- [ ] Rate limiting ativo
- [ ] Logs sanitizados (sem dados sensíveis)
- [ ] Backup das configurações

### **Monitoramento:**
- [ ] Health check funcionando
- [ ] Monitoramento básico configurado
- [ ] Plano de rollback testado
- [ ] Documentação para equipe criada

### **Validação Final:**
- [ ] Login funcionando
- [ ] Funcionalidades principais testadas
- [ ] Performance aceitável
- [ ] Sem vazamentos de dados sensíveis nos logs
- [ ] Pronto para beta testers

---

## 🎯 **Próximos Passos Pós-BETA**

1. **Feedback dos Beta Testers**
2. **Otimizações de Performance**
3. **Monitoramento Avançado** (Grafana + Prometheus)
4. **CI/CD Pipeline** (GitHub Actions)
5. **Backup Automatizado**
6. **Scaling Horizontal** (Load Balancer)
7. **Lançamento Público**

---

**Documento criado em:** 08/01/2025  
**Versão:** 1.0.0  
**Autor:** Equipe Nexus Agents  
**Status:** Pronto para Implementação
