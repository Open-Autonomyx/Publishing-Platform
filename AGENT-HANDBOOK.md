# 🎓 VPS Operator Agent Handbook

**Complete reference guide for the VPS Operator Agent**  
**Binds agent instructions, tools, decision trees, and operational procedures**

---

## 📖 How to Use This Handbook

**This handbook is split into sections:**

1. **Agent Identity** - Who the agent is and its scope
2. **Tool Registry** - Available tools and how to use them
3. **Decision Trees** - Logic for when to use each tool
4. **Operational Procedures** - Daily, weekly, monthly routines
5. **Command Reference** - All commands and their syntax
6. **Incident Response** - Step-by-step for emergencies
7. **Quick Lookup** - Fast reference cards

---

## 🤖 PART 1: AGENT IDENTITY & SCOPE

### Who Is the VPS Operator Agent?

```
Role:           Autonomous VPS operations manager
Authority:      Full operational control with human oversight
Responsibilities:
  - Monitor 5 services 24/7
  - Diagnose issues immediately
  - Execute remediation automatically
  - Report findings to humans
  - Maintain performance and reliability
  
Decision Level:  
  Level 1: Execute autonomously (read-only operations)
  Level 2: Execute after diagnostics (service restarts)
  Level 3: Escalate to human (data-destructive operations)
```

### What Systems Does It Manage?

```
5 Core Services:
  1. PostgreSQL 15     (Database)
  2. Redis 7           (Cache)
  3. Go API            (Application)
  4. Nginx             (Reverse Proxy)
  5. Liferay DXP       (Content Management)

Supporting Systems:
  - Docker daemon
  - Systemd services
  - SSL/TLS certificates
  - System resources (disk, memory, CPU)
```

---

## 🛠️ PART 2: TOOL REGISTRY

### All 4 Tools Available

#### Tool 1: VPS Automation Agent
```
File:     deploy/vps-automation-agent.sh
Purpose:  Full platform deployment from scratch
When:     Initial setup, complete re-provisioning
Phase 1:  System setup        (Docker, Nginx, Certbot)
Phase 2:  Database          (PostgreSQL, schema load)
Phase 3:  Services          (Redis, Liferay)
Phase 4:  API & Proxy       (Go API, Nginx routes)
Phase 5:  SSL               (Let's Encrypt, auto-renewal)
Phase 6:  Verification      (Health checks)

Usage:
  chmod +x deploy/vps-automation-agent.sh
  VPS_PASSWORD='pw' bash deploy/vps-automation-agent.sh

Output:
  ✅ Complete deployment in 15-20 minutes
  ✅ All services verified running
  ✅ Credentials saved to ~/.creative-platform/

Risk:    HIGH (destructive - full deployment)
Authority: Human decision only
```

---

#### Tool 2: GitHub Actions CI/CD Pipeline
```
File:     .github/workflows/deploy-vps.yml
Purpose:  Automatic deployment on code push
When:     Every push to main branch
Trigger:  git push origin main OR manual dispatch

Pipeline:
  1. Checkout code
  2. Build Go API + run tests
  3. Build Docker image
  4. Push to GHCR (GitHub Container Registry)
  5. SSH to VPS and deploy
  6. Run health checks
  7. Auto-rollback if health checks fail
  8. Send Slack notification

Usage:
  # Automatic (on git push)
  git push origin main
  
  # Manual
  gh workflow run deploy-vps.yml

Output:
  ✅ Deployment successful → Slack notification
  ❌ Deployment failed → Auto-rollback + alert

Risk:    MEDIUM (auto-rollback on health check fail)
Authority: Automatic (checks before commitment)
```

---

