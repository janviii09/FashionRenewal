import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    /**
     * Log an action to the immutable audit trail
     */
    async log(
        entityType: string,
        entityId: number,
        action: string,
        userId?: number,
        oldValue?: any,
        newValue?: any,
    ): Promise<void> {
        await this.prisma.auditLog.create({
            data: {
                entityType,
                entityId,
                action,
                userId,
                oldValue: oldValue ? JSON.stringify(oldValue) : null,
                newValue: newValue ? JSON.stringify(newValue) : null,
            },
        });
    }

    /**
     * Get audit trail for a specific entity
     */
    async getAuditTrail(entityType: string, entityId: number) {
        return this.prisma.auditLog.findMany({
            where: {
                entityType,
                entityId,
            },
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
}
