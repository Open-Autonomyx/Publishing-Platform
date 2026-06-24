# 24/7 System Monitoring & Support Stack

**Objective:** Ensure the system works reliably at all times with automatic alerts and workflow orchestration.

**Status:** Production-ready configuration included  
**Deployment:** Optional (extends existing stack)

---

## 📊 Monitoring Architecture

```
API & Services
    ↓
┌─────────────────────────────────────┐
│      Metrics & Logs Collection      │
├─────────────────────────────────────┤
│ • Prometheus (real-time metrics)    │
│ • Promtail (log shipper)            │
│ • Loki (centralized logs)           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│    Storage & Correlation            │
├─────────────────────────────────────┤
│ • Cortex (distributed metrics)      │
│ • ClickHouse (long-term storage)    │
│ • Temporal (workflow orchestration) │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│    Alerting & Visualization         │
├─────────────────────────────────────┤
│ • Alertmanager (alert routing)      │
│ • Grafana (dashboards)              │
│ • Temporal UI (workflow monitoring) │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│      Notifications                  │
├─────────────────────────────────────┤
│ • Slack (warnings, info)            │
│ • PagerDuty (critical alerts)       │
│ • Email (escalation)                │
└─────────────────────────────────────┘
```

---

## 🛠️ Components Overview

### 1. **Prometheus** (Real-Time Metrics)
- Collects metrics from API, database, services
- 15-second scrape interval
- Alerts based on thresholds
- Built-in with existing stack

### 2. **Cortex** (Distributed Metrics Storage)
- High-availability metrics storage
- Replaces single Prometheus instance
- Long-term metric retention (7+ days)
- Scales across multiple nodes

### 3. **ClickHouse** (Analytics Database)
- Stores all metrics and logs long-term
- Fast SQL queries for analysis
- Retention: 30+ days
- Enables trend analysis and reports

### 4. **Loki** (Centralized Log Aggregation)
- Collects logs from all containers
- JSON-based log searching
- Labels-based querying
- Integration with Grafana

### 5. **Promtail** (Log Shipper)
- Sends container logs to Loki
- Docker integration
- Per-service log streams
- Automatic log labeling

### 6. **Temporal** (Workflow Orchestration)
- Schedules background jobs (health checks, backups)
- Handles retries and failure recovery
- Monitors long-running operations
- Audit trail of all actions

### 7. **Alertmanager** (Alert Routing)
- Routes alerts to Slack, PagerDuty, email
- Groups related alerts
- Deduplicates notifications
- Prevents alert fatigue

### 8. **Grafana** (Dashboards)
- Real-time dashboards
- Alerts visualization
- Log exploration (Loki integration)
- Multi-datasource support

---

## 🚀 Quick Start

### Step 1: Enable Monitoring Stack

```bash
cd ~/CustomApps/creative-platform

# Start monitoring services alongside existing stack
docker-compose -f docker-compose.yml \
                -f docker-compose.monitoring.yml \
                up -d
```

### Step 2: Configure Notifications (Optional)

#### Slack Integration

```bash
# Get Slack webhook URL:
# 1. Go to https://api.slack.com/apps
# 2. Create new app → From scratch
# 3. Enable "Incoming Webhooks"
# 4. Create new webhook for #alerts channel
# 5. Copy webhook URL

# Set environment variable
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

#### PagerDuty Integration (Critical Alerts)

```bash
# Get PagerDuty service key:
# 1. Go to https://www.pagerduty.com
# 2. Services → Create new service
# 3. Copy integration key