#### Tool 3: VPS Monitoring Agent
```
File:     deploy/vps-monitoring-agent.sh
Purpose:  24/7 health monitoring and auto-recovery
When:     Continuous (every 60 seconds)
Interval: MONITOR_INTERVAL=60 (configurable)

Checks (Every 60 Seconds):
  ✅ Docker daemon status
  ✅ Container status (all 5)
  ✅ PostgreSQL (pg_isready)
  ✅ Redis (redis-cli ping)
  ✅ API health (/health endpoint)
  ✅ Nginx systemd status
  ✅ Disk usage (alert if >80%)
  ✅ Memory usage (alert if >85%)
  ✅ SSL certificate expiry

Auto-Recovery:
  Service fails → Restart → Verify → Alert if still down

Usage:
  bash deploy/vps-monitoring-agent.sh setup      # Install service
  bash deploy/vps-monitoring-agent.sh monitor-loop  # Start continuous
  bash deploy/vps-monitoring-agent.sh check      # Single check

Output:
  [14:30:45] [INFO] Docker is healthy ✓
  [14:30:47] [INFO] PostgreSQL is healthy ✓
  [14:30:50] [INFO] API is healthy ✓
  [14:31:00] [INFO] ✅ All checks passed

Risk:    LOW (auto-recovery with verification)
Authority: Automatic (runs 24/7)
```

---

#### Tool 4: VPS Operator Agent (YOU)
```
File:     deploy/vps-operator-agent.sh
Purpose:  On-demand operations and incident response
When:     Manual execution by operator
Commands: 20+ operations organized into 6 categories

Categories:
  1. Status & Diagnostics    (status, diagnostics, performance, logs)
  2. Service Management      (restart, restart-all, deploy-api, rollback)
  3. Maintenance            (clean-logs, cleanup-disk)
  4. SSL/TLS                (check-ssl, renew-ssl)
  5. Backup & Recovery      (backup-database, restore-database)
  6. Reporting              (report)

Usage:
  bash deploy/vps-operator-agent.sh {command}
  
  Examples:
    bash deploy/vps-operator-agent.sh status
    VPS_PASSWORD='pw' bash deploy/vps-operator-agent.sh diagnostics
    bash deploy/vps-operator-agent.sh restart api
    bash deploy/vps-operator-agent.sh backup-database

Output:
  Colored output with ✅/✗ status
  Logs to ~/.creative-platform/operator-reports/
  Slack alerts if critical

Risk:    VARIABLE (depends on command)
Authority: Agent decision (within scope)
```

---

## 🎯 PART 3: TOOL BINDING DECISION TREE

### When to Use Which Tool?

```
Scenario                          Tool        Reasoning
───────────────────────────────────────────────────────────────────
New VPS deployment                Tool 1      Full setup needed
                                             6-phase automation

Weekly code push                  Tool 2      Automatic CI/CD
                                             Builds & deploys

24/7 monitoring                   Tool 3      Continuous health
                                             Auto-recovery

Daily health check                Tool 4      Manual diagnostics
                                             
API not responding                Tool 4      Diagnose + restart
                                             
High disk usage                   Tool 4      clean-logs/cleanup-disk
                                             
Certificate expiring              Tool 4      renew-ssl
                                             
Disaster recovery                 Tool 4      restore-database
                                             
Performance analysis              Tool 4      performance command
                                             
All systems down                  Tool 4      restart-all
```

---

## 📋 PART 4: COMMAND REFERENCE

### Tool 4 Commands (The Operator Agent)

#### 🔍 READ-ONLY COMMANDS (SAFE ANYTIME)

```bash
# 1. Status Check (1 minute)
bash deploy/vps-operator-agent.sh status
├─ Uptime, load average
├─ CPU, memory, disk
├─ Container status
├─ Service health
└─ Network stats

# 2. Full Diagnostics (2 minutes)
VPS_PASSWORD='pw' bash deploy/vps-operator-agent.sh diagnostics
├─ Docker daemon: ✓/✗
├─ Disk usage: alert/warn/ok
├─ Memory usage: alert/warn/ok
├─ Container count: expect 5
├─ API health: HTTP status
├─ Database: pg_isready
├─ Redis: redis-cli ping
└─ Report: # issues found

# 3. Performance Analysis (1 minute)
VPS_PASSWORD='pw' bash deploy/vps-operator-agent.sh performance
├─ Top CPU processes
├─ Memory breakdown
├─ Disk I/O stats
├─ Docker container stats
└─ Network connections

# 4. View Logs (30 seconds)
bash deploy/vps-operator-agent.sh logs {container}
├─ Last 50 log lines
├─ Error count
├─ Last 5 errors
└─ Timestamp analysis

Containers: api, postgres, redis, liferay
Example:
  bash deploy/vps-operator-agent.sh logs api

# 5. Check SSL Certificate (10 seconds)
bash deploy/vps-operator-agent.sh check-ssl
├─ Expiry date
├─ Days until expiry
└─ Status: EXPIRED/EXPIRING/VALID

# 6. Generate Report (1 minute)
bash deploy/vps-operator-agent.sh report
├─ Comprehensive system state
├─ All diagnostics
├─ Container details
└─ Saved to: ~/.creative-platform/operator-reports/
```

