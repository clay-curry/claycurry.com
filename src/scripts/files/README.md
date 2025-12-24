# Dovecot on AWS Fargate

Simple IMAP/POP3 mail server on serverless Fargate.

## Files

| File | Purpose |
|------|---------|
| `.env.example` | Configuration template |
| `Dockerfile.fargate` | Container image |
| `startup.sh` | Container entrypoint |
| `cloudformation-fargate.yaml` | AWS infrastructure |
| `deploy-fargate.sh` | Deploy to AWS |
| `get-ip.sh` | Get task public IP |
| `teardown-fargate.sh` | Delete everything |
| `setup.sh` | Generate TLS certs |

## Usage

```bash
# 1. Setup
./setup.sh

# 2. Edit credentials
nano .env

# 3. Deploy
./deploy-fargate.sh

# 4. Get IP (if task restarts)
./get-ip.sh

# 5. Teardown
./teardown-fargate.sh
```

## Mail Client Settings

- Server: (IP from get-ip.sh)
- IMAP Port: 993 (SSL/TLS)
- POP3 Port: 995 (SSL/TLS)
- Username: (from .env)
- Password: (from .env)

## Cost

~$10/month (Fargate only, no load balancer)

## Notes

- IP changes on task restart - run `get-ip.sh` to get new IP
- Mail stored in ephemeral storage - lost on restart
- Self-signed cert - add to trusted certs or use Let's Encrypt
