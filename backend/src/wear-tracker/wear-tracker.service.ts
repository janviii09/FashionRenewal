import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WearTrackerService {
  constructor(private prisma: PrismaService) {}

  async logWear(itemId: number) {
    // 1. Log the wear event
    await this.prisma.wearLog.create({
      data: {
        item: { connect: { id: itemId } },
      },
    });

    // 2. Increment wear count on item
    await this.prisma.wardrobeItem.update({
      where: { id: itemId },
      data: { wearCount: { increment: 1 } },
    });

    return { message: "Wear logged successfully" };
  }

  async getWearFrequency(itemId: number) {
    const logs = await this.prisma.wearLog.findMany({
      where: { itemId },
      orderBy: { wornDate: "asc" },
    });
    // Simple frequency calculation: wears per month
    // In real app: more complex logic
    return { totalWears: logs.length, history: logs };
  }
}
