# Database & Migrations Guide

Complete guide for database management, migrations, and seeding.

## Table of Contents

- [Database Schema](#database-schema)
- [Migrations](#migrations)
- [Seeding Data](#seeding-data)
- [Backup & Restore](#backup--restore)

## Database Schema

### Core Tables

```
users (Authentication & Authors)
├── id (PK)
├── firstname
├── lastname
├── email
├── password (hashed)
└── profilePic

posts (Blog Content)
├── id (PK)
├── title
├── content
├── slug
├── mainImageUrl
├── userId (FK → users)
├── createdOn
└── modifiedOn

master_categories (Tech, Tamil, etc.)
├── id (PK)
├── name (unique)
├── slug
├── description
├── isActive
└── displayOrder

categories (Subcategories)
├── id (PK)
├── title
├── description
├── slug
├── masterCategoryId (FK → master_categories)
└── displayOrder

post_categories (Many-to-Many Junction)
├── postId (FK → posts)
└── categoryId (FK → categories)
```

### Portfolio Tables

```
projects
├── id (PK)
├── title
├── description
├── longDescription
├── technologies (array)
├── projectUrl
├── githubUrl
├── imageUrl
├── galleryImages (array)
├── startDate
├── endDate
├── featured
└── displayOrder

skills
├── id (PK)
├── name
├── category
├── proficiencyLevel
├── iconUrl
├── displayOrder
└── isVisible

experiences
├── id (PK)
├── company
├── position
├── description
├── responsibilities (array)
├── technologies (array)
├── startDate
├── endDate
├── isCurrent
├── location
├── companyUrl
└── displayOrder

about
├── id (PK)
├── fullName
├── tagline
├── bio
├── longBio
├── profileImageUrl
├── resumeUrl
├── linkedinUrl
├── githubUrl
├── twitterUrl
├── email
├── phone
└── location

contact_messages
├── id (PK)
├── name
├── email
├── subject
├── message
├── createdAt
├── isRead
└── isArchived

password_reset
├── id (PK)
├── token
├── userId (FK → users)
├── used
├── createdAt
└── expiresAt
```

## Migrations

### What Are Migrations?

Migrations are version control for your database schema. They allow you to:
- Track database changes over time
- Share schema changes with team members
- Deploy database updates safely
- Rollback changes if needed

### Migration Files

Located in `blog-backend/src/database/migrations/`:

1. **1734900000000-InitialSchema.ts**
   - Creates: users, categories, posts tables
   - Foreign key: posts → users

2. **1734950000000-CreatePortfolioAndAuthTables.ts**
   - Creates: projects, skills, experiences, about, contact_messages, password_reset
   - Foreign key: password_reset → users

3. **1734994000000-MakeMainImageUrlNullable.ts**
   - Makes mainImageUrl nullable in posts

4. **1735000000000-GenerateSlugsForExistingPosts.ts**
   - Generates slugs for all posts
   - Makes slug column NOT NULL

5. **1766424049385-CreateMultiBlogSchema.ts**
   - Creates: master_categories, post_categories
   - Seeds: Tech and Tamil master categories
   - Migrates existing post-category relationships

### How Migrations Work

#### Tracking System

TypeORM creates a `migrations` table:
```sql
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    name VARCHAR NOT NULL
);
```

This table tracks which migrations have been executed.

#### Execution Flow

1. TypeORM scans migration files
2. Queries `migrations` table for executed migrations
3. Finds NEW migrations (not in table)
4. Executes them in timestamp order
5. Records each in `migrations` table

#### Example Timeline

**Week 1:**
```bash
npm run migration:run
# Runs: InitialSchema, CreatePortfolioAndAuthTables
# migrations table: [InitialSchema, CreatePortfolioAndAuthTables]
```

**Week 4** (Add new feature):
```bash
npm run migration:generate -- src/database/migrations/AddComments
npm run migration:run
# Runs: ONLY AddComments (skips the first two)
# migrations table: [InitialSchema, CreatePortfolioAndAuthTables, AddComments]
```

**Week 8** (Another feature):
```bash
npm run migration:generate -- src/database/migrations/AddTags
npm run migration:run
# Runs: ONLY AddTags (skips all previous)
# migrations table: [...previous, AddTags]
```

### Migration Commands

```bash
# Show migration status
npm run migration:show
# Shows which migrations ran and which are pending

# Run pending migrations
npm run migration:run
# Executes only NEW migrations

# Rollback last migration
npm run migration:revert
# Runs the down() method of last migration

# Generate new migration from entity changes
npm run migration:generate -- src/database/migrations/DescriptiveName

# Create empty migration
npm run typeorm -- migration:create src/database/migrations/CustomName
```

### Creating a Migration

#### Option 1: Auto-Generate (Recommended)

```bash
# 1. Modify your entity
@Entity()
export class Post {
  // ... existing fields

  @Column({ nullable: true })
  excerpt: string;  // NEW FIELD
}

# 2. Generate migration
npm run migration:generate -- src/database/migrations/AddExcerptToPost

# 3. Review generated file
# TypeORM compares entity vs database and creates SQL

# 4. Test locally
npm run migration:run

# 5. Commit and deploy
git add .
git commit -m "Add excerpt field to posts"
git push
```

#### Option 2: Manual Migration

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComments1735100000000 implements MigrationInterface {
  name = 'AddComments1735100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create comments table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" SERIAL NOT NULL,
        "content" text NOT NULL,
        "postId" integer NOT NULL,
        "userId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_comments_post"
      FOREIGN KEY ("postId")
      REFERENCES "posts"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
  }
}
```

### Migration Best Practices

✅ **DO:**
- Use `IF NOT EXISTS` for safety
- Test migrations locally first
- Keep migrations small and focused
- Write descriptive migration names
- Always provide a `down()` method for rollback
- Commit migrations with related code changes

❌ **DON'T:**
- Never use `DB_SYNCHRONIZE=true` in production
- Don't modify existing migrations after deployment
- Don't skip migrations - run them in order
- Don't delete migrations that have run in production

## Seeding Data

### Initial Seeds (Automatic)

The `CreateMultiBlogSchema` migration automatically seeds:

```typescript
// Master Categories
INSERT INTO master_categories (name, slug, description)
VALUES
  ('Tech', 'tech', 'Technical blog posts...'),
  ('Tamil', 'tamil', 'Tamil language blog posts...');
```

### Manual Seeding

Create seed file: `blog-backend/src/database/seeds/seed.ts`

```typescript
import { AppDataSource } from '../data-source';
import { Category } from '../../category/entities/category.entity';

async function seed() {
  await AppDataSource.initialize();

  const categoryRepo = AppDataSource.getRepository(Category);

  // Seed Tech categories
  await categoryRepo.save([
    {
      title: 'JavaScript',
      description: 'JavaScript programming',
      slug: 'javascript',
      masterCategoryId: 1,
      displayOrder: 1,
    },
    {
      title: 'React',
      description: 'React framework',
      slug: 'react',
      masterCategoryId: 1,
      displayOrder: 2,
    },
    {
      title: 'Node.js',
      description: 'Node.js backend',
      slug: 'nodejs',
      masterCategoryId: 1,
      displayOrder: 3,
    },
  ]);

  // Seed Tamil categories
  await categoryRepo.save([
    {
      title: 'சினிமா',
      description: 'Tamil cinema',
      slug: 'tamil-cinema',
      masterCategoryId: 2,
      displayOrder: 1,
    },
    {
      title: 'இலக்கியம்',
      description: 'Tamil literature',
      slug: 'tamil-literature',
      masterCategoryId: 2,
      displayOrder: 2,
    },
  ]);

  console.log('✅ Seeding complete');
  await AppDataSource.destroy();
}

seed().catch(console.error);
```

Run seed:
```bash
npx ts-node src/database/seeds/seed.ts
```

## Backup & Restore

### Create Backup

```bash
# Full database backup
pg_dump -U username -d blog > backup-$(date +%Y%m%d-%H%M%S).sql

# Schema only
pg_dump -U username -d blog --schema-only > schema-backup.sql

# Data only
pg_dump -U username -d blog --data-only > data-backup.sql

# Specific tables
pg_dump -U username -d blog -t posts -t categories > posts-backup.sql
```

### Restore Backup

```bash
# Full restore
psql -U username -d blog < backup-20231220-120000.sql

# Create new database and restore
createdb -U username blog_restored
psql -U username -d blog_restored < backup-20231220-120000.sql
```

### Automated Backups

Create cron job:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U username -d blog > /backups/blog-$(date +\%Y\%m\%d).sql

# Keep only last 7 days
0 3 * * * find /backups -name "blog-*.sql" -mtime +7 -delete
```

## Troubleshooting

### Migration Fails

```bash
# Check what migrations ran
npm run migration:show

# Check database connection
psql $DATABASE_URL

# Manually run specific migration
npm run typeorm -- migration:run
```

### Rollback Migration

```bash
# Rollback last migration
npm run migration:revert

# Rollback multiple migrations
npm run migration:revert  # Repeat as needed
```

### Reset Database (Development Only!)

```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE blog;
CREATE DATABASE blog;
\q

# Run all migrations fresh
npm run migration:run
```

### Check Migration Status

```bash
# Show migration status
npm run migration:show

# Output shows:
# [X] CreateMultiBlogSchema1766424049385  ← Ran
# [X] AddExcerpt1735000000000              ← Ran
# [ ] AddComments1735100000000              ← Pending
```

## Database Maintenance

### Vacuum and Analyze

```sql
-- Reclaim storage and update statistics
VACUUM ANALYZE;

-- For specific table
VACUUM ANALYZE posts;
```

### Check Database Size

```sql
SELECT pg_size_pretty(pg_database_size('blog'));
```

### Monitor Active Connections

```sql
SELECT * FROM pg_stat_activity
WHERE datname = 'blog';
```

## Quick Reference

```bash
# Migrations
npm run migration:show      # Show status
npm run migration:run       # Run pending
npm run migration:revert    # Rollback last
npm run migration:generate  # Generate from entities

# Database
pg_dump -U user -d blog > backup.sql  # Backup
psql -U user -d blog < backup.sql      # Restore

# Development
npm run start:dev           # Auto-restart on changes
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment strategies.
