# 🏛️ AGenNext Agent Registry

**Official canonical registry for all VPS Operator Agents**

Repository: `github.com/AGenNext/agent-registry` (Official - Do Not Fork)

---

## 📦 Repository Structure

```
agent-registry/
├── README.md                          # Main registry overview
├── REGISTRY.json                      # Machine-readable agent index
├── CONTRIBUTING.md                    # How to register agents
├── LICENSE                            # License
│
├── agents/                            # Official agent definitions
│  ├── vps-operator-agent/
│  │  ├── agent.json                  # Agent metadata
│  │  ├── schema.json                 # Agent schema
│  │  ├── README.md                   # Agent documentation
│  │  └── versions/
│  │     ├── 1.0/
│  │     │  ├── manifest.json
│  │     │  └── checksum
│  │     └── latest -> 1.0
│  │
│  ├── deployment-agent/
│  │  ├── agent.json
│  │  ├── schema.json
│  │  ├── README.md
│  │  └── versions/
│  │
│  └── monitoring-agent/
│     ├── agent.json
│     ├── schema.json
│     ├── README.md
│     └── versions/
│
├── tools/                             # Tool registry
│  ├── tools.json                     # Master tool index
│  ├── vps-automation/
│  │  ├── tool.json
│  │  └── schema.json
│  │
│  ├── github-actions-ci-cd/
│  │  ├── tool.json
│  │  └── schema.json
│  │
│  ├── vps-monitoring/
│  │  ├── tool.json
│  │  └── schema.json
│  │
│  └── vps-operator/
│     ├── tool.json
│     └── schema.json
│
├── capabilities/                      # Capability definitions
│  ├── capabilities.json              # Master capability index
│  ├── monitoring.json
│  ├── deployment.json
│  ├── incident-response.json
│  └── maintenance.json
│
├── schemas/                           # JSON schemas
│  ├── agent-schema.json
│  ├── tool-schema.json
│  ├── capability-schema.json
│  └── registry-schema.json
│
├── docs/                              # Documentation
│  ├── REGISTRY-FORMAT.md             # How registry works
│  ├── AGENT-REQUIREMENTS.md          # What agents must implement
│  ├── TOOL-REQUIREMENTS.md           # What tools must implement
│  └── EXAMPLES.md                    # Example registrations
│
└── scripts/                           # Utility scripts
   ├── validate.sh                    # Validate registry
   ├── list-agents.sh                 # List all agents
   ├── list-tools.sh                  # List all tools
   └── verify-checksums.sh            # Verify integrity
```

---

## 📋 REGISTRY.json (Master Index)

```json
{
  "$schema": "https://agenext.dev/schemas/registry-v1.json",
  "version": "1.0",
  "registry": {
    "name": "AGenNext Official Agent Registry",
    "description": "Canonical registry for all AGenNext agents",
    "maintainer": "AGenNext Organization",
    "repository": "https://github.com/AGenNext/agent-registry",
    "homepage": "https://agenext.dev/registry",
    "lastUpdated": "2026-06-25T00:00:00Z"
  },
  "agents": [
    {
      "id": "vps-operator-agent",
      "name": "VPS Operator Agent",
      "version": "1.0.0",
      "status": "stable",
      "description": "Autonomous VPS management with human oversight",
      "author": "AGenNext",
      "repository": "https://github.com/AGenNext/vps-operator-agent",
      "capabilities": [
        "monitoring",
        "incident-response",
        "deployment",
        "maintenance"
      ],
      "tools": [
        "vps-automation",
        "github-actions-ci-cd",
        "vps-monitoring",
        "vps-operator"
      ],
      "authorization": {
        "levels": 3,
        "escalation": true,
        "humanOversight": true
      },
      "documentation": {
        "constitution": "AGENT-CONSTITUTION.md",
        "instructions": "AGENT-INSTRUCTIONS.md",
        "handbook": "AGENT-HANDBOOK.md",
        "language": "AGENT-LANGUAGE.md"
      },
      "certification": {
        "certified": true,
        "date": "2026-06-25",
        "version": "1.0"
      }
    }
  ],
  "tools": [
    {
      "id": "vps-automation",
      "name": "VPS Automation Agent",
      "version": "1.0.0",
      "status": "stable",
      "type": "deployment",
      "description": "Full platform deployment automation"
    },
    {
      "id": "github-actions-ci-cd",
      "name": "GitHub Actions CI/CD",
      "version": "1.0.0",
      "status": "stable",
      "type": "ci-cd",
      "description": "Automated deployment pipeline"
    },
    {
      "id": "vps-monitoring",
      "name": "VPS Monitoring Agent",
      "version": "1.0.0",
      "status": "stable",
      "type": "monitoring",
      "description": "24/7 health monitoring"
    },
    {
      "id": "vps-operator",
      "name": "VPS Operator Agent",
      "version": "1.0.0",
      "status": "stable",
      "type": "operations",
      "description": "On-demand VPS operations"
    }
  ],
  "stats": {
    "totalAgents": 1,
    "stableAgents": 1,
    "betaAgents": 0,
    "totalTools": 4,
    "totalCapabilities": 4
  }
}
```

