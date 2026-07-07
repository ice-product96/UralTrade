#!/bin/sh
set -e

echo "[entrypoint] UralTrade starting..."

echo "[entrypoint] Applying database migrations..."
if ! npx prisma migrate deploy; then
  echo "[entrypoint] ERROR: prisma migrate deploy failed. Fix DATABASE_URL or migration state before restart."
  exit 1
fi

echo "[entrypoint] Migrations applied successfully."
echo "[entrypoint] Starting Next.js..."
exec npm start
