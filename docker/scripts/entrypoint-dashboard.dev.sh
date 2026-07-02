#!/bin/sh
set -e

cd /app

if [ ! -f node_modules/.modules.yaml ] || [ pnpm-lock.yaml -nt node_modules/.modules.yaml ]; then
  echo "[dashboard] Installing dependencies (first run or lockfile changed)..."
  pnpm install --frozen-lockfile
fi

exec "$@"
