import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PhoneVerificationService } from "./services/phone-verification.service";
import { TrustedLenderService } from "./services/trusted-lender.service";
import {
  SendPhoneOTPDto,
  VerifyPhoneOTPDto,
} from "./dto/phone-verification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Throttle } from "@nestjs/throttler";
import { PrismaService } from "../prisma/prisma.service";

@Controller("verification")
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(
    private phoneVerificationService: PhoneVerificationService,
    private trustedLenderService: TrustedLenderService,
    private prisma: PrismaService,
  ) {}

  /**
   * POST /verification/phone/send-otp
   * Send OTP to phone number
   * Rate limit: 3 per hour
   */
  @Post("phone/send-otp")
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  @HttpCode(HttpStatus.OK)
  async sendPhoneOTP(@Request() req, @Body() dto: SendPhoneOTPDto) {
    const userId = req.user.userId;
    return this.phoneVerificationService.sendOTP(userId, dto.phoneNumber);
  }

  /**
   * POST /verification/phone/verify-otp
   * Verify OTP
   */
  @Post("phone/verify-otp")
  @HttpCode(HttpStatus.OK)
  async verifyPhoneOTP(@Request() req, @Body() dto: VerifyPhoneOTPDto) {
    const userId = req.user.userId;
    return this.phoneVerificationService.verifyOTP(
      userId,
      dto.phoneNumber,
      dto.otp,
    );
  }

  /**
   * GET /verification/status
   * Get user's verification status
   */
  @Get("status")
  async getVerificationStatus(@Request() req) {
    const userId = req.user.userId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isEmailVerified: true,
        phoneVerified: true,
        idVerified: true,
        trustedLender: true,
      },
    });

    const verifications = await this.prisma.userVerification.findMany({
      where: { userId },
      select: {
        type: true,
        status: true,
        verifiedAt: true,
        expiresAt: true,
      },
    });

    const trustedLenderMetrics =
      await this.trustedLenderService.getMetrics(userId);

    return {
      ...user,
      verifications,
      trustedLenderMetrics,
    };
  }

  /**
   * POST /verification/trusted-lender/calculate
   * Manually trigger trusted lender calculation
   */
  @Post("trusted-lender/calculate")
  @HttpCode(HttpStatus.OK)
  async calculateTrustedLender(@Request() req) {
    const userId = req.user.userId;
    const eligible =
      await this.trustedLenderService.calculateEligibility(userId);

    return {
      eligible,
      message: eligible
        ? "Congratulations! You are now a Trusted Lender."
        : "You do not meet the criteria for Trusted Lender badge yet.",
    };
  }
}
