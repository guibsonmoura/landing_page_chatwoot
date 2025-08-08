# Guia de Deploy BETA - Nexus Agents com Traefik + Portainer

---

## 🎯 **Visão Geral**

Este guia é otimizado para ambientes que já utilizam **Traefik** como proxy reverso, baseado no padrão de stack fornecido. Traefik oferece vantagens significativas sobre Nginx:

- ✅ **SSL automático** com Let's Encrypt
- ✅ **Service Discovery** automático via labels
- ✅ **Rate limiting** nativo
- ✅ **Headers de segurança** configuráveis
- ✅ **Health checks** integrados
- ✅ **Zero downtime** deployments

---

## 🏗️ **Arquitetura com Traefik**

```
┌─────────────────────────────────────────────────────────────┐
│                    Servidor Docker Swarm                    │
├─────────────────────────────────────────────────────────────┤
│  Traefik (Proxy Reverso + SSL)                             │
│  ├── Auto SSL (Let's Encrypt)                              │
│  ├── Service Discovery                                     │
│  └── Rate Limiting + Security Headers                      │
│                                                             │
│  Portainer (Gerenciamento)                                 │
│  └── Stack: Nexus Agents                                   │
│      ├── Container: Frontend (Next.js)                     │
│      └── Volume: Logs                                      │
│                                                             │
│  Network: network_public                                   │
│                                                             │
│  Conexões Externas:                                        │
│  ├── Supabase (Database + Auth + Storage)                  │
│  ├── OpenAI API                                            │
│  └── WhatsApp Business API                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 **Pré-requisitos**

### **Infraestrutura Existente:**
- [ ] **Docker Swarm** inicializado
- [ ] **Traefik** rodando com Let's Encrypt configurado
- [ ] **Portainer** instalado e funcionando
- [ ] **Network externa** `network_public` criada
- [ ] **Domínio** configurado (ex: `beta.nexusagents.com`)

### **Verificar Configuração Existente:**
```bash
# Verificar se o Swarm está ativo
docker info | grep Swarm

# Verificar se o Traefik está rodando
docker service ls | grep traefik

# Verificar network
docker network ls | grep network_public

# Verificar Portainer
curl -f http://localhost:9000 || echo "Portainer não acessível"
```

---

## 🚀 **Processo de Deploy**

### **Passo 1: Preparar a Imagem**

#### **1.1 Build Local (Teste)**
```bash
cd /path/to/nexus-agents/frontend

# Testar build localmente
docker build -t nexus-agents:test .

# Testar execução
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e LOG_LEVEL=error \
  nexus-agents:test

# Testar health check
curl http://localhost:3000/api/health
```

#### **1.2 Build para Produção**
```bash
# Build com tag de produção
docker build -t nexus-agents:latest .

# Opcional: Salvar imagem para transfer
docker save nexus-agents:latest | gzip > nexus-agents.tar.gz

# No servidor (se necessário)
gunzip -c nexus-agents.tar.gz | docker load
```

### **Passo 2: Criar Volumes Externos**

```bash
# Criar volume para logs (se não existir)
docker volume create nexus_logs

# Verificar volumes
docker volume ls | grep nexus
```

### **Passo 3: Deploy via Portainer**

#### **3.1 Acessar Portainer**
1. Navegar para `http://SEU_SERVIDOR:9000`
2. Ir em **Stacks** → **Add Stack**
3. Nome: `nexus-agents-beta`

#### **3.2 Configurar Stack**
Usar o arquivo `portainer-stack.yml` e configurar as variáveis:

```yaml
# Environment Variables no Portainer:
DOMAIN=beta.nexusagents.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
WHATSAPP_WEBHOOK_API_KEY=your-webhook-key
```

#### **3.3 Deploy**
1. Colar o conteúdo do `portainer-stack.yml`
2. Substituir `{{VARIAVEL}}` pelas variáveis de ambiente
3. Clicar em **Deploy the stack**
4. Monitorar logs em tempo real

