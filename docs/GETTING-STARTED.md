# Getting Started

Complete guide to set up and run the Blog + Portfolio Full-Stack Application locally.

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- Docker (optional, for containerized setup)

## Quick Setup (5 Steps)

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd blog-full-stack

# Install backend dependencies
cd blog-backend
npm install

# Install frontend dependencies
cd ../blog
npm install
```

### 2. Database Setup

**Option A: Using Docker**
```bash
# From project root
docker-compose up -d postgres

# Database will be available at localhost:5432
```

**Option B: Local PostgreSQL**
```bash
# Create database
psql -U postgres
CREATE DATABASE blog;
\q
```

### 3. Backend Configuration

```bash
cd blog-backend

# Copy environment file
cp .env.example .env.development

# Edit .env.development with your values
```

**Required Environment Variables:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=blog
DB_SYNCHRONIZE=false  # Use migrations instead

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Email (for contact form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CONTACT_EMAIL=contact@example.com
```

### 4. Run Database Migrations

```bash
cd blog-backend

# Build the backend first
npm run build

# Run migrations
npm run migration:run

# Verify migrations
npm run migration:show
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd blog-backend
npm run start:dev
# Backend running at http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd blog
npm run dev
# Frontend running at http://localhost:3000
```

## Create Admin Account

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Admin",
    "lastname": "User",
    "email": "admin@example.com",
    "password": "YourSecurePassword123!",
    "confirmPassword": "YourSecurePassword123!"
  }'
```

## Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:3000/admin
- **Blog**: http://localhost:3000/blog
- **Portfolio**: http://localhost:3000/portfolio

## Login

1. Navigate to http://localhost:3000/login
2. Use your admin credentials
3. Access admin dashboard at http://localhost:3000/admin

## Next Steps

- Create master categories (Tech, Tamil) via admin panel
- Create categories under each master category
- Add your first blog post
- Update your portfolio information

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflows and [DATABASE.md](./DATABASE.md) for database management.
