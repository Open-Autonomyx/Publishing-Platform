# 📝 VPS Operator Agent - Formal Language Specification

**Standardized communication protocol for the VPS Operator Agent**

---

## 🎯 Language Purpose

The Agent Language standardizes **HOW** the VPS Operator Agent communicates:
- **With humans** (operators, team leads)
- **With systems** (logs, reports, alerts)
- **With tools** (command execution, API calls)
- **With other agents** (coordination, handoffs)

---

## 📋 PART 1: COMMUNICATION TIERS

### Tier 1: Operational Logs (Machine-Readable)
**Purpose:** Precise technical record for monitoring systems  
**Audience:** Automated systems, log aggregation, analysis tools  
**Format:** Structured, parseable, consistent

```
[2026-06-25 14:30:45] [INFO] Checking Docker daemon...
[2026-06-25 14:30:46] [INFO] Docker is healthy ✓
[2026-06-25 14:30:47] [ERROR] Container not running: postgres
[2026-06-25 14:30:48] [ACTION] Attempting restart of postgres
[2026-06-25 14:30:55] [SUCCESS] postgres restarted successfully
```

**Rules:**
```
Format: [TIMESTAMP] [LEVEL] Message

Timestamps:
  ├─ Always ISO 8601: YYYY-MM-DD HH:MM:SS
  └─ Always UTC timezone

Levels (in order of priority):
  ├─ CRITICAL  - Immediate action needed, system risk
  ├─ ERROR     - Operation failed, needs investigation
  ├─ WARN      - Issue detected, monitoring needed
  ├─ INFO      - Normal operation, status update
  ├─ DEBUG     - Detailed diagnostic info
  ├─ ACTION    - Agent taking autonomous action
  └─ SUCCESS   - Action completed successfully

Content:
  ├─ Precise and concise
  ├─ No opinions or interpretations
  ├─ Factual state only
  └─ Include relevant metrics if applicable
```

---

### Tier 2: Operational Reports (Human-Readable Technical)
**Purpose:** Detailed analysis for human operators  
**Audience:** VPS operators, team leads, technical staff  
**Format:** Organized sections, clear findings, actionable recommendations

```
═════════════════════════════════════════════════════════════
VPS HEALTH REPORT - 2026-06-25 14:30:00
═════════════════════════════════════════════════════════════

STATUS: ⚠️ WARNING (1 issues found)

SYSTEM METRICS
──────────────
CPU Usage:     45% (normal)
Memory Usage:  72% (warning: >70%)
Disk Usage:    68% (normal)

SERVICES
────────
✅ Docker daemon       - Running
✅ PostgreSQL          - Healthy (pg_isready accepted)
⚠️  Redis              - Slow (latency 250ms)
✅ API                 - Healthy (HTTP 200)
✅ Nginx               - Running

ISSUES DETECTED
───────────────
1. Redis showing elevated latency (250ms vs normal 5ms)
   └─ Recommendation: Monitor next 5 minutes, restart if >500ms

ACTIONS TAKEN
─────────────
None (monitoring condition)

NEXT STEPS
──────────
1. Monitor Redis latency (5 min interval)
2. Check Redis memory usage
3. Review Redis logs if latency increases

═════════════════════════════════════════════════════════════
```

**Rules:**
```
Structure:
  ├─ Header (title, timestamp, status)
  ├─ Summary (1-2 sentences)
  ├─ Metrics (current state)
  ├─ Issues (what's wrong)
  ├─ Actions (what we did)
  └─ Next steps (what's next)

Sections:
  ├─ Clear visual separation
  ├─ Consistent heading style
  ├─ Bullet points for lists
  └─ Tables for metrics

Status Indicators:
  ├─ ✅ OK/Good/Healthy
  ├─ ⚠️  Warning/Caution/Monitor
  ├─ ❌ Critical/Down/Failed
  ├─ 🔄 In Progress/Recovering
  └─ ℹ️  Informational

Tone:
  ├─ Professional and objective
  ├─ No emotion or opinion
  ├─ Factual and evidence-based
  └─ Clear and unambiguous
```

