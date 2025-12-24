#!/bin/sh
set -e

echo "Configuring Dovecot..."

if [ -z "$DOVECOT_USERNAME" ] || [ -z "$DOVECOT_PASSWORD" ]; then
    echo "Error: DOVECOT_USERNAME and DOVECOT_PASSWORD must be set"
    exit 1
fi

if [ -z "$TLS_CERT" ] || [ -z "$TLS_KEY" ]; then
    echo "Error: TLS_CERT and TLS_KEY must be set"
    exit 1
fi

# Write TLS certs from env vars (base64 encoded)
echo "$TLS_CERT" | base64 -d > /etc/dovecot/ssl/tls.crt
echo "$TLS_KEY" | base64 -d > /etc/dovecot/ssl/tls.key
chmod 600 /etc/dovecot/ssl/tls.key
chmod 644 /etc/dovecot/ssl/tls.crt

# Create passwd file with plaintext password
echo "${DOVECOT_USERNAME}:{PLAIN}${DOVECOT_PASSWORD}:1000:1000::/srv/vmail/${DOVECOT_USERNAME}::" > /etc/dovecot/passwd

# Write config
cat > /etc/dovecot/dovecot.conf << 'EOF'
protocols = imap pop3
listen = *

log_path = /dev/stderr
info_log_path = /dev/stdout

ssl = required
ssl_cert = </etc/dovecot/ssl/tls.crt
ssl_key = </etc/dovecot/ssl/tls.key

disable_plaintext_auth = no
auth_mechanisms = plain login

passdb {
    driver = passwd-file
    args = scheme=PLAIN /etc/dovecot/passwd
}

userdb {
    driver = passwd-file
    args = /etc/dovecot/passwd
}

mail_location = maildir:~/Maildir

service imap-login {
    inet_listener imap {
        port = 143
    }
    inet_listener imaps {
        port = 993
        ssl = yes
    }
}

service pop3-login {
    inet_listener pop3 {
        port = 110
    }
    inet_listener pop3s {
        port = 995
        ssl = yes
    }
}

mail_uid = vmail
mail_gid = vmail
first_valid_uid = 1000
EOF

# EFS mounts at /srv/vmail with uid/gid 1000 via access point
# Just create the user's Maildir
mkdir -p "/srv/vmail/${DOVECOT_USERNAME}/Maildir"

echo "Starting Dovecot..."
exec /usr/sbin/dovecot -F