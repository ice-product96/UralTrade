-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "analogSkus" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