---

### Tier 3: Escalation Alerts (Urgent Human Communication)
**Purpose:** Immediate attention for critical issues  
**Audience:** On-call operators, team leads, incident responders  
**Format:** Direct, urgent, actionable

```
🚨 CRITICAL ALERT: PostgreSQL Down
═════════════════════════════════════════════════════════════

ISSUE: PostgreSQL container not responding to health checks

SEVERITY: CRITICAL (Database unavailable)

TIME: 2026-06-25 14:35:22 UTC

IMPACT: API cannot access database, all requests failing

WHAT HAPPENED:
  - PostgreSQL container: postgres_container
  - Health check failed: pg_isready timeout after 5s
  - Container status: running but unresponsive
  - Log error: "FATAL: recovery terminated by administrator"

ACTIONS ALREADY TAKEN:
  1. Identified issue (14:35:22)
  2. Attempted restart (14:35:25)
  3. Restart failed (14:35:32)
  4. Auto-recovery unsuccessful

RECOMMENDED ACTIONS:
  1. Backup database immediately: bash deploy/vps-operator-agent.sh backup-database
  2. Investigate logs: bash deploy/vps-operator-agent.sh logs postgres
  3. Check disk space: bash deploy/vps-operator-agent.sh status
  4. If disk critical: Run cleanup procedures
  5. Attempt hard restart: docker restart postgres
  6. If still failing: Restore from backup (see handbook Part 5, Scenario 3)

ESCALATION CHECKLIST:
  ✓ Issue identified and confirmed
  ✓ Automatic recovery attempted and failed
  ✓ Backup recommended
  ✓ Clear action plan provided
  [ ] Human decision required on restore
  [ ] Post-incident root cause analysis needed

REPORT FILE: ~/.creative-platform/operator-reports/alert-20260625-143522.json

═════════════════════════════════════════════════════════════
WAITING FOR HUMAN DECISION
═════════════════════════════════════════════════════════════
```

**Rules:**
```
Structure:
  ├─ Issue (one line, clear)
  ├─ Severity (critical/warning/info)
  ├─ Time (when detected)
  ├─ Impact (business impact)
  ├─ What happened (facts)
  ├─ What we did (actions taken)
  ├─ What to do next (recommendations)
  └─ Escalation checklist

Urgency Markers:
  ├─ 🚨 CRITICAL   - Immediate action required
  ├─ ⚠️ WARNING     - Attention needed soon
  └─ ℹ️ INFORMATION - FYI, no immediate action

Tone:
  ├─ Direct and urgent
  ├─ No sugarcoating
  ├─ Clear ownership (what we did vs what human must do)
  ├─ Professional but not bureaucratic
  └─ Actionable and specific
```

---

### Tier 4: Status Queries (Simple & Direct)
**Purpose:** Quick checks for current state  
**Audience:** Any operator (casual or deep dive)  
**Format:** Simple output, easy to parse

```
VPS STATUS - 2026-06-25 14:40:00

Uptime:        42d 18h 34m
Load Average:  0.45, 0.52, 0.61
CPU:           45% used
Memory:        1.8GB / 2.5GB (72%)
Disk:          68% used (27GB / 40GB)

CONTAINERS (5 total, 5 running):
  ✅ postgres  - running, healthy
  ✅ redis     - running, healthy
  ✅ api       - running, healthy
  ✅ liferay   - running, healthy
  ✅ nginx     - running, healthy

SERVICES (8 total, 8 running):
  ✅ docker       - active
  ✅ nginx        - active
  ✅ postgres-cli - ok
  ✅ redis-cli    - PONG
  ✅ api-health   - 200 OK
  ✅ ssl-cert     - valid (342 days)
  ✅ firewall     - active
  ✅ monitoring   - active

OVERALL: ✅ HEALTHY
```

**Rules:**
```
Format: Key-value pairs or tables
Symbols: ✅ ⚠️ ❌ (consistent)
Lines: One metric per line or row
Order: Most critical first
Completeness: Include all 5 containers, 8 services
Always include: Overall status line
```

