#!/bin/bash

##############################################################################
# OpenAutonomyX AlmaLinux VPS Deployment Script
# For: AlmaLinux, Rocky Linux, CentOS 8+, RHEL 8+
##############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  OpenAutonomyX - AlmaLinux VPS Deployment                  ║"
echo "║  Production-Ready Full Stack Setup                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
REPO_URL="https://github.com/openautonomyx/original.git"
DEPLOY_DIR="/opt/openautonomyx"
APP_PORT="3000"
DOMAIN="${1:-openautonomyx.com}"

echo -e "${YELLOW}📋 Configuration${NC}"
echo "Repository: $REPO_URL"
echo "Deploy Path: $DEPLOY_DIR"
echo "Domain: $DOMAIN"
echo "App Port: $APP_PORT"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}🔄 Step 1: Update System${NC}"
dnf update -y
dnf install -y curl wget git

echo -e "${YELLOW}🔄 Step 2: Install Docker${NC}"
if ! command -v docker &> /dev/null; then
    dnf install -y dnf-plugins-core
    dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
    dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi
systemctl start docker
systemctl enable docker

echo -e "${YELLOW}🔄 Step 3: Install Docker Compose${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo -e "${YELLOW}🔄 Step 4: Install Nginx${NC}"
dnf install -y nginx

echo -e "${YELLOW}🔄 Step 5: Install Certbot (SSL)${NC}"
dnf install -y certbot python3-certbot-nginx

echo -e "${YELLOW}🔄 Step 6: Disable SELinux (for Docker)${NC}"
setenforce 0 || true
sed -i 's/^SELINUX=enforcing$/SELINUX=disabled/' /etc/selinux/config

echo -e "${YELLOW}🔄 Step 7: Clone Repository${NC}"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR
if [ -d ".git" ]; then
    git pull origin main
else
    git clone $REPO_URL .
fi

echo -e "${YELLOW}🔄 Step 8: Create Environment File${NC}"
cat > $DEPLOY_DIR/.env << EOF
NODE_ENV=production
PORT=$APP_PORT

# Database
DATABASE_TYPE=postgresql
DATABASE_URL=postgresql://openautonomyx:secure_password@postgres:5432/openautonomyx

# Cache
REDIS_URL=redis://redis:6379

# LLM Configuration
LLM_PROVIDER=ollama
LLM_MODEL=mistral
OLLAMA_API_URL=http://ollama:11434

# Storage
STORAGE_TYPE=local
STORAGE_PATH=/data/uploads

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
JWT_SECRET=$(openssl rand -base64 32)
API_KEY_PREFIX=sk-openautonomyx

# Domain
DOMAIN=$DOMAIN
EOF

echo -e "${GREEN}✅ .env file created${NC}"
echo -e "${YELLOW}⚠️  Review .env file and update sensitive values:${NC}"
echo "nano $DEPLOY_DIR/.env"
echo ""

echo -e "${YELLOW}🔄 Step 9: Configure Firewall${NC}"
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=$APP_PORT/tcp
firewall-cmd --reload

echo -e "${YELLOW}🔄 Step 10: Start Docker Services${NC}"
cd $DEPLOY_DIR
docker-compose up -d

echo -e "${YELLOW}🔄 Step 11: Pull LLM Model${NC}"
sleep 5
docker exec openautonomyx-ollama ollama pull mistral || true

echo -e "${YELLOW}🔄 Step 12: Configure Nginx${NC}"
cat > /etc/nginx/conf.d/openautonomyx.conf << EOF
upstream openautonomyx_backend {
    server localhost:$APP_PORT;
}

server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    client_max_body_size 100M;

    location / {
        proxy_pass http://openautonomyx_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

nginx -t
systemctl start nginx
systemctl enable nginx

echo -e "${YELLOW}🔄 Step 13: Setup SSL Certificate${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || true

echo -e "${YELLOW}🔄 Step 14: Enable Auto-renewal${NC}"
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your platform is live at:"
echo -e "${GREEN}   https://$DOMAIN${NC}"
echo ""
echo "📊 Admin & Services:"
echo "   • App: http://localhost:$APP_PORT"
echo "   • PostgreSQL: localhost:5432"
echo "   • Redis: localhost:6379"
echo "   • Ollama: localhost:11434"
echo "   • pgAdmin: http://localhost:5050 (admin@openautonomyx.com / admin)"
echo ""
echo "📋 Useful Commands:"
echo "   • View logs: docker-compose -f $DEPLOY_DIR/docker-compose.yml logs -f app"
echo "   • Restart: docker-compose -f $DEPLOY_DIR/docker-compose.yml restart"
echo "   • Stop: docker-compose -f $DEPLOY_DIR/docker-compose.yml down"
echo "   • Firewall: firewall-cmd --list-all"
echo "   • SELinux status: getenforce"
echo ""
echo "🔒 Security Checklist:"
echo "   ☐ Update .env file with secure passwords"
echo "   ☐ Change pgAdmin default credentials"
echo "   ☐ Verify firewall rules"
echo "   ☐ Configure fail2ban (optional)"
echo "   ☐ Set up backups"
echo "   ☐ Enable monitoring"
echo ""
echo "📞 Support:"
echo "   • Docs: https://openautonomyx.github.io/original"
echo "   • Issues: https://github.com/openautonomyx/original/issues"
echo ""
