import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
    imports: [
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
        RecommendationModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
