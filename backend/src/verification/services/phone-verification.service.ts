import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "../../prisma/prisma.service";
import { SmsProvider } from "./sms.provider";
import { VerificationType, VerificationStatus } from "@prisma/client";

@Injectable()
export class PhoneVerificationService {
  constructor(
    private prisma: PrismaService,
    private smsProvider: SmsProvider,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Send OTP to phone number
   * - Rate limited: max 3 attempts per hour
   * - OTP expires in 5 minutes
   * - Stores OTP in Redis cache
   */
  async sendOTP(
    userId: number,
    phoneNumber: string,
  ): Promise<{ success: boolean; expiresIn: number }> {
    // 1. Check rate limiting (max 3 OTP requests per hour)
    const rateLimitKey = `otp:ratelimit:${userId}`;
    const attempts = (await this.cacheManager.get<number>(rateLimitKey)) || 0;

    if (attempts >= 3) {
      throw new HttpException(
        "Maximum OTP requests exceeded. Please try again in 1 hour.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. Check if phone number already verified by another user
    const existingVerification = await this.prisma.userVerification.findFirst({
      where: {
        type: VerificationType.PHONE,
        status: VerificationStatus.VERIFIED,
        verificationData: {
          path: ["phoneNumber"],
          equals: phoneNumber,
        },
        userId: { not: userId },
      },
    });

    if (existingVerification) {
      throw new BadRequestException(
        "This phone number is already verified by another account",
      );
    }

    // 3. Generate 6-digit OTP
    const otp = this.generateOTP();

    // 4. Store OTP in cache (5 minutes expiry)
    const otpKey = `otp:${userId}:${phoneNumber}`;
    await this.cacheManager.set(otpKey, otp, 300000); // 5 minutes in ms

    // 5. Send OTP via SMS
    const sent = await this.smsProvider.sendOTP(phoneNumber, otp);

    if (!sent) {
      throw new BadRequestException("Failed to send OTP. Please try again.");
    }

    // 6. Increment rate limit counter (1 hour expiry)
    await this.cacheManager.set(rateLimitKey, attempts + 1, 3600000); // 1 hour

    // 7. Log attempt
    const verification = await this.getOrCreateVerification(
      userId,
      VerificationType.PHONE,
    );

    await this.prisma.verificationAttempt.create({
      data: {
        verificationId: verification.id,
        attemptType: "OTP_SENT",
        success: true,
        metadata: {
          phoneNumber,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return { success: true, expiresIn: 300 };
  }

  /**
   * Verify OTP
   * - Max 3 verification attempts per OTP
   * - Marks phone as verified on success
   */
  async verifyOTP(
    userId: number,
    phoneNumber: string,
    otp: string,
  ): Promise<{ verified: boolean }> {
    // 1. Get OTP from cache
    const otpKey = `otp:${userId}:${phoneNumber}`;
    const storedOTP = await this.cacheManager.get<string>(otpKey);

    if (!storedOTP) {
      throw new UnauthorizedException(
        "OTP expired or invalid. Please request a new one.",
      );
    }

    // 2. Check verification attempts (max 3)
    const attemptsKey = `otp:attempts:${userId}:${phoneNumber}`;
    const attempts = (await this.cacheManager.get<number>(attemptsKey)) || 0;

    if (attempts >= 3) {
      // Clear OTP to prevent further attempts
      await this.cacheManager.del(otpKey);
      throw new HttpException(
        "Maximum verification attempts exceeded. Please request a new OTP.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 3. Verify OTP
    if (storedOTP !== otp) {
      // Increment attempts
      await this.cacheManager.set(attemptsKey, attempts + 1, 300000);

      // Log failed attempt
      const verification = await this.getOrCreateVerification(
        userId,
        VerificationType.PHONE,
      );

      await this.prisma.verificationAttempt.create({
        data: {
          verificationId: verification.id,
          attemptType: "OTP_VERIFIED",
          success: false,
          failureReason: "Invalid OTP",
        },
      });

      throw new UnauthorizedException("Invalid OTP. Please try again.");
    }

    // 4. OTP is valid - mark as verified
    await this.markPhoneAsVerified(userId, phoneNumber);

    // 5. Clear cache
    await this.cacheManager.del(otpKey);
    await this.cacheManager.del(attemptsKey);

    return { verified: true };
  }

  /**
   * Mark phone as verified
   */
  private async markPhoneAsVerified(
    userId: number,
    phoneNumber: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Update or create verification record
      await tx.userVerification.upsert({
        where: {
          userId_type: {
            userId,
            type: VerificationType.PHONE,
          },
        },
        create: {
          userId,
          type: VerificationType.PHONE,
          status: VerificationStatus.VERIFIED,
          verifiedAt: new Date(),
          verificationData: { phoneNumber },
        },
        update: {
          status: VerificationStatus.VERIFIED,
          verifiedAt: new Date(),
          verificationData: { phoneNumber },
        },
      });

      // Update user denormalized field
      await tx.user.update({
        where: { id: userId },
        data: { phoneVerified: true },
      });

      // Log successful attempt
      const verification = await tx.userVerification.findUnique({
        where: {
          userId_type: {
            userId,
            type: VerificationType.PHONE,
          },
        },
      });

      await tx.verificationAttempt.create({
        data: {
          verificationId: verification.id,
          attemptType: "OTP_VERIFIED",
          success: true,
        },
      });
    });
  }

  /**
   * Get or create verification record
   */
  private async getOrCreateVerification(
    userId: number,
    type: VerificationType,
  ) {
    return this.prisma.userVerification.upsert({
      where: {
        userId_type: { userId, type },
      },
      create: {
        userId,
        type,
        status: VerificationStatus.PENDING,
      },
      update: {},
    });
  }

  /**
   * Generate 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
