# GH Blog - Bilingual Admin Dashboard

Monorepo: source code under `src/`, Docker at project root.

## Structure

```
GH/
├── src/
│   ├── backend/           @gh/backend — Express API, Prisma, Zod types
│   ├── dashboard/         @gh/dashboard — Next.js admin panel
│   ├── client/            @gh/client — reserved for future public site
│   └── packages/ui/       @gh/ui — shared design system
├── docker/                Dockerfiles + entrypoint scripts
├── docker-compose.yml     dev stack (db + backend + dashboard)
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

See `docker/README.md` for more commands (`make logs`, `make dev-db`, `make clean`, …).

## Quick Start (Local)

```bash
pnpm install
cp .env.example .env
make dev-db
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
| `make dev-db` | PostgreSQL only (for local pnpm) |
