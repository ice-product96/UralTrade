#!/bin/bash
# Безопасный деплой: сначала сборка, затем перезапуск app с ожиданием healthcheck.
set -euo pipefail

cd "$(dirname "$0")/.."

export NPM_REGISTRY="${NPM_REGISTRY:-https://registry.npmmirror.com}"

echo "[deploy] Building app image..."
docker compose -f docker-compose.prod.yml build app

echo "[deploy] Restarting app (wait for healthcheck)..."
docker compose -f docker-compose.prod.yml up -d --no-deps --wait app

echo "[deploy] Checking HTTP response..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf -o /dev/null http://127.0.0.1:3010/; then
    echo "[deploy] App is healthy (attempt $i)."
    exit 0
  fi
  echo "[deploy] Waiting for app... ($i/10)"
  sleep 3
done

echo "[deploy] ERROR: app did not become healthy in time."
docker compose -f docker-compose.prod.yml logs app --tail 40
exit 1
