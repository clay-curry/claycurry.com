#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env" ]] && export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)

AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-dovecot-fargate}"

# Check if task already running
EXISTING=$(aws ecs list-tasks --cluster dovecot --region "$AWS_REGION" --query 'taskArns[0]' --output text 2>/dev/null || echo "None")
if [[ "$EXISTING" != "None" && -n "$EXISTING" ]]; then
    echo "Task already running!"
    "$SCRIPT_DIR/get-ip.sh"
    exit 0
fi

# Get stack outputs
SUBNET1=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='Subnet1'].OutputValue" --output text)
SUBNET2=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='Subnet2'].OutputValue" --output text)
SG=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='SecurityGroup'].OutputValue" --output text)
TASK_DEF=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" --query "Stacks[0].Outputs[?OutputKey=='TaskDefinition'].OutputValue" --output text)

echo "Starting Dovecot task..."

aws ecs run-task \
    --cluster dovecot \
    --task-definition "$TASK_DEF" \
    --launch-type FARGATE \
    --enable-execute-command \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET1,$SUBNET2],securityGroups=[$SG],assignPublicIp=ENABLED}" \
    --region "$AWS_REGION" \
    --query 'tasks[0].taskArn' \
    --output text > /dev/null

echo "Waiting for task to start..."
sleep 20

# Get IP
PUBLIC_IP=$("$SCRIPT_DIR/get-ip.sh" 2>/dev/null || echo "pending")

echo ""
echo "Task started!"
echo "IP: $PUBLIC_IP"
echo ""
echo "Task will auto-terminate after 10s idle."
echo "Mail: $PUBLIC_IP:993 (IMAPS)"
