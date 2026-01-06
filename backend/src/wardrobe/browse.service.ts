import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WardrobeItem } from "@prisma/client";
import { getMarketplaceExclusionFilter } from "../common/utils/marketplace-exclusion.util";

export interface BrowsePreviewResponse {
  featured: WardrobeItem[];
  trending: WardrobeItem[];
  mostRented: WardrobeItem[];
  newlyAdded: WardrobeItem[];
  meta: {
    totalMarketplaceItems: number;
    responseTime: string;
  };
}

@Injectable()
export class BrowseService {
  private readonly logger = new Logger(BrowseService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get browse preview - exactly 16 items across 4 sections
   * Optimized for fast loading and curated experience
   */
  async getBrowsePreview(userId?: number): Promise<BrowsePreviewResponse> {
    const startTime = Date.now();

    try {
      // Fetch all sections in parallel for performance
      const [featured, trending, mostRented, newlyAdded, total] =
        await Promise.all([
          this.getFeaturedItems(4, userId),
          this.getTrendingItems(4, userId),
          this.getMostRentedItems(4, userId),
          this.getNewlyAddedItems(4, userId),
          this.getTotalMarketplaceCount(userId),
        ]);

      const responseTime = Date.now() - startTime;

      return {
        featured,
        trending,
        mostRented,
        newlyAdded,
        meta: {
          totalMarketplaceItems: total,
          responseTime: `${responseTime}ms`,
        },
      };
    } catch (error) {
      this.logger.error("Error fetching browse preview:", error);
      throw error;
    }
  }

  /**
   * Featured Items: High quality + popular items
   * Criteria: viewCount >= 10 (quality threshold)
   */
  private async getFeaturedItems(
    limit: number,
    userId?: number,
  ): Promise<WardrobeItem[]> {
    return this.prisma.wardrobeItem.findMany({
      where: {
        ...getMarketplaceExclusionFilter(userId),
        availability: {
          in: [
            "AVAILABLE_FOR_RENT",
            "AVAILABLE_FOR_SALE",
            "AVAILABLE_FOR_SWAP",
          ],
        },
        deletedAt: null,
        viewCount: { gte: 5 }, // Quality threshold
      },
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  }

  /**
   * Trending Items: Based on computed trending score
   * Score updated hourly by AffinityService cron job
   */
  private async getTrendingItems(
    limit: number,
    userId?: number,
  ): Promise<WardrobeItem[]> {
    return this.prisma.wardrobeItem.findMany({
      where: {
        ...getMarketplaceExclusionFilter(userId),
        availability: {
          in: [
            "AVAILABLE_FOR_RENT",
            "AVAILABLE_FOR_SALE",
            "AVAILABLE_FOR_SWAP",
          ],
        },
        deletedAt: null,
        trendingScore: { gt: 0 }, // Only items with activity
      },
      orderBy: { trendingScore: "desc" },
      take: limit,
    });
  }

  /**
   * Most Rented Items: Popular rental items
   */
  private async getMostRentedItems(
    limit: number,
    userId?: number,
  ): Promise<WardrobeItem[]> {
    return this.prisma.wardrobeItem.findMany({
      where: {
        ...getMarketplaceExclusionFilter(userId),
        availability: {
          in: [
            "AVAILABLE_FOR_RENT",
            "AVAILABLE_FOR_SALE",
            "AVAILABLE_FOR_SWAP",
          ],
        },
        deletedAt: null,
        rentalCount: { gt: 0 }, // Only items that have been rented
      },
      orderBy: [{ rentalCount: "desc" }, { viewCount: "desc" }],
      take: limit,
    });
  }

  /**
   * Newly Added Items: Latest additions to marketplace
   */
  private async getNewlyAddedItems(
    limit: number,
    userId?: number,
  ): Promise<WardrobeItem[]> {
    return this.prisma.wardrobeItem.findMany({
      where: {
        ...getMarketplaceExclusionFilter(userId),
        availability: {
          in: [
            "AVAILABLE_FOR_RENT",
            "AVAILABLE_FOR_SALE",
            "AVAILABLE_FOR_SWAP",
          ],
        },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get total marketplace item count
   */
  private async getTotalMarketplaceCount(userId?: number): Promise<number> {
    return this.prisma.wardrobeItem.count({
      where: {
        ...getMarketplaceExclusionFilter(userId),
        availability: {
          in: [
            "AVAILABLE_FOR_RENT",
            "AVAILABLE_FOR_SALE",
            "AVAILABLE_FOR_SWAP",
          ],
        },
        deletedAt: null,
      },
    });
  }
}