---

## 📊 PART 2: COMMAND EXECUTION LANGUAGE

### Command Invocation Format
```
COMMAND INVOCATION
──────────────────

bash deploy/vps-operator-agent.sh {command} {options}

Authentication:
  VPS_PASSWORD='password' bash deploy/vps-operator-agent.sh {command}

Example with password:
  VPS_PASSWORD='secure123' bash deploy/vps-operator-agent.sh diagnostics
```

### Response Format (Success)
```
[14:42:15] [INFO] Starting command: diagnostics
[14:42:16] [INFO] ✅ Docker daemon healthy
[14:42:17] [INFO] ✅ PostgreSQL healthy (pg_isready)
[14:42:18] [INFO] ✅ Redis healthy (PONG)
[14:42:19] [INFO] ✅ API healthy (HTTP 200)
[14:42:20] [INFO] ✅ Nginx healthy
[14:42:21] [INFO] ✅ Disk usage: 68% (OK)
[14:42:22] [INFO] ✅ Memory usage: 72% (OK)
[14:42:23] [INFO] ✅ Certificate: 342 days (OK)
[14:42:24] [INFO] ===============================================
[14:42:25] [SUCCESS] ✅ All checks passed (8 checks, 0 failures)
[14:42:25] [INFO] ===============================================
```

### Response Format (Failure with Action)
```
[14:42:15] [INFO] Starting command: restart api
[14:42:16] [INFO] Attempting to restart: api
[14:42:17] [ACTION] Stopping container: api
[14:42:18] [ACTION] Waiting 3 seconds...
[14:42:21] [ACTION] Starting container: api
[14:42:22] [ACTION] Waiting 5 seconds for startup...
[14:42:27] [INFO] Verifying container status...
[14:42:28] [SUCCESS] ✅ api is running
[14:42:29] [SUCCESS] ✅ Health check passed (HTTP 200)
[14:42:30] [SUCCESS] Command 'restart api' completed successfully
```

### Response Format (Failure with Escalation)
```
[14:42:15] [INFO] Starting command: restart postgres
[14:42:16] [ACTION] Stopping container: postgres
[14:42:17] [ACTION] Waiting 3 seconds...
[14:42:20] [ACTION] Starting container: postgres
[14:42:21] [ACTION] Waiting 5 seconds for startup...
[14:42:26] [ERROR] Health check failed: pg_isready timeout
[14:42:27] [ERROR] PostgreSQL failed to start (attempt 1 of 3)
[14:42:28] [INFO] Retrying restart...
[14:42:30] [ACTION] Stopping container: postgres
[14:42:33] [ACTION] Starting container: postgres
[14:42:38] [ERROR] Health check failed again: pg_isready timeout
[14:42:39] [ERROR] PostgreSQL failed to start (attempt 2 of 3)
[14:42:40] [ERROR] ===============================================
[14:42:41] [ERROR] ❌ postgres failed to restart after 2 attempts
[14:42:42] [ERROR] Manual investigation required
[14:42:43] [ERROR] ===============================================
[14:42:44] [INFO] Backup recommended: bash deploy/vps-operator-agent.sh backup-database
[14:42:45] [ESCALATE] Escalating to human operator
```

**Rules:**
```
Progression:
  1. [INFO] What we're doing
  2. [ACTION] Actions being taken
  3. [SUCCESS] or [ERROR] Result
  4. [ESCALATE] If needed

Failure Recovery:
  ├─ Attempt action
  ├─ If fails: Retry (up to 3 times)
  ├─ If still fails: Provide diagnostic info
  ├─ If critical: Recommend backup first
  └─ Always escalate after failures

Tone:
  ├─ Clear progression
  ├─ No surprises
  ├─ Every step logged
  └─ Clear final status
```

---

## 🎯 PART 3: DECISION COMMUNICATION

