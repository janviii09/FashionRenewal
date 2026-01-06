import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDisputeDto } from "./dto/create-dispute.dto";
import { RespondDisputeDto } from "./dto/respond-dispute.dto";
import { ResolveDisputeDto } from "./dto/resolve-dispute.dto";
import {
  Dispute,
  DisputeStatus,
  DisputeResolution,
  DisputeReason,
  OrderStatus,
} from "@prisma/client";
import { addDays, addHours } from "date-fns";

@Injectable()
export class DisputeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new dispute
   * - Validates order exists and user is participant
   * - Checks if dispute already exists
   * - Sets SLA deadlines
   * - Creates timeline event
   * - Locks order from new disputes
   */
  async createDispute(userId: number, dto: CreateDisputeDto): Promise<Dispute> {
    // 1. Validate order exists
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { item: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // 2. Check user is participant in the order
    const isRenter = order.renterId === userId;
    const isOwner = order.ownerId === userId;

    if (!isRenter && !isOwner) {
      throw new ForbiddenException("You are not a participant in this order");
    }

    // 3. Check if active dispute already exists
    const existingDispute = await this.prisma.dispute.findFirst({
      where: {
        orderId: dto.orderId,
        status: {
          in: [
            DisputeStatus.OPEN,
            DisputeStatus.RESPONDED,
            DisputeStatus.UNDER_REVIEW,
            DisputeStatus.ESCALATED,
          ],
        },
      },
    });

    if (existingDispute) {
      throw new BadRequestException(
        `An active dispute already exists for this order (ID: ${existingDispute.id})`,
      );
    }

    // 4. Check if order is in a valid state for disputes
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException("Cannot raise dispute on cancelled order");
    }

    // 5. Determine who the dispute is against
    const againstId = isRenter ? order.ownerId : order.renterId;

    // 6. Calculate SLA deadlines
    const responseDeadline = addDays(new Date(), 3); // 3 days to respond
    const reviewDeadline = addDays(new Date(), 7); // 7 days for admin review

    // 7. Create dispute in transaction
    const dispute = await this.prisma.$transaction(async (tx) => {
      // Create dispute
      const newDispute = await tx.dispute.create({
        data: {
          orderId: dto.orderId,
          raisedById: userId,
          againstId,
          reason: dto.reason,
          description: dto.description,
          status: DisputeStatus.OPEN,
          responseDeadline,
          reviewDeadline,
        },
        include: {
          raisedBy: { select: { id: true, name: true, email: true } },
          against: { select: { id: true, name: true, email: true } },
          order: { select: { id: true, itemId: true, status: true } },
        },
      });

      // Create timeline event
      await tx.disputeTimeline.create({
        data: {
          disputeId: newDispute.id,
          actorId: userId,
          event: "DISPUTE_RAISED",
          description: `Dispute raised by ${newDispute.raisedBy.name} for reason: ${dto.reason}`,
          metadata: {
            reason: dto.reason,
            description: dto.description,
          },
        },
      });

      // Update order dispute tracking
      await tx.order.update({
        where: { id: dto.orderId },
        data: {
          hasActiveDispute: true,
          disputeCount: { increment: 1 },
        },
      });

      return newDispute;
    });

    // TODO: Send notification to counterparty
    // await this.notificationService.sendDisputeNotification(dispute);

    return dispute;
  }

  /**
   * Respond to a dispute (counterparty)
   * - Validates user is the counterparty
   * - Updates dispute status
   * - Creates response record
   * - Updates timeline
   */
  async respondToDispute(
    userId: number,
    disputeId: number,
    dto: RespondDisputeDto,
  ): Promise<Dispute> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        raisedBy: { select: { name: true } },
        against: { select: { name: true } },
      },
    });

    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    // Only the person being disputed can respond
    if (dispute.againstId !== userId) {
      throw new ForbiddenException(
        "Only the counterparty can respond to this dispute",
      );
    }

    // Check if already responded
    if (dispute.status !== DisputeStatus.OPEN) {
      throw new BadRequestException(
        "This dispute has already been responded to",
      );
    }

    // Create response in transaction
    const updatedDispute = await this.prisma.$transaction(async (tx) => {
      // Create response
      await tx.disputeResponse.create({
        data: {
          disputeId,
          respondedById: userId,
          message: dto.message,
        },
      });

      // Update dispute status
      const updated = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESPONDED,
          respondedAt: new Date(),
        },
        include: {
          raisedBy: { select: { id: true, name: true, email: true } },
          against: { select: { id: true, name: true, email: true } },
          responses: true,
        },
      });

      // Create timeline event
      await tx.disputeTimeline.create({
        data: {
          disputeId,
          actorId: userId,
          event: "RESPONSE_SUBMITTED",
          description: `${dispute.against.name} responded to the dispute`,
        },
      });

      return updated;
    });

    // TODO: Notify dispute raiser
    // await this.notificationService.sendDisputeResponseNotification(updatedDispute);

    return updatedDispute;
  }

  /**
   * Escalate overdue disputes (called by cron job)
   * - Finds disputes past response deadline
   * - Changes status to ESCALATED
   * - Notifies admin
   */
  async escalateOverdueDisputes(): Promise<number> {
    const now = new Date();

    const overdueDisputes = await this.prisma.dispute.findMany({
      where: {
        status: DisputeStatus.OPEN,
        responseDeadline: { lt: now },
      },
      include: {
        raisedBy: { select: { name: true } },
        against: { select: { name: true } },
      },
    });

    let escalatedCount = 0;

    for (const dispute of overdueDisputes) {
      await this.prisma.$transaction(async (tx) => {
        // Update status
        await tx.dispute.update({
          where: { id: dispute.id },
          data: {
            status: DisputeStatus.ESCALATED,
            escalatedAt: now,
          },
        });

        // Create timeline event
        await tx.disputeTimeline.create({
          data: {
            disputeId: dispute.id,
            actorId: null, // System event
            event: "AUTO_ESCALATED",
            description: `Dispute auto-escalated due to no response from ${dispute.against.name}`,
            metadata: {
              responseDeadline: dispute.responseDeadline,
              escalatedAt: now,
            },
          },
        });
      });

      escalatedCount++;
    }

    // TODO: Notify admin of escalated disputes
    // await this.notificationService.sendEscalationNotification(overdueDisputes);

    return escalatedCount;
  }

  /**
   * Resolve dispute (admin only)
   * - Applies resolution (refund, penalize, etc.)
   * - Updates trust scores
   * - Closes dispute
   * - Notifies all parties
   */
  async resolveDispute(
    adminId: number,
    disputeId: number,
    dto: ResolveDisputeDto,
  ): Promise<Dispute> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        raisedBy: { select: { id: true, name: true, trustScore: true } },
        against: { select: { id: true, name: true, trustScore: true } },
        order: true,
      },
    });

    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    if (
      dispute.status === DisputeStatus.RESOLVED ||
      dispute.status === DisputeStatus.CLOSED
    ) {
      throw new BadRequestException("Dispute is already resolved");
    }

    // Calculate trust score impact
    const trustScoreImpact = this.calculateTrustScoreImpact(
      dispute.reason,
      dto.resolution,
    );

    // Resolve in transaction
    const resolvedDispute = await this.prisma.$transaction(async (tx) => {
      // Update dispute
      const updated = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED,
          resolution: dto.resolution,
          refundAmount: dto.refundAmount,
          adminNotes: dto.adminNotes,
          resolvedById: adminId,
          resolvedAt: new Date(),
          trustScoreImpact,
        },
        include: {
          raisedBy: { select: { id: true, name: true, email: true } },
          against: { select: { id: true, name: true, email: true } },
          resolvedBy: { select: { id: true, name: true } },
        },
      });

      // Apply trust score changes
      if (trustScoreImpact.raisedBy !== 0) {
        await tx.user.update({
          where: { id: dispute.raisedById },
          data: {
            trustScore: { increment: trustScoreImpact.raisedBy },
          },
        });
      }

      if (trustScoreImpact.against !== 0) {
        await tx.user.update({
          where: { id: dispute.againstId },
          data: {
            trustScore: { increment: trustScoreImpact.against },
          },
        });
      }

      // Create timeline event
      await tx.disputeTimeline.create({
        data: {
          disputeId,
          actorId: adminId,
          event: "DISPUTE_RESOLVED",
          description: `Dispute resolved by admin with resolution: ${dto.resolution}`,
          metadata: {
            resolution: dto.resolution,
            refundAmount: dto.refundAmount?.toString(),
            trustScoreImpact,
          },
        },
      });

      // Update order
      await tx.order.update({
        where: { id: dispute.orderId },
        data: {
          hasActiveDispute: false,
          disputeLockedAt: new Date(), // Prevent new disputes
        },
      });

      // TODO: Create audit log (AuditLog model needs userId field)
      // await tx.auditLog.create({
      //     data: {
      //         userId: adminId,
      //         action: 'DISPUTE_RESOLVED',
      //     },
      // });

      return updated;
    });

    // TODO: Send notifications to all parties
    // await this.notificationService.sendResolutionNotification(resolvedDispute);

    return resolvedDispute;
  }

  /**
   * Calculate trust score impact based on dispute outcome
   * - Losing party gets negative impact
   * - Winning party may get small positive impact
   * - Severity depends on dispute reason
   */
  private calculateTrustScoreImpact(
    reason: DisputeReason,
    resolution: DisputeResolution,
  ): { raisedBy: number; against: number } {
    const impact = { raisedBy: 0, against: 0 };

    // Severity multiplier based on reason
    const severityMap: Record<DisputeReason, number> = {
      [DisputeReason.FRAUD]: 2.0,
      [DisputeReason.HARASSMENT]: 1.5,
      [DisputeReason.ITEM_DAMAGED]: 1.0,
      [DisputeReason.ITEM_NOT_AS_DESCRIBED]: 0.8,
      [DisputeReason.LATE_DELIVERY]: 0.5,
      [DisputeReason.PAYMENT_ISSUE]: 0.7,
      [DisputeReason.OTHER]: 0.5,
    };

    const severity = severityMap[reason] || 0.5;

    switch (resolution) {
      case DisputeResolution.REFUND_FULL:
      case DisputeResolution.PENALIZE_SELLER:
        // Seller/owner loses, buyer/renter wins
        impact.against = -0.5 * severity;
        impact.raisedBy = 0.1;
        break;

      case DisputeResolution.PENALIZE_BUYER:
        // Buyer/renter loses, seller/owner wins
        impact.raisedBy = -0.5 * severity;
        impact.against = 0.1;
        break;

      case DisputeResolution.REFUND_PARTIAL:
        // Partial refund means seller/owner is partially at fault
        impact.against = -0.3 * severity;
        impact.raisedBy = 0; // No penalty for buyer who raised valid concern
        break;
      case DisputeResolution.NO_REFUND:
      case DisputeResolution.FORCE_COMPLETE:
        // Dispute raiser was wrong
        impact.raisedBy = -0.3 * severity;
        impact.against = 0.1;
        break;

      case DisputeResolution.MUTUAL_AGREEMENT:
        // No penalty for either party
        break;
    }

    return impact;
  }

  /**
   * Get user's disputes (both raised and against)
   */
  async getMyDisputes(userId: number): Promise<Dispute[]> {
    return this.prisma.dispute.findMany({
      where: {
        OR: [{ raisedById: userId }, { againstId: userId }],
      },
      include: {
        raisedBy: { select: { id: true, name: true } },
        against: { select: { id: true, name: true } },
        order: {
          select: {
            id: true,
            status: true,
            item: { select: { id: true, title: true, images: true } },
          },
        },
        _count: {
          select: {
            evidence: true,
            responses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get dispute timeline
   */
  async getDisputeTimeline(disputeId: number) {
    return this.prisma.disputeTimeline.findMany({
      where: { disputeId },
      include: {
        actor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get dispute by ID with full details
   */
  async getDisputeById(disputeId: number): Promise<Dispute> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        raisedBy: {
          select: { id: true, name: true, email: true, trustScore: true },
        },
        against: {
          select: { id: true, name: true, email: true, trustScore: true },
        },
        resolvedBy: { select: { id: true, name: true } },
        order: {
          include: {
            item: {
              select: { id: true, title: true, images: true, category: true },
            },
          },
        },
        evidence: {
          include: {
            uploadedBy: { select: { id: true, name: true } },
          },
        },
        responses: {
          include: {
            respondedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        timeline: {
          include: {
            actor: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException("Dispute not found");
    }

    return dispute;
  }
}
