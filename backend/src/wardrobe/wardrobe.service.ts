import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WardrobeItem, ItemAvailability, Prisma } from "@prisma/client";
import { CreateItemDto } from "./dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";
import { getMarketplaceExclusionFilter } from "../common/utils/marketplace-exclusion.util";

@Injectable()
export class WardrobeService {
  private readonly logger = new Logger(WardrobeService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Validate image requirements based on availability type
   * RULE: 4+ images required for RENT, SELL, SWAP
   * RULE: PERSONAL_ONLY can have any number (0+)
   */
  private validateImageRequirement(
    availability: ItemAvailability,
    images?: string[],
  ): void {
    const marketplaceTypes: ItemAvailability[] = [
      ItemAvailability.AVAILABLE_FOR_RENT,
      ItemAvailability.AVAILABLE_FOR_SALE,
      ItemAvailability.AVAILABLE_FOR_SWAP,
    ];

    const requiresMinImages = marketplaceTypes.includes(availability);

    if (requiresMinImages) {
      if (!images || images.length < 4) {
        throw new BadRequestException(
          "At least 4 images are required for rent, sell, or exchange listings",
        );
      }
    }
  }

  /**
   * Create a wardrobe item
   * RULE: Defaults to PERSONAL_ONLY
   * RULE: No subscription required
   * RULE: 4+ images for marketplace listings
   */
  async createItem(userId: number, data: CreateItemDto): Promise<WardrobeItem> {
    // Determine final availability (default to PERSONAL_ONLY)
    const availability = data.availability || ItemAvailability.PERSONAL_ONLY;

    // VALIDATE: 4-image requirement for marketplace listings
    this.validateImageRequirement(availability, data.images);

    // Validate pricing based on availability
    if (
      availability === ItemAvailability.AVAILABLE_FOR_RENT &&
      !data.rentPricePerDay
    ) {
      throw new BadRequestException("Rent price required for rentable items");
    }
    if (
      availability === ItemAvailability.AVAILABLE_FOR_SALE &&
      !data.sellPrice
    ) {
      throw new BadRequestException("Sell price required for items for sale");
    }

    return this.prisma.wardrobeItem.create({
      data: {
        ownerId: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        brand: data.brand,
        size: data.size,
        condition: data.condition,
        images: data.images || [],
        rentPricePerDay: data.rentPricePerDay,
        sellPrice: data.sellPrice,
        // CRITICAL: Default to PERSONAL_ONLY if not specified
        availability,
      },
    });
  }

  /**
   * Get user's personal wardrobe
   * RULE: User can only see their own wardrobe
   */
  async getUserWardrobe(
    userId: number,
    filters?: {
      availability?: ItemAvailability;
      category?: string;
      search?: string;
    },
  ): Promise<WardrobeItem[]> {
    const where: Prisma.WardrobeItemWhereInput = {
      ownerId: userId,
      deletedAt: null,
    };

    if (filters?.availability) {
      where.availability = filters.availability;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { brand: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return this.prisma.wardrobeItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get marketplace items (public)
   * RULE: NEVER expose PERSONAL_ONLY items
   */
  async getMarketplaceItems(filters?: {
    availability?: ItemAvailability;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    userId?: number;
  }): Promise<WardrobeItem[]> {
    // Base filter: Exclude PERSONAL_ONLY items
    const baseWhere: Prisma.WardrobeItemWhereInput = {
      availability: {
        not: ItemAvailability.PERSONAL_ONLY,
      },
      deletedAt: null,
    };

    // Combine with exclusion filter (own items + interacted items)
    const exclusionFilter = getMarketplaceExclusionFilter(filters?.userId);

    const where: Prisma.WardrobeItemWhereInput = {
      AND: [baseWhere, exclusionFilter],
    };

    if (
      filters?.availability &&
      filters.availability !== ItemAvailability.PERSONAL_ONLY
    ) {
      where.availability = filters.availability;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      const priceOrConditions: Prisma.WardrobeItemWhereInput[] = [];

      if (filters.minPrice) {
        priceOrConditions.push(
          { rentPricePerDay: { gte: filters.minPrice } },
          { sellPrice: { gte: filters.minPrice } },
        );
      }
      if (filters.maxPrice) {
        priceOrConditions.push(
          { rentPricePerDay: { lte: filters.maxPrice } },
          { sellPrice: { lte: filters.maxPrice } },
        );
      }
      // Add price condition as a separate AND block or inside the main AND
      if (Array.isArray(where.AND)) {
        where.AND.push({ OR: priceOrConditions });
      }
    }

    if (filters?.search) {
      if (Array.isArray(where.AND)) {
        where.AND.push({
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
            { brand: { contains: filters.search, mode: "insensitive" } },
          ],
        });
      }
    }

    return this.prisma.wardrobeItem.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            trustScore: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get a single item
   * RULE: Personal items only visible to owner
   */
  async getItem(
    itemId: number,
    requestingUserId?: number,
  ): Promise<WardrobeItem> {
    // Defensive guard: prevent NaN or invalid IDs from reaching Prisma
    if (!itemId || isNaN(itemId) || itemId <= 0) {
      throw new NotFoundException("Invalid item ID");
    }

    const item = await this.prisma.wardrobeItem.findUnique({
      where: { id: itemId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            trustScore: true,
            location: true,
          },
        },
      },
    });

    if (!item || item.deletedAt) {
      throw new NotFoundException("Item not found");
    }

    // GUARD: PERSONAL_ONLY items only visible to owner
    if (item.availability === ItemAvailability.PERSONAL_ONLY) {
      if (!requestingUserId || item.ownerId !== requestingUserId) {
        throw new ForbiddenException("This item is private");
      }
    }

    return item;
  }

  /**
   * Update a wardrobe item
   * RULE: Only owner can update
   * RULE: Must re-validate images if changing to marketplace availability
   */
  async updateItem(
    itemId: number,
    userId: number,
    data: UpdateItemDto,
  ): Promise<WardrobeItem> {
    const item = await this.prisma.wardrobeItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.deletedAt) {
      throw new NotFoundException("Item not found");
    }

    // GUARD: Only owner can update
    if (item.ownerId !== userId) {
      throw new ForbiddenException("You can only update your own items");
    }

    // If availability is being changed, validate images
    if (data.availability) {
      const finalImages = data.images !== undefined ? data.images : item.images;
      this.validateImageRequirement(data.availability, finalImages);
    }

    // Validate pricing if availability changes
    if (data.availability === ItemAvailability.AVAILABLE_FOR_RENT) {
      if (!data.rentPricePerDay && !item.rentPricePerDay) {
        throw new BadRequestException("Rent price required for rentable items");
      }
    }
    if (data.availability === ItemAvailability.AVAILABLE_FOR_SALE) {
      if (!data.sellPrice && !item.sellPrice) {
        throw new BadRequestException("Sell price required for items for sale");
      }
    }

    return this.prisma.wardrobeItem.update({
      where: { id: itemId },
      data: data as Prisma.WardrobeItemUpdateInput,
    });
  }

  /**
   * Delete (soft delete) a wardrobe item
   * RULE: Only owner can delete
   */
  async deleteItem(itemId: number, userId: number): Promise<void> {
    const item = await this.prisma.wardrobeItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.deletedAt) {
      throw new NotFoundException("Item not found");
    }

    // GUARD: Only owner can delete
    if (item.ownerId !== userId) {
      throw new ForbiddenException("You can only delete your own items");
    }

    // Soft delete
    await this.prisma.wardrobeItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get unique categories from all marketplace items
   */
  async getUniqueCategories(): Promise<string[]> {
    const items = await this.prisma.wardrobeItem.findMany({
      where: {
        availability: {
          in: [
            "AVAILABLE_FOR_RENT",
            "AVAILABLE_FOR_SALE",
            "AVAILABLE_FOR_SWAP",
          ],
        },
      },
      select: {
        category: true,
      },
    });

    // Extract unique categories
    const categories = [
      ...new Set(items.map((item) => item.category).filter(Boolean)),
    ];
    return categories.sort();
  }
}
