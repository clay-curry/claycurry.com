#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl"

echo "=== Dovecot Setup ==="

# Create SSL directory
mkdir -p "$SSL_DIR"

# Generate self-signed certificate
if [[ ! -f "$SSL_DIR/tls.crt" ]]; then
    echo "Generating self-signed TLS certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/tls.key" \
        -out "$SSL_DIR/tls.crt" \
        -subj "/CN=mail.example.com/O=Dovecot/C=US"
    echo "Certificate generated: $SSL_DIR/tls.crt"
else
    echo "Certificate already exists: $SSL_DIR/tls.crt"
fi

# Create .env if it doesn't exist
if [[ ! -f "$SCRIPT_DIR/.env" ]]; then
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
    echo "Created .env from .env.example - edit it with your credentials"
fi

echo ""
echo "Setup complete! Next steps:"
echo "  1. Edit .env with your credentials"
echo "  2. Run ./deploy-fargate.sh"
