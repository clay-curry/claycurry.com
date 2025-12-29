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

if [[ -z "${API_KEY:-}" ]]; then
    echo "Error: API_KEY must be set in .env"
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
echo "[1/4] Setting up ECR..."
if ! aws ecr describe-repositories --repository-names "$ECR_REPO_NAME" --region "$AWS_REGION" &> /dev/null; then
    aws ecr create-repository --repository-name "$ECR_REPO_NAME" --region "$AWS_REGION" > /dev/null
fi

# Step 2: Build and push
echo "[2/4] Building and pushing Docker image..."
aws ecr get-login-password --region "$AWS_REGION" | \
    docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com" > /dev/null 2>&1

docker build --platform linux/amd64 -t "$ECR_REPO_NAME" -f "$SCRIPT_DIR/Dockerfile.fargate" "$SCRIPT_DIR"
docker tag "$ECR_REPO_NAME:latest" "$ECR_URI:latest"
docker push "$ECR_URI:latest"

# Step 3: Deploy
echo "[3/4] Deploying CloudFormation stack..."
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
        ApiKey="$API_KEY" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$AWS_REGION" \
    --no-fail-on-empty-changeset

# Update Lambda with actual code
echo "[4/4] Updating Lambda function..."
"$SCRIPT_DIR/update-lambda.sh"

# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)

echo ""
echo "==========================================="
echo "Deployment Complete!"
echo "==========================================="
echo ""
echo "=== Cloudflare Worker Configuration ==="
echo "Set these environment variables in Cloudflare:"
echo "  API_ENDPOINT = $API_ENDPOINT"
echo "  API_KEY = $API_KEY"
echo ""
echo "=== To Read Mail ==="
echo "1. Start Dovecot: ./start-task.sh"
echo "2. Get IP: ./get-ip.sh"
echo "3. Connect mail client to IP:993 (IMAPS)"
echo ""
echo "Logs: aws logs tail /ecs/dovecot --follow"