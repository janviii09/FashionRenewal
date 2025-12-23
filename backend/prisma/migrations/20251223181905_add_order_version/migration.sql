-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Order_version_idx" ON "Order"("version");
