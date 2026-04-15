#!/bin/bash

# SSL Setup Script for parathan.com
# This script automates Nginx + Let's Encrypt SSL setup

set -e  # Exit on any error

DOMAIN="parathan.com"
WWW_DOMAIN="www.parathan.com"
EMAIL="parathan98@gmail.com"  # For Let's Encrypt notifications

echo "========================================="
echo "SSL Setup Script for $DOMAIN"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Step 1: Install Nginx and Certbot
echo "Step 1: Installing Nginx and Certbot..."
apt update
apt install -y nginx certbot python3-certbot-nginx

# Step 2: Stop Nginx temporarily
echo "Step 2: Stopping Nginx temporarily..."
systemctl stop nginx

# Step 3: Create Nginx configuration
echo "Step 3: Creating Nginx configuration..."
cat > /etc/nginx/sites-available/$DOMAIN <<'EOF'
# Redirect www to non-www
server {
    listen 80;
    listen [::]:80;
    server_name www.parathan.com;
    return 301 http://parathan.com$request_uri;
}

# Main server block
server {
    listen 80;
    listen [::]:80;
    server_name parathan.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size for file uploads
    client_max_body_size 10M;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Proxy to Next.js frontend (running on port 3000 in Docker)
    location / {
        proxy_pass http://localhost:3000;
    }

    # Let's Encrypt challenge
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }
}
EOF

# Step 4: Enable the site
echo "Step 4: Enabling the site..."
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Step 5: Test Nginx configuration
echo "Step 5: Testing Nginx configuration..."
nginx -t

# Step 6: Start Nginx
echo "Step 6: Starting Nginx..."
systemctl start nginx
systemctl enable nginx

# Step 7: Check if DNS is pointing to this server
echo "Step 7: Checking DNS..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)

echo "Server IP: $SERVER_IP"
echo "Domain IP: $DOMAIN_IP"

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo ""
    echo "WARNING: DNS is not pointing to this server yet!"
    echo "Please update your DNS records:"
    echo "  $DOMAIN A record -> $SERVER_IP"
    echo "  $WWW_DOMAIN A record -> $SERVER_IP"
    echo ""
    echo "After updating DNS, wait 5-10 minutes for propagation, then run:"
    echo "  sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --email $EMAIL --agree-tos --non-interactive"
    exit 0
fi

# Step 8: Obtain SSL certificate
echo "Step 8: Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

# Step 9: Test auto-renewal
echo "Step 9: Testing SSL auto-renewal..."
certbot renew --dry-run

# Step 10: Update firewall (if ufw is enabled)
if command -v ufw &> /dev/null; then
    echo "Step 10: Updating firewall rules..."
    ufw allow 'Nginx Full'
    ufw delete allow 'Nginx HTTP' 2>/dev/null || true
fi

echo ""
echo "========================================="
echo "✅ SSL Setup Complete!"
echo "========================================="
echo ""
echo "Your site is now available at:"
echo "  https://$DOMAIN"
echo "  https://$WWW_DOMAIN (redirects to non-www)"
echo ""
echo "SSL certificate will auto-renew every 60 days."
echo ""
echo "Next steps:"
echo "1. Update your .env file with HTTPS URLs"
echo "2. Restart Docker containers"
echo ""
