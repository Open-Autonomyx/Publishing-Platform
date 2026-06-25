#!/bin/bash
# setup-clickhouse-cloud.sh - Configure ClickHouse Cloud integration
# Usage: ./deploy/setup-clickhouse-cloud.sh

set -e

echo "=========================================="
echo "📊 ClickHouse Cloud Setup Script"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${YELLOW}⚠️  $1 is not installed (optional)${NC}"
        return 1
    fi
    return 0
}

echo "📋 Checking prerequisites..."
check_command "clickhouse-client" || true
echo ""

# Step 1: Signup (if needed)
echo -e "${YELLOW}Step 1: ClickHouse Cloud Account${NC}"
echo "Signup URL: https://console.clickhouse.cloud/signUp"
echo ""

read -p "Do you have a ClickHouse Cloud account? (y/n): " HAS_ACCOUNT

if [ "$HAS_ACCOUNT" != "y" ]; then
    echo -e "${BLUE}Opening ClickHouse Cloud signup...${NC}"
    if command -v open &> /dev/null; then
        open "https://console.clickhouse.cloud/signUp"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://console.clickhouse.cloud/signUp"
    else
        echo "Please visit: https://console.clickhouse.cloud/signUp"
    fi
    read -p "Press Enter once you've created your account..."
fi

echo -e "${GREEN}✓ Account ready${NC}"
echo ""

# Step 2: Create service
echo -e "${YELLOW}Step 2: Create ClickHouse Service${NC}"
echo "In ClickHouse Cloud console:"
echo "  1. Go to Services"
echo "  2. Click 'Create Service'"
echo "  3. Name: creative-platform-analytics"
echo "  4. Type: Production"
echo "  5. Region: Choose closest to your VPS"
echo "  6. Create and wait for initialization"
echo ""

read -p "Enter service name (default: creative-platform-analytics): " SERVICE_NAME
SERVICE_NAME=${SERVICE_NAME:-creative-platform-analytics}

echo -e "${GREEN}✓ Service: $SERVICE_NAME${NC}"
echo ""

# Step 3: Get connection details
echo -e "${YELLOW}Step 3: Get Connection Details${NC}"
echo "In ClickHouse Cloud console:"
echo "  1. Click on your service"
echo "  2. Go to 'Connect' tab"
echo "  3. Copy the connection details"
echo ""

read -p "Enter ClickHouse Host (e.g., xxx.clickhouse.cloud): " CLICKHOUSE_HOST
if [ -z "$CLICKHOUSE_HOST" ]; then
    echo -e "${RED}❌ Host cannot be empty${NC}"
    exit 1
fi

read -p "Enter ClickHouse Port (default: 8443): " CLICKHOUSE_PORT
CLICKHOUSE_PORT=${CLICKHOUSE_PORT:-8443}

read -p "Enter Username (default: default): " CLICKHOUSE_USER
CLICKHOUSE_USER=${CLICKHOUSE_USER:-default}

read -sp "Enter Password: " CLICKHOUSE_PASSWORD
echo ""

if [ -z "$CLICKHOUSE_PASSWORD" ]; then
    echo -e "${RED}❌ Password cannot be empty${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Connection details configured${NC}"
echo ""

# Step 4: Test connection
echo -e "${YELLOW}Step 4: Test Connection${NC}"

if command -v curl &> /dev/null; then
    echo "Testing connection..."
    if curl -s "https://${CLICKHOUSE_HOST}:${CLICKHOUSE_PORT}/?query=SELECT%201" \
            -u "${CLICKHOUSE_USER}:${CLICKHOUSE_PASSWORD}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify connection (may need IP whitelist)${NC}"
    fi
fi

echo ""

# Step 5: Create .env.clickhouse file
echo -e "${YELLOW}Step 5: Creating Configuration File${NC}"

cat > .env.clickhouse << EOF
# ClickHouse Cloud Configuration
# Generated: $(date)

