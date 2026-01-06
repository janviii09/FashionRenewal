import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { differenceInDays } from "date-fns";

@Injectable()
export class TrustedLenderService {
  private readonly logger = new Logger(TrustedLenderService.name);

  // Eligibility criteria constants
  private readonly MIN_SUCCESSFUL_RENTALS = 5;
  private readonly MIN_ACCOUNT_AGE_DAYS = 30;
  private readonly MIN_TRUST_SCORE = 4.5;
  private readonly MAX_DAYS_SINCE_DISPUTE = 90;

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate trusted lender eligibility for a user
   * Criteria:
   * - Min 5 successful rentals
   * - No disputes in last 90 days
   * - Trust score > 4.5
   * - Account age > 30 days
   */
  async calculateEligibility(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        trustedLenderMetrics: true,
        ownerOrders: {
          where: { status: "COMPLETED" },
          select: { id: true },
        },
        disputesAgainst: {
          where: {
            createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
          },
          select: { id: true, createdAt: true },
        },
      },
    });

    if (!user) {
      return false;
    }

    // Calculate account age
    const accountAge = differenceInDays(new Date(), user.createdAt);

    // Check eligibility
    const eligible =
      user.ownerOrders.length >= this.MIN_SUCCESSFUL_RENTALS &&
      user.disputesAgainst.length === 0 &&
      user.trustScore >= this.MIN_TRUST_SCORE &&
      accountAge >= this.MIN_ACCOUNT_AGE_DAYS;

    // Get last dispute date
    const lastDisputeDate =
      user.disputesAgainst.length > 0
        ? user.disputesAgainst[0].createdAt
        : null;

    // Update or create metrics
    const metrics = await this.prisma.trustedLenderMetrics.upsert({
      where: { userId },
      create: {
        userId,
        successfulRentals: user.ownerOrders.length,
        totalRentals: user.ownerOrders.length,
        lastDisputeDate,
        accountAge,
        currentTrustScore: user.trustScore,
        isEligible: eligible,
        badgeGrantedAt: eligible ? new Date() : null,
        lastCalculatedAt: new Date(),
        nextCalculationAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      update: {
        successfulRentals: user.ownerOrders.length,
        totalRentals: user.ownerOrders.length,
        lastDisputeDate,
        accountAge,
        currentTrustScore: user.trustScore,
        isEligible: eligible,
        badgeGrantedAt:
          eligible && !user.trustedLenderMetrics?.badgeGrantedAt
            ? new Date()
            : user.trustedLenderMetrics?.badgeGrantedAt,
        badgeRevokedAt:
          !eligible && user.trustedLenderMetrics?.isEligible
            ? new Date()
            : user.trustedLenderMetrics?.badgeRevokedAt,
        lastCalculatedAt: new Date(),
        nextCalculationAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update user denormalized field
    if (user.trustedLender !== eligible) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { trustedLender: eligible },
      });

      this.logger.log(
        `User ${userId} trusted lender status changed: ${user.trustedLender} -> ${eligible}`,
      );
    }

    return eligible;
  }

  /**
   * Revoke trusted lender badge
   * Called when:
   * - Dispute is raised against user
   * - Trust score drops below threshold
   */
  async revokeBadge(userId: number, reason: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.trustedLenderMetrics.update({
        where: { userId },
        data: {
          isEligible: false,
          badgeRevokedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { trustedLender: false },
      }),
      // TODO: Create audit log (AuditLog model needs userId field)
      // this.prisma.auditLog.create({
      //     data: {
      //         userId,
      //         action: 'TRUSTED_LENDER_REVOKED',
      //     },
      // }),
    ]);

    this.logger.warn(
      `Trusted lender badge revoked for user ${userId}: ${reason}`,
    );
  }

  /**
   * Cron job to recalculate badges (runs daily at 2 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async recalculateAllBadges(): Promise<void> {
    this.logger.log("Starting trusted lender badge recalculation...");

    const metricsToRecalculate =
      await this.prisma.trustedLenderMetrics.findMany({
        where: {
          nextCalculationAt: { lte: new Date() },
        },
        select: { userId: true },
      });

    let updated = 0;
    for (const metrics of metricsToRecalculate) {
      try {
        await this.calculateEligibility(metrics.userId);
        updated++;
      } catch (error) {
        this.logger.error(
          `Failed to recalculate badge for user ${metrics.userId}:`,
          error,
        );
      }
    }

    this.logger.log(
      `Trusted lender badge recalculation complete. Updated: ${updated} users`,
    );
  }

  /**
   * Get trusted lender metrics for a user
   */
  async getMetrics(userId: number) {
    return this.prisma.trustedLenderMetrics.findUnique({
      where: { userId },
    });
  }
}
