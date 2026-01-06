import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers["idempotency-key"];

    if (!idempotencyKey) {
      // Idempotency key is optional - allow request to proceed
      return true;
    }

    // Check if this key has been used before
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        idempotencyKey,
        deletedAt: null, // Only check non-deleted orders
      },
      include: {
        item: true,
        renter: true,
        owner: true,
      },
    });

    if (existingOrder) {
      // Return the existing order instead of creating a duplicate
      // Store it in request for controller to return
      request.idempotentResponse = existingOrder;
      throw new ConflictException({
        message: "Request already processed",
        existingOrder,
      });
    }

    // Store key in request for service to use
    request.idempotencyKey = idempotencyKey;

    return true;
  }
}