---

## 🔧 **Configuração Avançada do Traefik**

### **Labels Explicadas:**

```yaml
# Habilitar Traefik para este serviço
- traefik.enable=true

# Roteamento principal (HTTPS)
- traefik.http.routers.nexus_frontend.rule=Host(`beta.nexusagents.com`)
- traefik.http.routers.nexus_frontend.entrypoints=websecure
- traefik.http.routers.nexus_frontend.tls.certresolver=le

# Configuração do serviço
- traefik.http.services.nexus_frontend.loadbalancer.server.port=3000
- traefik.http.services.nexus_frontend.loadbalancer.passHostHeader=true

# Health check automático
- traefik.http.services.nexus_frontend.loadbalancer.healthcheck.path=/api/health
- traefik.http.services.nexus_frontend.loadbalancer.healthcheck.interval=30s
```

### **Middlewares de Segurança:**

```yaml
# Headers de segurança
- traefik.http.middlewares.nexus-security.headers.frameDeny=true
- traefik.http.middlewares.nexus-security.headers.contentTypeNosniff=true
- traefik.http.middlewares.nexus-security.headers.browserXssFilter=true
- traefik.http.middlewares.nexus-security.headers.stsSeconds=31536000

# Rate limiting diferenciado
- traefik.http.middlewares.nexus-api-ratelimit.ratelimit.average=10  # APIs
- traefik.http.middlewares.nexus-general-ratelimit.ratelimit.average=50  # Geral
```

### **Roteamento Avançado:**

```yaml
# Rotas de API com rate limiting específico
- traefik.http.routers.nexus_api.rule=Host(`beta.nexusagents.com`) && PathPrefix(`/api`)
- traefik.http.routers.nexus_api.middlewares=nexus-security@docker,nexus-api-ratelimit@docker
- traefik.http.routers.nexus_api.priority=100

# Rotas gerais com rate limiting mais permissivo
- traefik.http.routers.nexus_frontend.middlewares=nexus-security@docker,nexus-general-ratelimit@docker
- traefik.http.routers.nexus_frontend.priority=50
```

---

## 🔒 **Configurações de Segurança**

### **Headers de Segurança Automáticos:**
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: max-age=31536000
- **Referrer-Policy**: strict-origin-when-cross-origin

### **Rate Limiting:**
- **APIs**: 10 req/s (burst 20)
- **Geral**: 50 req/s (burst 100)
- **Automático** por IP

### **SSL/TLS:**
- **Let's Encrypt** automático
- **HTTPS** obrigatório (redirect automático)
- **HSTS** habilitado

---

## 📊 **Monitoramento e Validação**

### **Verificar Deploy:**

```bash
# Status do serviço
docker service ls | grep nexus

# Logs do serviço
docker service logs nexus-agents-beta_nexus-frontend -f

# Verificar health check
curl -f https://beta.nexusagents.com/api/health

# Testar endpoints principais
curl -I https://beta.nexusagents.com
curl -I https://beta.nexusagents.com/login
```

### **Verificar Traefik:**

```bash
# Dashboard do Traefik (se habilitado)
curl https://traefik.seudominio.com/dashboard/

# Verificar rotas registradas
docker exec traefik_container traefik version
```

### **Verificar Headers de Segurança:**

```bash
# Testar headers
curl -I https://beta.nexusagents.com | grep -E "(X-Frame-Options|Strict-Transport-Security|X-Content-Type-Options)"

# Testar redirect HTTP → HTTPS
curl -I http://beta.nexusagents.com
```

---

## 🔄 **Atualizações e Rollback**

### **Atualizar Aplicação:**

```bash
# 1. Build nova versão
docker build -t nexus-agents:v1.1.0 .
docker tag nexus-agents:v1.1.0 nexus-agents:latest

# 2. Atualizar via Portainer
# - Ir no stack
# - Clicar em "Update the stack"
# - Confirmar

# 3. Verificar deploy
docker service ls | grep nexus
curl -f https://beta.nexusagents.com/api/health
```