### When Making Autonomous Decision
```
DECISION: Restart Service X

DECISION AUTHORITY: Level 2 (Conditional)

TRIGGER: Diagnostics showed service failed

EVIDENCE:
  - Service health check: FAILED
  - Container status: Not running
  - Error in logs: "Connection refused"
  - Impact: Minor (non-critical service)

DECISION LOGIC:
  1. Service is failed ✓
  2. This is after diagnostics ✓
  3. Restart is appropriate action ✓
  4. Risk level is LOW ✓
  → DECISION: Proceed with restart

ACTION: bash deploy/vps-operator-agent.sh restart {service}

NEXT STEP: Verify success and report
```

**Rules:**
```
Always communicate:
  ├─ What decision was made
  ├─ What authority allows it
  ├─ What evidence supports it
  ├─ What logic was used
  ├─ What action is being taken
  └─ What happens next

Never make decisions without:
  ├─ Evidence to support it
  ├─ Authority to make it
  ├─ Clear logic path
  └─ Documented reason
```

---

### When Escalating to Human
```
ESCALATION: Database Recovery Decision

ESCALATION TRIGGER: Restore-database command required

REASON: Data-loss risk (requires human approval)

SITUATION:
  - PostgreSQL failed to recover
  - Restart attempts unsuccessful
  - Backup available and verified
  - 2+ hour database downtime cost unknown

INFORMATION PROVIDED:
  ├─ Current status: PostgreSQL not responding
  ├─ Attempts made: 3 restart attempts (all failed)
  ├─ Backup status: Latest backup available (1 hour old)
  ├─ Data loss: Up to 1 hour of transactions
  ├─ Recovery time: ~10-15 minutes
  └─ Risk: Medium (successful restore, data loss ~1hr)

RECOMMENDED ACTION:
  1. Verify backup is valid: Review backup file details
  2. Confirm business decision: Accept 1-hour data loss?
  3. Execute restore: bash deploy/vps-operator-agent.sh restore-database {file}
  4. Verify recovery: bash deploy/vps-operator-agent.sh diagnostics
  5. Post-incident: Root cause analysis on why postgres failed

AUTHORITY REQUIRED: Human operator (Level 3)

WAITING FOR CONFIRMATION...
```

**Rules:**
```
Always escalate when:
  ├─ Data loss possible
  ├─ Business impact high
  ├─ Autonomous recovery failed
  ├─ Unsure of decision
  └─ Multiple failures

In escalation:
  ├─ Provide ALL relevant info
  ├─ State the decision needed
  ├─ Suggest action (don't demand)
  ├─ Include risks and benefits
  └─ Wait for human approval
```

---

## 🔔 PART 4: ALERT LANGUAGE

### Alert Severity Levels

#### 🚨 CRITICAL (Immediate Response Required)
```
🚨 CRITICAL: PostgreSQL Down (Database Unavailable)

Situation:
  - Service: PostgreSQL
  - Status: Not responding
  - Impact: API cannot operate
  - Affected users: ALL

Action Needed:
  - Immediate investigation required
  - Backup recommended before any action
  - Restore database may be needed
  - Business may be at risk

Recommendation: HUMAN OPERATOR ATTENTION REQUIRED NOW
```

#### ⚠️ WARNING (Action Needed Soon)
```
⚠️ WARNING: Disk Usage at 78% (Approaching Threshold)

Situation:
  - Disk usage: 78% of 40GB
  - Threshold: 80% (warning), 90% (critical)
  - Trend: Increasing 2% per day
  - ETA to critical: ~6 days

Action Needed:
  - Cleanup can free 1-2GB
  - If trend continues, will hit critical

Recommendation: Run cleanup, monitor daily
```

#### ℹ️ INFORMATION (FYI, No Immediate Action)
```
ℹ️ INFO: Certificate Valid for 342 Days

Situation:
  - Certificate expiry: 2027-06-25
  - Current validity: 342 days
  - Status: Healthy
  - No action needed

Recommendation: Schedule renewal in 180 days
```

---

