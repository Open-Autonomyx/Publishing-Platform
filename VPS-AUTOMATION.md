# 🤖 VPS Automation & Agent System

**Complete automated deployment and monitoring setup**

---

## 🎯 Three-Layer Automation

### Layer 1: VPS Deployment Agent
**Fully automated one-command deployment**
- `vps-automation-agent.sh` - Single script deploys everything
- 6 phases: System → Database → Services → API → SSL → Verification
- Real-time progress tracking
- Automatic rollback on failure
- Complete credential management

### Layer 2: GitHub Actions CI/CD
**Automatic deployment on every push**
- `deploy-vps.yml` - GitHub Actions workflow
- Triggers on: push to main, manual dispatch
- Auto-build Docker image
- Auto-push to GitHub Container Registry (GHCR)
- Auto-deploy to VPS
- Health checks + rollback on failure
- Slack notifications

### Layer 3: VPS Monitoring Agent
**24/7 health checks and auto-recovery**
- `vps-monitoring-agent.sh` - Continuous monitoring
- Monitors all 5 services
- Auto-restarts failed containers
- Resource monitoring (CPU, memory, disk)
- SSL certificate expiry warnings
- Slack alerts

---

## 📋 Quick Start

### One-Command Deployment
```bash
# Make script executable
chmod +x deploy/vps-automation-agent.sh

# Run deployment (one command!)
VPS_PASSWORD='your-vps-password' bash deploy/vps-automation-agent.sh

# ✅ Complete deployment in 15-20 minutes
```

### Output
```
🚀 VPS Deployment Agent - Starting
=========================================
Phase 1: System Setup (10 min)
  ✅ System setup complete
Phase 2: Database Setup (5 min)
  ✅ PostgreSQL running
  ✅ Schema loaded
Phase 3: Cache & Services Setup (5 min)
  ✅ Redis running
  ✅ Liferay started
Phase 4: API & Reverse Proxy Setup (5 min)
  ✅ Go API running
  ✅ Nginx configured
Phase 5: SSL Certificates (2 min)
  ✅ Certificate installed
  ✅ Auto-renewal scheduled
Phase 6: Health Checks & Verification
  ✅ All services running

🎉 Deployment Complete!
📄 Summary saved to ~/.creative-platform/deployment-summary.txt
```

---

## 🔄 VPS Deployment Agent (Detailed)

### What It Does (6 Phases)

#### Phase 1: System Setup (10 min)
```
✅ Update system packages
✅ Install Docker, Nginx, Certbot
✅ Start Docker daemon
✅ Install Docker Compose
✅ Configure firewall (ports 80, 443, 3001, 8080)
✅ Create Docker network
```

#### Phase 2: Database Setup (5 min)
```
✅ Pull PostgreSQL 15 image
✅ Start PostgreSQL container
✅ Create database
✅ Load schema (11 tables)
✅ Save credentials to ~/.creative-platform/
```

#### Phase 3: Cache & Services Setup (5 min)
```
✅ Start Redis cache
✅ Start Liferay DXP
✅ Wait for Liferay initialization (2-5 min)
```

#### Phase 4: API & Reverse Proxy Setup (5 min)
```
✅ Pull Go API Docker image from GHCR
✅ Start API container with environment vars
✅ Configure Nginx as reverse proxy
✅ Setup routing rules
✅ Health check validation
```

#### Phase 5: SSL Certificates (2 min)
```
✅ Request certificate from Let's Encrypt
✅ Install certificate in Nginx
✅ Setup automatic renewal (systemd timer)
✅ Test HTTPS
```

#### Phase 6: Verification (1 min)
```
✅ Health checks for all containers
✅ Database connectivity test
✅ Redis ping test
✅ API health endpoint check
✅ SSL certificate validation
```

### Usage

```bash
# Run deployment
chmod +x deploy/vps-automation-agent.sh
VPS_PASSWORD='password' bash deploy/vps-automation-agent.sh

# Real-time progress tracking
tail -f /tmp/deployment-*.log

# Check deployment status
cat ~/.creative-platform/deployment-summary.txt
```

### Credentials Generated

