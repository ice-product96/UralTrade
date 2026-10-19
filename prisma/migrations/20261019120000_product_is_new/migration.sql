-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isNew" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_isNew_idx" ON "Product"("isNew");
