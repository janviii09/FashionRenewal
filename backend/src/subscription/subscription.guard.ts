import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { OrderType } from '@prisma/client';

@Injectable()
export class SubscriptionGuard implements CanActivate {
    constructor(private subscriptionService: SubscriptionService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        const orderType: OrderType = request.body?.type;

        if (!userId) {
            throw new ForbiddenException('User not authenticated');
        }

        // Only enforce for RENT and SWAP
        if (orderType === OrderType.RENT || orderType === OrderType.SWAP) {
            const action = orderType === OrderType.RENT ? 'RENT' : 'SWAP';
            const check = await this.subscriptionService.checkUsage(userId, action);

            if (!check.allowed) {
                throw new ForbiddenException(
                    `Subscription limit exceeded: ${check.reason}`,
                );
            }

            // Increment usage after successful check
            await this.subscriptionService.incrementUsage(userId, action);
        }

        return true;
    }
}
