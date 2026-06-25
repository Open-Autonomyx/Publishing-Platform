#!/bin/bash

##############################################################################
# OpenAutonomyX K3s Deployment (Lightweight Kubernetes)
# For: AlmaLinux VPS
##############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  OpenAutonomyX - K3s Deployment                            ║"
echo "║  Lightweight Kubernetes on VPS                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO_URL="https://github.com/openautonomyx/original.git"
DEPLOY_DIR="/opt/openautonomyx"
DOMAIN="${1:-openautonomyx.com}"

if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}🔄 Step 1: Update System${NC}"
dnf update -y
dnf install -y curl wget git

echo -e "${YELLOW}🔄 Step 2: Disable SELinux${NC}"
setenforce 0 || true
sed -i 's/^SELINUX=enforcing$/SELINUX=disabled/' /etc/selinux/config

echo -e "${YELLOW}🔄 Step 3: Configure Firewall${NC}"
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

echo -e "${YELLOW}🔄 Step 4: Install K3s${NC}"
curl -sfL https://get.k3s.io | sh -
sleep 10

echo -e "${YELLOW}🔄 Step 5: Verify K3s${NC}"
/usr/local/bin/k3s kubectl get nodes
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

echo -e "${YELLOW}🔄 Step 6: Clone Repository${NC}"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR
git clone $REPO_URL . || git -C $DEPLOY_DIR pull origin main

echo -e "${YELLOW}🔄 Step 7: Create Namespace${NC}"
/usr/local/bin/k3s kubectl create namespace openautonomyx || true

echo -e "${YELLOW}🔄 Step 8: Create Secrets${NC}"
/usr/local/bin/k3s kubectl create secret generic openautonomyx-secrets \
  --from-literal=db-password=secure_password \
  --from-literal=jwt-secret=$(openssl rand -base64 32) \
  -n openautonomyx || true

echo -e "${YELLOW}🔄 Step 9: Deploy PostgreSQL${NC}"
cat << 'EOF' | /usr/local/bin/k3s kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: openautonomyx
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: openautonomyx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_USER
          value: openautonomyx
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: openautonomyx-secrets
              key: db-password
        - name: POSTGRES_DB
          value: openautonomyx
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: openautonomyx
spec:
  ports:
  - port: 5432
  selector:
    app: postgres
EOF

echo -e "${YELLOW}🔄 Step 10: Deploy Redis${NC}"
cat << 'EOF' | /usr/local/bin/k3s kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: openautonomyx
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: openautonomyx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command:
        - redis-server
        - "--appendonly"
        - "yes"
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: openautonomyx
spec:
  ports:
  - port: 6379
  selector:
    app: redis
EOF

echo -e "${YELLOW}🔄 Step 11: Deploy Ollama${NC}"
cat << 'EOF' | /usr/local/bin/k3s kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ollama-pvc
  namespace: openautonomyx
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: openautonomyx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
      - name: ollama
        image: ollama/ollama:latest
        ports:
        - containerPort: 11434
        volumeMounts:
        - name: ollama-storage
          mountPath: /root/.ollama
      volumes:
      - name: ollama-storage
        persistentVolumeClaim:
          claimName: ollama-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ollama
  namespace: openautonomyx
spec:
  ports:
  - port: 11434
  selector:
    app: ollama
EOF

echo -e "${YELLOW}🔄 Step 12: Deploy Application${NC}"
cat << EOF | /usr/local/bin/k3s kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: openautonomyx-app
  namespace: openautonomyx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: openautonomyx
  template:
    metadata:
      labels:
        app: openautonomyx
    spec:
      containers:
      - name: app
        image: ghcr.io/openautonomyx/original:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: PORT
          value: "3000"
        - name: DATABASE_URL
          value: postgresql://openautonomyx:secure_password@postgres:5432/openautonomyx
        - name: REDIS_URL
          value: redis://redis:6379
        - name: LLM_PROVIDER
          value: ollama
        - name: OLLAMA_API_URL
          value: http://ollama:11434
        - name: DOMAIN
          value: $DOMAIN
---
apiVersion: v1
kind: Service
metadata:
  name: openautonomyx
  namespace: openautonomyx
spec:
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: openautonomyx
  type: LoadBalancer
EOF

echo -e "${YELLOW}🔄 Step 13: Install Ingress Controller${NC}"
/usr/local/bin/k3s kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.0/deploy/static/provider/cloud/deploy.yaml

echo -e "${YELLOW}🔄 Step 14: Setup Ingress${NC}"
cat << EOF | /usr/local/bin/k3s kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: openautonomyx-ingress
  namespace: openautonomyx
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - $DOMAIN
    secretName: openautonomyx-tls
  rules:
  - host: $DOMAIN
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: openautonomyx
            port:
              number: 3000
EOF

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}✅ K3s Deployment Complete!${NC}"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your platform is deploying..."
echo ""
echo "📋 Useful Kubectl Commands:"
echo "   export KUBECONFIG=/etc/rancher/k3s/k3s.yaml"
echo "   kubectl get pods -n openautonomyx"
echo "   kubectl logs -f deployment/openautonomyx-app -n openautonomyx"
echo "   kubectl get svc -n openautonomyx"
echo "   kubectl describe ingress -n openautonomyx"
echo ""
echo "🔄 Monitor Deployment:"
echo "   kubectl get pods -n openautonomyx -w"
echo ""
echo "Wait 2-3 minutes for all pods to be Ready"
echo ""
echo "Access your app:"
echo "   Point DNS: $DOMAIN → $(hostname -I | awk '{print $1}')"
echo "   Then visit: https://$DOMAIN"
echo ""
