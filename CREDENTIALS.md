# 🔐 Credentials & Secrets Management

**All credentials stored in OpenBao (secure vault)**

---

## 📋 All Required Credentials

### VPS Access
```
Path: secret/vps/credentials
├─ host: agennext.com
├─ user: almalinux
├─ password: (randomly generated)
├─ ssh_key: ~/.ssh/id_rsa
└─ port: 22
```

### Database (PostgreSQL)
```
Path: secret/database/postgres
├─ host: localhost
├─ port: 5432
├─ user: postgres
├─ password: (randomly generated)
├─ database: creative_platform
└─ connection_string: postgres://postgres:password@localhost:5432/creative_platform
```

### Authentication (JWT)
```
Path: secret/auth/jwt
├─ secret: (randomly generated 32-byte key)
├─ algorithm: HS256
└─ expiry: 24h
```

### Liferay DXP
```
Path: secret/liferay/api
├─ url: http://localhost:8080
├─ api_key: (randomly generated)
├─ admin_email: admin@liferay.com
├─ admin_password: admin123
└─ api_version: v1
```

### Redis Cache
```
Path: secret/redis/cache
├─ host: localhost
├─ port: 6379
├─ password: (randomly generated)
├─ db: 0
└─ connection_string: redis://:password@localhost:6379/0
```

### GitHub & Docker Registry
```
Path: secret/github/credentials
├─ token: ghp_xxxxxxxxxxxx
├─ username: fractional-pm
├─ repository: creative-platform
├─ ghcr_token: (same as token)
└─ docker_registry: ghcr.io
```

### Payment (Stripe)
```
Path: secret/payment/stripe
├─ api_key: sk_live_xxxxxxxxxx
├─ publishable_key: pk_live_xxxxxxxxxx
└─ webhook_secret: whsec_xxxxxxxxxx
```

### Notifications (Slack)
```
Path: secret/notifications/slack
├─ webhook_url: https://hooks.slack.com/services/...
├─ channel: #alerts
└─ username: Creative Platform
```

### Temporal Cloud
```
Path: secret/cloud/temporal
├─ namespace: creative-platform-prod.tmprl.cloud
├─ api_key: (from Temporal Cloud dashboard)
└─ address: your-namespace.tmprl.cloud:7233
```

### ClickHouse Cloud
```
Path: secret/cloud/clickhouse
├─ host: your-service.clickhouse.cloud
├─ port: 8443
├─ user: default
├─ password: (randomly generated)
├─ database: metrics
└─ connection_string: https://default:password@your-service.clickhouse.cloud:8443/metrics
```

### SSL/TLS Certificates (cert-manager)
```
Path: secret/ssl/certmanager
├─ domain: agennext.com
├─ issuer: letsencrypt-prod
├─ email: admin@agennext.com
├─ provider: cert-manager
├─ renewal_enabled: true
└─ renewal_days_before: 30
```

### API Keys
```
Path: secret/api/keys
├─ production_api_key: (randomly generated)
├─ staging_api_key: (randomly generated)
└─ development_api_key: (randomly generated)
```

### Environment Configuration
```
Path: secret/config/production
├─ api_url: https://app.creative-platform.com
├─ web_url: https://creative-platform.com
├─ grafana_url: https://grafana.creative-platform.com
├─ prometheus_url: https://prometheus.creative-platform.com
├─ environment: production
├─ log_level: info
└─ debug: false
```

### PII Protection (Vault)
```
Path: secret/pii/protection
├─ encryption_enabled: true
├─ encryption_algorithm: AES-256-GCM
├─ field_masking: true
├─ audit_logging: true
├─ retention_days: 30
├─ anonymization: true
├─ pii_fields: email,phone,ssn,credit_card,address,ip_address,user_agent
├─ gdpr_compliant: true
└─ ccpa_compliant: true
```

---

## 🔒 SSL/TLS with cert-manager

### Automatic Certificate Management
```bash
# cert-manager handles Let's Encrypt automation
# - Automatic renewal 30 days before expiry
# - HTTP-01 ACME challenge verification
# - Zero-downtime certificate updates

# Certificate location
/etc/letsencrypt/live/agennext.com/fullchain.pem
/etc/letsencrypt/live/agennext.com/privkey.pem

# Check certificate expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/agennext.com/fullchain.pem

# Manual renewal (if needed)
certbot renew --dry-run
certbot renew
```

### Nginx Integration
- Automatic HTTPS redirect (HTTP → HTTPS)
- Strong TLS 1.2/1.3 configuration
- PII-aware security headers
- Cache control for sensitive endpoints
- Metrics endpoint restricted to localhost

