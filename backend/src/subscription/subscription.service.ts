import { Injectable, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { Subscription, UserSubscription, Prisma } from "@prisma/client";

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  /**
   * Create a subscription plan
   */
  async createPlan(
    data: Prisma.SubscriptionCreateInput,
  ): Promise<Subscription> {
    return this.prisma.subscription.create({ data });
  }

  /**
   * Subscribe a user to a plan
   */
  async subscribeUser(
    userId: number,
    subscriptionId: number,
  ): Promise<UserSubscription> {
    const now = new Date();
    const cycleEnd = new Date();
    cycleEnd.setMonth(cycleEnd.getMonth() + 1); // 1 month cycle

    return this.prisma.userSubscription.create({
      data: {
        userId,
        subscriptionId,
        cycleStart: now,
        cycleEnd,
        rentalsUsed: 0,
        swapsUsed: 0,
      },
    });
  }

  /**
   * Check if user can perform an action based on their subscription
   */
  async checkUsage(
    userId: number,
    action: "RENT" | "SWAP",
  ): Promise<{ allowed: boolean; reason?: string }> {
    const userSub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { subscription: true },
    });

    if (!userSub) {
      return { allowed: false, reason: "No active subscription" };
    }

    // Check if cycle has expired
    if (new Date() > userSub.cycleEnd) {
      return { allowed: false, reason: "Subscription cycle expired" };
    }

    if (action === "RENT") {
      if (userSub.rentalsUsed >= userSub.subscription.rentalLimit) {
        return {
          allowed: false,
          reason: `Rental limit reached (${userSub.subscription.rentalLimit})`,
        };
      }
    }

    if (action === "SWAP") {
      if (userSub.swapsUsed >= userSub.subscription.swapCredits) {
        return {
          allowed: false,
          reason: `Swap credits exhausted (${userSub.subscription.swapCredits})`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * CRITICAL: Increment usage in transaction
   * This MUST be called within the order creation transaction
   * to prevent concurrent bypass
   */
  async incrementUsageInTransaction(
    tx: any, // Prisma transaction client
    userId: number,
    action: "RENT" | "SWAP",
  ): Promise<void> {
    const field = action === "RENT" ? "rentalsUsed" : "swapsUsed";

    const updated = await tx.userSubscription.update({
      where: { userId },
      data: {
        [field]: { increment: 1 },
      },
    });

    // AUDIT: Log subscription usage (CRITICAL for billing and disputes)
    await this.audit.log(
      "USER_SUBSCRIPTION",
      updated.id,
      "USAGE_INCREMENT",
      userId,
      { [field]: updated[field] - 1 },
      { [field]: updated[field], action },
    );
  }

  /**
   * Reset usage for a new billing cycle
   */
  async resetCycle(userId: number): Promise<void> {
    const now = new Date();
    const cycleEnd = new Date();
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    await this.prisma.userSubscription.update({
      where: { userId },
      data: {
        cycleStart: now,
        cycleEnd,
        rentalsUsed: 0,
        swapsUsed: 0,
      },
    });
  }
}