### **Rollback:**

```bash
# 1. Voltar para versão anterior
docker tag nexus-agents:v1.0.0 nexus-agents:latest

# 2. Forçar update do serviço
docker service update --force nexus-agents-beta_nexus-frontend

# 3. Verificar
curl -f https://beta.nexusagents.com/api/health
```

### **Zero Downtime Update:**

O Traefik + Docker Swarm oferece zero downtime automaticamente:
- **Health checks** garantem que apenas containers saudáveis recebem tráfego
- **Rolling updates** substituem containers gradualmente
- **Service discovery** atualiza rotas automaticamente

---

## 🚨 **Troubleshooting**

### **Problemas Comuns:**

#### **1. Serviço não aparece no Traefik**
```bash
# Verificar labels
docker service inspect nexus-agents-beta_nexus-frontend | grep -A 20 Labels

# Verificar network
docker service inspect nexus-agents-beta_nexus-frontend | grep -A 5 Networks

# Verificar se está na network correta
docker network inspect network_public
```

#### **2. SSL não funciona**
```bash
# Verificar certificados Let's Encrypt
docker exec traefik_container ls -la /data/acme.json

# Verificar logs do Traefik
docker service logs traefik_service | grep -i certificate
```

#### **3. Health check falha**
```bash
# Testar health check diretamente
docker exec nexus_container wget --spider http://localhost:3000/api/health

# Verificar logs da aplicação
docker service logs nexus-agents-beta_nexus-frontend
```

#### **4. Rate limiting muito restritivo**
```bash
# Ajustar middlewares via labels:
- traefik.http.middlewares.nexus-api-ratelimit.ratelimit.average=20
- traefik.http.middlewares.nexus-general-ratelimit.ratelimit.average=100
```

---

## ✅ **Checklist de Deploy**

### **Pré-Deploy:**
- [ ] Traefik funcionando com Let's Encrypt
- [ ] Network `network_public` criada
- [ ] Domínio DNS configurado
- [ ] Variáveis de ambiente definidas
- [ ] Build da aplicação testado localmente

### **Deploy:**
- [ ] Stack criado no Portainer
- [ ] Serviço rodando sem erros
- [ ] Health check passando
- [ ] HTTPS funcionando automaticamente
- [ ] Headers de segurança presentes

### **Pós-Deploy:**
- [ ] Rate limiting testado
- [ ] Logs sendo gerados corretamente
- [ ] Funcionalidades principais testadas
- [ ] Backup da configuração realizado
- [ ] Documentação atualizada

---

## 🎯 **Vantagens do Traefik vs Nginx**

| Aspecto | Traefik | Nginx |
|---------|---------|-------|
| **SSL Automático** | ✅ Let's Encrypt nativo | ❌ Configuração manual |
| **Service Discovery** | ✅ Via labels Docker | ❌ Configuração estática |
| **Zero Downtime** | ✅ Automático | ⚠️ Requer configuração |
| **Rate Limiting** | ✅ Nativo via middlewares | ⚠️ Módulos adicionais |
| **Health Checks** | ✅ Integrado | ❌ Configuração manual |
| **Dashboard** | ✅ Interface web | ❌ Apenas logs |
| **Configuração** | ✅ Via labels (código) | ❌ Arquivos separados |

---

## 📚 **Próximos Passos**

1. **Monitoramento Avançado**: Integrar com Prometheus/Grafana
2. **Backup Automático**: Scripts para backup de configurações
3. **CI/CD**: Pipeline automático de deploy
4. **Scaling**: Configurar múltiplas réplicas
5. **Staging Environment**: Ambiente de testes separado

---

**Documento criado em:** 08/01/2025  
**Versão:** 1.0.0 (Traefik-optimized)  
**Autor:** Equipe Nexus Agents  
**Status:** Pronto para Deploy com Traefik
