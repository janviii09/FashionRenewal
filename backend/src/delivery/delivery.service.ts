import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryStatus } from '@prisma/client';

@Injectable()
export class DeliveryService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create delivery tracking for an order
     * Called automatically when order is dispatched
     */
    async createDelivery(orderId: number) {
        return this.prisma.delivery.create({
            data: {
                orderId,
                status: DeliveryStatus.PENDING,
            },
        });
    }

    /**
     * Update delivery status
     * RULE: Syncs with order state machine
     */
    async updateDeliveryStatus(
        orderId: number,
        status: DeliveryStatus,
        notes?: string,
        trackingNumber?: string,
    ) {
        const delivery = await this.prisma.delivery.findUnique({
            where: { orderId },
            include: { order: true },
        });

        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }

        const updateData: any = {
            status,
            notes,
        };

        if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        // Set timestamps based on status
        switch (status) {
            case DeliveryStatus.PICKED_UP:
                updateData.pickedUpAt = new Date();
                break;
            case DeliveryStatus.DELIVERED:
                updateData.deliveredAt = new Date();
                break;
            case DeliveryStatus.FAILED:
                updateData.failedAt = new Date();
                break;
        }

        const updated = await this.prisma.delivery.update({
            where: { orderId },
            data: updateData,
        });

        // Sync order status
        await this.syncOrderStatus(orderId, status);

        return updated;
    }

    /**
     * Sync order status with delivery status
     * RULE: Delivery status drives order status
     */
    private async syncOrderStatus(orderId: number, deliveryStatus: DeliveryStatus) {
        let orderStatus: string | undefined;

        switch (deliveryStatus) {
            case DeliveryStatus.PICKED_UP:
            case DeliveryStatus.IN_TRANSIT:
                orderStatus = 'IN_TRANSIT';
                break;
            case DeliveryStatus.DELIVERED:
                orderStatus = 'DELIVERED';
                break;
            case DeliveryStatus.FAILED:
                // Don't change order status on failed delivery
                // Let admin handle it
                break;
        }

        if (orderStatus) {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: orderStatus as any },
            });
        }
    }

    /**
     * Get delivery for an order
     */
    async getDelivery(orderId: number) {
        const delivery = await this.prisma.delivery.findUnique({
            where: { orderId },
            include: {
                order: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        renter: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        owner: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!delivery) {
            throw new NotFoundException('Delivery not found');
        }

        return delivery;
    }
}
