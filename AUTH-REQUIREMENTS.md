# Complete Authentication Requirements

**All places where you need to login or provide credentials**

---

## 🔐 Summary: Where Auth is Required

| Component | Auth Type | Credentials | File/Step |
|-----------|-----------|-------------|-----------|
| Docker Hub | Login | Username + Token | `push-to-docker-hub.sh` |
| Google Cloud | gcloud login | Google Account | `push-to-google-cloud.sh` |
| GitHub | SSH/HTTPS | SSH key or Token | Git push commands |
| Vercel | CLI login | Vercel Account | Frontend deployment |
| Liferay Portal | Portal login | Admin credentials | `http://localhost:8080` |
| Domain Registrar | Web login | Registrar account | DNS configuration |
| PostgreSQL | Database | DB user/pass | `.env` file |
| API Gateway | JWT | Auth tokens | API calls |

---

## 1️⃣ Docker Hub Authentication

### Where it's needed
```
./push-to-docker-hub.sh
  ↓
docker login
  ↓
Push to: hub.docker.com/u/open-autonomyx
```

### Get Credentials

**Option A: Username & Password**
```bash
docker login
# Prompt: Username: [your-username]
# Prompt: Password: [your-password]
```

**Option B: Personal Access Token (Recommended)**
```
1. Go to: https://hub.docker.com/settings/security
2. Click: New Access Token
3. Name: openautonomyx-automation
4. Permissions: Read & Write
5. Copy token
6. Use: docker login -u username -p token
```

### Command to Login
```bash
docker login -u your-username -p your-access-token
```

### Verify Authentication
```bash
docker info | grep "Username"
# Output: Username: your-username ✅
```

---

## 2️⃣ Google Cloud Authentication

### Where it's needed
```
./push-to-google-cloud.sh
  ↓
gcloud auth login
  ↓
Deploy to: Google Artifact Registry
```

### Get Credentials

**Step 1: Install gcloud**
```bash
brew install google-cloud-sdk  # macOS
# or
curl https://sdk.cloud.google.com | bash  # Linux
```

**Step 2: Login**
```bash
gcloud auth login
# Opens browser → Sign in with Google account
# Approve permissions
# Returns: "You are now authenticated"
```

**Step 3: Create Project**
```bash
gcloud projects create openautonomyx
gcloud config set project openautonomyx
```

**Step 4: Setup Service Account (for CI/CD)**
```bash
# Create service account
gcloud iam service-accounts create openautonomyx-ci \
  --display-name="OpenAutonomyX CI/CD"

# Create key
gcloud iam service-accounts keys create ./sa-key.json \
  --iam-account=openautonomyx-ci@openautonomyx.iam.gserviceaccount.com

# Grant permissions
gcloud projects add-iam-policy-binding openautonomyx \
  --member=serviceAccount:openautonomyx-ci@openautonomyx.iam.gserviceaccount.com \
  --role=roles/artifactregistry.admin
```

### Verify Authentication
```bash
gcloud auth list
# Output: ACTIVE  your-email@gmail.com ✅

gcloud config get-value project
# Output: openautonomyx ✅
```

---

## 3️⃣ GitHub Authentication

### Where it's needed
```
Git push to GitHub
  ↓
git push origin main
  ↓
Update: https://github.com/Open-Autonomyx/Publishing-Platform
```

### Get Credentials

**Option A: SSH Key (Recommended)**
```bash
# Generate SSH key (if not exists)
ssh-keygen -t ed25519 -C "your-email@gmail.com"

# Add to ssh-agent
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# 1. https://github.com/settings/ssh/new
# 2. Paste public key
# 3. Save
```

**Option B: Personal Access Token**
```bash
# Generate token:
# 1. https://github.com/settings/tokens/new
# 2. Scopes: repo, read:org
# 3. Copy token

# Use token for HTTPS push:
git remote set-url origin https://username:token@github.com/Open-Autonomyx/Publishing-Platform.git
```

### Verify Authentication
```bash
ssh -T git@github.com
# Output: Hi username! You've successfully authenticated. ✅
```

---

## 4️⃣ Vercel Authentication

### Where it's needed
```
npm run build
  ↓
vercel --prod
  ↓
Deploy to: Vercel (app.publishing.openautonomyx.com)
```

### Get Credentials

**Step 1: Create Vercel Account**
```
https://vercel.com/signup
```

**Step 2: Install Vercel CLI**
```bash
npm install -g vercel
```

**Step 3: Login**
```bash
vercel login
# Opens browser → Sign in
# Approve
# Returns token
```

**Step 4: Deploy**
```bash
cd /Users/chinmaypanda/CustomApps/frontend
vercel --prod
# Prompts for project name
# Builds and deploys
```

### Verify Authentication
```bash
vercel whoami
# Output: your-email@example.com ✅
```

---

## 5️⃣ Liferay Portal Authentication

### Where it's needed
```
Docker starts Liferay
  ↓
http://localhost:8080
  ↓
Login required to use portal
```

### Default Credentials

**First Access:**
```
URL: http://localhost:8080
Username: test@liferay.com
Password: test
```

**Change Admin Password:**
```
1. Login with default credentials
2. User menu (top right) → Account Settings
3. Change password
4. Save
```

### Generate API Tokens (for programmatic access)
```bash
# In Liferay admin panel:
# 1. Go to: Control Panel → Users and Organizations
# 2. Select user
# 3. API Tokens tab
# 4. Generate token
# 5. Use in API calls:

curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/jsonws/user/get-current-user
```

---

## 6️⃣ Domain Registrar Authentication

### Where it's needed
```
Update DNS records
  ↓
publishing.openautonomyx.com → CNAME → openautonomyx.github.io
```

