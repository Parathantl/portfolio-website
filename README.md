# Blog + Portfolio Full-Stack Application

A production-ready blog and portfolio platform built with **Next.js 14** and **NestJS 10**, deployed with Docker Compose. Features multi-blog support (Tech & Tamil), portfolio showcase, admin dashboard, and AI/SEO optimizations (AEO/GEO).

**Live:** [parathan.com](https://parathan.com)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14.2 (App Router), React 18, Tailwind CSS, Quill Editor |
| Backend | NestJS 10, TypeORM, PostgreSQL 17, Passport.js + JWT |
| Deployment | Docker Compose, Nginx reverse proxy |
| File Storage | Multer (local) / Cloudinary (optional) |

## Project Structure

```
blog-full-stack/
├── blog/                    # Next.js frontend
│   ├── app/                 # App Router pages & API routes
│   │   ├── blog/            # Blog pages (tech & tamil)
│   │   ├── portfolio/       # Portfolio pages
│   │   ├── admin/           # Admin dashboard
│   │   ├── lib/             # API clients, utilities, structured data
│   │   ├── feed.xml/        # RSS feed (dynamic)
│   │   ├── llms.txt/        # AI engine discovery file
│   │   ├── sitemap.ts       # Dynamic sitemap
│   │   └── robots.ts        # Robots + AI crawler rules
│   ├── components/          # React components
│   └── Dockerfile
│
├── blog-backend/            # NestJS backend
│   ├── src/
│   │   ├── auth/            # JWT authentication
│   │   ├── post/            # Blog posts CRUD
│   │   ├── category/        # Categories & master categories
│   │   ├── portfolio/       # Projects, skills, experience, about
│   │   ├── newsletter/      # Newsletter subscriptions
│   │   ├── contact/         # Contact form + email
│   │   └── database/        # Migrations & config
│   └── Dockerfile
│
├── docs/                    # Extended documentation
├── scripts/                 # One-time setup & utility scripts
│   ├── setup-ssl.sh         # SSL certificate setup
│   ├── setup-uploads-folder.sh
│   ├── update-env-https.sh
│   └── update-nginx-for-uploads.sh
├── docker-compose.yml       # Full stack orchestration
├── deploy.sh                # Production deployment script
└── quick-deploy.sh          # Minimal deployment script
```

## Prerequisites

- **Node.js** >= 18 (v20 recommended)
- **npm** >= 9
- **PostgreSQL** 15+ (or use Docker)
- **Docker** & **Docker Compose** (for containerized setup)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Parathantl/blog-full-stack.git
cd blog-full-stack
```

### 2. Install dependencies

```bash
# Backend
cd blog-backend && npm install

# Frontend
cd ../blog && npm install

cd ..
```

### 3. Set up PostgreSQL

**Option A: Docker (recommended)**
```bash
docker compose up -d postgres
# Available at localhost:5432
```

**Option B: Local PostgreSQL**
```bash
createdb blog
# Or: psql -U postgres -c "CREATE DATABASE blog;"
```

### 4. Configure environment variables

```bash
# Root-level .env (used by docker-compose)
cp .env.example .env

# Backend local dev
cd blog-backend
cp .env.example .env.development
# Edit .env.development with your database credentials
```

**Backend `.env.development`:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=blog
DB_SYNCHRONIZE=false

JWT_SECRET=your-secret-key-minimum-32-characters
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Email (for contact form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
CONTACT_EMAIL=your-email@gmail.com

# Storage
STORAGE_PROVIDER=local
APP_URL=http://localhost:3001
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Run database migrations

```bash
cd blog-backend
npm run build
npm run migration:run
npm run migration:show   # Verify all migrations ran
```

### 6. Start development servers

```bash
# Terminal 1 — Backend (http://localhost:3001)
cd blog-backend
npm run start:dev

# Terminal 2 — Frontend (http://localhost:3000)
cd blog
npm run dev
```

### 7. Create an admin account

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

### 8. Access the application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend |
| http://localhost:3000/blog | Blog |
| http://localhost:3000/portfolio | Portfolio |
| http://localhost:3000/admin | Admin dashboard |
| http://localhost:3001 | Backend API |

## Docker Deployment (Production)

```bash
# Configure environment
cp .env.example .env
# Edit .env with production values

# Build and start all services
docker compose up --build -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

The Docker stack runs three containers:
- **blog-postgres** — PostgreSQL 17
- **blog-backend** — NestJS API on port 3001 (localhost only)
- **blog-frontend** — Next.js on port 3000

An external **Nginx** reverse proxy handles SSL termination and routes `/api` to the backend.

### Deployment scripts

```bash
./deploy.sh          # Full deployment: pull, backup, rebuild, health check
./quick-deploy.sh    # Minimal: pull, rebuild, restart
```

## Important Notes

### Docker build constraint
All pages that fetch API data **must** include `export const dynamic = 'force-dynamic'`. During Docker build, the backend is not available, so any static generation that calls the API will fail.

### ISR cache
After deploying new content or code changes, clear the Next.js cache:
```bash
docker compose restart blog-frontend
```

### Empty array checks
JavaScript treats `[]` as truthy. Always check `.length`:
```ts
// Wrong: if (posts) { ... }
// Right: if (posts && posts.length > 0) { ... }
```

### Database columns
- Post timestamps: `createdOn` / `modifiedOn` (not `createdAt` / `updatedAt`)
- User display name: `firstname` / `lastname` (not `username`)

### Content formatting
Blog posts use the Quill rich text editor. The content parser extracts:
- **FAQ schema** from headings ending with `?`
- **HowTo schema** from headings containing `Step N:`

### Package compatibility
`isomorphic-dompurify@2.16.0` is pinned — v3.x has ESM compatibility issues with Node 20.

### DB_SYNCHRONIZE
**Never** set `DB_SYNCHRONIZE=true` in production. Use migrations instead:
```bash
cd blog-backend
npm run migration:run
```

## Development Scripts

### Backend (`blog-backend/`)

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production server |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:show` | Show migration status |
| `npm run migration:generate -- -n MigrationName` | Generate migration from entity changes |

### Frontend (`blog/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |

## API Endpoints

### Authentication
- `POST /auth/signup` — Create account
- `POST /auth/login` — Login (sets httpOnly cookie)
- `GET /auth/authstatus` — Check auth status

### Blog Posts
- `GET /post` — All posts
- `GET /post?masterCategory=tech` — Tech blog posts
- `GET /post?masterCategory=tamil` — Tamil blog posts
- `GET /post/slug/:slug` — Single post by slug

### Portfolio
- `GET /portfolio/projects` — Projects
- `GET /portfolio/skills` — Skills
- `GET /portfolio/experience` — Work experience
- `GET /portfolio/about` — About info

### Contact
- `POST /contact` — Submit contact form

## Features

- **Multi-blog system** — Tech Blog & Tamil Blog with separate categories
- **Portfolio showcase** — Projects, skills, experience timeline, about section
- **Admin dashboard** — Full CRUD with JWT auth (httpOnly cookies)
- **AEO/GEO optimized** — JSON-LD structured data, RSS feed, llms.txt, AI crawler rules
- **SEO** — Dynamic sitemap, Open Graph tags, canonical URLs
- **Contact form** — Email notifications via Gmail SMTP
- **File uploads** — Local storage or Cloudinary
- **Rich text editor** — Quill with image upload support

## Documentation

See the `docs/` directory for detailed guides:
- [Getting Started](docs/GETTING-STARTED.md)
- [Development](docs/DEVELOPMENT.md)
- [Database & Migrations](docs/DATABASE.md)
- [Deployment](docs/DEPLOYMENT.md)

## License

MIT
