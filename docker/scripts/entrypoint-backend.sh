#!/bin/sh
set -e

cd /app

echo "[backend] Waiting for PostgreSQL..."
until nc -z "${DB_HOST:-db}" "${DB_PORT:-5432}"; do
  sleep 1
done

pnpm --filter @gh/backend migrate:deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[backend] Seeding database..."
  pnpm --filter @gh/backend seed || true
fi

exec "$@"