---

## 🤖 agents/vps-operator-agent/agent.json

```json
{
  "$schema": "https://agenext.dev/schemas/agent-v1.json",
  "metadata": {
    "id": "vps-operator-agent",
    "name": "VPS Operator Agent",
    "version": "1.0.0",
    "codename": "VPS-OPS-001",
    "status": "stable",
    "releaseDate": "2026-06-25"
  },
  "identity": {
    "author": "AGenNext",
    "organization": "AGenNext",
    "repository": "https://github.com/AGenNext/vps-operator-agent",
    "license": "Apache-2.0",
    "maintainers": [
      {
        "name": "AGenNext Team",
        "email": "team@agenext.dev",
        "role": "maintainer"
      }
    ]
  },
  "description": {
    "short": "Autonomous VPS management with human oversight",
    "long": "24/7 VPS monitoring, incident response, and operations management with formal authority hierarchy and constitutional governance",
    "purpose": "Maintain continuous operational health of all VPS services through proactive monitoring, rapid incident response, and intelligent remediation"
  },
  "capabilities": {
    "monitoring": {
      "enabled": true,
      "description": "24/7 health monitoring of 5 core services",
      "interval": "60 seconds"
    },
    "incident-response": {
      "enabled": true,
      "description": "Automatic incident diagnosis and remediation",
      "scenarios": 5
    },
    "deployment": {
      "enabled": true,
      "description": "Application deployment and rollback",
      "verification": "health-checks"
    },
    "maintenance": {
      "enabled": true,
      "description": "Preventive maintenance and optimization",
      "operations": 20
    }
  },
  "authority": {
    "levels": 3,
    "level1": {
      "name": "Autonomous",
      "description": "Agent executes without human approval",
      "examples": ["status", "diagnostics", "logs", "report"]
    },
    "level2": {
      "name": "Conditional",
      "description": "Agent executes after diagnostics verify issue",
      "examples": ["restart api", "deploy-api", "clean-logs"]
    },
    "level3": {
      "name": "Escalate",
      "description": "Human approval required before execution",
      "examples": ["restore-database", "rollback", "restart-all"]
    }
  },
  "tools": [
    {
      "id": "vps-automation",
      "role": "deployment",
      "required": true
    },
    {
      "id": "github-actions-ci-cd",
      "role": "ci-cd",
      "required": true
    },
    {
      "id": "vps-monitoring",
      "role": "monitoring",
      "required": true
    },
    {
      "id": "vps-operator",
      "role": "operations",
      "required": true
    }
  ],
  "documentation": {
    "constitution": {
      "file": "AGENT-CONSTITUTION.md",
      "purpose": "Binding legal and ethical principles",
      "articles": 12
    },
    "instructions": {
      "file": "AGENT-INSTRUCTIONS.md",
      "purpose": "Complete operational instructions",
      "sections": 8
    },
    "handbook": {
      "file": "AGENT-HANDBOOK.md",
      "purpose": "Complete reference guide",
      "parts": 8
    },
    "language": {
      "file": "AGENT-LANGUAGE.md",
      "purpose": "Formal communication protocol",
      "tiers": 4
    },
    "masterIndex": {
      "file": "AGENT-MASTER-INDEX.md",
      "purpose": "Navigation and cross-references"
    },
    "binding": {
      "file": "AGENT-COMPLETE-BINDING.md",
      "purpose": "Master integration document"
    }
  },
  "requirements": {
    "infrastructure": {
      "vps": "agennext.com",
      "os": "AlmaLinux 9+",
      "docker": "24.0+",
      "memory": "2.5GB minimum"
    },
    "services": [
      "PostgreSQL 15",
      "Redis 7",
      "Go API 1.21",
      "Nginx",
      "Liferay DXP"
    ],
    "permissions": {
      "ssh": "required",
      "docker": "required",
      "systemctl": "required"
    ]
  },
  "certification": {
    "certified": true,
    "certificationDate": "2026-06-25",
    "certificationVersion": "1.0",
    "standards": [
      "AGenNext Constitutional Framework",
      "AGenNext Language Specification",
      "AGenNext Tool Integration Protocol"
    ]
  },
  "deployment": {
    "method": "docker",
    "imageName": "ghcr.io/AGenNext/vps-operator-agent",
    "imageTag": "1.0.0",
    "environment": {
      "VPS_HOST": "agennext.com",
      "VPS_USER": "almalinux",
      "VPS_PASSWORD": "${SECRET}"
    },
    "healthCheck": {
      "command": "bash deploy/vps-operator-agent.sh status",
      "interval": 60,
      "timeout": 10
    }
  },
  "support": {
    "documentation": "https://agenext.dev/agents/vps-operator",
    "issues": "https://github.com/AGenNext/vps-operator-agent/issues",
    "discussions": "https://github.com/orgs/AGenNext/discussions",
    "email": "support@agenext.dev"
  }
}
```