# Connection
CLICKHOUSE_HOST=${CLICKHOUSE_HOST}
CLICKHOUSE_PORT=${CLICKHOUSE_PORT}
CLICKHOUSE_USER=${CLICKHOUSE_USER}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD}
CLICKHOUSE_DATABASE=metrics

# TLS/SSL
CLICKHOUSE_SSL=true
CLICKHOUSE_VERIFY_SSL=true

# Connection pool
CLICKHOUSE_MAX_CONNECTIONS=10
CLICKHOUSE_CONNECTION_TIMEOUT=30s
CLICKHOUSE_READ_TIMEOUT=300s
CLICKHOUSE_WRITE_TIMEOUT=300s

# Retention policies
CLICKHOUSE_METRICS_RETENTION_DAYS=90
CLICKHOUSE_LOGS_RETENTION_DAYS=30
CLICKHOUSE_TRACES_RETENTION_DAYS=7

# Performance
CLICKHOUSE_ASYNC_INSERTS=true
CLICKHOUSE_BATCH_SIZE=10000
CLICKHOUSE_FLUSH_INTERVAL=10s

# Logging
CLICKHOUSE_LOG_LEVEL=info
EOF

echo -e "${GREEN}✓ Created .env.clickhouse${NC}"
echo ""

# Step 6: Secure configuration
echo -e "${YELLOW}Step 6: Securing Sensitive Files${NC}"

if ! grep -q ".env.clickhouse" .gitignore; then
    echo ".env.clickhouse" >> .gitignore
    echo -e "${GREEN}✓ Added .env.clickhouse to .gitignore${NC}"
fi

echo ""

# Step 7: Create database schema
echo -e "${YELLOW}Step 7: Creating Database Schema${NC}"

cat > deploy/clickhouse-schema.sql << 'SQLEOF'
-- ClickHouse Schema for Creative Platform Analytics

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS metrics;
USE metrics;

-- ===========================================================================
-- Metrics Table (from Prometheus)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS metrics (
    timestamp DateTime,
    metric_name String,
    service String,
    value Float64,
    labels Map(String, String),
    tags Map(String, String)
) ENGINE = MergeTree()
ORDER BY (timestamp, metric_name, service)
TTL timestamp + INTERVAL 90 DAY;

-- ===========================================================================
-- Logs Table (from Loki/Promtail)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS logs (
    timestamp DateTime,
    level String,
    service String,
    job String,
    message String,
    labels Map(String, String),
    metadata Map(String, String)
) ENGINE = MergeTree()
ORDER BY (timestamp, service, level)
TTL timestamp + INTERVAL 30 DAY;

-- ===========================================================================
-- API Request Metrics Table
-- ===========================================================================
CREATE TABLE IF NOT EXISTS api_requests (
    timestamp DateTime,
    method String,
    path String,
    status_code Int32,
    duration_ms Float64,
    user_id String,
    org_id String,
    error_message Nullable(String)
) ENGINE = MergeTree()
ORDER BY (timestamp, method, status_code)
TTL timestamp + INTERVAL 90 DAY;

-- ===========================================================================
-- Database Query Metrics
-- ===========================================================================
CREATE TABLE IF NOT EXISTS db_queries (
    timestamp DateTime,
    query_type String,
    table_name String,
    duration_ms Float64,
    rows_affected Int32,
    user_id String,
    success Boolean
) ENGINE = MergeTree()
ORDER BY (timestamp, table_name, success)
TTL timestamp + INTERVAL 90 DAY;

-- ===========================================================================
-- Alerts Table
-- ===========================================================================
CREATE TABLE IF NOT EXISTS alerts (
    timestamp DateTime,
    alert_name String,
    severity String,
    service String,
    message String,
    status String,
    resolved_at Nullable(DateTime),
    metadata Map(String, String)
) ENGINE = MergeTree()
ORDER BY (timestamp, severity, status)
TTL timestamp + INTERVAL 90 DAY;

