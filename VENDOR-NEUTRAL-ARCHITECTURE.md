# Vendor-Neutral Architecture

**OpenAutonomyX: Build Once, Deploy Anywhere, On Any Infrastructure**

> © 2026 OpenAutonomyX Contributors
> Built with Claude AI (Anthropic AI Coding Agent)
> Licensed under MIT License

---

## 🎯 Core Principles

### 1. **No Vendor Lock-in**
- Swap LLM providers with a config change
- Switch databases without code changes
- Deploy on any cloud, on-premise, or hybrid
- Use open standards everywhere

### 2. **Local-First**
- Run everything locally by default
- No cloud vendor required
- Minimal dependencies
- Full data privacy

### 3. **Supply Chain Security**
- Every dependency tracked (SBOM)
- Vulnerability scanning built-in
- Compliance reporting automated
- Risk assessment continuous

### 4. **Configuration-Driven**
- UI-based admin panel (no code changes)
- Hot-reload configuration
- Multi-environment support
- Version-controlled settings

---

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│              Application Layer                      │
│  (Content creation, publishing, analytics)          │
└────────────────────┬────────────────────────────────┘
                     │
┌─────────────────────┴────────────────────────────────┐
│          Abstraction/Router Layer                    │
│  (LLM Router, Database Adapter, Storage Router)     │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌─────────┐
   │  LLM   │  │Database │  │ Storage │
   │Provider│  │Provider │  │Provider │
   └────────┘  └─────────┘  └─────────┘
        │            │            │
   ┌────┴──┬─────┬───┴────┬──┐    │
   │ │     │     │        │  │    │
 Local Cloud Enterprise On-Prem Hybrid
(Ollama,    (OpenAI,   (Azure, Various Options:
LLaMA)      Anthropic) AWS)    • PostgreSQL
                               • MySQL
                               • MongoDB
                               • DuckDB (local)
                               
                               • S3
                               • MinIO
                               • Local Disk
```

---

## 🔄 LLM Provider Abstraction

### Supported Providers

**Local (No Cost, Full Privacy)**
```
• Ollama (easiest setup)
  - Mistral (7B - fast)
  - LLaMA 2 (7-70B - capable)
  - Neural Chat (dialogue)
  - StarCoder (code)

• LLaMA.cpp (optimized)
  - ggml quantization
  - CPU/GPU support
  - ~2-8GB RAM usage

• vLLM (production inference)
  - High-throughput
  - Low-latency
  - Multi-GPU support
```

**Cloud (Scale, Managed)**
```
• OpenAI (GPT-4, best)
  - Pay-per-token
  - Latest models
  - Fastest

• Anthropic (Claude, balanced)
  - Constitutional AI
  - Long context
  - Reasonable cost

• Azure OpenAI
  - Enterprise SLA
  - HIPAA/PCI compliance
  - Regional deployments

• Hugging Face
  - Open models
  - Community-driven
  - Cost-effective

• Google Vertex AI
  - Gemini models
  - Enterprise integration
  - Multi-region
```

### How to Switch

**Option 1: UI Admin Panel** (Recommended)
```
1. Go to http://localhost:3000/admin
2. Select LLM Provider
3. Enter credentials or URL
4. Click Save
5. ✅ Done - auto-switches
```

**Option 2: Environment Variables**
```bash
export LLM_PROVIDER=openai
export LLM_MODEL=gpt-4
export OPENAI_API_KEY=sk-...
# Restart application
```

**Option 3: Config File**
```yaml
# config/llm.yml
provider: ollama
model: mistral
apiUrl: http://localhost:11434
temperature: 0.7
maxTokens: 512
```

---

## 📊 Database Abstraction

### Supported Databases

**Local (Embedded)**
```
• SQLite
  - Perfect for small deployments
  - Zero setup
  - Single file

• DuckDB
  - OLAP queries
  - Fast analytics
  - In-process
```

**Production (Scalable)**
```
• PostgreSQL (recommended)
  - ACID compliant
  - Powerful queries
  - JSON support
  - Full-text search

• MySQL/MariaDB
  - Traditional RDBMS
  - Wide hosting support
  - Good performance

• MongoDB
  - Document-oriented
  - Flexible schema
  - Horizontal scaling

• CockroachDB
  - Distributed SQL
  - Multi-region
  - Enterprise-ready