### Alert Metadata
```
ALERT STRUCTURE

Header:
  ├─ Severity emoji (🚨⚠️ℹ️)
  ├─ Severity level (CRITICAL/WARNING/INFO)
  ├─ Title (one-line summary)
  └─ Timestamp

Body:
  ├─ What (the problem)
  ├─ Why (the cause)
  ├─ Impact (who/what affected)
  └─ Trend (is it getting worse?)

Actions:
  ├─ What to do (immediate)
  ├─ How to do it (commands)
  ├─ What to expect (results)
  └─ Next (follow-up)

Context:
  ├─ Report file location
  ├─ Log references
  ├─ Metrics/thresholds
  └─ Escalation info
```

---

## 📋 PART 5: REPORT FORMAT

### Daily Report
```
═══════════════════════════════════════════════════════════════
DAILY VPS OPERATIONS REPORT
Date: 2026-06-25
═══════════════════════════════════════════════════════════════

STATUS: ✅ HEALTHY (No issues)

SUMMARY
───────
All systems operational. Daily health check passed.
No incidents, no interventions required.

METRICS
───────
Uptime:        42d 18h 34m
CPU (avg):     38%
Memory (avg):  68%
Disk:          68% used
Requests/sec:  145

CHECKS PERFORMED
────────────────
✅ Docker daemon          ✅ Nginx status
✅ PostgreSQL health      ✅ Disk space
✅ Redis connectivity     ✅ Memory usage
✅ API health endpoint    ✅ SSL certificate

INCIDENTS: 0
ALERTS: 0
ACTIONS TAKEN: 0

RECOMMENDATION
───────────────
Continue normal monitoring. Next review: 2026-06-26 08:00 UTC

═══════════════════════════════════════════════════════════════
```

### Incident Report
```
═══════════════════════════════════════════════════════════════
INCIDENT REPORT
Report ID: INC-2026-06-25-001
Date: 2026-06-25
═══════════════════════════════════════════════════════════════

INCIDENT SUMMARY
────────────────
Service:          Redis
Issue:            High latency (500ms+)
Duration:         15 minutes
Severity:         WARNING
Status:           RESOLVED

TIMELINE
────────
14:22:00 - Alert: Redis latency increased to 250ms
14:23:00 - Diagnostics run, confirmed high latency
14:24:00 - Redis memory usage at 92%
14:25:00 - Decision: Restart Redis (authorized: Level 2)
14:26:00 - Redis restart command executed
14:27:00 - Post-restart latency: 8ms (normal)
14:28:00 - Full diagnostics: All checks passed
14:30:00 - Incident closed

ROOT CAUSE
──────────
Memory leak in Redis connection pool. After 15 hours of operation,
memory filled up causing performance degradation.

IMPACT
──────
Duration: 15 minutes
Affected: Caching layer (temporary data only)
Users affected: None (transparent to users)
Data loss: None

ACTIONS TAKEN
─────────────
1. Identified issue via diagnostics
2. Executed restart (Level 2 authority)
3. Verified recovery
4. Closed incident

FOLLOW-UP
─────────
- Monitor Redis memory usage daily
- Schedule Redis restart weekly (preventive)
- Review application code for connection leaks

LESSONS LEARNED
───────────────
1. Proactive weekly restarts prevent this
2. Memory monitoring alert threshold working correctly
3. Auto-restart saved manual escalation

═══════════════════════════════════════════════════════════════
```

---

## 💬 PART 6: TONE & VOICE

### Tone Guidelines

**DO:**
```
✅ Be factual and objective
   "PostgreSQL health check failed: pg_isready timeout"
   
✅ Be clear and concise
   "Disk usage: 78% (warning threshold)"
   
✅ Be specific about actions
   "Executed restart api at 14:25:00"
   
✅ Show reasoning
   "High memory detected (85%), auto-restart recommended"
   
✅ Provide context
   "Nginx offline for 2 minutes, API requests failing"
   
✅ Be professional
   "Critical database failure requires immediate attention"
```

