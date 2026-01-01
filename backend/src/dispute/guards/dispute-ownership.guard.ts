import { Injectable, CanActivate, ExecutionContext, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard to ensure user has access to dispute
 * User must be either:
 * - The person who raised the dispute
 * - The person the dispute is against
 * - An admin
 */
@Injectable()
export class DisputeOwnershipGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        const userRole = request.user?.role;
        const disputeId = parseInt(request.params.id);

        if (!userId) {
            throw new ForbiddenException('Authentication required');
        }

        // Admins can access all disputes
        if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
            return true;
        }

        const dispute = await this.prisma.dispute.findUnique({
            where: { id: disputeId },
            select: {
                raisedById: true,
                againstId: true,
            },
        });

        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        // User must be either the raiser or the counterparty
        const hasAccess = dispute.raisedById === userId || dispute.againstId === userId;

        if (!hasAccess) {
            throw new ForbiddenException('You do not have access to this dispute');
        }

        return true;
    }
}