**Risk Level: NONE (All read-only)**  
**Decision Level: Agent can execute anytime**

---

#### 🔧 SERVICE MANAGEMENT COMMANDS (CONDITIONAL)

```bash
# 1. Restart Single Service
bash deploy/vps-operator-agent.sh restart {service}
├─ Stop container
├─ Wait 3 seconds
├─ Start container
├─ Wait 5 seconds
├─ Verify running
└─ Report: success/fail

Services: api, postgres, redis, liferay, nginx
Example:
  bash deploy/vps-operator-agent.sh restart api
Recovery time: 10-30 seconds

# 2. Restart All Services
bash deploy/vps-operator-agent.sh restart-all
├─ Restart in sequence: postgres → redis → api → liferay → nginx
├─ Each waits for healthy start
└─ Final verification: all running
Recovery time: 60-120 seconds

# 3. Deploy New API Version
bash deploy/vps-operator-agent.sh deploy-api
├─ Pull latest from GHCR
├─ Stop old container
├─ Start new container
├─ Health check /health endpoint
└─ Status: success/fail or auto-rollback
Recovery time: 30-60 seconds

# 4. Rollback Deployment
bash deploy/vps-operator-agent.sh rollback
├─ Stop new version
├─ Start previous version
├─ Health check
└─ Status: success/fail
Recovery time: 30 seconds
```

**Risk Level: LOW (auto-verify before success)**  
**Decision Level: Execute after diagnostics**

---

#### 🧹 MAINTENANCE COMMANDS (SAFE)

```bash
# 1. Clean Old Logs
bash deploy/vps-operator-agent.sh clean-logs
├─ Remove old logs from containers
├─ Space freed: 200-500MB typically
└─ No service impact

Usage: Routine maintenance, or if disk >60%

# 2. Cleanup Unused Docker Objects
bash deploy/vps-operator-agent.sh cleanup-disk
├─ Remove unused images
├─ Remove unused volumes
├─ Remove unused networks
├─ Remove dangling containers
└─ Space freed: 500MB-2GB typically

Usage: Routine maintenance, or if disk >60%
```

**Risk Level: VERY LOW (unused objects only)**  
**Decision Level: Agent can execute proactively**

---

#### 🔐 SSL/TLS COMMANDS (IMPORTANT)

```bash
# 1. Check Certificate Status
bash deploy/vps-operator-agent.sh check-ssl
├─ Expiry date
├─ Days until expiry
└─ Status: EXPIRED / EXPIRING SOON / VALID

Usage: Weekly check, or if alert received

# 2. Renew Certificate
bash deploy/vps-operator-agent.sh renew-ssl
├─ Request new certificate from Let's Encrypt
├─ Install in Nginx
├─ Reload Nginx
└─ Verify HTTPS works

Usage: If days < 7, or manually anytime

Alert Rule:
  If days < 7 → Automatic renewal attempt
  If renewal fails → Escalate to human
```

**Risk Level: LOW (renewal is safe)**  
**Decision Level: Execute automatically if expiring**

---

#### 💾 BACKUP & RECOVERY COMMANDS (CRITICAL)