export PAGERDUTY_SERVICE_KEY="YOUR_SERVICE_KEY"
```

### Step 3: Verify Services Are Running

```bash
docker-compose ps
```

Expected:
```
creative-prometheus    UP
creative-grafana       UP
creative-loki          UP
creative-promtail      UP
creative-cortex        UP
creative-clickhouse    UP
creative-temporal      UP
creative-temporal-ui   UP
creative-alertmanager  UP
```

---

## 📍 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Grafana** | http://agennext.com:3000 | Dashboards & monitoring |
| **Prometheus** | http://agennext.com:9090 | Metrics database |
| **Loki** | http://agennext.com:3100 | Log aggregation |
| **Cortex** | http://agennext.com:9009 | Distributed metrics |
| **Temporal UI** | http://agennext.com:8080 | Workflow monitoring |
| **ClickHouse** | http://agennext.com:8123 | Analytics database |
| **Alertmanager** | http://agennext.com:9093 | Alert management |

---

## 📊 Key Metrics to Monitor

### API Performance
```sql
-- P95 latency
rate(http_request_duration_seconds_bucket{le="0.2"}[5m])

-- Error rate
rate(http_requests_total{status=~"5.."}[5m])

-- Requests per second
rate(http_requests_total[1m])
```

### Database Health
```sql
-- Connection pool usage
pg_stat_activity_count

-- Query latency
rate(pg_stat_statements_total_time[5m])

-- Slow queries
rate(pg_stat_statements_calls{query_time > 1000}[5m])
```

### System Resources
```sql
-- Memory usage
container_memory_usage_bytes

-- CPU usage
rate(container_cpu_usage_seconds_total[5m])

-- Disk I/O
rate(container_fs_io_current[5m])
```

---

## 🔔 Alert Rules

### Critical Alerts (Immediate Notification)

**API Down**
```yaml
- alert: APIDown
  expr: up{job="api"} == 0
  for: 1m
  annotations:
    severity: critical
    description: "API is down"
```

**High Error Rate**
```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 2m
  annotations:
    severity: critical
    description: "Error rate above 5%"
```

**Database Connection Pool Exhausted**
```yaml
- alert: DBConnectionPoolExhausted
  expr: pg_stat_activity_count > 90
  for: 1m
  annotations:
    severity: critical
    description: "Database connections nearly full"
```

### Warning Alerts (Slack Notification)

**High Latency**
```yaml
- alert: HighLatency
  expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
  for: 5m
  annotations:
    severity: warning
    description: "P95 latency above 500ms"
```

**High Memory Usage**
```yaml
- alert: HighMemoryUsage
  expr: container_memory_usage_bytes / 1024 / 1024 / 1024 > 6
  for: 5m
  annotations:
    severity: warning
    description: "Memory usage above 6GB"
```

---

## 🔄 Temporal Workflows

### Background Job Examples

**Daily Health Check**
```go
// Runs every 24 hours
workflow.NewScheduledHealthCheck()
  .EveryDay(time.Hour(2))  // 2 AM UTC
  .CheckEndpoints([]string{
    "http://localhost:3001/health",
    "http://localhost:5432",  // DB
    "http://localhost:6379",  // Redis
  })
  .SendAlert(AlertConfig{
    Slack: true,
    Email: "ops@example.com",
  })
```

**Hourly Metrics Aggregation**
```go
// Runs every hour, aggregates metrics to ClickHouse
workflow.NewMetricsAggregation()
  .EveryHour()
  .From(Prometheus)
  .To(ClickHouse)
  .Retention(30 * time.Hour * 24)  // 30 days
```

**Database Backup**
```go
// Runs daily, backs up PostgreSQL
workflow.NewDatabaseBackup()
  .EveryDay(time.Hour(3))  // 3 AM UTC
  .Backup(Database)
  .StoreTo("s3://backups/creative-platform")
  .Retention(30)  // Keep 30 backups
  .OnFailure(AlertOn: AlertSeverity.Critical)
