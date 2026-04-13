# Blog015

Blog015 is a full-stack blog application built with Next.js App Router, Prisma, SQLite, and Tailwind CSS.
It includes:

- Public blog pages (homepage, post details, category/tag filters)
- Admin authentication with signed HTTP-only session cookies
- Admin CRUD for posts, categories, and tags
- SEO endpoints (`/sitemap.xml`, `/robots.txt`)
- Docker support for production-style deployment

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Prisma ORM + SQLite
- Tailwind CSS
- Server Actions for admin mutations

## Prerequisites

- Node.js 20+
- npm 9+

## Local Development Setup

1. Install dependencies:

```bash
npm ci
```

2. Configure environment variables:

```bash
cp .env.example .env
```

3. Run Prisma migrations:

```bash
npx prisma migrate dev
```

4. Seed sample data:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

The app runs on `http://localhost:8080`.

## Environment Variables

Set these in `.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma SQLite connection string (example: `file:./dev.db`) |
| `ADMIN_PASSWORD` | Yes | Password used by `/admin/login` |
| `SESSION_SECRET` | Yes | Secret for signing/verifying session cookies |
| `BASE_URL` | Yes | Public base URL used for metadata, sitemap, robots |

See [.env.example](./.env.example) for documented defaults.

## Useful Commands

```bash
npm run dev      # Start development server on 0.0.0.0:8080
npm run build    # Production build
npm run start    # Start production server on 0.0.0.0:8080
npm run lint     # Run ESLint
npm run seed     # Seed sample categories/tags/posts
```

## Prisma Notes

- Prisma schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
- Seed script: `prisma/seed.ts`

If you update the schema:

```bash
npx prisma migrate dev --name <migration-name>
```

## Docker Deployment

### Option A: Docker Compose (recommended)

1. Ensure environment variables are set in your shell or `.env`.
2. Build and run:

```bash
docker compose up --build -d
```

3. Open `http://localhost:8080`.

SQLite data is persisted using the named volume `blog015_sqlite_data` mounted at `/data`.

Stop services:

```bash
docker compose down
```

### Option B: Dockerfile only

Build image:

```bash
docker build -t blog015:latest .
```

Run container:

```bash
docker run --rm -p 8080:8080 \
  -e NODE_ENV=production \
  -e DATABASE_URL="file:/data/dev.db" \
  -e ADMIN_PASSWORD="<your-admin-password>" \
  -e SESSION_SECRET="<your-session-secret>" \
  -e BASE_URL="http://localhost:8080" \
  -v blog015_sqlite_data:/data \
  blog015:latest
```

## Admin Access

- Login URL: `/admin/login`
- Admin routes are protected by middleware.

## License

Internal project for the mtplayground/blog015 repository.