---

## 🔧 tools/tools.json (Tool Master Index)

```json
{
  "$schema": "https://agenext.dev/schemas/tools-v1.json",
  "version": "1.0",
  "tools": [
    {
      "id": "vps-automation",
      "name": "VPS Automation Agent",
      "version": "1.0.0",
      "status": "stable",
      "type": "deployment",
      "category": "infrastructure",
      "description": "Full platform deployment from scratch",
      "purpose": "Complete VPS setup and provisioning",
      "phases": 6,
      "documentation": "deploy/vps-automation-agent.sh",
      "capabilities": ["deployment", "provisioning", "verification"],
      "authority": "level1-manual"
    },
    {
      "id": "github-actions-ci-cd",
      "name": "GitHub Actions CI/CD Pipeline",
      "version": "1.0.0",
      "status": "stable",
      "type": "ci-cd",
      "category": "automation",
      "description": "Automated deployment on code push",
      "purpose": "Continuous integration and deployment",
      "triggers": ["push-main", "manual-dispatch"],
      "documentation": ".github/workflows/deploy-vps.yml",
      "capabilities": ["build", "test", "deploy", "rollback"],
      "authority": "level2-automated"
    },
    {
      "id": "vps-monitoring",
      "name": "VPS Monitoring Agent",
      "version": "1.0.0",
      "status": "stable",
      "type": "monitoring",
      "category": "operations",
      "description": "24/7 health monitoring and auto-recovery",
      "purpose": "Continuous health checks",
      "interval": 60,
      "documentation": "deploy/vps-monitoring-agent.sh",
      "capabilities": ["monitoring", "health-check", "auto-recovery", "alerting"],
      "authority": "level1-autonomous"
    },
    {
      "id": "vps-operator",
      "name": "VPS Operator Agent",
      "version": "1.0.0",
      "status": "stable",
      "type": "operations",
      "category": "infrastructure",
      "description": "On-demand VPS operations and incident response",
      "purpose": "Manual and automated operations",
      "commands": 20,
      "documentation": "deploy/vps-operator-agent.sh",
      "capabilities": [
        "status",
        "diagnostics",
        "restart",
        "deploy",
        "backup",
        "restore",
        "maintenance"
      ],
      "authority": "level1-3-mixed"
    }
  ]
}
```

