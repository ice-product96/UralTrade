# UralTrade

Интернет-магазин инженерного оборудования: витрина, админка, конструктор полей товара, фасетный фильтр и SEO-разметка под Яндекс.

## Стек

- Next.js 16 App Router, React 19, TypeScript
- PostgreSQL 16, Prisma 7
- Tailwind CSS 4, Framer Motion, Embla Carousel
- NextAuth Credentials для `/admin`

## Быстрый запуск

```bash
npm install
npm run db:generate
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev
```

Админка: `http://localhost:3000/admin`

Демо-доступ:

- Email: `admin@uraltrade.local`
- Пароль: `admin12345`

## Важные переменные окружения

```env
DATABASE_URL="postgresql://uraltrade:uraltrade@localhost:5432/uraltrade?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-in-production"
SITE_URL="http://localhost:3000"
ORDER_EMAIL_TO="manager@example.com"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="smtp-user"
SMTP_PASSWORD="smtp-password"
SMTP_FROM="UralTrade <no-reply@example.com>"
```

Если SMTP не заполнен, заказ сохраняется в админке без отправки письма.

## Деплой на VPS

1. Указать production-переменные в `.env`.
2. Выполнить `docker compose up -d --build`.
3. Применить миграции внутри контейнера приложения: `docker compose exec app npm run db:migrate`.
4. Создать стартовые данные: `docker compose exec app npm run db:seed`.
5. Поставить nginx/SSL перед портом `3000` или расширить `docker-compose.yml` отдельным nginx-сервисом.

## SEO

- `sitemap.xml` и `robots.txt` генерируются через Next Metadata API.
- Карточка товара отдаёт `Product` JSON-LD с `image`, `sku`, `brand`, `offers.price`, `availability`.
- Хлебные крошки размечены через `BreadcrumbList`.
- Фильтры синхронизируются с URL, диапазонные SEO-шумные параметры закрыты в `robots.ts`.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
