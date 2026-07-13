-- CreateTable
CREATE TABLE "SiteContact" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "phone" TEXT,
    "email" TEXT,
    "telegram" TEXT,
    "whatsapp" TEXT,
    "maxMessenger" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContact_pkey" PRIMARY KEY ("id")
);

-- Seed default row
INSERT INTO "SiteContact" ("id", "phone", "email", "telegram", "whatsapp", "maxMessenger", "updatedAt")
VALUES ('default', '+7 (343) 000-00-00', 'sales@uraltrade.local', NULL, NULL, NULL, CURRENT_TIMESTAMP);
