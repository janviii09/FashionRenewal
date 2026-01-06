import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrderStatus, DisputeResolution, DisputeStatus } from "@prisma/client";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Force close a dispute (admin override)
   */
  async forceCloseDispute(
    disputeId: number,
    adminId: number,
    reason: string,
    resolution: DisputeResolution,
  ) {
    // Update dispute
    const dispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: DisputeStatus.RESOLVED,
        resolution: resolution,
        resolvedAt: new Date(),
      },
    });

    // Log admin action
    await this.prisma.adminOverrideLog.create({
      data: {
        adminId,
        action: "FORCE_CLOSE_DISPUTE",
        entityType: "DISPUTE",
        entityId: disputeId,
        reason,
        metadata: JSON.stringify({ resolution }),
      },
    });

    return dispute;
  }

  /**
   * Override order status (admin power)
   */
  async overrideOrderStatus(
    orderId: number,
    newStatus: OrderStatus,
    adminId: number,
    reason: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        previousStatus: order.status,
      },
    });

    // Log admin override
    await this.prisma.adminOverrideLog.create({
      data: {
        adminId,
        action: "OVERRIDE_ORDER_STATUS",
        entityType: "ORDER",
        entityId: orderId,
        reason,
        metadata: JSON.stringify({
          oldStatus: order.status,
          newStatus,
        }),
      },
    });

    return updatedOrder;
  }

  /**
   * Freeze user account (soft ban)
   */
  async freezeUser(userId: number, adminId: number, reason: string) {
    // In a real app, you'd add a 'frozen' or 'banned' field to User
    // For now, we'll just log it
    await this.prisma.adminOverrideLog.create({
      data: {
        adminId,
        action: "FREEZE_USER",
        entityType: "USER",
        entityId: userId,
        reason,
      },
    });

    return { message: "User frozen", userId };
  }

  /**
   * Get all admin actions (audit trail)
   */
  async getAdminActions(adminId?: number) {
    return this.prisma.adminOverrideLog.findMany({
      where: adminId ? { adminId } : {},
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
