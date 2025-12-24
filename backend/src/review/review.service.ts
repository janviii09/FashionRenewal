import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { OrderStatus } from '@prisma/client';

interface CreateReviewDto {
    rating: number;
    comment?: string;
}

@Injectable()
export class ReviewService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditService,
    ) { }

    /**
     * Create a review for an order
     * SAFETY-CRITICAL: Enforces all 6 mandatory guards
     */
    async createReview(userId: number, orderId: number, data: CreateReviewDto) {
        // GUARD 1: Order must exist
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                renter: true,
                owner: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // GUARD 2: Order must be COMPLETED
        if (order.status !== OrderStatus.COMPLETED) {
            throw new BadRequestException('Can only review completed orders');
        }

        // GUARD 3: User must be part of the order
        const isRenter = order.renterId === userId;
        const isOwner = order.ownerId === userId;

        if (!isRenter && !isOwner) {
            throw new ForbiddenException('Not authorized to review this order');
        }

        // GUARD 4: Can only review the OTHER party (counterparty)
        const revieweeId = isRenter ? order.ownerId : order.renterId;

        // GUARD 5: No self-reviews
        if (userId === revieweeId) {
            throw new BadRequestException('Cannot review yourself');
        }

        // GUARD 6: Check for existing review
        const existing = await this.prisma.review.findUnique({
            where: {
                orderId_reviewerId: {
                    orderId,
                    reviewerId: userId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('Review already submitted for this order');
        }

        // Validate rating
        if (data.rating < 1 || data.rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }

        // Create review (IMMUTABLE - no updates allowed)
        const review = await this.prisma.review.create({
            data: {
                orderId,
                reviewerId: userId,
                revieweeId,
                rating: data.rating,
                comment: data.comment,
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                reviewee: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // AUDIT: Log review creation (CRITICAL for trust and disputes)
        await this.audit.log(
            'REVIEW',
            review.id,
            'CREATED',
            userId,
            null,
            {
                orderId,
                revieweeId,
                rating: data.rating,
                hasComment: !!data.comment,
            },
        );

        // Update reviewee's trust score
        await this.updateTrustScore(revieweeId);

        return review;
    }

    /**
     * Get reviews for a user (public)
     */
    async getUserReviews(userId: number) {
        return this.prisma.review.findMany({
            where: {
                revieweeId: userId,
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                order: {
                    select: {
                        id: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get review statistics for a user
     */
    async getUserReviewStats(userId: number) {
        const reviews = await this.prisma.review.findMany({
            where: {
                revieweeId: userId,
            },
            select: {
                rating: true,
            },
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        const ratingDistribution = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length,
        };

        return {
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
        };
    }

    /**
     * Update user's trust score based on reviews
     * Private method - called after review creation
     */
    private async updateTrustScore(userId: number) {
        const stats = await this.getUserReviewStats(userId);

        // Get current trust score for audit
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { trustScore: true },
        });

        // Trust score = average rating (1-5 scale)
        // Can be enhanced with more sophisticated algorithm
        const newTrustScore = stats.averageRating > 0 ? stats.averageRating : 5.0;

        await this.prisma.user.update({
            where: { id: userId },
            data: { trustScore: newTrustScore },
        });

        // AUDIT: Log trust score update (CRITICAL for validation gates)
        await this.audit.log(
            'USER',
            userId,
            'TRUST_SCORE_UPDATE',
            null, // System-triggered
            { trustScore: currentUser.trustScore },
            { trustScore: newTrustScore, totalReviews: stats.totalReviews },
        );
    }

    // NO UPDATE METHOD - reviews are IMMUTABLE
    // NO DELETE METHOD - reviews are PERMANENT
}
