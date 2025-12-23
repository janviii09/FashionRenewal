import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderStateMachineService } from './order-state-machine.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class OrderPaymentTransactionService {
    constructor(
        private prisma: PrismaService,
        private orderStateMachine: OrderStateMachineService,
        private audit: AuditService,
    ) { }

    /**
     * Atomically capture payment and update order to PAID status
     * This ensures payment and order state are always consistent
     */
    async capturePaymentAndUpdateOrder(
        paymentId: number,
        orderId: number,
        userId: number,
    ) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Get current order
            const order = await tx.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                throw new BadRequestException('Order not found');
            }

            // 2. Validate state transition
            this.orderStateMachine.validateTransition(order.status, OrderStatus.PAID);

            // 3. Capture payment
            const payment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: PaymentStatus.CAPTURED,
                    capturedAt: new Date(),
                },
            });

            // 4. Update order status
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.PAID,
                    previousStatus: order.status,
                    version: { increment: 1 },
                },
            });

            // 5. Audit log
            await this.audit.log(
                'ORDER_PAYMENT',
                orderId,
                'PAYMENT_CAPTURED_ORDER_UPDATED',
                userId,
                { orderStatus: order.status, paymentStatus: 'AUTHORIZED' },
                { orderStatus: OrderStatus.PAID, paymentStatus: 'CAPTURED' },
            );

            return { payment, order: updatedOrder };
        });
    }

    /**
     * Handle payment failure - mark payment as failed and cancel order
     * Ensures system stays consistent when payment fails
     */
    async handlePaymentFailure(
        paymentId: number,
        orderId: number,
        userId: number,
        reason?: string,
    ) {
        return this.prisma.$transaction(async (tx) => {

            // 1. Fetch order
            const existingOrder = await tx.order.findUnique({
                where: { id: orderId },
            });

            if (!existingOrder) {
                throw new BadRequestException('Order not found');
            }

            // 2. Validate transition
            this.orderStateMachine.validateTransition(
                existingOrder.status,
                OrderStatus.CANCELLED,
            );

            // 3. Mark payment failed
            const payment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: PaymentStatus.FAILED,
                    failedAt: new Date(),
                },
            });

            // 4. Cancel order
            const order = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.CANCELLED,
                    previousStatus: existingOrder.status,
                    version: { increment: 1 },
                },
            });

            // 5. Audit
            await this.audit.log(
                'ORDER_PAYMENT',
                orderId,
                'PAYMENT_FAILED_ORDER_CANCELLED',
                userId,
                { paymentId, orderId },
                { reason },
            );

            return { payment, order };
        });
    }




    /**
     * Refund payment and update order status
     */
    async refundPaymentAndUpdateOrder(
        paymentId: number,
        orderId: number,
        userId: number,
        refundAmount?: number,
    ) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
            });

            const isPartial = refundAmount && refundAmount < payment.amount;

            // Update payment
            const updatedPayment = await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: isPartial
                        ? PaymentStatus.PARTIALLY_REFUNDED
                        : PaymentStatus.REFUNDED,
                    refundAmount: refundAmount || payment.amount,
                    refundedAt: new Date(),
                },
            });

            // Update order if full refund
            let updatedOrder = null;
            if (!isPartial) {
                updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: OrderStatus.CANCELLED,
                        version: { increment: 1 },
                    },
                });
            }

            // Audit log
            await this.audit.log(
                'ORDER_PAYMENT',
                orderId,
                isPartial ? 'PARTIAL_REFUND' : 'FULL_REFUND',
                userId,
                { paymentId, amount: payment.amount },
                { refundAmount: refundAmount || payment.amount },
            );

            return { payment: updatedPayment, order: updatedOrder };
        });
    }
}