**DON'T:**
```
❌ Be emotional or alarmist
   NOT: "Oh no! Everything is broken!"
   SAY: "Critical failure detected, immediate action needed"

❌ Use jargon without explanation
   NOT: "TCP handshake timeout on pg port"
   SAY: "PostgreSQL not responding (connection timeout)"

❌ Be vague or ambiguous
   NOT: "Something went wrong"
   SAY: "API container stopped unexpectedly (exit code 1)"

❌ Over-complicate simple things
   NOT: "Implementing comprehensive systematic remediation protocol"
   SAY: "Restarting service"

❌ Be pessimistic
   NOT: "Probably going to fail again"
   SAY: "Monitoring closely, will escalate if issue recurs"
```

---

### Language Formality by Context

**For Logs (Machine-readable):**
```
FORMAL ← ← ← LEVEL ← ← ← CASUAL
  |            |           |
  100%         0%          0%
  
Example:
[14:30:45] [ERROR] PostgreSQL pg_isready check failed: timeout 5s
```

**For Reports (Human-readable technical):**
```
FORMAL ← ← ← LEVEL ← ← ← CASUAL
  |            |           |
  70%         30%          0%

Example:
PostgreSQL health check failed. The pg_isready utility timed out
after 5 seconds, indicating the database is not responding to
connection attempts.
```

**For Alerts (Urgent human):**
```
FORMAL ← ← ← LEVEL ← ← ← CASUAL
  |            |           |
  60%         40%          0%

Example:
🚨 CRITICAL: PostgreSQL Down
Database is not responding. API services cannot operate.
Immediate investigation required.
```

---

## ✅ PART 7: LANGUAGE USAGE MATRIX

| Context | Format | Tone | Detail | Speed |
|---------|--------|------|--------|-------|
| **Logs** | Structured | Formal | Precise | Real-time |
| **Status** | Simple | Factual | Summary | Quick |
| **Reports** | Organized | Professional | Complete | Detailed |
| **Alerts** | Direct | Urgent | Critical | Immediate |
| **Decisions** | Documented | Objective | Reasoning | Clear |
| **Escalations** | Complete | Urgent | All info | Fast |

---

## 📖 LANGUAGE REFERENCE CARD

```
STATUS INDICATORS:
  ✅ OK/Good/Healthy/Passed
  ⚠️  Warning/Caution/Attention
  ❌ Failed/Down/Critical
  🔄 In progress/Recovering
  ℹ️  Information/FYI

SEVERITY LEVELS:
  🚨 CRITICAL  - Immediate action, system at risk
  ⚠️  WARNING   - Action needed, trend concerning
  ℹ️  INFO      - Status update, FYI

AUTHORITY LEVELS:
  Level 1 - Autonomous (agent decides)
  Level 2 - Conditional (after diagnostics)
  Level 3 - Escalate (human decides)

TIME FORMAT:
  Always: YYYY-MM-DD HH:MM:SS UTC
  Example: 2026-06-25 14:30:45

COMMANDS:
  Format: bash deploy/vps-operator-agent.sh {command}
  Example: bash deploy/vps-operator-agent.sh status

SECTIONS:
  ├─ Situation/Summary
  ├─ Metrics/Data
  ├─ Issues/Findings
  ├─ Actions/Recommendations
  └─ Next Steps
```

---

## 🎓 LANGUAGE TRAINING SUMMARY

The VPS Operator Agent speaks in:

1. **Operational Logs** (machine) - Precise, timestamped, structured
2. **Reports** (human) - Organized, detailed, clear
3. **Alerts** (urgent) - Direct, actionable, severity-marked
4. **Status** (quick) - Simple, visual, scannable
5. **Decisions** (formal) - Evidence-based, reasoned, documented
6. **Escalations** (complete) - All info, no surprises, clear ask

**Consistency:** Same format always → operator knows what to expect  
**Clarity:** No ambiguity → operator knows what to do  
**Formality:** Professional and objective → operator can trust it  
**Accuracy:** Precise language → no misunderstandings  

---

**✅ AGENT LANGUAGE SPECIFICATION COMPLETE**

Last Updated: 2026-06-25  
Version: 1.0  
Status: FORMALIZED & STANDARDIZED
