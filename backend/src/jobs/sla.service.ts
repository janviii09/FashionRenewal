import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class SlaService {
    constructor(private prisma: PrismaService) { }

    /**
     * Auto-cancel REQUESTED orders after 24 hours
     */
    @Cron(CronExpression.EVERY_HOUR)
    async cancelStaleRequests() {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const staleOrders = await this.prisma.order.updateMany({
            where: {
                status: OrderStatus.REQUESTED,
                createdAt: {
                    lt: twentyFourHoursAgo,
                },
                deletedAt: null,
            },
            data: {
                status: OrderStatus.CANCELLED,
                previousStatus: OrderStatus.REQUESTED,
            },
        });

        console.log(`Auto-cancelled ${staleOrders.count} stale REQUESTED orders`);
        return staleOrders;
    }

    /**
     * Flag late returns
     */
    @Cron(CronExpression.EVERY_HOUR)
    async flagLateReturns() {
        const now = new Date();

        const lateOrders = await this.prisma.order.updateMany({
            where: {
                status: OrderStatus.DELIVERED,
                endDate: {
                    lt: now,
                },
                isLate: false,
                deletedAt: null,
            },
            data: {
                isLate: true,
            },
        });

        console.log(`Flagged ${lateOrders.count} late returns`);
        return lateOrders;
    }

    /**
     * Set expiry dates for new orders
     */
    async setOrderExpiry(orderId: number, hoursUntilExpiry: number = 24) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hoursUntilExpiry);

        return this.prisma.order.update({
            where: { id: orderId },
            data: { expiresAt },
        });
    }
}
