# Dovecot Mail Server (Scale-to-Zero)

Serverless IMAP/POP3 mail server with Cloudflare Email Workers integration.

## Architecture

```
Incoming Email:

  Cloudflare SMTP server
  (route1.mx.cloudflare.net)
           ↓
  Cloudflare Email Worker
           ↓
  AWS API Gateway (CNAME)
           ↓
  AWS Lambda (dovecot-email-handler)
           ↓
  Writes to EFS (Maildir format)
  
Reading Email:
  ./start-task.sh
           ↓
  Fargate runs Dovecot
           ↓
  Reads from EFS
           ↓
  Auto-terminates after 10s idle
```

## Files

| File | Purpose |
|------|---------|
| `cloudflare-worker/email-worker.js` | Cloudflare Email Worker |
| `cloudformation-fargate.yaml` | AWS infrastructure |
| `Dockerfile.fargate` | Dovecot container |
| `startup.sh` | Container entrypoint |
| `deploy-fargate.sh` | Deploy to AWS |
| `start-task.sh` | Start Dovecot |
| `get-ip.sh` | Get Fargate IP |
| `setup.sh` | Generate TLS certs |

## Setup

```bash
# 1. Generate TLS certs and .env
./setup.sh

# 2. Edit credentials
nano .env

# 3. Deploy AWS infrastructure
./deploy-fargate.sh
# Note the API_ENDPOINT and API_KEY output

# 4. Configure Cloudflare Email Worker
# - Create worker with cloudflare-worker/email-worker.js
# - Set environment variables:
#   API_ENDPOINT = (from deploy output)
#   API_KEY = (from .env)
# - Add Email Route to your domain
```

## Usage

```bash
# Start Dovecot to read mail
./start-task.sh

# Get current IP
./get-ip.sh

# Configure mail client:
#   Server: <IP from get-ip.sh>
#   Port: 993 (IMAPS)
#   Username: (from .env)
#   Password: (from .env)
```

## Cost

- **Receiving email:** ~$0 (Lambda free tier: 1M requests/month)
- **Reading email:** ~$0.01/hour when Fargate running
- **Storage:** ~$0.30/GB/month (EFS)
- **NAT Gateway:** ~$0.045/hour + data (~$32/month if always on)

**Note:** NAT Gateway is the main cost. Consider removing it if Lambda doesn't need internet access (it only needs EFS and ECS).

## How It Works

1. **Email arrives** → Cloudflare receives it
2. **Worker POSTs** → Raw email sent to Lambda via API Gateway
3. **Lambda writes** → Email saved to EFS in Maildir format
4. **You run start-task.sh** → Fargate starts Dovecot
5. **Mail client connects** → Dovecot serves email from EFS
6. **10s idle** → Fargate auto-terminates