-- ===========================================================================
-- Error Tracking
-- ===========================================================================
CREATE TABLE IF NOT EXISTS errors (
    timestamp DateTime,
    service String,
    error_type String,
    message String,
    stack_trace String,
    user_id Nullable(String),
    org_id Nullable(String),
    frequency Int32
) ENGINE = MergeTree()
ORDER BY (timestamp, service, error_type)
TTL timestamp + INTERVAL 90 DAY;

-- ===========================================================================
-- Performance Metrics (Aggregated)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS performance_stats (
    time_bucket DateTime,
    metric String,
    p50 Float64,
    p95 Float64,
    p99 Float64,
    mean Float64,
    max Float64,
    service String
) ENGINE = MergeTree()
ORDER BY (time_bucket, metric, service)
TTL time_bucket + INTERVAL 90 DAY;

-- ===========================================================================
-- User Activity Audit
-- ===========================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    timestamp DateTime,
    user_id String,
    org_id String,
    action String,
    resource String,
    resource_id String,
    old_value Nullable(String),
    new_value Nullable(String),
    ip_address String,
    user_agent String
) ENGINE = MergeTree()
ORDER BY (timestamp, user_id, org_id)
TTL timestamp + INTERVAL 90 DAY;

-- Create materialized view for aggregated metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS performance_stats_mv
ENGINE = MergeTree()
ORDER BY (time_bucket, metric, service)
TTL time_bucket + INTERVAL 90 DAY
AS SELECT
    toStartOfMinute(timestamp) as time_bucket,
    metric_name as metric,
    quantile(0.50)(value) as p50,
    quantile(0.95)(value) as p95,
    quantile(0.99)(value) as p99,
    avg(value) as mean,
    max(value) as max,
    service
FROM metrics
GROUP BY time_bucket, metric, service;
SQLEOF

echo -e "${GREEN}✓ Created schema file: deploy/clickhouse-schema.sql${NC}"
echo ""

# Step 8: Create initialization script
echo -e "${YELLOW}Step 8: Creating Database Initialization${NC}"

cat > deploy/init-clickhouse.sh << 'BASHEOF'
#!/bin/bash
# Initialize ClickHouse Cloud database

set -e

source .env.clickhouse

echo "Connecting to ClickHouse Cloud..."
echo "Host: $CLICKHOUSE_HOST"
echo "Database: $CLICKHOUSE_DATABASE"
echo ""

# Create schema
echo "Creating database schema..."
if command -v clickhouse-client &> /dev/null; then
    clickhouse-client \
        --host "$CLICKHOUSE_HOST" \
        --port "$CLICKHOUSE_PORT" \
        --user "$CLICKHOUSE_USER" \
        --password "$CLICKHOUSE_PASSWORD" \
        --secure \
        < deploy/clickhouse-schema.sql
else
    # Use curl as fallback
    curl -X POST \
        "https://${CLICKHOUSE_HOST}:${CLICKHOUSE_PORT}/?query=$(cat deploy/clickhouse-schema.sql | python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read()))')" \
        -u "${CLICKHOUSE_USER}:${CLICKHOUSE_PASSWORD}"
fi

echo "✓ Database schema created"
echo ""
echo "Tables created:"
echo "  - metrics (90-day retention)"
echo "  - logs (30-day retention)"
echo "  - api_requests (90-day retention)"
echo "  - db_queries (90-day retention)"
echo "  - alerts (90-day retention)"
echo "  - errors (90-day retention)"
echo "  - performance_stats (aggregated)"
echo "  - audit_log (90-day retention)"
BASHEOF

chmod +x deploy/init-clickhouse.sh

echo -e "${GREEN}✓ Created initialization script${NC}"
echo ""

# Step 9: Create Go client code
echo -e "${YELLOW}Step 9: Creating Go Client Code${NC}"

cat > src/api/clickhouse_client.go << 'GOEOF'
package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/dial"
)

var clickhouseClient clickhouse.Conn

