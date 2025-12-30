import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardrobeItem } from '@prisma/client';

interface ScoredProduct {
    product: WardrobeItem;
    score: number;
    matchReason: string;
}

@Injectable()
export class RecommendationService {
    private readonly logger = new Logger(RecommendationService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Get similar products based on attribute matching
     * Production-ready with error handling and edge cases
     * 
     * @param productId - Source product ID
     * @param limit - Number of recommendations to return (default: 12, max: 50)
     * @returns Array of recommended products
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
            // 1. Get source product
            const sourceProduct = await this.prisma.wardrobeItem.findUnique({
                where: { id: productId }
            });

            // Edge case: Product not found
            if (!sourceProduct) {
                throw new NotFoundException(`Product with ID ${productId} not found`);
            }

            // Edge case: Source product not in marketplace
            if (!this.isMarketplaceItem(sourceProduct)) {
                this.logger.warn(`Product ${productId} is not a marketplace item`);
                // Return popular items as fallback
                return this.getFallbackRecommendations(limit);
            }

            // 2. Build candidate pool with optimized query
            const candidates = await this.prisma.wardrobeItem.findMany({
                where: {
                    id: { not: productId },
                    availability: {
                        in: ['AVAILABLE_FOR_RENT', 'AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_SWAP']
                    },
                    // Optimize: Only get items from same or related categories
                    ...(sourceProduct.category && {
                        OR: [
                            { category: sourceProduct.category },
                        ]
                    })
                },
                // Limit candidates for performance
                take: 500
            });

            // Edge case: No candidates available
            if (candidates.length === 0) {
                this.logger.warn('No candidate products found for recommendations');
                return [];
            }

            // 3. Score each candidate
            const scoredCandidates: ScoredProduct[] = candidates.map(candidate => {
                const { score, reason } = this.calculateSimilarityScore(sourceProduct, candidate);
                return {
                    product: candidate,
                    score,
                    matchReason: reason
                };
            });

            // 4. Sort by score and return top N
            const recommendations = scoredCandidates
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(item => item.product);

            // Edge case: Not enough high-quality recommendations
            if (recommendations.length < Math.min(limit, 3)) {
                this.logger.warn(`Only ${recommendations.length} recommendations found for product ${productId}`);
            }

            return recommendations;

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error(`Error getting recommendations for product ${productId}:`, error);
            // Return empty array instead of throwing to prevent breaking the page
            return [];
        }
    }

    /**
     * Calculate similarity score between two products
     * Max score: 118 points
     */
    private calculateSimilarityScore(
        source: WardrobeItem,
        candidate: WardrobeItem
    ): { score: number; reason: string } {
        let score = 0;
        const reasons: string[] = [];

        // Category Match (40 points) - PRIMARY DRIVER
        if (source.category && candidate.category && source.category === candidate.category) {
            score += 40;
            reasons.push('Same category');
        }

        // Price Range Match (15 points) - ±20%
        const sourcePrice = this.getPrice(source);
        const candidatePrice = this.getPrice(candidate);

        if (sourcePrice > 0 && candidatePrice > 0) {
            const priceRangeLower = sourcePrice * 0.8;
            const priceRangeUpper = sourcePrice * 1.2;

            if (candidatePrice >= priceRangeLower && candidatePrice <= priceRangeUpper) {
                score += 15;
                reasons.push('Similar price');
            }
        }

        // Brand Match (10 points)
        if (source.brand && candidate.brand && source.brand.toLowerCase() === candidate.brand.toLowerCase()) {
            score += 10;
            reasons.push('Same brand');
        }

        // Condition Match (8 points)
        if (source.condition === candidate.condition) {
            score += 8;
            reasons.push('Same condition');
        }

        // Size Match (5 points)
        if (source.size && candidate.size && source.size === candidate.size) {
            score += 5;
        }

        // Availability Type Match (5 points)
        if (source.availability === candidate.availability) {
            score += 5;
        }

        // Build match reason string
        const reason = reasons.length > 0
            ? reasons.join(', ')
            : 'Related item';

        return { score, reason };
    }

    /**
     * Get recommendations with metadata for debugging and analytics
     */
    async getRecommendationsWithMetadata(productId: number, limit: number = 12) {
        const startTime = Date.now();

        try {
            const recommendations = await this.getSimilarProducts(productId, limit);

            // Get total candidate count for metadata
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

            // Return error metadata
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

    /**
     * Helper: Check if item is available in marketplace
     */
    private isMarketplaceItem(item: WardrobeItem): boolean {
        return ['AVAILABLE_FOR_RENT', 'AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_SWAP'].includes(item.availability);
    }

    /**
     * Helper: Get price from item (rent or sell)
     */
    private getPrice(item: WardrobeItem): number {
        return item.rentPricePerDay || item.sellPrice || 0;
    }

    /**
     * Fallback: Get popular items when no good recommendations found
     */
    private async getFallbackRecommendations(limit: number): Promise<WardrobeItem[]> {
        try {
            // Return most recently added marketplace items as fallback
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
}
