import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WardrobeModule } from './wardrobe/wardrobe.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { WearTrackerModule } from './wear-tracker/wear-tracker.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { AuditModule } from './audit/audit.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';
import { AdminModule } from './admin/admin.module';
import { JobsModule } from './jobs/jobs.module';
import { ReviewModule } from './review/review.module';
import { ValidationModule } from './validation/validation.module';
import { DeliveryModule } from './delivery/delivery.module';

import { ActivityModule } from './activity/activity.module';

import { AffinityModule } from './affinity/affinity.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
    ScheduleModule.forRoot(),
    AffinityModule,
    ActivityModule,
        // Rate limiting: 10 requests per minute per IP
        ThrottlerModule.forRoot([{
            ttl: 60000, // 1 minute
            limit: 10, // 10 requests
        }]),
        PrismaModule,
        AuditModule,
        SubscriptionModule,
        PaymentModule,
        AdminModule,
        JobsModule,
        UsersModule,
        AuthModule,
        WardrobeModule,
        MarketplaceModule,
        WearTrackerModule,
        RecommendationModule,
        ReviewModule,
        ValidationModule,
        DeliveryModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
