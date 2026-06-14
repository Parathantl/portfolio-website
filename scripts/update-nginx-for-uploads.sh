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
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # HSTS: force HTTPS for 2 years. www -> non-www already redirects over TLS.
    # (Add the 'preload' token and submit to hstspreload.org only when you are
    # certain every current and future subdomain will always be HTTPS.)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;

    # Content Security Policy — shipped in Report-Only so it can NEVER break the
    # site. Load the blog, portfolio, a post with embeds, and /admin, then watch
    # the browser console for violations. Once clean, rename the header to
    # "Content-Security-Policy" to enforce. Notes:
    #   - 'unsafe-inline' on script-src is required by Next.js hydration + the
    #     inline JSON-LD blocks (no nonce middleware in place).
    #   - next/font self-hosts Inter, so no Google Fonts origins are needed.
    #   - img-src allows https: so Cloudinary/markdown-embedded images work.
    #   - if the admin Markdown editor reports an eval violation, add
    #     'unsafe-eval' to script-src before enforcing.
    add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests;" always;

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
