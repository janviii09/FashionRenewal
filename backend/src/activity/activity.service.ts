import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActivityType } from "@prisma/client";

interface TrackActivityDto {
  eventType: ActivityType;
  itemId?: number;
  category?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);
  private eventBatch: any[] = [];
  private readonly BATCH_SIZE = 10;
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(private prisma: PrismaService) {
    // Flush batch every 5 seconds
    this.startBatchTimer();
  }

  /**
   * Track user activity (async, fire-and-forget)
   */
  async trackActivity(
    userId: number | null,
    sessionId: string | null,
    data: TrackActivityDto,
  ): Promise<void> {
    try {
      const event = {
        userId,
        sessionId,
        eventType: data.eventType,
        itemId: data.itemId,
        category: data.category,
        metadata: data.metadata || {},
        createdAt: new Date(),
      };

      // Add to batch
      this.eventBatch.push(event);

      // If batch is full, flush immediately
      if (this.eventBatch.length >= this.BATCH_SIZE) {
        await this.flushBatch();
      }
    } catch (error) {
      this.logger.error("Error tracking activity:", error);
      // Don't throw - silent fail to not break user experience
    }
  }

  /**
   * Flush batch to database
   */
  private async flushBatch(): Promise<void> {
    if (this.eventBatch.length === 0) return;

    const eventsToInsert = [...this.eventBatch];
    this.eventBatch = [];

    try {
      await this.prisma.userActivity.createMany({
        data: eventsToInsert,
        skipDuplicates: true,
      });

      this.logger.debug(`Flushed ${eventsToInsert.length} activity events`);
    } catch (error) {
      this.logger.error("Error flushing activity batch:", error);
    }
  }

  /**
   * Start batch timer (flush every 5 seconds)
   */
  private startBatchTimer(): void {
    this.batchTimer = setInterval(async () => {
      await this.flushBatch();
    }, 5000);
  }

  /**
   * Get user's recent activities
   */
  async getUserActivities(userId: number, limit: number = 50): Promise<any[]> {
    return this.prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        item: {
          select: {
            id: true,
            title: true,
            category: true,
            images: true,
          },
        },
      },
    });
  }

  /**
   * Track recently viewed items
   */
  async trackRecentlyViewed(
    userId: number | null,
    sessionId: string | null,
    itemId: number,
  ): Promise<void> {
    try {
      if (userId) {
        await this.prisma.recentlyViewed.upsert({
          where: {
            userId_itemId: {
              userId,
              itemId,
            },
          },
          update: {
            viewedAt: new Date(),
          },
          create: {
            userId,
            itemId,
            viewedAt: new Date(),
          },
        });
      } else if (sessionId) {
        await this.prisma.recentlyViewed.upsert({
          where: {
            sessionId_itemId: {
              sessionId,
              itemId,
            },
          },
          update: {
            viewedAt: new Date(),
          },
          create: {
            sessionId,
            itemId,
            viewedAt: new Date(),
          },
        });
      }
    } catch (error) {
      this.logger.error("Error tracking recently viewed:", error);
    }
  }

  /**
   * Get recently viewed items
   */
  async getRecentlyViewed(
    userId: number | null,
    sessionId: string | null,
    limit: number = 12,
  ): Promise<any[]> {
    const where = userId ? { userId } : sessionId ? { sessionId } : {};

    return this.prisma.recentlyViewed.findMany({
      where,
      orderBy: { viewedAt: "desc" },
      take: limit,
      include: {
        item: true,
      },
    });
  }

  /**
   * Cleanup old activities (run as cron job)
   */
  async cleanupOldActivities(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.userActivity.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old activity records`);
    return result.count;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    await this.flushBatch();
  }
}