---

## 🛡️ PII Protection (Vault)

### Protected Fields
- Email addresses
- Phone numbers
- SSN (Social Security Numbers)
- Credit card information
- Physical addresses
- IP addresses
- User agents

### Protection Methods
```bash
# 1. AES-256-GCM Encryption
#    - At-rest encryption for all PII in database
#    - Key management via OpenBao

# 2. Field Masking
#    - Display masked values: ***-**-1234 (for SSN)
#    - Last 4 digits visible for cards
#    - Show only domain for emails (user@****)

# 3. Audit Logging
#    - All PII access logged
#    - User ID, timestamp, action recorded
#    - Tamper-proof audit trail

# 4. Retention Policy
#    - Auto-delete PII after 30 days (configurable)
#    - GDPR "right to be forgotten" compliant
#    - CCPA "right to deletion" implemented

# 5. Anonymization
#    - Remove identifiable data from logs
#    - Pseudonymize user IDs in metrics
#    - Separate analytics from raw user data
```

### GDPR/CCPA Compliance
```
✅ Encryption: AES-256-GCM
✅ Access Control: Role-based, audit-logged
✅ Data Retention: Automatic purging
✅ User Rights: Delete, export, access
✅ Breach Notification: Automated alerts
✅ Privacy Policy: Required
✅ Consent Management: Opt-in/out tracking
```

### Deployment Headers
```nginx
# Cache-Control for sensitive endpoints
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
Pragma: no-cache
Expires: 0

# Security headers
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: default-src 'self'

# Privacy headers
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 🚀 Setup OpenBao

### 1. Start OpenBao Server

```bash
# Docker (development mode)
docker run -d \
  --name openbao \
  --network creative-network \
  -e 'BOAS_DEV_ROOT_TOKEN_ID=root' \
  -p 8200:8200 \
  ghcr.io/openbao/openbao:latest server -dev

# Get root token
docker logs openbao | grep 'Root Token:'
export BOAS_TOKEN='your-root-token'
```

### 2. Setup All Credentials & PII Protection

```bash
# Make script executable
chmod +x deploy/openbao-setup.sh

# Run setup (will prompt for credentials)
BOAS_TOKEN='root-token' bash deploy/openbao-setup.sh

# Setup includes:
# ✅ All credentials (12 categories)
# ✅ cert-manager configuration
# ✅ PII protection policies
# ✅ Deploy access policy
# ✅ 24h deployment token

# Follow prompts to enter:
# - GitHub token
# - Stripe API key
# - Slack webhook
# - Temporal API key
# - ClickHouse password
```

### 3. Save Deployment Token

```bash
# After setup, token is saved to ~/.openbao/deploy-token
source ~/.openbao/deploy-token

# Verify
echo $BOAS_TOKEN
echo $BOAS_ADDR
```

---

## 🔍 Retrieve Credentials

### CLI Commands

```bash
# Get single credential
boas kv get -field=password secret/database/postgres

# Get all database credentials
boas kv get secret/database/postgres

# Get formatted JSON
boas kv get -format=json secret/database/postgres

# List all secret paths
boas kv list secret/

# List all VPS secrets
boas kv list secret/vps/
```

### In Shell Scripts

```bash
# Source credentials
source ~/.openbao/deploy-token

# Get database password
DB_PASSWORD=$(boas kv get -field=password secret/database/postgres)

# Get JWT secret
JWT_SECRET=$(boas kv get -field=secret secret/auth/jwt)

# Get all VPS credentials
VPS_CREDS=$(boas kv get -format=json secret/vps/credentials)
VPS_HOST=$(echo $VPS_CREDS | jq -r '.data.data.host')
VPS_USER=$(echo $VPS_CREDS | jq -r '.data.data.user')
VPS_PASS=$(echo $VPS_CREDS | jq -r '.data.data.password')
```

### In Go Code

```go
// Get OpenBao client
client, err := boas.NewClient(&boas.Config{
    Address: os.Getenv("BOAS_ADDR"),
})
client.SetToken(os.Getenv("BOAS_TOKEN"))

// Read secret
secret, err := client.Logical().Read("secret/data/database/postgres")
dbPassword := secret.Data["data"].(map[string]interface{})["password"]
```

### In Docker

```bash
# Pass credentials as environment variables
docker run -d \
  --name api \
  -e "DATABASE_PASSWORD=$(boas kv get -field=password secret/database/postgres)" \
  -e "JWT_SECRET=$(boas kv get -field=secret secret/auth/jwt)" \
  -e "LIFERAY_API_KEY=$(boas kv get -field=api_key secret/liferay/api)" \
  creative-platform-api:latest
