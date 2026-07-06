# UralTrade

Интернет-магазин инженерного оборудования: витрина, админка, конструктор полей товара, фасетный фильтр и SEO-разметка под Яндекс.

## Стек

- Next.js 16 App Router, React 19, TypeScript
- PostgreSQL 16, Prisma 7
- Tailwind CSS 4, Framer Motion, Embla Carousel
- NextAuth Credentials для `/admin`

## Локальная разработка

```bash
npm install
cp .env.example .env
npm run db:generate
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev
```

Админка: `http://localhost:3000/admin`

Демо-доступ после seed:

- Email: `admin@uraltrade.local`
- Пароль: `admin12345`

## Деплой на VPS (production)

Для сервера используйте отдельный compose-файл с изолированным PostgreSQL и приложением на `127.0.0.1:3010` за nginx.

```bash
cp .env.example .env          # заполнить секреты и домен
npm run deploy:up
docker compose -f docker-compose.prod.yml exec app npm run db:deploy
docker compose -f docker-compose.prod.yml exec app npm run db:seed
```

Подробная инструкция: [deploy/DEPLOY.md](deploy/DEPLOY.md)  
Временный домен: **https://uraltrade.ice-product.ru**  
Пример nginx: [deploy/nginx/uraltrade.conf](deploy/nginx/uraltrade.conf)

### Отличия production от local

| | `docker-compose.yml` (dev) | `docker-compose.prod.yml` (VPS) |
|---|---|---|
| PostgreSQL на хосте | `5432:5432` | не публикуется |
| Приложение | `0.0.0.0:3000` | `127.0.0.1:3010` |
| Миграции | `npm run db:migrate` | `npm run db:deploy` |

## Переменные окружения

См. [.env.example](.env.example). Файл `.env` в git не попадает.

## SEO

- `sitemap.xml` и `robots.txt` генерируются через Next Metadata API.
- Карточка товара отдаёт `Product` JSON-LD с `image`, `sku`, `brand`, `offers.price`, `availability`.
- Хлебные крошки размечены через `BreadcrumbList`.
- Фильтры синхронизируются с URL, диапазонные SEO-шумные параметры закрыты в `robots.ts`.
