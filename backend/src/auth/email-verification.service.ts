import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as crypto from "crypto";

@Injectable()
export class EmailVerificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique email verification token
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Send verification email (placeholder - integrate with email service)
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`
      ========================================
      EMAIL VERIFICATION
      ========================================
      To: ${email}
      Subject: Verify your FashionRenewal account
      
      Click the link below to verify your email:
      ${verificationLink}
      
      Or use this token: ${token}
      ========================================
    `);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(
    token: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired verification token",
      };
    }

    if (user.isEmailVerified) {
      return { success: false, message: "Email already verified" };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { success: true, message: "Email verified successfully!" };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.isEmailVerified) {
      return { success: false, message: "Email already verified" };
    }

    const newToken = this.generateVerificationToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: newToken },
    });

    await this.sendVerificationEmail(email, newToken);

    return { success: true, message: "Verification email sent!" };
  }
}
