import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { ValidationStatus, Role } from "@prisma/client";

// Configuration thresholds
const VALIDATION_CONFIG = {
  ITEM_VALUE_THRESHOLD: 500, // $500
  TRUST_SCORE_THRESHOLD: 3.0,
};

@Injectable()
export class ValidationService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  /**
   * Check if validation is required for an order
   * RULE: Required if item value > threshold OR user trust score < threshold
   */
  checkValidationRequired(itemValue: number, userTrustScore: number): boolean {
    return (
      itemValue > VALIDATION_CONFIG.ITEM_VALUE_THRESHOLD ||
      userTrustScore < VALIDATION_CONFIG.TRUST_SCORE_THRESHOLD
    );
  }

  /**
   * Create a validation for an order
   * Called automatically during order creation if validation is required
   */
  async createValidation(orderId: number, itemId: number, reason: string) {
    return this.prisma.validation.create({
      data: {
        orderId,
        itemId,
        reason,
        status: ValidationStatus.PENDING,
      },
    });
  }

  /**
   * Get pending validations (for validators)
   * GUARD: Only VALIDATOR or ADMIN roles
   */
  async getPendingValidations(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (
      !user ||
      (user.role !== Role.VALIDATOR &&
        user.role !== Role.ADMIN &&
        user.role !== Role.SUPER_ADMIN)
    ) {
      throw new ForbiddenException(
        "Only validators can view pending validations",
      );
    }

    return this.prisma.validation.findMany({
      where: {
        status: ValidationStatus.PENDING,
      },
      include: {
        order: {
          include: {
            renter: {
              select: {
                id: true,
                name: true,
                email: true,
                trustScore: true,
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
                trustScore: true,
              },
            },
          },
        },
        item: {
          select: {
            id: true,
            title: true,
            category: true,
            condition: true,
            sellPrice: true,
            rentPricePerDay: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Approve a validation
   * GUARD: Only VALIDATOR or ADMIN roles
   * EFFECT: Allows order to proceed
   */
  async approveValidation(
    validationId: number,
    validatorId: number,
    notes?: string,
  ) {
    const validator = await this.prisma.user.findUnique({
      where: { id: validatorId },
    });

    if (
      !validator ||
      (validator.role !== Role.VALIDATOR &&
        validator.role !== Role.ADMIN &&
        validator.role !== Role.SUPER_ADMIN)
    ) {
      throw new ForbiddenException("Only validators can approve validations");
    }

    const validation = await this.prisma.validation.findUnique({
      where: { id: validationId },
      include: { order: true },
    });

    if (!validation) {
      throw new NotFoundException("Validation not found");
    }

    if (validation.status !== ValidationStatus.PENDING) {
      throw new BadRequestException("Validation already processed");
    }

    // Update validation
    const updated = await this.prisma.validation.update({
      where: { id: validationId },
      data: {
        status: ValidationStatus.APPROVED,
        validatorId,
        notes,
        approvedAt: new Date(),
      },
    });

    // Update order status to move forward
    await this.prisma.order.update({
      where: { id: validation.orderId },
      data: {
        status: "APPROVED", // Move from PENDING_VALIDATION to APPROVED
      },
    });

    // AUDIT: Log validation approval (CRITICAL for compliance)
    await this.audit.log(
      "VALIDATION",
      validationId,
      "APPROVED",
      validatorId,
      { status: ValidationStatus.PENDING },
      { status: ValidationStatus.APPROVED, validatorId, notes },
    );

    return updated;
  }

  /**
   * Reject a validation
   * GUARD: Only VALIDATOR or ADMIN roles
   * EFFECT: Blocks order from proceeding
   */
  async rejectValidation(
    validationId: number,
    validatorId: number,
    notes: string,
  ) {
    const validator = await this.prisma.user.findUnique({
      where: { id: validatorId },
    });

    if (
      !validator ||
      (validator.role !== Role.VALIDATOR &&
        validator.role !== Role.ADMIN &&
        validator.role !== Role.SUPER_ADMIN)
    ) {
      throw new ForbiddenException("Only validators can reject validations");
    }

    const validation = await this.prisma.validation.findUnique({
      where: { id: validationId },
      include: { order: true },
    });

    if (!validation) {
      throw new NotFoundException("Validation not found");
    }

    if (validation.status !== ValidationStatus.PENDING) {
      throw new BadRequestException("Validation already processed");
    }

    if (!notes) {
      throw new BadRequestException("Rejection reason is required");
    }

    // Update validation
    const updated = await this.prisma.validation.update({
      where: { id: validationId },
      data: {
        status: ValidationStatus.REJECTED,
        validatorId,
        notes,
        rejectedAt: new Date(),
      },
    });

    // Cancel the order
    await this.prisma.order.update({
      where: { id: validation.orderId },
      data: {
        status: "CANCELLED",
      },
    });

    // AUDIT: Log validation rejection (CRITICAL for compliance)
    await this.audit.log(
      "VALIDATION",
      validationId,
      "REJECTED",
      validatorId,
      { status: ValidationStatus.PENDING },
      { status: ValidationStatus.REJECTED, validatorId, notes },
    );

    return updated;
  }

  /**
   * Get validation for an order
   */
  async getOrderValidation(orderId: number) {
    return this.prisma.validation.findUnique({
      where: { orderId },
      include: {
        validator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