---

## 📄 README.md (Registry Homepage)

```markdown
# AGenNext Agent Registry

**Official canonical registry for all AGenNext agents**

Registry: `github.com/AGenNext/agent-registry` ✅ Official (Do Not Fork)

## Overview

This repository maintains the authoritative registry of:
- ✅ Official AGenNext agents
- ✅ Certified agent tools
- ✅ Agent capabilities
- ✅ Agent versions and releases
- ✅ Agent documentation references

## Quick Start

### Find an Agent
```bash
./scripts/list-agents.sh
```

### Find a Tool
```bash
./scripts/list-tools.sh
```

### Validate Registry
```bash
./scripts/validate.sh
```

## Registered Agents

| Agent | Version | Status | Purpose |
|-------|---------|--------|---------|
| **VPS Operator Agent** | 1.0.0 | Stable | 24/7 VPS operations & incident response |

## Registered Tools

| Tool | Version | Type | Purpose |
|------|---------|------|---------|
| VPS Automation Agent | 1.0.0 | Deployment | Full platform provisioning |
| GitHub Actions CI/CD | 1.0.0 | CI/CD | Automated deployment pipeline |
| VPS Monitoring Agent | 1.0.0 | Monitoring | 24/7 health monitoring |
| VPS Operator Agent | 1.0.0 | Operations | On-demand VPS operations |

## Registry Format

All agent registrations follow the official JSON schema:
- `agents/*/agent.json` - Agent metadata
- `tools/*/tool.json` - Tool metadata
- `REGISTRY.json` - Master index

See [REGISTRY-FORMAT.md](docs/REGISTRY-FORMAT.md) for details.

## Contributing

To register a new agent:
1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Read [AGENT-REQUIREMENTS.md](docs/AGENT-REQUIREMENTS.md)
3. Create agent directory under `agents/`
4. Submit PR with `agent.json` and documentation
5. Pass validation checks
6. Get approved by maintainers

## Official Documentation

- [Agent Registry Format](docs/REGISTRY-FORMAT.md)
- [Agent Requirements](docs/AGENT-REQUIREMENTS.md)
- [Tool Requirements](docs/TOOL-REQUIREMENTS.md)
- [Examples](docs/EXAMPLES.md)

## License

All agents in this registry are licensed under Apache 2.0.

## Support

- 📖 Documentation: https://agenext.dev/registry
- 💬 Discussions: https://github.com/orgs/AGenNext/discussions
- 🐛 Issues: https://github.com/AGenNext/agent-registry/issues
- 📧 Email: registry@agenext.dev

---

**Official Registry - Do Not Fork**
```

---

## 🎯 HOW TO USE THIS REGISTRY

### For VPS Operator Agent Registration

```bash
# 1. Create the repository structure locally
mkdir -p agent-registry
cd agent-registry

# 2. Copy all registry files
# Include: REGISTRY.json, agents/, tools/, docs/, scripts/

# 3. Create the VPS Operator Agent entry
# File: agents/vps-operator-agent/agent.json

# 4. Validate registry
./scripts/validate.sh

# 5. Push to AGenNext GitHub Organization
git remote add origin https://github.com/AGenNext/agent-registry.git
git push -u origin main
```

### Key Points

✅ **Official Repository** - Single source of truth  
✅ **No Forks** - Canonical structure only  
✅ **Versioned Agents** - Track all versions  
✅ **Tool Registry** - All tools indexed  
✅ **Certification** - Only certified agents listed  
✅ **Machine Readable** - JSON schemas for validation  
✅ **Documentation** - Links to all docs  

---

## ✅ REGISTRY STRUCTURE READY

This is the canonical structure for:
- `github.com/AGenNext/agent-registry` (Official)

**Do not deviate. Do not fork. Use this structure as-is.**

All VPS Operator Agent information will be indexed here.
```