```bash
# 1. Backup Database (SAFE - NO DOWNTIME)
bash deploy/vps-operator-agent.sh backup-database
├─ Creates PostgreSQL dump
├─ Saves to: ~/.creative-platform/operator-reports/
├─ Filename: database-backup-{TIMESTAMP}.sql
└─ No downtime

Usage: 
  - Before major changes
  - After corruption detected
  - Routine daily backups

# 2. Restore Database (REQUIRES CONFIRMATION)
bash deploy/vps-operator-agent.sh restore-database {backup-file}
├─ Stops API
├─ Restores database from file
├─ Starts API
└─ Verify data integrity

Usage: 
  bash deploy/vps-operator-agent.sh restore-database database-backup-20260625.sql

Data Loss Risk: YES (overwrites current database)
Requires: HUMAN CONFIRMATION
```

**Backup Backup Schedule:**
```
Automatic: Daily at 2am UTC (if monitoring configured)
Manual:    Any time before deployments
Retention: Keep 7 rolling daily backups
Storage:   ~/.creative-platform/operator-reports/
```

**Risk Level: MEDIUM (restore is destructive)**  
**Decision Level: Backup = autonomous, Restore = human only**

---

#### 📊 REPORTING COMMAND

```bash
# Generate Comprehensive Report
bash deploy/vps-operator-agent.sh report
├─ Timestamp
├─ Uptime, load, disk, memory
├─ Container status (all 5)
├─ Service status (all 8)
├─ All diagnostics
└─ Saved to: ~/.creative-platform/operator-reports/report-{TIMESTAMP}.json

Usage:
  - Weekly review
  - Incident postmortem
  - Escalation to human
  - Performance trending
```

**Risk Level: NONE (informational only)**  
**Decision Level: Agent can generate anytime**

---

## 🚨 PART 5: INCIDENT RESPONSE PROCEDURES

### Scenario 1: API Not Responding

```
Immediate Response (0-2 min):
├─ Run: bash deploy/vps-operator-agent.sh diagnostics
├─ Check: Which services failed?
├─ Run: bash deploy/vps-operator-agent.sh logs api
├─ Read: Error messages carefully
└─ Decide next action

If API container isn't running:
├─ Action: bash deploy/vps-operator-agent.sh restart api
├─ Wait: 10-15 seconds
├─ Verify: bash deploy/vps-operator-agent.sh status
└─ If OK → Document + continue monitoring
   If FAIL → Proceed to escalation

If Database is down:
├─ Action: bash deploy/vps-operator-agent.sh restart postgres
├─ Wait: 15-20 seconds
├─ Then: Restart API
├─ Verify: bash deploy/vps-operator-agent.sh diagnostics
└─ If OK → Document + continue
   If FAIL → Escalate

If still failing after restart:
├─ Action: bash deploy/vps-operator-agent.sh rollback
├─ Wait: 10 seconds
├─ Verify: bash deploy/vps-operator-agent.sh status
└─ If OK → Document + escalate for root cause
   If FAIL → Escalate immediately

Escalation (If restart/rollback fails):
├─ Action: bash deploy/vps-operator-agent.sh report
├─ Report: Save report file
├─ Alert: Notify human with findings
├─ Copy: Report file to incident folder
└─ Wait: Human decision
```

---

### Scenario 2: High Disk Usage

```
Detection:
├─ Monitoring agent alerts on disk >80%
├─ OR manual check: bash deploy/vps-operator-agent.sh status
└─ Shows: Disk usage X%

Immediate Response:
├─ If >90% → CRITICAL alert
├─ If 80-90% → WARNING
└─ Proceed to cleanup

Cleanup Phase 1 (Free ~200-500MB):
├─ Action: bash deploy/vps-operator-agent.sh clean-logs
├─ Wait: 1 minute
├─ Verify: bash deploy/vps-operator-agent.sh status
└─ Check: Did it help?

Cleanup Phase 2 (Free ~500MB-2GB):
├─ Action: bash deploy/vps-operator-agent.sh cleanup-disk
├─ Wait: 2 minutes
├─ Verify: bash deploy/vps-operator-agent.sh status
└─ If <70% → Success, continue monitoring
   If >70% → Investigate what's using disk

Deep Investigation:
├─ Run: bash deploy/vps-operator-agent.sh performance
├─ Check: What's using space?
├─ Options:
│  - Logs too large? → clean-logs again
│  - Docker images? → cleanup-disk again
│  - Database? → Might need backup + purge old data
│  - Unknown? → Escalate with report
└─ Action: Based on findings

Escalation (If still >70%):
├─ Action: bash deploy/vps-operator-agent.sh report
├─ Alert: Notify human with disk usage report
├─ Recommendation: Scale VPS or purge data
└─ Wait: Human decision
```

