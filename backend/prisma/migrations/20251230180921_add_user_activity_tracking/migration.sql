-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('VIEW', 'CLICK', 'WISHLIST_ADD', 'WISHLIST_REMOVE', 'CART_ADD', 'CART_REMOVE', 'RENTAL_COMPLETE', 'PURCHASE_COMPLETE', 'SEARCH');

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "sessionId" TEXT,
    "eventType" "ActivityType" NOT NULL,
    "itemId" INTEGER,
    "category" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAffinity" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoryScores" JSONB NOT NULL DEFAULT '{}',
    "brandScores" JSONB NOT NULL DEFAULT '{}',
    "priceRangePrefs" JSONB NOT NULL DEFAULT '{}',
    "avgViewDuration" INTEGER,
    "conversionRate" DOUBLE PRECISION,
    "lastComputed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalActivities" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserAffinity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentlyViewed" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "sessionId" TEXT,
    "itemId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentlyViewed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserActivity_sessionId_createdAt_idx" ON "UserActivity"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "UserActivity_eventType_createdAt_idx" ON "UserActivity"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "UserActivity_itemId_idx" ON "UserActivity"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAffinity_userId_key" ON "UserAffinity"("userId");

-- CreateIndex
CREATE INDEX "UserAffinity_userId_idx" ON "UserAffinity"("userId");

-- CreateIndex
CREATE INDEX "RecentlyViewed_userId_viewedAt_idx" ON "RecentlyViewed"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "RecentlyViewed_sessionId_viewedAt_idx" ON "RecentlyViewed"("sessionId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecentlyViewed_userId_itemId_key" ON "RecentlyViewed"("userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "RecentlyViewed_sessionId_itemId_key" ON "RecentlyViewed"("sessionId", "itemId");

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WardrobeItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAffinity" ADD CONSTRAINT "UserAffinity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyViewed" ADD CONSTRAINT "RecentlyViewed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyViewed" ADD CONSTRAINT "RecentlyViewed_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WardrobeItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
