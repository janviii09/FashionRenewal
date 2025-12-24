import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ItemLifecycleService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditService,
    ) { }

    /**
     * Record condition snapshot before/after rental
     */
    async recordConditionSnapshot(
        itemId: number,
        orderId: number,
        conditionBefore: string,
        conditionAfter: string,
        reportedBy: number,
        damageReport?: string,
    ) {
        const history = await this.prisma.itemConditionHistory.create({
            data: {
                itemId,
                orderId,
                conditionBefore,
                conditionAfter,
                damageReport,
                reportedBy,
            },
        });

        // Audit log
        await this.audit.log(
            'ITEM_CONDITION',
            itemId,
            'CONDITION_CHANGE',
            reportedBy,
            { condition: conditionBefore },
            { condition: conditionAfter, damage: damageReport },
        );

        // Update item's current condition
        await this.prisma.wardrobeItem.update({
            where: { id: itemId },
            data: { condition: conditionAfter as any },
        });

        return history;
    }

    /**
     * Transfer custody of item to another user
     */
    async transferCustody(itemId: number, toUserId: number, orderId?: number) {
        const item = await this.prisma.wardrobeItem.findUnique({
            where: { id: itemId },
        });

        const updated = await this.prisma.wardrobeItem.update({
            where: { id: itemId },
            data: {
                currentHolderId: toUserId,
                custodyStartDate: new Date(),
            },
        });

        // Audit log
        await this.audit.log(
            'ITEM_CUSTODY',
            itemId,
            'CUSTODY_TRANSFER',
            toUserId,
            { holder: item.currentHolderId },
            { holder: toUserId, orderId },
        );

        return updated;
    }

    /**
     * Return custody back to owner
     */
    async returnCustody(itemId: number) {
        const item = await this.prisma.wardrobeItem.findUnique({
            where: { id: itemId },
            include: { owner: true },
        });

        const updated = await this.prisma.wardrobeItem.update({
            where: { id: itemId },
            data: {
                currentHolderId: item.ownerId,
                custodyEndDate: new Date(),
            },
        });

        // Audit log
        await this.audit.log(
            'ITEM_CUSTODY',
            itemId,
            'CUSTODY_RETURNED',
            item.ownerId,
            { holder: item.currentHolderId },
            { holder: item.ownerId },
        );

        return updated;
    }

    /**
     * Report damage on an item
     */
    async reportDamage(
        itemId: number,
        orderId: number,
        damageReport: string,
        reportedBy: number,
    ) {
        const item = await this.prisma.wardrobeItem.findUnique({
            where: { id: itemId },
        });

        return this.recordConditionSnapshot(
            itemId,
            orderId,
            item.condition,
            'DAMAGED',
            reportedBy,
            damageReport,
        );
    }
}