```

### How to Switch

**Config-driven selection:**
```yaml
database:
  type: postgresql  # or mysql, mongodb, sqlite
  host: localhost
  port: 5432
  name: openautonomyx
  user: ${DB_USER}
  password: ${DB_PASSWORD}
```

---

## 💾 Storage Abstraction

### Supported Storage

**Local (Development)**
```
• Local Filesystem
  - No setup needed
  - Perfect for testing
  - Single machine
```

**Cloud (Production)**
```
• AWS S3
  - Industry standard
  - Highly available
  - Cost-effective scale

• Azure Blob Storage
  - Enterprise integration
  - GDPR compliant
  - Tiered pricing

• Google Cloud Storage
  - Multi-region
  - Strong consistency
  - Analytics built-in

• MinIO (S3-compatible)
  - Self-hosted S3
  - On-premise option
  - Zero vendor lock-in
```

### Configuration

```yaml
storage:
  type: s3  # or azure, gcs, minio, local
  bucket: openautonomyx-media
  region: us-east-1
  credentials:
    accessKeyId: ${AWS_ACCESS_KEY_ID}
    secretAccessKey: ${AWS_SECRET_ACCESS_KEY}
```

---

## 🔐 Supply Chain Security

### SBOM (Software Bill of Materials)

**Automatic Generation**
```bash
npm run generate:sbom
# Outputs: sbom.xml (CycloneDX format)
```

**Tracks:**
- ✅ Every dependency & version
- ✅ License compliance
- ✅ Known vulnerabilities
- ✅ Vendor lock-in indicators
- ✅ Update recommendations

### Vulnerability Scanning

**Built-in Checks:**
```
✅ NVD (National Vulnerability Database)
✅ OSV (Open Source Vulnerabilities)
✅ Snyk integration ready
✅ GitHub Security Advisory
```

### Compliance Reports

**Automated:**
```
• License compliance matrix
• Supply chain risk score (0-100)
• Vendor lock-in assessment
• Recommendation engine
```

**Export Formats:**
- CycloneDX (XML, JSON)
- SPDX (standard format)
- Custom reports

---

## ⚙️ Configuration System

### Admin UI Dashboard

**Access:**
```
http://localhost:3000/admin-config.html
```

**Features:**
- 🤖 LLM provider selection
- 📦 Model management
- 🔒 SBOM generation
- 🏢 Vendor lock-in analysis
- ⚠️ Risk assessment
- 📊 Configuration summary

### No Code Changes Required

Change any of these without touching code:
```
✅ LLM provider
✅ Database
✅ Storage backend
✅ API endpoints
✅ Authentication method
✅ Feature flags
✅ Rate limits
✅ Logging level
```

---

## 📦 Repository Structure

```
openautonomyx/
├── src/
│   ├── services/
│   │   ├── llm.ts              ← LLM router (all providers)
│   │   ├── database/           ← Database adapters
│   │   ├── storage/            ← Storage providers
│   │   └── content.ts          ← Business logic
│   │
│   ├── security/
│   │   ├── sbom-generator.ts   ← SBOM generation
│   │   ├── vulnerability.ts    ← Vuln scanning
│   │   └── compliance.ts       ← Compliance checks
│   │
│   ├── admin/
│   │   ├── api/                ← Admin endpoints
│   │   └── ui/                 ← Configuration UI
│   │
│   └── config/
│       ├── llm.ts              ← LLM configuration
│       ├── database.ts         ← Database configuration
│       └── storage.ts          ← Storage configuration
│
├── config/
│   ├── llm.yml                 ← LLM settings
│   ├── database.yml            ← Database settings
│   ├── storage.yml             ← Storage settings
│   └── app.yml                 ← Application settings
│
├── public/
│   └── admin-config.html       ← Admin UI
│
├── docs/
│   ├── VENDOR-NEUTRAL.md       ← This file
│   ├── LLM-SETUP.md            ← LLM setup guide
│   └── DEPLOYMENT.md           ← Deployment guide
│
└── sbom.xml                    ← Software Bill of Materials
```

---

## 🚀 Quick Start (Vendor-Neutral)

### Step 1: Choose Your Stack

**Option A: Local Only (Recommended for Development)**
```bash
# Uses Ollama + SQLite + Local Storage
# Zero cloud dependencies
# Full privacy
export LLM_PROVIDER=ollama
export DATABASE_TYPE=sqlite
export STORAGE_TYPE=local
```

**Option B: Hybrid (Development + Production)**
```bash
# Uses Ollama locally, PostgreSQL + S3 in production
export LLM_PROVIDER=ollama          # Local
export DATABASE_TYPE=postgresql      # Cloud/On-prem
export STORAGE_TYPE=s3              # Cloud/On-prem
```

**Option C: Cloud (Maximum Scale)**
```bash
# Uses OpenAI + PostgreSQL + S3
# Best performance
# Managed services
export LLM_PROVIDER=openai
export DATABASE_TYPE=postgresql
export STORAGE_TYPE=s3
```

### Step 2: Install Local LLM (if using Ollama)

```bash
# macOS
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Step 3: Start Ollama

