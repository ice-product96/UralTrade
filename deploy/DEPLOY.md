# Деплой UralTrade на VPS (ice-server)

## Архитектура

```text
Internet → nginx (80/443) → 127.0.0.1:3010 → uraltrade-app
                                    ↓
                            uraltrade-postgres (только внутри Docker)
```

Отдельный PostgreSQL-контейнер, как у `iceschool-db-1` и `ays-tracker-db-1`. Порт `5432` на хост **не** публикуется.

## 1. Клонирование

```bash
cd /home/MapAgent   # или другая рабочая директория
git clone https://github.com/ice-product96/UralTrade.git
cd UralTrade
```

## 2. Переменные окружения

```bash
cp .env.example .env
nano .env
```

Обязательно задать:

- `POSTGRES_PASSWORD` — сильный пароль БД
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` и `SITE_URL` — ваш домен, например `https://shop.example.com`
- `ADMIN_PASSWORD` — пароль администратора после seed

## 3. Запуск контейнеров

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Проверка:

```bash
docker compose -f docker-compose.prod.yml ps
curl -I http://127.0.0.1:3010
```

## 4. Миграции и демо-данные

```bash
docker compose -f docker-compose.prod.yml exec app npm run db:deploy
docker compose -f docker-compose.prod.yml exec app npm run db:seed
```

Админка: `https://ваш-домен/admin`

## 5. Nginx

```bash
sudo cp deploy/nginx/uraltrade.conf /etc/nginx/sites-available/uraltrade
sudo nano /etc/nginx/sites-available/uraltrade   # заменить uraltrade.example.com
sudo ln -sf /etc/nginx/sites-available/uraltrade /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

SSL:

```bash
sudo certbot --nginx -d uraltrade.example.com
```

## 6. Обновление

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app npm run db:deploy
```

## Полезные команды

```bash
# Логи приложения
docker compose -f docker-compose.prod.yml logs -f app

# Логи БД
docker compose -f docker-compose.prod.yml logs -f postgres

# Остановка
docker compose -f docker-compose.prod.yml down

# Остановка с удалением данных БД (осторожно!)
docker compose -f docker-compose.prod.yml down -v
```

## Порты на сервере

| Сервис | Порт на хосте |
|--------|----------------|
| UralTrade app | `127.0.0.1:3010` (меняется через `APP_PORT` в `.env`) |
| PostgreSQL | не публикуется |

Если `3010` занят — измените `APP_PORT` в `.env` и upstream в nginx-конфиге.