```

---

## 🔄 Rotation & Updates

### Update Single Credential

```bash
# Update database password
boas kv put secret/database/postgres \
  password="new-secure-password" \
  host="localhost" \
  user="postgres" \
  database="creative_platform"
```

### Update Multiple Credentials

```bash
# Update all JWT settings
boas kv put secret/auth/jwt \
  secret="new-jwt-secret" \
  algorithm="HS256" \
  expiry="48h"
```

### Rotate All Credentials (Monthly)

```bash
# Backup current credentials
boas kv get -format=json secret/database/postgres > backups/postgres-backup.json

# Generate new password
NEW_PASS=$(openssl rand -base64 32)

# Update in OpenBao
boas kv put secret/database/postgres password="$NEW_PASS"

# Update in database
# (run on VPS or via kubectl)
ALTER USER postgres WITH PASSWORD 'new-password';

# Update running services
docker-compose restart api
```

---

## 🔐 Security Best Practices

### Access Control

```bash
# Only deployment policy can read secrets
boas policy write deploy-policy deploy-policy.hcl

# Create token with deployment policy
boas token create -policy=deploy-policy -ttl=24h

# Create short-lived token for CI/CD
boas token create -policy=deploy-policy -ttl=1h
```

### Audit Logging

```bash
# Check who accessed secrets
boas audit list secret/

# Enable audit logging
boas audit enable file

# Watch audit log
tail -f /var/log/boas/audit.log
```

### Token Lifecycle

```bash
# Create token with TTL
boas token create -ttl=24h -policy=deploy-policy

# Revoke token when done
boas token revoke $BOAS_TOKEN

# List active tokens
boas token list

# Check token info
boas token lookup
```

---

## 📝 Environment Variables

### Production Deployment

```bash
# Set all required environment variables
export BOAS_ADDR="http://openbao:8200"
export BOAS_TOKEN="deployment-token-here"
export BOAS_NAMESPACE="secret"

# VPS credentials
export VPS_PASSWORD=$(boas kv get -field=password secret/vps/credentials)
export VPS_HOST=$(boas kv get -field=host secret/vps/credentials)
export VPS_USER=$(boas kv get -field=user secret/vps/credentials)

# Database credentials
export DATABASE_URL="$(boas kv get -field=connection_string secret/database/postgres)"

# Auth secrets
export JWT_SECRET=$(boas kv get -field=secret secret/auth/jwt)

# Liferay
export LIFERAY_API_KEY=$(boas kv get -field=api_key secret/liferay/api)
export LIFERAY_URL=$(boas kv get -field=url secret/liferay/api)

# Redis
export REDIS_URL=$(boas kv get -field=connection_string secret/redis/cache)

# GitHub
export GITHUB_TOKEN=$(boas kv get -field=token secret/github/credentials)
export GHCR_TOKEN=$(boas kv get -field=ghcr_token secret/github/credentials)

# Cloud services
export TEMPORAL_NAMESPACE=$(boas kv get -field=namespace secret/cloud/temporal)
export TEMPORAL_API_KEY=$(boas kv get -field=api_key secret/cloud/temporal)
export CLICKHOUSE_HOST=$(boas kv get -field=host secret/cloud/clickhouse)
export CLICKHOUSE_PASSWORD=$(boas kv get -field=password secret/cloud/clickhouse)
```

### Load in Deployment Script

```bash
# In deploy-to-vps.sh
source ~/.openbao/deploy-token

# Then use:
VPS_PASSWORD=$(boas kv get -field=password secret/vps/credentials)
JWT_SECRET=$(boas kv get -field=secret secret/auth/jwt)
# ... etc
```

---

## ⚠️ Important Notes

- **Never commit credentials** to Git (they're auto-generated and stored in OpenBao)
- **Rotate credentials** every 30 days for production
- **Backup OpenBao** regularly to disaster-recovery location
- **Monitor access** via audit logs for suspicious activity
- **Use short-lived tokens** for CI/CD (1-24 hours, not permanent)
- **Different tokens** per environment (prod, staging, dev)
- **Enable mTLS** for production OpenBao deployment

---

## 🚀 Deployment with OpenBao

```bash
# 1. Source credentials
source ~/.openbao/deploy-token

# 2. Run deployment
bash deploy/deploy-to-vps.sh

# Script automatically retrieves all credentials from OpenBao
# No hardcoded secrets anywhere
```

---

**Status:** ✅ **OPENBAO SETUP READY**

**All credentials secured and managed centrally!**
