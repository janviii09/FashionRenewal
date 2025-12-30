import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AffinityService {
    private readonly logger = new Logger(AffinityService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Compute user affinity from activity history
     * Called periodically or on-demand
     */
    async computeUserAffinity(userId: number): Promise<any> {
        try {
            // Get user's activity from last 90 days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);

            const activities = await this.prisma.userActivity.findMany({
                where: {
                    userId,
                    createdAt: { gte: cutoffDate }
                },
                include: {
                    item: {
                        select: {
                            category: true,
                            brand: true,
                            rentPricePerDay: true,
                            sellPrice: true
                        }
                    }
                }
            });

            if (activities.length === 0) {
                return null; // New user, no affinity yet
            }

            // Compute category scores
            const categoryScores = this.computeCategoryAffinity(activities);

            // Compute brand scores
            const brandScores = this.computeBrandAffinity(activities);

            // Compute price range preferences
            const priceRangePrefs = this.computePriceRangePrefs(activities);

            // Compute behavioral metrics
            const conversionRate = this.computeConversionRate(activities);

            // Upsert affinity record
            const affinity = await this.prisma.userAffinity.upsert({
                where: { userId },
                update: {
                    categoryScores,
                    brandScores,
                    priceRangePrefs,
                    conversionRate,
                    lastComputed: new Date(),
                    totalActivities: activities.length
                },
                create: {
                    userId,
                    categoryScores,
                    brandScores,
                    priceRangePrefs,
                    conversionRate,
                    totalActivities: activities.length
                }
            });

            this.logger.debug(`Computed affinity for user ${userId}`);
            return affinity;

        } catch (error) {
            this.logger.error(`Error computing affinity for user ${userId}:`, error);
            return null;
        }
    }

    /**
     * Compute category affinity scores (0-100)
     */
    private computeCategoryAffinity(activities: any[]): any {
        const categoryWeights: Record<string, number> = {};
        const eventWeights = {
            VIEW: 1,
            CLICK: 2,
            WISHLIST_ADD: 5,
            CART_ADD: 8,
            PURCHASE_COMPLETE: 15,
            RENTAL_COMPLETE: 15
        };

        activities.forEach(activity => {
            const category = activity.category || activity.item?.category;
            if (!category) return;

            const weight = eventWeights[activity.eventType] || 1;
            categoryWeights[category] = (categoryWeights[category] || 0) + weight;
        });

        // Normalize to 0-100 scale
        const maxWeight = Math.max(...Object.values(categoryWeights), 1);
        const normalized: Record<string, number> = {};

        Object.entries(categoryWeights).forEach(([category, weight]) => {
            normalized[category] = Math.round((weight / maxWeight) * 100);
        });

        return normalized;
    }

    /**
     * Compute brand affinity scores (0-100)
     */
    private computeBrandAffinity(activities: any[]): any {
        const brandWeights: Record<string, number> = {};
        const eventWeights = {
            VIEW: 1,
            CLICK: 2,
            WISHLIST_ADD: 5,
            CART_ADD: 8,
            PURCHASE_COMPLETE: 15,
            RENTAL_COMPLETE: 15
        };

        activities.forEach(activity => {
            const brand = activity.item?.brand;
            if (!brand) return;

            const weight = eventWeights[activity.eventType] || 1;
            brandWeights[brand] = (brandWeights[brand] || 0) + weight;
        });

        // Normalize to 0-100 scale
        const maxWeight = Math.max(...Object.values(brandWeights), 1);
        const normalized: Record<string, number> = {};

        Object.entries(brandWeights).forEach(([brand, weight]) => {
            normalized[brand] = Math.round((weight / maxWeight) * 100);
        });

        return normalized;
    }

    /**
     * Compute price range preferences
     */
    private computePriceRangePrefs(activities: any[]): any {
        const prices: number[] = [];

        activities.forEach(activity => {
            const item = activity.item;
            if (!item) return;

            const price = item.rentPricePerDay || item.sellPrice;
            if (price && price > 0) {
                prices.push(price);
            }
        });

        if (prices.length === 0) {
            return { min: 0, max: 0, avg: 0 };
        }

        const sorted = prices.sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const avg = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);

        return { min, max, avg };
    }

    /**
     * Compute conversion rate (purchases / views)
     */
    private computeConversionRate(activities: any[]): number {
        const views = activities.filter(a => a.eventType === 'VIEW').length;
        const purchases = activities.filter(a =>
            a.eventType === 'PURCHASE_COMPLETE' || a.eventType === 'RENTAL_COMPLETE'
        ).length;

        if (views === 0) return 0;
        return parseFloat((purchases / views).toFixed(4));
    }

    /**
     * Get user affinity (cached or compute)
     */
    async getUserAffinity(userId: number): Promise<any> {
        // Try to get existing affinity
        let affinity = await this.prisma.userAffinity.findUnique({
            where: { userId }
        });

        // If doesn't exist or is stale (>24 hours), recompute
        if (!affinity || this.isStale(affinity.lastComputed)) {
            affinity = await this.computeUserAffinity(userId);
        }

        return affinity;
    }

    /**
     * Check if affinity is stale (>24 hours old)
     */
    private isStale(lastComputed: Date): boolean {
        const hoursSinceCompute = (Date.now() - lastComputed.getTime()) / (1000 * 60 * 60);
        return hoursSinceCompute > 24;
    }

    /**
     * Cron job: Update affinity for active users (runs hourly)
     */
    @Cron(CronExpression.EVERY_HOUR)
    async updateActiveUserAffinities() {
        try {
            // Get users with activity in last 24 hours
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - 24);

            const activeUserIds = await this.prisma.userActivity.findMany({
                where: {
                    createdAt: { gte: cutoffDate },
                    userId: { not: null }
                },
                select: { userId: true },
                distinct: ['userId']
            });

            this.logger.log(`Updating affinity for ${activeUserIds.length} active users`);

            // Update in batches of 10
            for (let i = 0; i < activeUserIds.length; i += 10) {
                const batch = activeUserIds.slice(i, i + 10);
                await Promise.all(
                    batch.map(({ userId }) =>
                        userId ? this.computeUserAffinity(userId) : Promise.resolve()
                    )
                );
            }

            this.logger.log('Affinity update complete');
        } catch (error) {
            this.logger.error('Error updating user affinities:', error);
        }
    }
}
