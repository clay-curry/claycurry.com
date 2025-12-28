#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$SCRIPT_DIR/.env" ]] && export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)

AWS_REGION="${AWS_REGION:-us-east-1}"
LAMBDA_NAME="dovecot-email-handler"

echo "Packaging Lambda function..."

# Create temp directory
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# Copy handler and rename to index.py (matches Handler: index.lambda_handler)
cp "$SCRIPT_DIR/lambda/handler.py" "$TMPDIR/index.py"

# Create zip
cd "$TMPDIR"
zip -q lambda.zip index.py

echo "Updating Lambda function..."

aws lambda update-function-code \
    --function-name "$LAMBDA_NAME" \
    --zip-file "fileb://lambda.zip" \
    --region "$AWS_REGION" \
    --query 'LastModified' \
    --output text

echo "Lambda updated successfully!"