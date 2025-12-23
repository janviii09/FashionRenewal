import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order, Prisma, OrderStatus, OrderType } from '@prisma/client';
import { OrderStateMachineService } from './order-state-machine.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MarketplaceService {
    constructor(
        private prisma: PrismaService,
        private stateMachine: OrderStateMachineService,
        private audit: AuditService,
    ) { }

    async createOrder(data: Prisma.OrderCreateInput, requesterId: number, idempotencyKey?: string): Promise<Order> {
        // Basic validation: check if item exists
        const item = await this.prisma.wardrobeItem.findUnique({
            where: { id: data.item.connect.id, deletedAt: null }
        });
        if (!item) throw new BadRequestException('Item not found');

        // Anti double-booking: Check for overlapping rentals
        if (data.type === OrderType.RENT && data.startDate && data.endDate) {
            // Convert to Date objects if they're strings
            const startDate = data.startDate instanceof Date ? data.startDate : new Date(data.startDate as string);
            const endDate = data.endDate instanceof Date ? data.endDate : new Date(data.endDate as string);
            await this.checkDateConflict(data.item.connect.id, startDate, endDate);
        }

        // Create order in transaction
        const order = await this.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    ...data,
                    idempotencyKey, // Store idempotency key
                }
            });

            // Audit log
            await this.audit.log('ORDER', newOrder.id, 'CREATED', requesterId, null, newOrder);

            return newOrder;
        });

        return order;
    }

    /**
     * Check for date conflicts (anti double-booking)
     */
    private async checkDateConflict(itemId: number, startDate: Date, endDate: Date): Promise<void> {
        const overlappingOrders = await this.prisma.order.findMany({
            where: {
                itemId,
                type: OrderType.RENT,
                deletedAt: null, // Only check non-deleted orders
                status: {
                    in: [
                        OrderStatus.APPROVED,
                        OrderStatus.PAID,
                        OrderStatus.DISPATCHED,
                        OrderStatus.DELIVERED,
                    ],
                },
                OR: [
                    {
                        AND: [
                            { startDate: { lte: endDate } },
                            { endDate: { gte: startDate } },
                        ],
                    },
                ],
            },
        });

        if (overlappingOrders.length > 0) {
            throw new ConflictException(
                `Item is already booked for the selected dates. Conflicting order ID: ${overlappingOrders[0].id}`,
            );
        }
    }

    /**
     * Update order status with state machine validation and audit logging
     * Now includes optimistic locking to prevent concurrent updates
     */
    async updateOrderStatus(
        orderId: number,
        newStatus: OrderStatus,
        userId: number,
        expectedVersion?: number,
    ): Promise<Order> {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new BadRequestException('Order not found');

        // Optimistic locking check
        if (expectedVersion !== undefined && order.version !== expectedVersion) {
            throw new ConflictException(
                `Order was modified by another process. Expected version ${expectedVersion}, got ${order.version}. Please refresh and try again.`,
            );
        }

        // Validate state transition
        this.stateMachine.validateTransition(order.status, newStatus);

        // Update with audit trail
        const updatedOrder = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.order.update({
                where: {
                    id: orderId,
                    ...(expectedVersion !== undefined && { version: expectedVersion }),
                },
                data: {
                    status: newStatus,
                    previousStatus: order.status,
                    version: { increment: 1 },
                },
            });

            // Audit log
            await this.audit.log(
                'ORDER',
                orderId,
                'STATUS_CHANGE',
                userId,
                { status: order.status, version: order.version },
                { status: newStatus, version: order.version + 1 },
            );

            return updated;
        });

        return updatedOrder;
    }

    async findAllOrders(userId: number, type: 'owner' | 'renter'): Promise<Order[]> {
        if (type === 'owner') {
            return this.prisma.order.findMany({
                where: { ownerId: userId, deletedAt: null },
                include: { item: true, renter: true }
            });
        } else {
            return this.prisma.order.findMany({
                where: { renterId: userId, deletedAt: null },
                include: { item: true, owner: true }
            });
        }
    }
}