// InitClickHouseClient initializes ClickHouse connection
func InitClickHouseClient() error {
	host := os.Getenv("CLICKHOUSE_HOST")
	port := 8443 // HTTPS default

	opts := &clickhouse.Options{
		Addr: []string{host + ":8443"},
		Auth: clickhouse.Auth{
			Database: os.Getenv("CLICKHOUSE_DATABASE"),
			Username: os.Getenv("CLICKHOUSE_USER"),
			Password: os.Getenv("CLICKHOUSE_PASSWORD"),
		},
		ClientInfo: clickhouse.ClientInfo{
			Products: []struct {
				Name    string
				Version string
			}{
				{Name: "creative-platform", Version: "1.0"},
			},
		},
		Debugf: func(format string, v ...interface{}) {
			fmt.Printf("[clickhouse] "+format+"\n", v...)
		},
		TLS: &dial.TLS{
			Config: nil, // Use system CA
		},
	}

	var err error
	clickhouseClient, err = clickhouse.Open(opts)
	if err != nil {
		return fmt.Errorf("failed to connect to ClickHouse: %w", err)
	}

	// Verify connection
	if err := clickhouseClient.Ping(context.Background()); err != nil {
		return fmt.Errorf("failed to ping ClickHouse: %w", err)
	}

	return nil
}

// RecordMetric stores a metric in ClickHouse
func RecordMetric(ctx context.Context, metricName string, value float64, service string, labels map[string]string) error {
	if clickhouseClient == nil {
		return fmt.Errorf("clickhouse client not initialized")
	}

	return clickhouseClient.AsyncInsert(ctx, fmt.Sprintf(
		"INSERT INTO metrics (timestamp, metric_name, service, value, labels) VALUES (?, ?, ?, ?, ?)",
	), false, time.Now(), metricName, service, value, labels)
}

// RecordLog stores a log entry in ClickHouse
func RecordLog(ctx context.Context, level, service, message string, labels map[string]string) error {
	if clickhouseClient == nil {
		return fmt.Errorf("clickhouse client not initialized")
	}

	return clickhouseClient.AsyncInsert(ctx, fmt.Sprintf(
		"INSERT INTO logs (timestamp, level, service, message, labels) VALUES (?, ?, ?, ?, ?)",
	), false, time.Now(), level, service, message, labels)
}

// RecordAPIRequest stores API request metrics
func RecordAPIRequest(ctx context.Context, method, path string, statusCode int, duration float64, userID, orgID string) error {
	if clickhouseClient == nil {
		return fmt.Errorf("clickhouse client not initialized")
	}

	return clickhouseClient.AsyncInsert(ctx, fmt.Sprintf(
		"INSERT INTO api_requests (timestamp, method, path, status_code, duration_ms, user_id, org_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
	), false, time.Now(), method, path, statusCode, duration, userID, orgID)
}

// QueryMetrics runs a query on ClickHouse
func QueryMetrics(ctx context.Context, query string) ([]map[string]interface{}, error) {
	if clickhouseClient == nil {
		return nil, fmt.Errorf("clickhouse client not initialized")
	}

	rows, err := clickhouseClient.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var values []interface{}
		if err := rows.Scan(&values); err != nil {
			return nil, err
		}
		// Convert to map (simplified)
		results = append(results, map[string]interface{}{
			"data": values,
		})
	}

	return results, nil
}

// Close closes the ClickHouse connection
func CloseClickHouseClient() error {
	if clickhouseClient != nil {
		return clickhouseClient.Close()
	}
	return nil
}
GOEOF

echo -e "${GREEN}✓ Created Go client: src/api/clickhouse_client.go${NC}"
echo ""

# Step 10: Update Go dependencies
echo -e "${YELLOW}Step 10: Updating Go Dependencies${NC}"

cd src/api

echo "Installing ClickHouse Go driver..."
go get github.com/ClickHouse/clickhouse-go/v2@latest

echo "Running go mod tidy..."
go mod tidy

cd ../..

echo -e "${GREEN}✓ Dependencies updated${NC}"
echo ""

# Step 11: Create deployment documentation
echo -e "${YELLOW}Step 11: Creating Documentation${NC}"

cat > deploy/CLICKHOUSE-DEPLOYMENT.md << 'MARKDOWNEOF'
# ClickHouse Cloud Deployment

