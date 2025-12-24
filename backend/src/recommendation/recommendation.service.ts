import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationService {
    private readonly logger = new Logger(RecommendationService.name);

    constructor(private prisma: PrismaService) { }

    // In a real app, this would be a Cron job using @nestjs/schedule
    async getRecommendations(userId: number) {
        this.logger.log('Running recommendation engine...');

        // Simple rule-based recommendations
        // TODO: Enhance with ML/collaborative filtering
        const underutilized = await this.prisma.wardrobeItem.findMany({
            where: {
                wearCount: { lt: 5 },
                deletedAt: null // Only active items
            }
        });

        const recommendations = underutilized.map(item => ({
            itemId: item.id,
            action: 'RENT_OR_SELL',
            reason: 'Low wear frequency detected'
        }));

        // Save recommendations to DB (Not implemented in schema yet, just returning)
        return recommendations;
    }
}
