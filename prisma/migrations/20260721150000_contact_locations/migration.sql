-- CreateTable
CREATE TABLE "ContactLocation" (
    "id" TEXT NOT NULL,
    "siteContactId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'OFFICE',
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "workingHours" TEXT,
    "mapUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactLocation_siteContactId_published_sortOrder_idx"
ON "ContactLocation"("siteContactId", "published", "sortOrder");

-- AddForeignKey
ALTER TABLE "ContactLocation"
ADD CONSTRAINT "ContactLocation_siteContactId_fkey"
FOREIGN KEY ("siteContactId") REFERENCES "SiteContact"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
