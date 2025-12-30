import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardrobeItem, ActivityType } from '@prisma/client';

interface ScoredProduct {
    product: WardrobeItem;
    score: number;
    matchReason: string;
    reasonType: string;
}

interface PersonalizedRecommendation extends WardrobeItem {
    score: number;
    reason: string;
    reasonType: string;
}

@Injectable()
export class RecommendationService {
    private readonly logger = new Logger(RecommendationService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Get personalized recommendations for a user
     * Uses hybrid scoring: item similarity + user behavior + affinity
     */
    async getPersonalizedRecommendations(
        userId: number | null,
        sessionId: string | null,
        limit: number = 16
    ): Promise<PersonalizedRecommendation[]> {
        try {
            // For guest users or new users, fall back to popular items
            if (!userId) {
                return this.getPopularItems(limit);
            }

            // Get user affinity
            const affinity = await this.prisma.userAffinity.findUnique({
                where: { userId }
            });

            // If no affinity (new user), return popular items
            if (!affinity || affinity.totalActivities < 3) {
                return this.getPopularItems(limit);
            }

            // Get user's recent activity (last 30 days)
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);

            const recentActivities = await this.prisma.userActivity.findMany({
                where: {
                    userId,
                    createdAt: { gte: cutoffDate }
                },
                include: {
                    item: true
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });

            // Get candidate items (exclude already interacted)
            const interactedItemIds = recentActivities
                .filter(a => a.itemId)
                .map(a => a.itemId!);

            const candidates = await this.prisma.wardrobeItem.findMany({
                where: {
                    id: { notIn: interactedItemIds },
                    availability: {
                        in: ['AVAILABLE_FOR_RENT', 'AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_SWAP']
                    }
                },
                take: 500 // Limit for performance
            });

            if (candidates.length === 0) {
                return this.getPopularItems(limit);
            }

            // Score each candidate with hybrid algorithm
            const scoredCandidates = candidates.map(candidate => {
                const score = this.calculateHybridScore(
                    candidate,
                    affinity,
                    recentActivities
                );
                const { reason, reasonType } = this.generateReason(
                    candidate,
                    affinity,
                    recentActivities
                );

                return {
                    ...candidate,
                    score,
                    reason,
                    reasonType
                };
            });

            // Sort by score and return top N
            return scoredCandidates
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

        } catch (error) {
            this.logger.error('Error getting personalized recommendations:', error);
            return this.getPopularItems(limit);
        }
    }

    /**
     * Hybrid scoring algorithm
     * Total = ItemSimilarity(30%) + UserBehavior(40%) + CategoryAffinity(15%) + Recency(10%) + Popularity(5%)
     */
    private calculateHybridScore(
        item: WardrobeItem,
        affinity: any,
        recentActivities: any[]
    ): number {
        // 1. Item Similarity Score (30%) - Based on recent interactions
        const itemSimilarityScore = this.getItemSimilarityScore(item, recentActivities);

        // 2. User Behavior Score (40%) - Based on activity patterns
        const userBehaviorScore = this.getUserBehaviorScore(item, recentActivities);

        // 3. Category Affinity Score (15%) - Based on computed preferences
        const categoryAffinityScore = this.getCategoryAffinityScore(item, affinity);

        // 4. Recency Score (10%) - Boost if user was recently active
        const recencyScore = this.getRecencyScore(recentActivities);

        // 5. Popularity Score (5%) - Based on global metrics
        const popularityScore = this.getPopularityScore(item);

        // Weighted combination
        const totalScore = (
            itemSimilarityScore * 0.30 +
            userBehaviorScore * 0.40 +
            categoryAffinityScore * 0.15 +
            recencyScore * 0.10 +
            popularityScore * 0.05
        );

        return Math.round(totalScore * 100) / 100;
    }

    /**
     * Item similarity based on recent interactions
     */
    private getItemSimilarityScore(item: WardrobeItem, activities: any[]): number {
        let maxSimilarity = 0;

        // Compare with recently viewed/purchased items
        activities.forEach(activity => {
            if (!activity.item) return;

            const similarity = this.calculateItemSimilarity(item, activity.item);
            maxSimilarity = Math.max(maxSimilarity, similarity);
        });

        return maxSimilarity;
    }

    /**
     * Calculate similarity between two items (0-100)
     */
    private calculateItemSimilarity(item1: WardrobeItem, item2: WardrobeItem): number {
        let score = 0;

        // Category match (40 points)
        if (item1.category === item2.category) score += 40;

        // Price similarity (15 points)
        const price1 = item1.rentPricePerDay || item1.sellPrice || 0;
        const price2 = item2.rentPricePerDay || item2.sellPrice || 0;
        if (price1 > 0 && price2 > 0) {
            const priceDiff = Math.abs(price1 - price2) / Math.max(price1, price2);
            if (priceDiff < 0.2) score += 15;
        }

        // Brand match (10 points)
        if (item1.brand && item2.brand && item1.brand === item2.brand) score += 10;

        // Condition match (8 points)
        if (item1.condition === item2.condition) score += 8;

        return score;
    }

    /**
     * User behavior score based on activity patterns
     */
    private getUserBehaviorScore(item: WardrobeItem, activities: any[]): number {
        let score = 0;

        const categoryActivities = activities.filter(a =>
            a.category === item.category || a.item?.category === item.category
        );

        // Weight by event type
        categoryActivities.forEach(activity => {
            switch (activity.eventType) {
                case 'VIEW':
                    score += 5;
                    break;
                case 'CLICK':
                    score += 10;
                    break;
                case 'WISHLIST_ADD':
                    score += 15;
                    break;
                case 'CART_ADD':
                    score += 20;
                    break;
                case 'PURCHASE_COMPLETE':
                case 'RENTAL_COMPLETE':
                    score += 30;
                    break;
            }
        });

        // Normalize to 0-100
        return Math.min(score, 100);
    }

    /**
     * Category affinity score from computed preferences
     */
    private getCategoryAffinityScore(item: WardrobeItem, affinity: any): number {
        if (!affinity || !affinity.categoryScores) return 0;

        const scores = affinity.categoryScores as Record<string, number>;
        return scores[item.category] || 0;
    }

    /**
     * Recency score - boost if user was recently active
     */
    private getRecencyScore(activities: any[]): number {
        if (activities.length === 0) return 0;

        const mostRecent = activities[0].createdAt;
        const hoursSince = (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60);

        // Exponential decay: 100 if just now, decays over 7 days
        return Math.round(100 * Math.exp(-hoursSince / 168)); // 168 hours = 7 days
    }

    /**
     * Popularity score based on view count
     */
    private getPopularityScore(item: WardrobeItem): number {
        // Simple popularity based on view count
        // Normalize to 0-100 (assume max 1000 views)
        return Math.min((item.viewCount / 1000) * 100, 100);
    }

    /**
     * Generate human-readable reason for recommendation
     */
    private generateReason(
        item: WardrobeItem,
        affinity: any,
        activities: any[]
    ): { reason: string; reasonType: string } {
        // Check for recent purchases in same category
        const recentPurchases = activities.filter(a =>
            (a.eventType === 'PURCHASE_COMPLETE' || a.eventType === 'RENTAL_COMPLETE') &&
            a.item?.category === item.category
        );

        if (recentPurchases.length > 0) {
            const lastItem = recentPurchases[0].item;
            return {
                reason: `Because you rented ${lastItem.title}`,
                reasonType: 'behavior'
            };
        }

        // Check for category affinity
        const categoryScores = affinity?.categoryScores as Record<string, number> || {};
        if (categoryScores[item.category] > 70) {
            return {
                reason: 'Inspired by your wardrobe preferences',
                reasonType: 'affinity'
            };
        }

        // Check for wishlist items in same category
        const wishlistItems = activities.filter(a =>
            a.eventType === 'WISHLIST_ADD' && a.item?.category === item.category
        );

        if (wishlistItems.length > 0) {
            return {
                reason: 'Similar to items in your wishlist',
                reasonType: 'wishlist'
            };
        }

        // Default
        return {
            reason: 'Popular among users like you',
            reasonType: 'popular'
        };
    }

    /**
     * Fallback: Get popular items
     */
    private async getPopularItems(limit: number): Promise<PersonalizedRecommendation[]> {
        const items = await this.prisma.wardrobeItem.findMany({
            where: {
                availability: {
                    in: ['AVAILABLE_FOR_RENT', 'AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_SWAP']
                }
            },
            orderBy: {
                viewCount: 'desc'
            },
            take: limit
        });

        return items.map(item => ({
            ...item,
            score: 50,
            reason: 'Popular right now',
            reasonType: 'popular'
        }));
    }

    /**
     * Get similar products (existing functionality)
     */
    async getSimilarProducts(productId: number, limit: number = 12): Promise<WardrobeItem[]> {
        // Input validation
        if (!productId || productId <= 0) {
            throw new BadRequestException('Invalid product ID');
        }

        if (limit <= 0 || limit > 50) {
            throw new BadRequestException('Limit must be between 1 and 50');
        }

        try {
            const sourceProduct = await this.prisma.wardrobeItem.findUnique({
                where: { id: productId }
            });

            if (!sourceProduct) {
                throw new NotFoundException(`Product with ID ${productId} not found`);
            }

            if (!this.isMarketplaceItem(sourceProduct)) {
                this.logger.warn(`Product ${productId} is not a marketplace item`);
                return this.getFallbackRecommendations(limit);
            }

            const candidates = await this.prisma.wardrobeItem.findMany({
                where: {
                    id: { not: productId },
                    availability: {
                        in: ['AVAILABLE_FOR_RENT', 'AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_SWAP']
                    },
                    ...(sourceProduct.category && {
                        OR: [
                            { category: sourceProduct.category },
                        ]
                    })
                },
                take: 500
            });

            if (candidates.length === 0) {
                this.logger.warn('No candidate products found for recommendations');
                return [];
            }

            const scoredCandidates = candidates.map(candidate => {
                const score = this.calculateItemSimilarity(sourceProduct, candidate);
                return {
                    product: candidate,
                    score,
                    matchReason: 'Similar item'
                };
            });

            return scoredCandidates
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(item => item.product);

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error(`Error getting recommendations for product ${productId}:`, error);
            return [];
        }
    }

    private isMarketplaceItem(item: WardrobeItem): boolean {
        return ['AVAILABLE_FOR_RENT', 'AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_SWAP'].includes(item.availability);
    }

    private async getFallbackRecommendations(limit: number): Promise<WardrobeItem[]> {
        try {
            return await this.prisma.wardrobeItem.findMany({
                where: {
                    availability: {
                        in: ['AVAILABLE_FOR_RENT', 'AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_SWAP']
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });
        } catch (error) {
            this.logger.error('Error getting fallback recommendations:', error);
            return [];
        }
    }

    async getRecommendationsWithMetadata(productId: number, limit: number = 12) {
        const startTime = Date.now();

        try {
            const recommendations = await this.getSimilarProducts(productId, limit);

            const totalCandidates = await this.prisma.wardrobeItem.count({
                where: {
                    id: { not: productId },
                    availability: {
                        in: ['AVAILABLE_FOR_RENT', 'AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_SWAP']
                    }
                }
            });

            const responseTime = Date.now() - startTime;

            return {
                recommendations,
                meta: {
                    sourceProductId: productId,
                    totalCandidates,
                    returnedCount: recommendations.length,
                    algorithm: 'attribute-based',
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;

            return {
                recommendations: [],
                meta: {
                    sourceProductId: productId,
                    totalCandidates: 0,
                    returnedCount: 0,
                    algorithm: 'attribute-based',
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
}
