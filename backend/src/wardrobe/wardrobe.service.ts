import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardrobeItem, ItemAvailability, Prisma } from '@prisma/client';

interface CreateItemDto {
    title: string;
    description?: string;
    category: string;
    brand?: string;
    size?: string;
    condition: string;
    images?: string[];
    // Availability is optional - defaults to PERSONAL_ONLY
    availability?: ItemAvailability;
    rentPricePerDay?: number;
    sellPrice?: number;
}

interface UpdateItemDto {
    title?: string;
    description?: string;
    category?: string;
    brand?: string;
    size?: string;
    condition?: string;
    images?: string[];
    availability?: ItemAvailability;
    rentPricePerDay?: number;
    sellPrice?: number;
}

@Injectable()
export class WardrobeService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a wardrobe item
     * RULE: Defaults to PERSONAL_ONLY
     * RULE: No subscription required
     */
    async createItem(userId: number, data: CreateItemDto): Promise<WardrobeItem> {
        // Validate pricing based on availability
        if (data.availability === ItemAvailability.AVAILABLE_FOR_RENT && !data.rentPricePerDay) {
            throw new BadRequestException('Rent price required for rentable items');
        }
        if (data.availability === ItemAvailability.AVAILABLE_FOR_SALE && !data.sellPrice) {
            throw new BadRequestException('Sell price required for items for sale');
        }

        return this.prisma.wardrobeItem.create({
            data: {
                ownerId: userId,
                title: data.title,
                description: data.description,
                category: data.category,
                brand: data.brand,
                size: data.size,
                condition: data.condition as any, // Cast to enum
                images: data.images || [],
                rentPricePerDay: data.rentPricePerDay,
                sellPrice: data.sellPrice,
                // CRITICAL: Default to PERSONAL_ONLY if not specified
                availability: data.availability || ItemAvailability.PERSONAL_ONLY,
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
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { brand: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.wardrobeItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
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
    }): Promise<WardrobeItem[]> {
        const where: Prisma.WardrobeItemWhereInput = {
            // CRITICAL: Exclude PERSONAL_ONLY items
            availability: {
                not: ItemAvailability.PERSONAL_ONLY,
            },
            deletedAt: null,
        };

        if (filters?.availability && filters.availability !== ItemAvailability.PERSONAL_ONLY) {
            where.availability = filters.availability;
        }

        if (filters?.category) {
            where.category = filters.category;
        }

        if (filters?.minPrice || filters?.maxPrice) {
            where.OR = [];
            if (filters.minPrice) {
                where.OR.push(
                    { rentPricePerDay: { gte: filters.minPrice } },
                    { sellPrice: { gte: filters.minPrice } },
                );
            }
            if (filters.maxPrice) {
                where.OR.push(
                    { rentPricePerDay: { lte: filters.maxPrice } },
                    { sellPrice: { lte: filters.maxPrice } },
                );
            }
        }

        if (filters?.search) {
            where.AND = [
                {
                    OR: [
                        { title: { contains: filters.search, mode: 'insensitive' } },
                        { description: { contains: filters.search, mode: 'insensitive' } },
                        { brand: { contains: filters.search, mode: 'insensitive' } },
                    ],
                },
            ];
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
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get a single item
     * RULE: Personal items only visible to owner
     */
    async getItem(itemId: number, requestingUserId?: number): Promise<WardrobeItem> {
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
            throw new NotFoundException('Item not found');
        }

        // GUARD: PERSONAL_ONLY items only visible to owner
        if (item.availability === ItemAvailability.PERSONAL_ONLY) {
            if (!requestingUserId || item.ownerId !== requestingUserId) {
                throw new ForbiddenException('This item is private');
            }
        }

        return item;
    }

    /**
     * Update a wardrobe item
     * RULE: Only owner can update
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
            throw new NotFoundException('Item not found');
        }

        // GUARD: Only owner can update
        if (item.ownerId !== userId) {
            throw new ForbiddenException('You can only update your own items');
        }

        // Validate pricing if availability changes
        if (data.availability === ItemAvailability.AVAILABLE_FOR_RENT) {
            if (!data.rentPricePerDay && !item.rentPricePerDay) {
                throw new BadRequestException('Rent price required for rentable items');
            }
        }
        if (data.availability === ItemAvailability.AVAILABLE_FOR_SALE) {
            if (!data.sellPrice && !item.sellPrice) {
                throw new BadRequestException('Sell price required for items for sale');
            }
        }

        return this.prisma.wardrobeItem.update({
            where: { id: itemId },
            data: data as any, // Cast to bypass type issues
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
            throw new NotFoundException('Item not found');
        }

        // GUARD: Only owner can delete
        if (item.ownerId !== userId) {
            throw new ForbiddenException('You can only delete your own items');
        }

        // Soft delete
        await this.prisma.wardrobeItem.update({
            where: { id: itemId },
            data: { deletedAt: new Date() },
        });
    }
}
