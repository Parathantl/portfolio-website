# Production Deployment Guide

Complete guide for deploying your Blog + Portfolio application to production.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All migrations tested locally
- [ ] Environment variables configured
- [ ] Database backup created (if updating existing deployment)
- [ ] `NODE_ENV=production` set
- [ ] `DB_SYNCHRONIZE=false` set (CRITICAL - never use sync in production)
- [ ] JWT secret is strong and unique
- [ ] CORS configured correctly
- [ ] SSL/TLS enabled for database

## Deployment Options

### Option 1: Docker Compose (Recommended for VPS)

```bash
# Build and start all services
docker-compose up --build -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

**docker-compose.yml** is already configured with:
- PostgreSQL database
- Backend service
- Frontend service
- Automatic migrations on startup

### Option 2: Railway (Backend) + Vercel (Frontend)

#### Backend on Railway

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Add PostgreSQL database

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Link project
   cd blog-backend
   railway link

   # Deploy
   railway up
   ```

3. **Configure Environment Variables**
   ```env
   NODE_ENV=production
   DATABASE_URL=<provided-by-railway>
   DB_SYNCHRONIZE=false
   JWT_SECRET=<your-strong-secret>
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   EMAIL_USER=<your-email>
   EMAIL_PASSWORD=<your-app-password>
   CONTACT_EMAIL=<contact-email>
   ```

4. **Set Start Command**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run deploy"
     }
   }
   ```

#### Frontend on Vercel

1. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set root directory to `blog`

2. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

3. **Deploy**
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy from blog directory
   cd blog
   vercel --prod
   ```

### Option 3: VPS (Ubuntu/Debian)

#### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Database Setup

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE blog;
CREATE USER blog_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE blog TO blog_user;
\q
```

#### Backend Deployment

```bash
# Clone repository
git clone <your-repo> /var/www/blog-backend
cd /var/www/blog-backend/blog-backend

# Install dependencies
npm install

# Create production environment file
cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=postgresql://blog_user:secure_password@localhost:5432/blog
DB_SYNCHRONIZE=false
JWT_SECRET=your-super-secret-key
ALLOWED_ORIGINS=https://yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CONTACT_EMAIL=contact@example.com
EOF

# Build application
npm run build

# Run migrations
npm run migration:run

# Start with PM2
pm2 start npm --name "blog-backend" -- run start:prod
pm2 save
pm2 startup
```

#### Frontend Deployment

```bash
# Navigate to frontend
cd /var/www/blog-backend/blog

# Install dependencies
npm install

# Create production environment file
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
EOF

# Build
npm run build

# Start with PM2
pm2 start npm --name "blog-frontend" -- start
pm2 save
```

#### Nginx Configuration

```nginx
# Backend API - /etc/nginx/sites-available/blog-api
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend - /etc/nginx/sites-available/blog-frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable sites:
```bash
sudo ln -s /etc/nginx/sites-available/blog-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/blog-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
DB_SYNCHRONIZE=false  # Use migrations even in dev
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=blog
```

### Production
```env
NODE_ENV=production
DB_SYNCHRONIZE=false  # NEVER true in production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Deployment Workflow

### Initial Deployment

```bash
# 1. Prepare
git checkout main
git pull origin main

# 2. Run migrations locally first (test)
cd blog-backend
npm run migration:run
npm run migration:show

# 3. Commit and push
git add .
git commit -m "Deployment: <description>"
git push origin main

# 4. Deploy
# Migrations run automatically via npm run deploy
```

### Updating Existing Deployment

```bash
# 1. Backup database
pg_dump -U user -d blog > backup-$(date +%Y%m%d).sql

# 2. Pull latest changes
git pull origin main

# 3. Install dependencies
npm install

# 4. Run migrations
npm run migration:run

# 5. Build and restart
npm run build
pm2 restart blog-backend
pm2 restart blog-frontend
```

## Monitoring and Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status
pm2 logs blog-backend
pm2 logs blog-frontend

# Docker status
docker-compose ps
docker-compose logs -f
```

### Database Backup

```bash
# Create backup
pg_dump -U user -d blog > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore backup
psql -U user -d blog < backup-20231220-120000.sql
```

### Clean Up Docker

```bash
# Remove unused containers and images
docker system prune -a --volumes

# Check disk usage
docker system df
```

## Troubleshooting

### Migrations Not Running

```bash
# Check migration status
npm run migration:show

# Manually run migrations
npm run migration:run

# Check database connection
echo $DATABASE_URL
```

### Application Not Starting

```bash
# Check logs
pm2 logs blog-backend --lines 100

# Or with Docker
docker-compose logs blog-backend
```

### Database Connection Errors

```bash
# Test connection
psql $DATABASE_URL

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Or with Docker
docker-compose ps postgres
```

### CORS Errors

Ensure `ALLOWED_ORIGINS` includes your frontend URL:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Rollback Procedure

If something goes wrong:

```bash
# 1. Rollback last migration
npm run migration:revert

# 2. Restore database backup
psql -U user -d blog < backup-before-deployment.sql

# 3. Revert code
git checkout <previous-commit>
npm run build
pm2 restart all
```

## Performance Optimization

### Enable PostgreSQL Connection Pooling

Already configured in TypeORM settings.

### Enable Nginx Caching

Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 10m;
    # ... rest of proxy settings
}
```

### PM2 Cluster Mode

For better performance:
```bash
pm2 start npm --name "blog-backend" -i max -- run start:prod
```

## Security Checklist

- [ ] SSL/TLS enabled
- [ ] Strong JWT secret (32+ characters)
- [ ] Database user has minimal required permissions
- [ ] CORS properly configured
- [ ] Environment variables not in git
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular security updates
- [ ] Database backups automated

## Support

For deployment issues, check:
1. Application logs: `pm2 logs` or `docker-compose logs`
2. Database connection: Test with `psql`
3. Environment variables: Verify all required vars are set
4. Migration status: `npm run migration:show`

See [DATABASE.md](./DATABASE.md) for database and migration details.
