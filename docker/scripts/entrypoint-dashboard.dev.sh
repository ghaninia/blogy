#!/bin/sh
set -e

cd /app

if [ ! -d node_modules/.pnpm ] || [ ! -f node_modules/.modules.yaml ]; then
  echo "[dashboard] Installing dependencies (first run or empty volume)..."
  pnpm install --frozen-lockfile
fi

exec "$@"
