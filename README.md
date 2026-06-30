# GH Blog - Bilingual Admin Dashboard

Monorepo: source code under `src/`, Docker and config at project root.

## Structure

```
GH/
├── src/
│   ├── backend/           @gh/backend — Express API, Prisma, Zod types
│   │   ├── prisma/        schema, migrations, seed
│   │   └── src/
│   │       ├── modules/   auth, post, page, category, tag, portfolio, media, comment, setting
│   │       ├── shared/    config, http, auth, security
│   │       ├── db/        Prisma client
│   │       └── types/     shared Zod schemas (exported as @gh/backend/types)
│   ├── dashboard/         @gh/dashboard — Next.js admin panel
│   │   └── src/
│   │       ├── app/       routes (auth + panel groups)
│   │       ├── features/  domain UI components
│   │       └── shared/    api-client, store, i18n, lib
│   ├── client/            @gh/client — reserved for future public site
│   └── packages/
│       └── ui/            @gh/ui — shared design system
├── .docker/               dev Docker only
├── uploads/               runtime media files (gitignored)
├── Makefile
├── package.json
└── pnpm-workspace.yaml
```

## Quick Start (Docker)

```bash
make init
make dev
```

- Dashboard: http://localhost:3000/fa/dashboard
- API: http://localhost:4000/health

## Quick Start (Local)

```bash
pnpm install
cp .env.example .env
docker compose -f .docker/docker-compose.dev.yml up db -d
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm dev
```

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123456 |
| Author | author@example.com | Author@123456 |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | backend + dashboard |
| `pnpm dev:backend` | API only |
| `pnpm dev:dashboard` | dashboard only |
| `pnpm build` | build all |
| `pnpm db:migrate` | run migrations |
| `pnpm db:seed` | seed database |
| `make dev` | Docker dev stack |
