-- CreateTable
CREATE TABLE "HomePage" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeFeature" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'wrench',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HomeFeature_pkey" PRIMARY KEY ("id")
);

-- Migrate hero from the first active banner
INSERT INTO "HomePage" ("id", "title", "subtitle", "imageUrl", "updatedAt")
SELECT 'default', "title", "subtitle", "imageUrl", CURRENT_TIMESTAMP
FROM "HomeBanner"
WHERE "active" = true
ORDER BY "sortOrder" ASC
LIMIT 1;

INSERT INTO "HomePage" ("id", "title", "subtitle", "imageUrl", "updatedAt")
SELECT 'default', 'Инженерное оборудование с умным подбором', 'Каталог UralTrade помогает быстро найти товар по артикулу, бренду и точным техническим параметрам.', '/demo/hero-equipment.jpg', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomePage");

INSERT INTO "HomeFeature" ("id", "title", "text", "icon", "sortOrder") VALUES
    ('seed-home-feature-1', 'Подбор по параметрам', 'Фильтры по характеристикам и брендам', 'wrench', 10),
    ('seed-home-feature-2', 'Доставка по РФ', 'Отправка до транспортной компании', 'truck', 20),
    ('seed-home-feature-3', 'Консультация', 'Поможем подобрать оборудование', 'shield', 30)
ON CONFLICT ("id") DO NOTHING;

DROP TABLE "HomeBanner";
