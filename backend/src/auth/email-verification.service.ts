import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { Resend } from 'resend';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private resend: Resend | null = null;

  constructor(private prisma: PrismaService) {
    // Initialize Resend if API key is provided
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.logger.log('Resend initialized successfully');
    } else {
      this.logger.warn('RESEND_API_KEY not found - emails will be logged to console only');
    }
  }

  /**
   * Generate a unique email verification token
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send verification email via Resend
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    // If Resend is not configured, log to console (development fallback)
    if (!this.resend || !process.env.FROM_EMAIL) {
      this.logger.warn('Email service not configured - logging to console');
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
      return;
    }

    // Send real email via Resend
    try {
      await this.resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Verify your FashionRenewal account',
        html: this.getEmailTemplate(verificationLink, email),
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * HTML email template
   */
  private getEmailTemplate(verificationLink: string, email: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">FashionRenewal</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Welcome to FashionRenewal!</h2>
                    <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                      Thank you for signing up. We're excited to have you join our sustainable fashion community!
                    </p>
                    <p style="margin: 0 0 30px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                      To get started, please verify your email address by clicking the button below:
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${verificationLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                      ${verificationLink}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 10px; color: #6a6a6a; font-size: 14px; line-height: 1.6;">
                      This email was sent to <strong>${email}</strong>
                    </p>
                    <p style="margin: 0; color: #9a9a9a; font-size: 12px; line-height: 1.6;">
                      If you didn't create an account with FashionRenewal, you can safely ignore this email.
                    </p>
                    <p style="margin: 20px 0 0; color: #9a9a9a; font-size: 12px;">
                      © ${new Date().getFullYear()} FashionRenewal. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
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
        message: 'Invalid or expired verification token',
      };
    }

    if (user.isEmailVerified) {
      return { success: false, message: 'Email already verified' };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    return { success: true, message: 'Email verified successfully!' };
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
      return { success: false, message: 'User not found' };
    }

    if (user.isEmailVerified) {
      return { success: false, message: 'Email already verified' };
    }

    const newToken = this.generateVerificationToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: newToken },
    });

    await this.sendVerificationEmail(email, newToken);

    return { success: true, message: 'Verification email sent!' };
  }
}