```
~/.creative-platform/
├─ deployment-summary.txt       - Complete summary
├─ db-password.txt              - PostgreSQL password
├─ jwt-secret.txt               - JWT secret
└─ liferay-api-key.txt          - Liferay API key
```

---

## 🚀 GitHub Actions CI/CD Pipeline

### What It Does

```
Trigger: Push to main branch
   ↓
1. Checkout code
   ↓
2. Build Go API
   ├─ Compile binary
   └─ Run tests
   ↓
3. Build Docker image
   ├─ Build from Dockerfile
   ├─ Tag with SHA
   └─ Push to GHCR
   ↓
4. Deploy to VPS
   ├─ SSH to VPS
   ├─ Pull new image
   ├─ Stop old container
   └─ Start new container
   ↓
5. Health checks
   ├─ API health endpoint
   ├─ Database connectivity
   └─ Container status
   ↓
6. If all checks pass:
   ✅ Deployment successful
   📧 Slack notification
   Else:
   ❌ Rollback to previous version
   🚨 Slack alert
```

### Setup GitHub Actions

#### Step 1: Add GitHub Secrets

```
Settings → Secrets and variables → Actions
Add:
- VPS_HOST: agennext.com
- VPS_USER: almalinux
- VPS_PASSWORD: [your password]
- VPS_SSH_KEY: [your SSH private key]
- DB_PASSWORD: [PostgreSQL password]
- JWT_SECRET: [JWT secret]
- SLACK_WEBHOOK: https://hooks.slack.com/services/... (optional)
```

#### Step 2: Trigger Deployment

```bash
# Automatic: Push to main
git push origin main

# Manual: Trigger from GitHub UI
GitHub UI → Actions → Deploy VPS → Run workflow

# Manual: Via CLI
gh workflow run deploy-vps.yml
```

#### Step 3: Monitor Deployment

```bash
# View logs
gh run view --log

# Watch in real-time
gh run list --workflow=deploy-vps.yml

# Check specific run
gh run view <run-id> --log
```

### Workflow Status

Each deployment:
```
✅ Build passed
✅ Docker image pushed to ghcr.io
✅ Deployed to VPS
✅ Health checks passed
📧 Slack notification sent
```

---

## 🔍 VPS Monitoring Agent

### Continuous Health Monitoring

```bash
# Run single check
bash deploy/vps-monitoring-agent.sh check

# Start monitoring service (continuous)
VPS_PASSWORD='password' bash deploy/vps-monitoring-agent.sh setup

# Check monitoring status
bash deploy/vps-monitoring-agent.sh status

# View monitoring logs
bash deploy/vps-monitoring-agent.sh logs
```

### What It Monitors (Every 60 seconds)

```
✅ Docker daemon status
✅ PostgreSQL health (pg_isready)
✅ Redis health (redis-cli ping)
✅ API health (HTTP /health endpoint)
✅ Nginx status (systemctl check)
✅ Disk space usage (alert if >80%)
✅ Memory usage (alert if >85%)
✅ SSL certificate expiry (alert if <7 days)
```

### Auto-Recovery

```
If service fails:
1. Log the failure
2. Automatically restart container
3. Wait 5-10 seconds
4. Verify it's running
5. Send Slack alert if still failing
```

### Sample Output

```
[2026-06-25 14:30:45] [INFO] Checking Docker daemon...
[2026-06-25 14:30:46] [INFO] Docker is healthy ✓
[2026-06-25 14:30:46] [INFO] Checking container: postgres
[2026-06-25 14:30:47] [INFO] Container healthy: postgres ✓
[2026-06-25 14:30:47] [INFO] Checking PostgreSQL...
[2026-06-25 14:30:48] [INFO] PostgreSQL is healthy ✓
[2026-06-25 14:30:48] [INFO] Checking API health endpoint...
[2026-06-25 14:30:49] [INFO] API is healthy ✓
[2026-06-25 14:30:49] [INFO] ✅ All checks passed
```

---

## 📊 Monitoring Dashboard (Real-time)

### View Live Logs

```bash
# API logs (live)
ssh almalinux@agennext.com "docker logs -f api"

# Database logs
ssh almalinux@agennext.com "docker logs -f postgres"

# Nginx logs
ssh almalinux@agennext.com "sudo tail -f /var/log/nginx/access.log"

# All container status
ssh almalinux@agennext.com "docker ps --format 'table {{.Names}}\t{{.Status}}'"
```

