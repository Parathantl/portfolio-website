# Development Guide

Guide for developing and maintaining the Blog + Portfolio application.

## Project Structure

```
blog-full-stack/
├── blog/                     # Next.js Frontend
│   ├── app/
│   │   ├── admin/           # Admin dashboard
│   │   ├── blog/            # Blog pages
│   │   ├── portfolio/       # Portfolio pages
│   │   ├── contact/         # Contact page
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities and API client
│   ├── public/              # Static assets
│   └── package.json
│
├── blog-backend/            # NestJS Backend
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── post/            # Blog posts module
│   │   ├── category/        # Categories module
│   │   ├── master-category/ # Master categories module
│   │   ├── portfolio/       # Portfolio module
│   │   ├── contact/         # Contact form module
│   │   └── database/        # Database config & migrations
│   ├── uploads/             # Uploaded files (gitignored)
│   └── package.json
│
├── docs/                    # Documentation
└── docker-compose.yml       # Docker configuration
```

## Tech Stack

### Backend (NestJS)
- **Framework**: NestJS - Enterprise Node.js framework
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport.js + JWT (httpOnly cookies)
- **File Upload**: Multer (local) / Cloudinary (production)
- **Email**: Nodemailer
- **Validation**: class-validator, class-transformer

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Rich Text Editor**: Quill with image resize
- **HTTP Client**: Axios + Fetch API
- **Notifications**: react-toastify
- **State Management**: React hooks (no external library)

## Development Workflow

### Starting Development

```bash
# Terminal 1 - Backend
cd blog-backend
npm run start:dev
# Runs on http://localhost:3001

# Terminal 2 - Frontend
cd blog
npm run dev
# Runs on http://localhost:3000

# Terminal 3 - Database (if using Docker)
docker-compose up postgres
```

### File Upload Configuration

#### Local Storage (Development)

**Backend**: `blog-backend/src/post/post.controller.ts`

```typescript
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
      },
    }),
  }),
)
```

Files saved to: `blog-backend/uploads/`

Serve static files: `http://localhost:3001/uploads/filename.jpg`

#### Cloudinary (Production)

**Setup**:
```bash
npm install cloudinary multer-storage-cloudinary
```

**Environment Variables**:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Configuration**:
```typescript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
  },
});
```

### Package Scripts Reference

#### Backend Scripts

```json
{
  "start:dev": "nest start --watch",        // Development with auto-reload
  "start:prod": "node dist/main",          // Production server
  "build": "nest build",                    // Build for production
  "deploy": "npm run build && npm run start:prod", // Full deployment

  "migration:run": "typeorm migration:run -d dist/database/data-source.js",
  "migration:revert": "typeorm migration:revert -d dist/database/data-source.js",
  "migration:show": "typeorm migration:show -d dist/database/data-source.js",
  "migration:generate": "typeorm migration:generate -d src/database/data-source.ts",

  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "format": "prettier --write \"src/**/*.ts\"",
  "test": "jest"
}
```

#### Frontend Scripts

```json
{
  "dev": "next dev",                   // Development server
  "build": "next build",               // Production build
  "start": "next start",               // Production server
  "lint": "next lint"                  // ESLint
}
```

### API Development

#### Creating New Module

```bash
# Generate module, controller, service
cd blog-backend
nest generate module comments
nest generate controller comments
nest generate service comments

# Generate entity
# Create src/comments/entities/comment.entity.ts manually
```

#### Example Module Structure

```typescript
// comment.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

// comment.service.ts
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User) {
    const comment = this.commentRepo.create({
      ...createCommentDto,
      user,
    });
    return await this.commentRepo.save(comment);
  }

  async findByPost(postId: number) {
    return await this.commentRepo.find({
      where: { post: { id: postId } },
      relations: ['user'],
    });
  }
}

// comment.controller.ts
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    return this.commentService.create(createCommentDto, req.user);
  }

  @Get('post/:postId')
  findByPost(@Param('postId') postId: string) {
    return this.commentService.findByPost(+postId);
  }
}
```

### Frontend Development

#### Creating New Page

```bash
cd blog
# Create page file
touch app/about/page.tsx
```

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">About</h1>
      <p>Content here...</p>
    </main>
  );
}

// With data fetching
export default async function AboutPage() {
  const data = await fetch('http://localhost:3001/portfolio/about', {
    cache: 'no-store',
  }).then(res => res.json());

  return (
    <main>
      <h1>{data.fullName}</h1>
      <p>{data.bio}</p>
    </main>
  );
}
```

#### Creating API Client

```typescript
// app/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

export const commentsAPI = {
  getByPost: (postId: number) =>
    api.get(`/comments/post/${postId}`).then(res => res.data),

  create: (postId: number, content: string) =>
    api.post('/comments', { postId, content }).then(res => res.data),

  delete: (id: number) =>
    api.delete(`/comments/${id}`).then(res => res.data),
};
```

### Testing

#### Backend Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

Example test:
```typescript
describe('PostService', () => {
  let service: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService],
    }).compile();

    service = module.get<PostingService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a post', async () => {
    const dto = { title: 'Test', content: 'Test content' };
    const result = await service.create(dto, mockUser);
    expect(result.title).toBe('Test');
  });
});
```

#### Frontend Testing

```bash
# Run tests (if configured)
npm run test
```

## Code Style

### Backend (NestJS)

- Use TypeScript strict mode
- Follow NestJS conventions (modules, controllers, services)
- Use DTOs for validation
- Use guards for authentication
- Use interceptors for transformation
- Use pipes for validation

### Frontend (Next.js)

- Use TypeScript
- Use Server Components when possible
- Use Client Components only when needed ('use client')
- Follow Next.js App Router conventions
- Use Tailwind for styling
- Keep components small and focused

### General Guidelines

- Write meaningful commit messages
- Keep functions small and focused
- Use descriptive variable names
- Comment complex logic
- Keep dependencies up to date
- Follow SOLID principles

## Environment Variables

### Required Variables

#### Backend
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DB_SYNCHRONIZE=false

# Authentication
JWT_SECRET=your-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CONTACT_EMAIL=contact@example.com

# Storage (Optional - for Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Debugging

### Backend Debugging (VS Code)

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:dev"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Frontend Debugging

Use browser DevTools:
- React DevTools extension
- Network tab for API calls
- Console for errors
- Sources tab for breakpoints

## Common Tasks

### Add New Entity Field

1. Update entity:
```typescript
@Column({ nullable: true })
newField: string;
```

2. Generate migration:
```bash
npm run migration:generate -- src/database/migrations/AddNewField
```

3. Run migration:
```bash
npm run migration:run
```

4. Update DTOs:
```typescript
export class CreatePostDto {
  // ...existing fields
  newField?: string;
}
```

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update package
npm update package-name

# Update all minor/patch versions
npm update

# Update to latest (breaking changes possible)
npm install package-name@latest
```

### Clean Up

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build

# Clear NestJS build
rm -rf dist
npm run build
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001
# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Quick Reference

```bash
# Development
npm run start:dev     # Backend
npm run dev           # Frontend

# Building
npm run build         # Both

# Migrations
npm run migration:run     # Run pending
npm run migration:revert  # Rollback
npm run migration:show    # Show status

# Testing
npm test              # Run tests
npm run lint          # Lint code

# Docker
docker-compose up     # Start all services
docker-compose down   # Stop all services
docker-compose logs   # View logs
```

See [DATABASE.md](./DATABASE.md) for database details and [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment.
