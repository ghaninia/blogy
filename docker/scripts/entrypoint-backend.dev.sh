#!/bin/sh
set -e

cd /app

if [ ! -f node_modules/.modules.yaml ] || [ pnpm-lock.yaml -nt node_modules/.modules.yaml ]; then
  echo "[backend] Installing dependencies (first run or lockfile changed)..."
  pnpm install --frozen-lockfile
fi

echo "[backend] Waiting for PostgreSQL..."
until nc -z "${DB_HOST:-db}" "${DB_PORT:-5432}"; do
  sleep 1
done

pnpm --filter @gh/backend generate
pnpm --filter @gh/backend migrate:deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  pnpm --filter @gh/backend seed || true
fi

exec "$@"
