-- CreateTable
CREATE TABLE "SiteTheme" (
    "id" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTheme_pkey" PRIMARY KEY ("id")
);
