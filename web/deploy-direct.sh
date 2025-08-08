#!/bin/bash
# Script de Deploy Direto - Nexus Agents BETA
# Para auto-hospedagem sem Docker

echo "🚀 Iniciando deploy direto do Nexus Agents BETA..."

# 1. Build local
echo "📦 Fazendo build da aplicação..."
npm run build

# 2. Instalar PM2 (se não tiver)
echo "⚙️ Verificando PM2..."
npm install -g pm2 || echo "PM2 já instalado"

# 3. Configurar variáveis de ambiente
echo "🔧 Configurando variáveis de ambiente..."
cp .env.local.example .env.production
echo "⚠️  EDITE o arquivo .env.production com suas credenciais!"

# 4. Iniciar aplicação com PM2
echo "🎯 Iniciando aplicação..."
pm2 start npm --name "nexus-agents-beta" -- start
pm2 save
pm2 startup

# 5. Configurar proxy reverso (Nginx/Traefik)
echo "🌐 Configurar seu proxy reverso para apontar para localhost:3000"
echo "✅ Deploy concluído!"
echo "📊 Monitorar com: pm2 monit"
echo "🔄 Restart com: pm2 restart nexus-agents-beta"
