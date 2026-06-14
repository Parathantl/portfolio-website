#!/bin/bash

# Update Nginx to proxy /uploads requests to backend
# This allows uploaded files to be served through HTTPS

set -e

echo "Updating Nginx configuration to serve uploaded files..."

# Backup current config
sudo cp /etc/nginx/sites-available/parathan.com /etc/nginx/sites-available/parathan.com.backup

# Update Nginx configuration to add /uploads proxy
sudo tee /etc/nginx/sites-available/parathan.com > /dev/null <<'EOF'
# Redirect www to non-www
server {
    server_name www.parathan.com;
    return 301 https://parathan.com$request_uri;

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/parathan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/parathan.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Main server block
server {
    server_name parathan.com;

    # Security headers
    # NOTE: HSTS, CSP, and Referrer-Policy are set in the Next.js app
    # (frontend/next.config.mjs) so they ship automatically with every deploy.
    # Keep only the edge-level headers here to avoid duplicate header values.
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

    # Proxy uploaded files to backend
    location /uploads/ {
        proxy_pass http://localhost:3001/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache settings for uploaded files
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Next.js frontend (running on port 3000 in Docker)
    location / {
        proxy_pass http://localhost:3000;
    }

    # Let's Encrypt challenge
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }

    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/parathan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/parathan.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP to HTTPS redirect
server {
    if ($host = parathan.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;
    server_name parathan.com;
    return 404;
}

server {
    if ($host = www.parathan.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;
    server_name www.parathan.com;
    return 404;
}
EOF

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Nginx configuration updated successfully!"
echo "Uploaded files will now be served through: https://parathan.com/uploads/"
echo ""