### System Metrics

```bash
# SSH into VPS
ssh almalinux@agennext.com

# CPU usage
top -bn1 | head -n 5

# Memory usage
free -h

# Disk usage
df -h

# Network stats
netstat -tuln | grep LISTEN

# Docker resource usage
docker stats --no-stream
```

---

## 🔄 Deployment Workflow

### Normal Flow (Success Path)

```
Developer commits to main
    ↓
GitHub Actions triggered
    ↓
✅ Tests pass
    ↓
✅ Docker image built & pushed
    ↓
SSH to VPS
    ↓
Pull new Docker image
    ↓
Stop old container
    ↓
Start new container
    ↓
✅ Health checks pass
    ↓
✅ Deployment successful!
    ↓
Slack notification: "Deployment successful"
    ↓
Monitor logs for issues
```

### Failure & Rollback Path

```
GitHub Actions deployment fails
    ↓
❌ Health checks fail
    ↓
Automatic rollback triggered
    ↓
Stop new container
    ↓
Start previous container
    ↓
✅ Health checks pass
    ↓
Slack alert: "Deployment failed - rolled back"
    ↓
Manual investigation needed
```

---

## 🚨 Alerts & Notifications

### Slack Alerts

```
✅ Deployment successful
❌ Deployment failed
🔄 Rollback executed
⚠️ Disk space warning (>80%)
⚠️ Memory warning (>85%)
⚠️ Certificate expiring
🔗 Broken health checks
```

### Sample Alert

```
⚠️ Memory warning: 87% used on agennext.com
   - Time: 2026-06-25 14:35:22
   - Action: Check running processes
   - Recommendation: Review app performance
```

---

## 📈 Monitoring Metrics

### Available Metrics

```
Container Status:
- State (running/stopped)
- Uptime
- Restart count

Performance:
- CPU usage
- Memory usage
- Network I/O
- Disk usage

Application:
- HTTP response time
- Error rate
- Request count

Database:
- Connection count
- Query latency
- Replication lag

Cache:
- Hit rate
- Memory used
- Keys stored
```

---

## 🔧 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs <container-name>

# Check image exists
docker image ls

# Manual restart
docker restart <container-name>

# Remove and recreate
docker rm <container-name>
docker run -d <image> ...
```

### Health Check Failing

```bash
# Test endpoint manually
curl http://localhost:3001/health

# Check port is open
netstat -tlnp | grep 3001

# Verify environment variables
docker inspect <container-name> | grep Env

# Restart container
docker restart <container-name>
```

### Monitoring Service Not Running

```bash
# Check service status
systemctl status creative-platform-monitor

# View service logs
journalctl -u creative-platform-monitor -n 50

# Restart service
sudo systemctl restart creative-platform-monitor

# Enable auto-start
sudo systemctl enable creative-platform-monitor
```

---

## 📝 Log Locations

```
VPS Logs:
/var/log/creative-platform-monitor.log    - Monitoring
/var/log/nginx/access.log                 - HTTP requests
/var/log/nginx/error.log                  - HTTP errors

Docker Logs:
docker logs api                           - API container
docker logs postgres                      - Database
docker logs redis                         - Cache
docker logs liferay                       - CMS

Local Logs:
/tmp/deployment-*.log                     - Deployment log
~/.creative-platform/*                    - Credentials & summary
```

---

## ✅ Deployment Checklist

Before considering deployment done:

```
✅ Deployment script ran without errors
✅ All 6 phases completed
✅ Services verified running (docker ps)
✅ Health checks passed
✅ API responding to requests
✅ Database connectivity confirmed
✅ SSL certificate installed
✅ Auto-renewal scheduled
✅ Credentials saved securely
✅ Monitoring agent installed
✅ GitHub Actions secrets configured
✅ First automatic deployment successful
✅ Rollback tested (optional)
```

---

**Status:** ✅ **VPS AUTOMATION SYSTEM COMPLETE**

Fully automated deployment, CI/CD, and 24/7 monitoring ready! 🚀

