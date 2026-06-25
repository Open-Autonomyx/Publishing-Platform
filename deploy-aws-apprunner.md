# AWS AppRunner Deployment

## ⚡ Deploy in 5 Minutes

### Prerequisites
- AWS Account (free tier works)
- AWS CLI installed: `brew install awscli`
- Configured credentials: `aws configure`

---

## 🚀 Step 1: Create RDS PostgreSQL

```bash
aws rds create-db-instance \
  --db-instance-identifier openautonomyx-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username openautonomyx \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20 \
  --publicly-accessible false \
  --no-enable-cloudwatch-logs-exports \
  --region us-east-1
```

Wait for DB to be available (2-3 minutes):
```bash
aws rds describe-db-instances \
  --db-instance-identifier openautonomyx-db \
  --query 'DBInstances[0].DBInstanceStatus' \
  --region us-east-1
```

Get endpoint:
```bash
aws rds describe-db-instances \
  --db-instance-identifier openautonomyx-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --region us-east-1
```

---

## 🚀 Step 2: Create ElastiCache Redis

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id openautonomyx-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --region us-east-1
```

Get endpoint:
```bash
aws elasticache describe-cache-clusters \
  --cache-cluster-id openautonomyx-redis \
  --show-cache-node-info \
  --query 'CacheClusters[0].CacheNodes[0].Endpoint' \
  --region us-east-1
```

---

## 🚀 Step 3: Create AppRunner Service

Create `apprunner-config.json`:

```json
{
  "ServiceName": "openautonomyx",
  "SourceConfiguration": {
    "ImageRepository": {
      "ImageIdentifier": "ghcr.io/openautonomyx/original:latest",
      "ImageRepositoryType": "ECR_PUBLIC"
    },
    "AutoDeploymentsEnabled": true
  },
  "InstanceConfiguration": {
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  },
  "NetworkConfiguration": {
    "EgressConfiguration": {
      "EgressType": "DEFAULT"
    }
  },
  "Tags": [
    {
      "Key": "Project",
      "Value": "OpenAutonomyX"
    }
  ]
}
```

Deploy:
```bash
aws apprunner create-service \
  --cli-input-json file://apprunner-config.json \
  --region us-east-1
```

---

## 🚀 Step 4: Configure Environment Variables

Get your RDS endpoint and Redis endpoint from above, then:

```bash
aws apprunner update-service \
  --service-arn arn:aws:apprunner:us-east-1:ACCOUNT-ID:service/openautonomyx/auto-generated-id \
  --instance-configuration Cpu=1 vCPU,Memory=2 GB,EnvironmentVariables=[{Name=DATABASE_URL,Value="postgresql://openautonomyx:YourPassword@RDS-ENDPOINT:5432/openautonomyx"},{Name=REDIS_URL,Value="redis://REDIS-ENDPOINT:6379"}] \
  --region us-east-1
```

---

## 📊 Your Services

| Service | AWS Product |
|---------|-------------|
| **App** | AppRunner |
| **Database** | RDS PostgreSQL |
| **Cache** | ElastiCache Redis |
| **Registry** | ECR Public (auto via GitHub) |
| **DNS** | Route 53 (optional) |

---

## 🌐 Access Your App

AppRunner gives you a public URL like:
```
https://xxxxxxxxxxxx.us-east-1.apprunner.aws.com
```

To use custom domain:
```bash
aws apprunner associate-custom-domain \
  --service-arn arn:aws:apprunner:us-east-1:ACCOUNT-ID:service/openautonomyx/xxxxx \
  --domain-name your-domain.com \
  --region us-east-1
```

---

## 💰 Estimated Cost

| Service | Free Tier | Usage Cost |
|---------|-----------|------------|
| **AppRunner** | 1 million requests/month | $0.064/hour |
| **RDS (db.t3.micro)** | 750 hours/month | $0.017/hour |
| **ElastiCache (cache.t3.micro)** | 750 hours/month | $0.017/hour |
| **Data Transfer** | First 1 GB free | $0.09/GB |
| **Total** | ~$40/month free tier | ~$30/month production |

---

## 🔍 Useful Commands

### View Service Status
```bash
aws apprunner describe-service \
  --service-arn arn:aws:apprunner:us-east-1:ACCOUNT-ID:service/openautonomyx/xxxxx \
  --region us-east-1
```

### View Logs
```bash
aws logs tail /aws/apprunner/openautonomyx/xxxxx --follow
```

### Scale Up
```bash
aws apprunner update-service \
  --service-arn arn:aws:apprunner:... \
  --instance-configuration Cpu=2\ vCPU,Memory=4\ GB \
  --region us-east-1
```

### Delete Services
```bash
# AppRunner
aws apprunner delete-service --service-arn arn:aws:apprunner:...

# RDS
aws rds delete-db-instance \
  --db-instance-identifier openautonomyx-db \
  --skip-final-snapshot

# ElastiCache
aws elasticache delete-cache-cluster \
  --cache-cluster-id openautonomyx-redis
```

---

## 🔐 Security

- ✅ Change default passwords
- ✅ Use AWS Secrets Manager for credentials
- ✅ Enable RDS backup
- ✅ Set VPC security groups
- ✅ Enable CloudWatch monitoring

---

## 📞 Support

- AWS Console: https://console.aws.amazon.com
- AppRunner Docs: https://docs.aws.amazon.com/apprunner
- GitHub: https://github.com/openautonomyx/original

---

**Deploy now:** Run the commands above! 🚀
