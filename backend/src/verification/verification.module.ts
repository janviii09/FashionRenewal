import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { VerificationController } from './verification.controller';
import { PhoneVerificationService } from './services/phone-verification.service';
import { TrustedLenderService } from './services/trusted-lender.service';
import { SmsProvider } from './services/sms.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        CacheModule.register({
            ttl: 300, // 5 minutes default
            max: 100, // max items in cache
        }),
    ],
    controllers: [VerificationController],
    providers: [
        PhoneVerificationService,
        TrustedLenderService,
        SmsProvider,
    ],
    exports: [PhoneVerificationService, TrustedLenderService],
})
export class VerificationModule { }