---

### Scenario 3: Database Issues

```
Detection:
├─ Monitoring agent detects pg_isready fail
├─ OR diagnostics show: PostgreSQL unhealthy
└─ User reports: "Database errors"

Immediate Response:
├─ Run: bash deploy/vps-operator-agent.sh diagnostics
├─ Check: Is PostgreSQL container running?
├─ Run: bash deploy/vps-operator-agent.sh logs postgres
└─ Read: Error messages

If container is down:
├─ Action: bash deploy/vps-operator-agent.sh restart postgres
├─ Wait: 10-15 seconds
├─ Verify: bash deploy/vps-operator-agent.sh diagnostics
└─ If OK → Continue monitoring
   If FAIL → Proceed to recovery

If container is up but not responding:
├─ Action: bash deploy/vps-operator-agent.sh backup-database
├─ Wait: 1-2 minutes (safety first!)
├─ Action: bash deploy/vps-operator-agent.sh restart postgres
├─ Wait: 15-20 seconds
├─ Verify: bash deploy/vps-operator-agent.sh diagnostics
└─ If OK → Continue monitoring
   If FAIL → Restore from backup (human decision)

Recovery (Restore from Backup):
├─ Decision: Human approval required (data recovery)
├─ Action: bash deploy/vps-operator-agent.sh restore-database {backup-file}
├─ Wait: 1-3 minutes depending on database size
├─ Verify: bash deploy/vps-operator-agent.sh diagnostics
└─ If OK → Monitoring continues
   If FAIL → Critical escalation

Escalation (If restore fails):
├─ Action: bash deploy/vps-operator-agent.sh report
├─ Alert: Critical database failure
├─ Escalate: Immediately to human
└─ Info: Include all diagnostic info and logs
```

---

### Scenario 4: Certificate Expiring

```
Detection:
├─ Weekly: bash deploy/vps-operator-agent.sh check-ssl
├─ Monitoring: Auto-check on certificate expiry
└─ Check shows: X days until expiry

If days > 7:
├─ Status: ✅ VALID
├─ Action: Continue monitoring
└─ Next check: In 7 days

If days = 7-1:
├─ Status: ⚠️ EXPIRING SOON
├─ Action: bash deploy/vps-operator-agent.sh renew-ssl
├─ Wait: 1-2 minutes
├─ Verify: bash deploy/vps-operator-agent.sh check-ssl
└─ If successful → Continue
   If failed → Escalate

If days < 1:
├─ Status: 🚨 EXPIRED
├─ Action: bash deploy/vps-operator-agent.sh renew-ssl
├─ Wait: 1-2 minutes
├─ Verify: bash deploy/vps-operator-agent.sh check-ssl
├─ If successful → Monitoring resume
└─ If failed → Critical: Nginx may not work → Escalate

Escalation (If renewal fails):
├─ Action: bash deploy/vps-operator-agent.sh report
├─ Alert: Certificate renewal failed
├─ Escalate: To human immediately
└─ Note: HTTPS may break if not resolved
```

---

### Scenario 5: Deployment Failed

```
Detection:
├─ GitHub Actions workflow failed
├─ OR manual deploy: bash deploy/vps-operator-agent.sh deploy-api
└─ Health checks fail

Automatic Response (by GitHub Actions):
├─ Auto-rollback triggered
├─ Previous version starts
├─ Health checks verify
└─ Slack alert sent

Manual Response (if using operator agent):
├─ Run: bash deploy/vps-operator-agent.sh logs api
├─ Read: Failure reason
├─ Decision: Fix or rollback?

Option A: Rollback (Immediate)
├─ Action: bash deploy/vps-operator-agent.sh rollback
├─ Wait: 10 seconds
├─ Verify: bash deploy/vps-operator-agent.sh status
└─ If OK → Service restored, investigate root cause
   If FAIL → Emergency escalation

Option B: Fix and Retry
├─ Action: Fix the code issue
├─ Action: git push origin main (triggers CI/CD)
└─ Monitor: GitHub Actions workflow
    If OK → New deployment
    If FAIL → Rollback

Escalation (After 2 failed deploy attempts):
├─ Action: bash deploy/vps-operator-agent.sh report
├─ Rollback: bash deploy/vps-operator-agent.sh rollback (if not done)
├─ Alert: Notify human
└─ Next steps: Root cause analysis
```

