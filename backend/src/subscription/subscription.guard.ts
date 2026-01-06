import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";

/**
 * CRITICAL: Subscription guard for marketplace actions
 * Personal wardrobe is ALWAYS free - this guard ONLY applies to marketplace
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const action = request.body?.type; // RENT or SWAP

    if (!userId) {
      throw new ForbiddenException("User not authenticated");
    }

    // Personal wardrobe actions are ALWAYS allowed (no subscription needed)
    // This guard ONLY applies to marketplace rental/swap creation
    if (!action || (action !== "RENT" && action !== "SWAP")) {
      return true; // Allow non-marketplace actions
    }

    // Check subscription usage
    const check = await this.subscriptionService.checkUsage(userId, action);

    if (!check.allowed) {
      throw new ForbiddenException(
        check.reason || "Subscription limit exceeded",
      );
    }

    return true;
  }
}
