# Publishing Platform - Complete Docker Compose Setup

## 🎯 What You Get

One command to run the entire platform:

```bash
docker-compose up -d
```

## 🏗️ Architecture

### Infrastructure Layer
- **PostgreSQL** (5432) - Main database
- **Redis** (6379) - Cache & sessions
- **Elasticsearch** (9200) - Search & analytics
- **MinIO** (9000) - S3-compatible storage
- **Ollama** (11434) - Local LLM

### Core Services
- **API Gateway** (3000) - Central routing & auth
- **Event Bus** (3001) - Service communication

### Business Services
- **Content Management** (3002) - Create/publish content
- **Skills** (3003) - Skill taxonomy & tracking
- **Tools** (3004) - Tool & integration management
- **Analytics** (3005) - Metrics & reporting
- **Optimization** (3006) - AI recommendations
- **Design** (3007) - Templates & assets
- **Features** (3008) - ML feature store

### Monitoring & Utils
- **pgAdmin** (5050) - Database UI
- **Redis Commander** (8081) - Cache inspection
- **Kibana** (5601) - Log/analytics UI
- **Mailhog** (8025) - Email testing

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/openautonomyx/Publishing-Platform.git
cd Publishing-Platform

# 2. Build services
docker-compose build

# 3. Start everything
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f api-gateway

# 6. Access platform
open http://localhost:3000
```

## 🔗 Service Endpoints

### APIs
| Service | Port | URL |
|---------|------|-----|
| API Gateway | 3000 | http://localhost:3000/api/v1/* |
| Content Management | 3002 | http://localhost:3002 |
| Skills | 3003 | http://localhost:3003 |
| Tools | 3004 | http://localhost:3004 |
| Analytics | 3005 | http://localhost:3005 |
| Optimization | 3006 | http://localhost:3006 |
| Design | 3007 | http://localhost:3007 |
| Features | 3008 | http://localhost:3008 |

### Admin Interfaces
| Tool | Port | URL | Credentials |
|------|------|-----|-------------|
| pgAdmin | 5050 | http://localhost:5050 | admin@example.com / admin |
| Redis Commander | 8081 | http://localhost:8081 | (no auth) |
| Kibana | 5601 | http://localhost:5601 | (no auth) |
| Mailhog | 8025 | http://localhost:8025 | (no auth) |
| MinIO | 9001 | http://localhost:9001 | minioadmin / minioadmin |

## 📋 Common Commands

```bash
# View all services
docker-compose ps

# View logs from specific service
docker-compose logs content-management

# View logs from all services
docker-compose logs -f

# Restart a service
docker-compose restart content-management

# Stop all services
docker-compose down

# Remove all data (WARNING: deletes databases)
docker-compose down -v

# Build specific service
docker-compose build content-management

# Scale a service
docker-compose up -d --scale content-management=3

# Execute command in container
docker-compose exec postgres psql -U pp_admin -d publishing_platform

# View resource usage
docker stats
```

## 🔐 Environment Variables

Key credentials (in docker-compose.yml):

```
PostgreSQL:
  User: pp_admin
  Password: secure_password_change_me
  Database: publishing_platform

Redis: (no auth by default)

MinIO:
  Access Key: minioadmin
  Secret Key: minioadmin

JWT Secret: change_me_in_production
```

## 🔧 Configuration

Edit `docker-compose.yml` to change:

```yaml
# Database
POSTGRES_PASSWORD: change_me_in_production
DATABASE_URL: postgresql://...

# JWT
JWT_SECRET: change_me_in_production

# LLM
OLLAMA_URL: http://ollama:11434

# Storage
MINIO_ACCESS_KEY: your_key
MINIO_SECRET_KEY: your_key
```

## 📊 Service Communication

```
Client Request
    ↓
API Gateway (3000)
    ├─ Auth (JWT)
    ├─ Route to service
    └─ Log request
    ↓
Service (3002-3008)
    ├─ Business logic
    ├─ Query database
    ├─ Emit event
    └─ Response
    ↓
Event Bus (3001)
    ├─ Store event
    ├─ Notify subscribers
    └─ Update other services
```

## 🧪 Testing

```bash
# Health check all services
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008; do
  echo "Port $port:"
  curl -s http://localhost:$port/health | jq .
done

# Create content
curl -X POST http://localhost:3000/api/v1/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Article",
    "body": "Content here",
    "type": "blog"
  }'

# List content
curl http://localhost:3000/api/v1/content

# Check analytics
curl http://localhost:3000/api/v1/analytics
```

## 🐛 Debugging

### Service won't start
```bash
docker-compose logs service-name
docker-compose ps

# Rebuild
docker-compose build service-name
docker-compose up service-name
```

### Database connection error
```bash
# Test connection
docker-compose exec postgres psql -U pp_admin -d publishing_platform -c "SELECT 1"

# Check logs
docker-compose logs postgres
```

### Port conflicts
```bash
# Find what's using port 5432
lsof -i :5432

# Change in docker-compose.yml
ports:
  - "5433:5432"  # changed from 5432:5432
```

### Reset everything
```bash
# Stop and remove all containers
docker-compose down

# Remove all data
docker-compose down -v

# Rebuild and start fresh
docker-compose build
docker-compose up -d
```

## 📈 Scaling

```bash
# Scale content service to 3 replicas
docker-compose up -d --scale content-management=3

# Load balancing via API Gateway (routes to all)
# Each request goes to different replica
```

## 🔐 Production Checklist

- [ ] Change all default passwords
- [ ] Set JWT_SECRET to secure random value
- [ ] Enable SSL/TLS on API Gateway
- [ ] Configure database backups
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Enable Redis persistence
- [ ] Configure Elasticsearch backups
- [ ] Set resource limits
- [ ] Enable logging aggregation
- [ ] Configure CORS properly

## 📞 Support

- **Docs:** https://openautonomyx.github.io/Publishing-Platform
- **Issues:** https://github.com/openautonomyx/Publishing-Platform/issues
- **Discord:** https://discord.gg/openautonomyx

---

**Ready to start?** Run: `docker-compose up -d` 🚀