### Get Credentials

**Where to update DNS:**
- GoDaddy, Namecheap, Route53, Google Domains, etc.

**Login steps (vary by provider):**
```
1. Go to your registrar (e.g., godaddy.com)
2. Sign in with your account
3. Navigate to DNS settings
4. Update CNAME records
```

### Example: GoDaddy
```
1. https://www.godaddy.com → Sign in
2. Products → Domain Management
3. Click your domain
4. DNS → DNS Records
5. Add CNAME:
   Name: publishing.openautonomyx.com
   Type: CNAME
   Value: openautonomyx.github.io
6. Save
```

---

## 7️⃣ PostgreSQL Database Authentication

### Where it's needed
```
Services connect to database
  ↓
Environment variables
  ↓
.env file
```

### Set Database Credentials

**File: `.env`**
```bash
DB_USER=postgres
DB_PASS=your_very_secure_password_here
DATABASE_URL=postgresql://postgres:your_password@postgres:5432/publishing_platform
```

**File: `.env.production`** (for production)
```bash
DB_USER=liferay_user
DB_PASS=your_very_secure_password_here
```

### Change PostgreSQL Password
```bash
# Connect to database
docker-compose exec postgres psql -U postgres

# Inside psql:
ALTER USER postgres WITH PASSWORD 'new_password';
\q

# Update .env:
DB_PASS=new_password
```

---

## 8️⃣ API Gateway Authentication

### Where it's needed
```
API calls
  ↓
Authorization: Bearer <JWT_TOKEN>
  ↓
Access protected endpoints
```

### Get JWT Token

**Step 1: Login endpoint**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "expiresIn": 3600
# }
```

**Step 2: Use token**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/content/list
```

**Step 3: Refresh token (expires every hour)**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Authorization: Bearer $TOKEN"
```

---

## 9️⃣ Integration Platform Authentication

### Where it's needed
```
Connect to external platforms
  ↓
WordPress, Medium, Twitter, LinkedIn, etc.
  ↓
API keys/tokens required
```

### WordPress Integration
```bash
# Get credentials:
# 1. WordPress admin: https://yourblog.com/wp-admin
# 2. Users → Your Profile
# 3. Copy Application Passwords
# 4. Save username + password

# Setup in OpenAutonomyX:
POST /api/v1/integrations
{
  "name": "My WordPress",
  "type": "wordpress",
  "config": {
    "url": "https://yourblog.com",
    "username": "admin",
    "password": "app_password_here"
  }
}
```

### Twitter/X Integration
```bash
# Get API credentials:
# 1. https://developer.twitter.com/en/portal/dashboard
# 2. Create app
# 3. Copy API Key, API Secret Key, Bearer Token
# 4. Save

# Setup in OpenAutonomyX:
POST /api/v1/integrations
{
  "name": "My Twitter",
  "type": "twitter",
  "config": {
    "apiKey": "...",
    "apiSecret": "...",
    "bearerToken": "..."
  }
}
```

### Medium Integration
```bash
# Get credentials:
# 1. https://medium.com/me/settings/security
# 2. Integration tokens
# 3. Create new token
# 4. Copy

# Setup in OpenAutonomyX:
POST /api/v1/integrations
{
  "name": "My Medium",
  "type": "medium",
  "config": {
    "token": "..."
  }
}
```

---

## 🔑 Complete Auth Checklist

```
✅ Docker Hub
   □ Login: docker login
   □ Verify: docker info

✅ Google Cloud
   □ Install: brew install google-cloud-sdk
   □ Login: gcloud auth login
   □ Project: gcloud config set project openautonomyx
   □ Verify: gcloud auth list

✅ GitHub
   □ SSH key or PAT generated
   □ Verify: ssh -T git@github.com

✅ Vercel
   □ Account created
   □ CLI installed: npm install -g vercel
   □ Login: vercel login
   □ Verify: vercel whoami

✅ Domain Registrar
   □ Logged into registrar
   □ DNS records ready to update

✅ Database
   □ .env file created
   □ DB_USER and DB_PASS set

✅ API/Integrations
   □ JWT tokens tested
   □ Platform credentials saved
```

---

## 🚀 Quick Auth Setup (All at Once)

```bash
#!/bin/bash

echo "🔐 Setting up all authentication...\n"

# 1. Docker Hub
echo "1/5: Docker Hub"
docker login
echo "✅ Docker Hub authenticated\n"

# 2. Google Cloud
echo "2/5: Google Cloud"
gcloud auth login
gcloud config set project openautonomyx
echo "✅ Google Cloud authenticated\n"

# 3. Vercel
echo "3/5: Vercel"
npm install -g vercel
vercel login
echo "✅ Vercel authenticated\n"

# 4. GitHub SSH
echo "4/5: GitHub SSH"
ssh -T git@github.com
echo "✅ GitHub authenticated\n"

# 5. Create .env
echo "5/5: Environment variables"
cat > .env << 'EOF'
DB_USER=postgres
DB_PASS=your_secure_password
DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/publishing_platform
EOF
echo "✅ .env created\n"

echo "🎉 All authentication setup complete!"
```

---

## 📊 Auth Status

| Service | Status | Command to Check |
|---------|--------|------------------|
| Docker | ❌ | `docker login && docker info` |
| Google Cloud | ❌ | `gcloud auth list` |
| GitHub | ❌ | `ssh -T git@github.com` |
| Vercel | ❌ | `vercel whoami` |
| Database | ❌ | `cat .env` |

Run these commands to verify all auth is working!

---

🔐 **All authentication requirements documented. Ready to deploy!**
