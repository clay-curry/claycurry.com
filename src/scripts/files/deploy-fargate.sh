#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load .env
if [[ -f "$SCRIPT_DIR/.env" ]]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-dovecot-fargate}"
CPU="${CPU:-256}"
MEMORY="${MEMORY:-512}"
SSL_DIR="${SSL_DIR:-$SCRIPT_DIR/ssl}"
ECR_REPO_NAME="dovecot-fargate"

if [[ -z "${DOVECOT_USERNAME:-}" ]] || [[ -z "${DOVECOT_PASSWORD:-}" ]]; then
    echo "Error: DOVECOT_USERNAME and DOVECOT_PASSWORD must be set in .env"
    exit 1
fi

if [[ ! -f "$SSL_DIR/tls.crt" ]] || [[ ! -f "$SSL_DIR/tls.key" ]]; then
    echo "Error: TLS certs not found. Run ./setup.sh first"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

echo "=== Dovecot Fargate Deployment ==="
echo "Region: $AWS_REGION"
echo ""

# Step 1: ECR
echo "[1/3] Setting up ECR..."
if ! aws ecr describe-repositories --repository-names "$ECR_REPO_NAME" --region "$AWS_REGION" &> /dev/null; then
    aws ecr create-repository --repository-name "$ECR_REPO_NAME" --region "$AWS_REGION" > /dev/null
fi

# Step 2: Build and push
echo "[2/3] Building and pushing Docker image..."
aws ecr get-login-password --region "$AWS_REGION" | \
    docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com" > /dev/null 2>&1

docker build --platform linux/amd64 -t "$ECR_REPO_NAME" -f "$SCRIPT_DIR/Dockerfile.fargate" "$SCRIPT_DIR"
docker tag "$ECR_REPO_NAME:latest" "$ECR_URI:latest"
docker push "$ECR_URI:latest"

# Step 3: Deploy
echo "[3/3] Deploying CloudFormation stack..."
TLS_CERT=$(base64 -i "$SSL_DIR/tls.crt" | tr -d '\n')
TLS_KEY=$(base64 -i "$SSL_DIR/tls.key" | tr -d '\n')

aws cloudformation deploy \
    --template-file "$SCRIPT_DIR/cloudformation-fargate.yaml" \
    --stack-name "$STACK_NAME" \
    --parameter-overrides \
        ContainerImage="$ECR_URI:latest" \
        Cpu="$CPU" \
        Memory="$MEMORY" \
        DovecotUsername="$DOVECOT_USERNAME" \
        DovecotPassword="$DOVECOT_PASSWORD" \
        TlsCert="$TLS_CERT" \
        TlsKey="$TLS_KEY" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$AWS_REGION" \
    --no-fail-on-empty-changeset

echo ""
echo "Waiting for task to start..."
sleep 30

PUBLIC_IP=$("$SCRIPT_DIR/get-ip.sh" 2>/dev/null || echo "pending")

echo ""
echo "==========================================="
echo "Deployment Complete!"
echo "==========================================="
echo ""
echo "Task Public IP: $PUBLIC_IP"
echo ""
echo "Test: openssl s_client -connect $PUBLIC_IP:993"
echo ""
echo "Mail client:"
echo "  Server: $PUBLIC_IP"
echo "  IMAP: 993 (SSL/TLS)"
echo "  Username: $DOVECOT_USERNAME"
echo ""
echo "Logs: aws logs tail /ecs/dovecot --follow"