#!/bin/sh
set -e

echo "[entrypoint] UralTrade starting..."

if [ -z "$DATABASE_URL" ]; then
  if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "[entrypoint] ERROR: DATABASE_URL or POSTGRES_PASSWORD must be set."
    exit 1
  fi
  POSTGRES_USER="${POSTGRES_USER:-uraltrade}"
  POSTGRES_DB="${POSTGRES_DB:-uraltrade}"
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
fi

echo "[entrypoint] Applying database migrations..."
if ! npx prisma migrate deploy; then
  echo "[entrypoint] ERROR: prisma migrate deploy failed. Fix DATABASE_URL or migration state before restart."
  exit 1
fi

echo "[entrypoint] Migrations applied successfully."

mkdir -p public/uploads/products/images public/uploads/products/documents

echo "[entrypoint] Starting Next.js..."
exec npm start