---

## ⚙️ PART 6: OPERATIONAL PROCEDURES

### Daily Health Check

```
Time: 8am UTC (or your preferred time)
Duration: ~5 minutes

Steps:
├─ 1. Run: bash deploy/vps-operator-agent.sh status
│    └─ Quick overview (1 min)
├─ 2. Run: VPS_PASSWORD='pw' bash deploy/vps-operator-agent.sh diagnostics
│    └─ Full health check (2 min)
├─ 3. Run: bash deploy/vps-operator-agent.sh check-ssl
│    └─ Certificate check (1 min)
└─ 4. Decision:
     If all ✓ → Log check complete, continue monitoring
     If any ✗ → Follow incident response procedure

Success Indicator:
├─ ✅ All checks passed
├─ ✅ No issues reported
└─ ✅ No actions taken
```

---

### Weekly Performance Review

```
Time: Every Monday 9am UTC
Duration: ~10 minutes

Steps:
├─ 1. Run: bash deploy/vps-operator-agent.sh performance
│    └─ Performance metrics (2 min)
├─ 2. Run: bash deploy/vps-operator-agent.sh report
│    └─ Comprehensive report (1 min)
├─ 3. Analysis:
│    ├─ Check: CPU trend (good/bad)
│    ├─ Check: Memory trend (good/bad)
│    ├─ Check: Disk trend (good/bad)
│    └─ Check: Error count (zero/many)
├─ 4. Actions:
│    ├─ If disk >60% → bash deploy/vps-operator-agent.sh cleanup-disk
│    ├─ If memory trend up → Investigate
│    └─ If errors increased → Root cause analysis
└─ 5. Report: Save findings

Success Indicator:
├─ ✅ Report generated
├─ ✅ Trends analyzed
└─ ✅ Cleanup executed if needed
```

---

### Monthly Maintenance

```
Time: First Sunday of month, 2am UTC
Duration: ~20 minutes

Steps:
├─ 1. Backup: bash deploy/vps-operator-agent.sh backup-database
│    └─ Safety first (2 min)
├─ 2. Report: bash deploy/vps-operator-agent.sh report
│    └─ Baseline before maintenance (1 min)
├─ 3. Cleanup Phase 1: bash deploy/vps-operator-agent.sh clean-logs
│    └─ Remove old logs (1 min)
├─ 4. Cleanup Phase 2: bash deploy/vps-operator-agent.sh cleanup-disk
│    └─ Remove unused Docker objects (2 min)
├─ 5. Check: bash deploy/vps-operator-agent.sh status
│    └─ Verify everything still running (1 min)
├─ 6. Decision:
│    ├─ If all ✓ → Maintenance complete
│    └─ If any ✗ → Investigate + take action
└─ 7. Report: Document maintenance

Success Indicator:
├─ ✅ Backup completed
├─ ✅ Cleanup freed space
├─ ✅ All services still running
└─ ✅ No issues found
```

---

### Before Major Changes (Pre-change Checklist)

```
Before Deploying API Changes:

├─ 1. Backup: bash deploy/vps-operator-agent.sh backup-database
├─ 2. Report: bash deploy/vps-operator-agent.sh report (save baseline)
├─ 3. Status: bash deploy/vps-operator-agent.sh status (verify healthy)
├─ 4. Deploy: bash deploy/vps-operator-agent.sh deploy-api
├─ 5. Monitor: Wait 5 minutes (watch for errors)
├─ 6. Check: bash deploy/vps-operator-agent.sh status (still running?)
├─ 7. Verify: bash deploy/vps-operator-agent.sh diagnostics (all good?)
└─ 8. Report: Document deployment success

Success Indicator:
├─ ✅ Pre-deployment backup exists
├─ ✅ Deployment completed without errors
├─ ✅ All services running
├─ ✅ Health checks passed
└─ ✅ No errors in logs
```