```bash
ollama serve
# Runs on http://localhost:11434
```

### Step 4: Pull a Model

```bash
ollama pull mistral              # 7B, fast
# or
ollama pull llama2               # 7B-70B, more capable
# or
ollama pull neural-chat          # Good for dialogue
```

### Step 5: Start OpenAutonomyX

```bash
npm install
npm start
# Automatically detects Ollama
# Opens on http://localhost:3000
```

### Step 6: Configure (Optional)

```bash
# Go to admin panel
open http://localhost:3000/admin-config.html

# Or use environment variables
export OPENAI_API_KEY=sk-...
export DATABASE_URL=postgresql://...
export AWS_ACCESS_KEY_ID=...
```

---

## 📊 Comparison: Vendor-Neutral vs Locked-in

| Feature | OpenAutonomyX | Typical SaaS |
|---------|---|---|
| **Swap LLM provider** | ✅ 1 config change | ❌ Rebuild, redeploy |
| **Use local LLM** | ✅ Yes, built-in | ❌ Not supported |
| **Data privacy** | ✅ 100% (local mode) | ❌ Cloud-only |
| **Cost control** | ✅ Choose your spend | ❌ Vendor decides |
| **Custom deployment** | ✅ Any infrastructure | ❌ Their servers only |
| **Ownership** | ✅ Your data, your code | ❌ Vendor owns everything |
| **Audit & compliance** | ✅ Full transparency | ❌ Vendor gates access |

---

## 🔗 Integration Paths

### Path 1: Local Development
```
Your Laptop
├── Ollama (free)
├── SQLite (embedded)
└── Local filesystem
= Zero cost, full control
```

### Path 2: Enterprise On-Prem
```
Your Data Center
├── LLaMA.cpp (self-hosted LLM)
├── PostgreSQL (on-prem DB)
├── MinIO S3 (on-prem storage)
└── Kubernetes (orchestration)
= Full privacy, complete control
```

### Path 3: Hybrid (Dev + Prod)
```
Development:
├── Ollama (local)
├── SQLite (local)
└── Local filesystem

Production:
├── OpenAI/Anthropic (pay-as-you-go)
├── PostgreSQL (managed RDS)
└── S3/MinIO (object storage)
= Best of both worlds
```

### Path 4: Enterprise Cloud
```
Azure/AWS/GCP
├── Cloud LLM (Azure OpenAI, Bedrock, etc.)
├── Managed Database (RDS, CosmosDB)
├── Object Storage (S3, Blob, GCS)
└── Kubernetes/AppService (orchestration)
= Enterprise SLA, global scale
```

---

## ✅ Compliance & Security Checklist

- [ ] SBOM generated monthly
- [ ] Vulnerability scan passing
- [ ] License compliance verified
- [ ] Vendor lock-in score < 30
- [ ] Configuration audit logged
- [ ] Data encryption enabled
- [ ] Access controls configured
- [ ] Backup strategy tested
- [ ] Disaster recovery plan documented
- [ ] Security training completed

---

## 📞 Support & Community

- **Docs:** https://openautonomyx.com/docs
- **GitHub:** https://github.com/openautonomyx/openautonomyx
- **Discord:** https://discord.gg/openautonomyx
- **Issues:** https://github.com/openautonomyx/openautonomyx/issues

---

**Built with ❤️ for independence, privacy, and freedom.** 🚀

*Your data. Your code. Your rules.*
