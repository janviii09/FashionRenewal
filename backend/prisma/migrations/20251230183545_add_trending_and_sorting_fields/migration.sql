-- AlterTable
ALTER TABLE "WardrobeItem" ADD COLUMN     "lastRentedAt" TIMESTAMP(3),
ADD COLUMN     "purchaseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rentalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trendingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "wishlistCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "WardrobeItem_trendingScore_idx" ON "WardrobeItem"("trendingScore");

-- CreateIndex
CREATE INDEX "WardrobeItem_rentalCount_idx" ON "WardrobeItem"("rentalCount");

-- CreateIndex
CREATE INDEX "WardrobeItem_createdAt_idx" ON "WardrobeItem"("createdAt");

-- CreateIndex
CREATE INDEX "WardrobeItem_category_availability_idx" ON "WardrobeItem"("category", "availability");

-- CreateIndex
CREATE INDEX "WardrobeItem_rentPricePerDay_idx" ON "WardrobeItem"("rentPricePerDay");

-- CreateIndex
CREATE INDEX "WardrobeItem_sellPrice_idx" ON "WardrobeItem"("sellPrice");
