#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env" ]] && export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)

AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-dovecot-fargate}"

echo "=== Dovecot Fargate Teardown ==="
echo "This will delete stack: $STACK_NAME"
read -p "Are you sure? (y/N): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Aborted."
    exit 0
fi

echo "Deleting CloudFormation stack..."
aws cloudformation delete-stack --stack-name "$STACK_NAME" --region "$AWS_REGION"
aws cloudformation wait stack-delete-complete --stack-name "$STACK_NAME" --region "$AWS_REGION"
echo "Stack deleted."

read -p "Delete ECR repository? (y/N): " delete_ecr
if [[ "$delete_ecr" == "y" || "$delete_ecr" == "Y" ]]; then
    aws ecr delete-repository --repository-name dovecot-fargate --force --region "$AWS_REGION" 2>/dev/null || true
    echo "ECR repository deleted."
fi

echo "=== Teardown Complete ==="
