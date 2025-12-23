import { Module, Global } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionGuard } from './subscription.guard';

@Global()
@Module({
    providers: [SubscriptionService, SubscriptionGuard],
    exports: [SubscriptionService, SubscriptionGuard],
})
export class SubscriptionModule { }
