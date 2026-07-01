# Docker

Development stack is defined at the project root in `docker-compose.yml`.

## Quick start

```bash
make init   # creates .env from .env.example
make dev    # build + start db, backend, dashboard
```

| Service   | URL |
|-----------|-----|
| Dashboard | http://localhost:3000/fa/dashboard |
| API       | http://localhost:4000/health |

## Layout

```
docker/
├── Dockerfile.backend.dev
├── Dockerfile.dashboard.dev
└── scripts/
    ├── entrypoint-backend.dev.sh
    └── entrypoint-dashboard.dev.sh
docker-compose.yml   # at repo root
.env                 # from .env.example (gitignored)
```

## Common commands

```bash
make dev-d          # detached
make down           # stop stack
make logs           # follow logs
make ps             # container status
make migrate        # prisma migrate in backend
make seed           # seed database
make shell-backend  # shell in backend
make clean          # stop + remove volumes
```

## Database only (local pnpm dev)

```bash
make init
docker compose up db -d
pnpm install
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm dev
```

Use `DATABASE_URL=...@localhost:5432/...` and `UPLOAD_DIR=../../uploads` in `.env` for this mode.
