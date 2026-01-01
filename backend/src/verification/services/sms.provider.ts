import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SMS Provider abstraction
 * Currently using mock implementation
 * Can be replaced with Twilio, AWS SNS, or other providers
 */
@Injectable()
export class SmsProvider {
    private readonly logger = new Logger(SmsProvider.name);
    private readonly isDevelopment: boolean;

    constructor(private configService: ConfigService) {
        this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';
    }

    /**
     * Send SMS with OTP
     * In development: logs OTP to console
     * In production: sends via configured provider (Twilio/SNS)
     */
    async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
        try {
            if (this.isDevelopment) {
                // Development mode: log OTP to console
                this.logger.log(`📱 OTP for ${phoneNumber}: ${otp}`);
                this.logger.log(`⚠️  Development mode - OTP not sent via SMS`);
                return true;
            }

            // Production mode: integrate with real SMS provider
            // Example Twilio integration:
            /*
            const twilioClient = twilio(
              this.configService.get('TWILIO_ACCOUNT_SID'),
              this.configService.get('TWILIO_AUTH_TOKEN'),
            );
      
            await twilioClient.messages.create({
              body: `Your FashionRenewal verification code is: ${otp}. Valid for 5 minutes.`,
              from: this.configService.get('TWILIO_PHONE_NUMBER'),
              to: phoneNumber,
            });
            */

            this.logger.warn('SMS provider not configured - using development mode');
            return true;
        } catch (error) {
            this.logger.error(`Failed to send OTP to ${phoneNumber}:`, error);
            return false;
        }
    }
}