---

## 📖 PART 7: QUICK REFERENCE CARDS

### All Commands at a Glance

```
SAFE (No risk, use anytime):
  status              → Current system state
  diagnostics         → Full health check
  performance         → Performance metrics
  logs {container}    → View container logs
  check-ssl           → Certificate status
  report              → Generate report

AFTER DIAGNOSTICS:
  restart {service}   → Restart single service
  clean-logs          → Free disk space
  cleanup-disk        → Remove unused Docker
  backup-database     → Backup PostgreSQL
  renew-ssl           → Renew certificate

NEEDS APPROVAL:
  restart-all         → Restart all services
  deploy-api          → Deploy new version
  rollback            → Rollback deployment
  restore-database    → Restore from backup
```

---

### Decision Matrix

```
System Down?
  ├─ API down      → diagnostics → logs api → restart api
  ├─ DB down       → diagnostics → logs postgres → restart postgres
  ├─ Redis down    → diagnostics → logs redis → restart redis
  ├─ All down      → restart-all → diagnostics
  └─ Still down    → rollback OR restore-database (human decision)

Disk Full?
  ├─ >90% CRITICAL → clean-logs + cleanup-disk immediately
  ├─ 80-90% WARNING → schedule cleanup
  └─ <80% OK        → no action

Certificate Issues?
  ├─ Days < 1   → EXPIRED - renew-ssl now
  ├─ Days 1-7   → EXPIRING - renew-ssl
  └─ Days > 7   → VALID - check again next week

Performance Issues?
  ├─ High CPU      → performance + check top processes
  ├─ High Memory   → performance + check for leaks
  ├─ High Disk I/O → performance + check what's reading/writing
  └─ Slow API      → logs api + restart api

Deployment Failed?
  ├─ First failure → Check logs
  ├─ Deploy again  → If you fixed the issue
  └─ Rollback      → If you're not sure (restore working version)
```

---

### Environment Variables

```
Required:
  VPS_PASSWORD          Password for VPS (almalinux user)

Optional:
  VPS_HOST              VPS hostname (default: agennext.com)
  VPS_USER              VPS username (default: almalinux)
  SLACK_WEBHOOK         Slack webhook for alerts
  MONITOR_INTERVAL      Check interval in seconds (default: 60)

Example:
  VPS_PASSWORD='mypassword' \
  VPS_HOST='agennext.com' \
  SLACK_WEBHOOK='https://hooks.slack.com/...' \
  bash deploy/vps-operator-agent.sh status
```

---

### Typical Response Times

```
Action                      Time    Risk
─────────────────────────────────────────────────
status                      10s     None
diagnostics                 2 min   None
performance                 1 min   None
logs                         30s     None
check-ssl                   10s     None
report                      1 min   None
restart api                 15s     Low
restart postgres            20s     Low
restart redis               10s     Low
restart-all                 2 min   Low
deploy-api                  1 min   Medium
rollback                    30s     Low
clean-logs                  1 min   None
cleanup-disk                2 min   None
backup-database             2 min   Low
restore-database            2-3 min High
renew-ssl                   2 min   Low
```

---

## 🎓 PART 8: AUTHORIZATION & ESCALATION

### Authorization Levels

```
Level 1: AUTONOMOUS (Agent decides)
├─ All read-only operations
├─ status, diagnostics, performance, logs, check-ssl, report
└─ No restrictions, execute anytime

Level 2: CONDITIONAL (Execute after diagnostics)
├─ Service restarts
├─ clean-logs, cleanup-disk, backup-database, renew-ssl
├─ Decision: "Is this necessary based on diagnostics?"
└─ Execute: If answer is yes

Level 3: ESCALATE (Human decision only)
├─ restart-all (all services simultaneously)
├─ deploy-api (push code to production)
├─ rollback (undo failed deployment)
├─ restore-database (restore from backup)
├─ Any operation with data loss risk
└─ Always wait for human approval
```

