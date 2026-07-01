# Blogy

Bilingual admin dashboard and API for managing a modern blog — posts, pages, media, portfolio, and more. Built as a TypeScript monorepo with Next.js, Express, Prisma, and a shared UI kit.

## Stack

| Layer | Tech |
|-------|------|
| Dashboard | Next.js 15, React 19, next-intl (FA/EN) |
| API | Express, Zod, Prisma, PostgreSQL |
| UI | `@gh/ui` design system (glass theme, RTL) |
| Dev ops | Docker Compose, pnpm workspaces |

## Project structure

```
blogy/
├── src/
│   ├── backend/       @gh/backend — REST API
│   ├── dashboard/     @gh/dashboard — admin panel
│   ├── client/        @gh/client — reserved for public site
│   └── packages/ui/   @gh/ui — shared components
├── docker/            Dockerfiles & entrypoint scripts
├── docker-compose.yml dev stack (db + api + dashboard)
├── uploads/           media files (gitignored)
└── Makefile           Docker shortcuts
```

## Quick start (Docker)

```bash
make init
make dev
```

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000/fa/dashboard |
| API health | http://localhost:4000/health |

More commands: `make logs`, `make dev-db`, `make down`, `make clean` — see [docker/README.md](docker/README.md).

## Quick start (local)

```bash
pnpm install
cp .env.example .env
make dev-db
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm dev
```

## Default accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123456 |
| Author | author@example.com | Author@123456 |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run API + dashboard |
| `pnpm dev:backend` | API only |
| `pnpm dev:dashboard` | Dashboard only |
| `pnpm build` | Production build |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:seed` | Seed database |
| `make dev` | Full Docker dev stack |
| `make dev-db` | PostgreSQL only |

## Environment

Copy `.env.example` to `.env`. Key variables:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — auth (change in production)
- `NEXT_PUBLIC_API_URL` — dashboard → API URL
- `CORS_ORIGIN` — allowed dashboard origin for API

## License

Private — all rights reserved.