```

---

## 📈 Grafana Dashboard Setup

### Create Dashboard

1. **Open Grafana:** http://agennext.com:3000
2. **Create new dashboard**
3. **Add panels:**

#### Panel 1: Request Rate
```
Prometheus Query: rate(http_requests_total[5m])
Visualization: Graph
Title: Requests Per Second
```

#### Panel 2: Error Rate
```
Prometheus Query: rate(http_requests_total{status=~"5.."}[5m])
Visualization: Graph
Title: Error Rate (5xx responses)
```

#### Panel 3: API Latency (P95)
```
Prometheus Query: histogram_quantile(0.95, http_request_duration_seconds)
Visualization: Graph
Title: P95 Latency
```

#### Panel 4: Recent Logs
```
Loki Query: {job="api"}
Visualization: Logs
Title: Recent API Logs
```

#### Panel 5: Database Connections
```
Prometheus Query: pg_stat_activity_count
Visualization: Gauge
Title: Active DB Connections
```

---

## 🔍 Querying Logs with Loki

### Find Errors
```
{job="api"} | json | level="error"
```

### Find Slow Requests
```
{job="api"} | json | duration > 1000
```

### Find Specific User Activity
```
{job="api"} | json | user_id="abc123"
```

### Count Requests by Status
```
{job="api"} | json | status_code | stats count() by status_code
```

---

## 🔐 Security Considerations

### Secrets Management

Store these in `.env.production`:
```bash
SLACK_WEBHOOK_URL=https://...
PAGERDUTY_SERVICE_KEY=...
SMTP_PASSWORD=...
CLICKHOUSE_PASSWORD=...
```

### Network Access

- **Grafana:** Require authentication
- **Prometheus:** Internal only (no auth by default)
- **Temporal UI:** Internal only
- **ClickHouse:** No direct internet access

### Audit Logging

All Temporal workflow executions are logged:
```sql
SELECT * FROM temporal_executions WHERE start_time > now() - interval '1 day'
```

---

## 📊 Retention Policies

| Component | Retention | Storage |
|-----------|-----------|---------|
| **Prometheus** | 15 days | Local disk |
| **Cortex** | 30 days | Distributed |
| **ClickHouse** | 90 days | Database |
| **Loki** | 30 days | Local disk |
| **Temporal** | Indefinite | PostgreSQL |

---

## 🚨 On-Call Runbook

### Alert: API Down

1. **Check status:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check logs:**
   ```bash
   docker-compose logs api --tail=100
   ```

3. **Restart service:**
   ```bash
   docker-compose restart api
   ```

4. **Verify:**
   ```bash
   curl http://localhost:3001/health
   ```

### Alert: High Error Rate

1. **Check error logs:**
   ```
   Grafana → Loki → {job="api"} | json | level="error"
   ```

2. **Check database:**
   ```bash
   docker-compose logs postgres --tail=50
   ```

3. **Check API logs for stack traces:**
   ```bash
   docker-compose logs api --tail=100 | grep -i "error\|panic"
   ```

### Alert: Database Connection Pool Exhausted

1. **Check connections:**
   ```bash
   ssh almalinux@agennext.com
   docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
   ```

2. **Kill idle connections:**
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
   WHERE state = 'idle' AND query_start < now() - interval '10 minutes';
   ```

3. **Restart API service:**
   ```bash
   docker-compose restart api
   ```

---

## 💰 Cost Considerations

| Component | Cost | Notes |
|-----------|------|-------|
| **ClickHouse** | Free (self-hosted) | Storage: ~1GB/day |
| **Cortex** | Free (self-hosted) | Replaces Prometheus at scale |
| **Loki** | Free (self-hosted) | Storage: ~2GB/day |
| **Temporal** | Free (self-hosted) | Uses PostgreSQL |
| **Slack/PagerDuty** | $X/month | Notification services |

---

## 🎯 Next Steps

1. Deploy monitoring stack: `docker-compose -f docker-compose.monitoring.yml up -d`
2. Configure Slack webhook (optional)
3. Configure PagerDuty (optional)
4. Create Grafana dashboards
5. Test alert routing
6. Add to on-call runbook

---

## 📞 Support

- **Grafana Docs:** https://grafana.com/docs/
- **Prometheus Docs:** https://prometheus.io/docs/
- **Loki Docs:** https://grafana.com/docs/loki/
- **Temporal Docs:** https://temporal.io/docs/
- **ClickHouse Docs:** https://clickhouse.com/docs/

---

**Status:** ✅ READY FOR DEPLOYMENT  
**Last Updated:** 2026-06-25
