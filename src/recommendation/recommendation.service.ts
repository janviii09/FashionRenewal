import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationService {
    private readonly logger = new Logger(RecommendationService.name);

    constructor(private prisma: PrismaService) { }

    // In a real app, this would be a Cron job using @nestjs/schedule
    async generateRecommendations() {
        this.logger.log('Running recommendation engine...');

        // Logic: Find items with low wear count in last 6 months -> Suggest RENT or SELL
        const items = await this.prisma.wardrobeItem.findMany({
            where: { wearCount: { lt: 5 }, status: 'KEEP' }
        });

        const recommendations = items.map(item => ({
            itemId: item.id,
            action: 'RENT_OR_SELL',
            reason: 'Low wear frequency detected'
        }));

        // Save recommendations to DB (Not implemented in schema yet, just returning)
        return recommendations;
    }
}