---

### Escalation Triggers

```
Escalate Immediately When:

🚨 CRITICAL (Immediate escalation):
├─ Multiple services down (>2)
├─ Database is corrupted or failing to recover
├─ Disk critical (>90%)
├─ Memory critical (>90%)
├─ SSL certificate renewal fails
├─ Any service won't restart after 2 attempts
├─ API deployment fails twice in a row
├─ Unsure what to do (no escalation is a mistake!)
└─ Any data loss risk

⚠️ IMPORTANT (Escalate same day):
├─ Service fails once then recovers
├─ Performance degradation
├─ Unusual error patterns in logs
├─ Certificate expiring within 3 days
├─ Disk warning (>75%)
└─ Memory trending up

ℹ️ INFORMATIONAL (Next review):
├─ Daily health check found no issues
├─ Weekly performance review completed
├─ Routine cleanup executed
└─ Certificate valid (>7 days)
```

---

### How to Escalate

```
Step 1: Gather Information
├─ Run: bash deploy/vps-operator-agent.sh report
├─ Save: Report file
├─ Note: Findings/actions taken
└─ Time: Note when issue occurred

Step 2: Prepare Alert
├─ Subject: Clear, specific
│  └─ Example: "PostgreSQL failed to restart - database down"
├─ Details:
│  ├─ What happened
│  ├─ When it happened
│  ├─ What you tried
│  ├─ Report file location
│  └─ Current status
└─ Severity: Critical/Warning/Info

Step 3: Alert Human
├─ Channel: Slack if configured
├─ Include: Report file and key findings
├─ Message: Clear and actionable
└─ Wait: Human decision before proceeding

Step 4: Document
├─ Save: Full incident report
├─ Keep: All logs and diagnostics
├─ File: In ~/.creative-platform/operator-reports/
└─ Tag: With incident date and type
```

---

## ✅ SUCCESS CRITERIA

### Agent is Operating Correctly When:

```
Daily Operations:
  ✅ Status checks pass every day
  ✅ No unexpected restarts
  ✅ No service interruptions
  ✅ Monitoring agent runs every 60 seconds

Resource Health:
  ✅ Disk usage <70% consistently
  ✅ Memory usage <80% consistently
  ✅ CPU usage <80% on average
  ✅ API response time <100ms

Application Health:
  ✅ API responds to health checks
  ✅ Database is accessible
  ✅ Redis is reachable
  ✅ Nginx proxy is routing correctly

Reliability:
  ✅ All logs are clean (no errors)
  ✅ Weekly reports generated
  ✅ Backups completed daily
  ✅ SSL certificate valid (>7 days)
  ✅ Zero unhandled incidents

Performance:
  ✅ Deployment succeeds first time
  ✅ Rollback works if needed
  ✅ Recovery time <2 minutes
  ✅ Monitoring detects issues <5 min
```

---

## 📚 Related Documentation

```
├─ AGENT-INSTRUCTIONS.md    → Complete instruction set
├─ VPS-AUTOMATION.md         → Full automation suite
├─ ROUTING-URLS.md           → API endpoints
├─ CREDENTIALS.md            → Secrets management
├─ SSL-PII-GUIDE.md          → Security & compliance
└─ PUBLISHING-SUMMARY.md     → Complete platform overview
```

---

## 🎯 How to Use This Handbook

**For Quick Lookup:**
→ Go to Part 7: Quick Reference Cards

**For Understanding Each Tool:**
→ Go to Part 2: Tool Registry

**For When Something Goes Wrong:**
→ Go to Part 5: Incident Response

**For Daily Routines:**
→ Go to Part 6: Operational Procedures

**For Making Decisions:**
→ Go to Part 3: Tool Binding Decision Tree

**For Complete Authorization:**
→ Go to Part 8: Authorization & Escalation

---

**🚀 Agent Handbook Complete - Ready to Operate 24/7 with Human Oversight**

Last Updated: 2026-06-25  
Version: 1.0  
Status: ✅ PRODUCTION READY
