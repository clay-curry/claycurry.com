#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env" ]] && export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)

AWS_REGION="${AWS_REGION:-us-east-1}"

TASK_ARN=$(aws ecs list-tasks --cluster dovecot --service-name dovecot --region "$AWS_REGION" --query 'taskArns[0]' --output text)

if [[ -z "$TASK_ARN" || "$TASK_ARN" == "None" ]]; then
    echo "Error: No running task found" >&2
    exit 1
fi

ENI_ID=$(aws ecs describe-tasks --cluster dovecot --tasks "$TASK_ARN" --region "$AWS_REGION" \
    --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)

aws ec2 describe-network-interfaces --network-interface-ids "$ENI_ID" --region "$AWS_REGION" \
    --query 'NetworkInterfaces[0].Association.PublicIp' --output text