## Prerequisites
- ClickHouse Cloud account
- Service created and running
- Connection credentials in `.env.clickhouse`

## Initialization

### 1. Create Database Schema

```bash
./deploy/init-clickhouse.sh
```

This creates all tables with proper TTL (Time-To-Live) settings:
- Metrics: 90-day retention
- Logs: 30-day retention
- Errors: 90-day retention

### 2. Verify Tables

```bash
clickhouse-client --host your-service.clickhouse.cloud \
                  --user default \
                  --password \
                  --query "SHOW TABLES FROM metrics"
```

## Usage in Go API

### Initialize Client

```go
import "github.com/ClickHouse/clickhouse-go/v2"

// In main()
if err := InitClickHouseClient(); err != nil {
    log.Fatal(err)
}
defer CloseClickHouseClient()
```

### Record Metrics

```go
// Record API request
RecordAPIRequest(ctx, "GET", "/api/v1/content", 200, 45.5, userID, orgID)

// Record custom metric
RecordMetric(ctx, "active_users", 1532, "api-service", map[string]string{
    "org_id": orgID,
    "region": "us-east",
})
```

## Queries

### Recent Errors (Last 24h)

```sql
SELECT timestamp, service, error_type, message, COUNT(*) as count
FROM errors
WHERE timestamp > now() - INTERVAL 1 DAY
GROUP BY timestamp, service, error_type, message
ORDER BY timestamp DESC
LIMIT 100;
```

### API Performance (Last Hour)

```sql
SELECT
    method,
    path,
    count() as requests,
    quantile(0.50)(duration_ms) as p50,
    quantile(0.95)(duration_ms) as p95,
    quantile(0.99)(duration_ms) as p99,
    max(duration_ms) as max_duration
FROM api_requests
WHERE timestamp > now() - INTERVAL 1 HOUR
GROUP BY method, path
ORDER BY requests DESC;
```

### User Activity

```sql
SELECT timestamp, user_id, org_id, action, resource
FROM audit_log
WHERE org_id = 'your-org-id'
ORDER BY timestamp DESC
LIMIT 50;
```

## Cost Optimization

### TTL Strategy
- Active data: 90 days
- Logs: 30 days (shorter for cost)
- Traces: 7 days (optional)

### Query Optimization
- Use approximate functions when possible
- Aggregate at write time
- Use materialized views for common queries

## Monitoring

Check data flow:
```sql
SELECT
    table,
    sum(bytes) / 1024 / 1024 as size_mb,
    count(*) as rows
FROM system.tables
WHERE database = 'metrics'
GROUP BY table;
```

MARKDOWNEOF

echo -e "${GREEN}✓ Created deployment documentation${NC}"
echo ""

# Final summary
echo "=========================================="
echo -e "${GREEN}✅ ClickHouse Cloud Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "📝 Configuration saved to: .env.clickhouse"
echo "🔐 Keep .env.clickhouse secure (added to .gitignore)"
echo ""
echo "📊 Database Details:"
echo "  Host: $CLICKHOUSE_HOST"
echo "  Port: $CLICKHOUSE_PORT"
echo "  Database: $CLICKHOUSE_DATABASE"
echo ""
echo "🚀 Next steps:"
echo "  1. Review .env.clickhouse configuration"
echo "  2. Initialize database: ./deploy/init-clickhouse.sh"
echo "  3. Verify connection: clickhouse-client ... --query 'SELECT 1'"
echo "  4. Deploy: git push origin main"
echo "  5. Monitor: https://console.clickhouse.cloud"
echo ""
echo "📚 Documentation:"
echo "  - CLOUD-DEPLOYMENT.md - Full strategy"
echo "  - deploy/CLICKHOUSE-DEPLOYMENT.md - Deployment guide"
echo "  - deploy/clickhouse-schema.sql - Database schema"
echo ""
echo "🔗 ClickHouse Cloud Console:"
echo "  https://console.clickhouse.cloud"
echo ""
