import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Payment, PaymentStatus, Prisma } from "@prisma/client";

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a payment for an order
   */
  async createPayment(
    orderId: number,
    amount: number,
    currency: string = "INR",
  ): Promise<Payment> {
    return this.prisma.payment.create({
      data: {
        orderId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
      },
    });
  }

  /**
   * Authorize payment (e.g., from Razorpay/Stripe webhook)
   */
  async authorizePayment(
    paymentId: number,
    gatewayOrderId: string,
    gatewayPaymentId: string,
  ): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.AUTHORIZED,
        gatewayOrderId,
        gatewayPaymentId,
        authorizedAt: new Date(),
      },
    });
  }

  /**
   * Capture payment (finalize transaction)
   */
  async capturePayment(paymentId: number): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CAPTURED,
        capturedAt: new Date(),
      },
    });
  }

  /**
   * Mark payment as failed
   */
  async failPayment(paymentId: number): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
      },
    });
  }

  /**
   * Refund payment (full or partial)
   */
  async refundPayment(
    paymentId: number,
    refundAmount?: number,
  ): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    const isPartial = refundAmount && refundAmount < payment.amount;

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: isPartial
          ? PaymentStatus.PARTIALLY_REFUNDED
          : PaymentStatus.REFUNDED,
        refundAmount: refundAmount || payment.amount,
        refundedAt: new Date(),
      },
    });
  }

  /**
   * Get payment by gateway order ID (for webhook processing)
   */
  async getByGatewayOrderId(gatewayOrderId: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { gatewayOrderId },
      include: { order: true },
    });
  }
}
