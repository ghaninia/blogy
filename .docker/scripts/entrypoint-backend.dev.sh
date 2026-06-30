#!/bin/sh
set -e

echo "[backend] Waiting for PostgreSQL..."
until nc -z "${DB_HOST:-db}" "${DB_PORT:-5432}"; do
  sleep 1
done

cd /app
pnpm --filter @gh/backend generate
pnpm --filter @gh/backend migrate:deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  pnpm --filter @gh/backend seed || true
fi

exec "$@"
