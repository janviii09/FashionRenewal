import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, WardrobeItem } from '@prisma/client';

interface DiscoverQuery {
    page?: number;
    limit?: number;
    category?: string;
    availability?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    condition?: string;
    sort?: string;
    search?: string;
}

export interface DiscoverResponse {
    items: WardrobeItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    meta: {
        responseTime: string;
        algorithm: string;
    };
}

@Injectable()
export class DiscoverService {
    private readonly logger = new Logger(DiscoverService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Discover items with server-side pagination, filtering, and sorting
     * Optimized for large datasets (10k+ items)
     */
    async discover(query: DiscoverQuery): Promise<DiscoverResponse> {
        const startTime = Date.now();

        // Validate and normalize parameters
        const page = Math.max(query.page || 1, 1);
        const limit = Math.min(Math.max(query.limit || 24, 1), 100); // Max 100 per page
        const skip = (page - 1) * limit;

        try {
            // Build where clause
            const where = this.buildWhereClause(query);

            // Build orderBy clause
            const orderBy = this.buildOrderBy(query.sort);

            // Execute queries in parallel for performance
            const [items, total] = await Promise.all([
                this.prisma.wardrobeItem.findMany({
                    where,
                    orderBy,
                    skip,
                    take: limit
                }),
                this.prisma.wardrobeItem.count({ where })
            ]);

            const responseTime = Date.now() - startTime;
            const totalPages = Math.ceil(total / limit);

            return {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                meta: {
                    responseTime: `${responseTime}ms`,
                    algorithm: query.sort || 'latest'
                }
            };
        } catch (error) {
            this.logger.error('Error in discover:', error);
            throw error;
        }
    }

    /**
     * Build Prisma where clause from query parameters
     */
    private buildWhereClause(query: DiscoverQuery): Prisma.WardrobeItemWhereInput {
        const where: Prisma.WardrobeItemWhereInput = {
            availability: {
                in: ['AVAILABLE_FOR_RENT', 'AVAILABLE_FOR_SALE', 'AVAILABLE_FOR_SWAP']
            },
            deletedAt: null
        };

        // Category filter (case-insensitive partial match)
        if (query.category) {
            where.category = {
                contains: query.category,
                mode: 'insensitive'
            };
        }

        // Availability filter
        if (query.availability) {
            where.availability = query.availability as any;
        }

        // Size filter
        if (query.size) {
            where.size = query.size;
        }

        // Condition filter
        if (query.condition) {
            where.condition = query.condition as any;
        }

        // Search filter (title, description, brand)
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { brand: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        // Price range filter
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            const priceConditions: any[] = [];

            // Rent price condition
            if (query.minPrice !== undefined || query.maxPrice !== undefined) {
                priceConditions.push({
                    rentPricePerDay: {
                        ...(query.minPrice !== undefined && { gte: query.minPrice }),
                        ...(query.maxPrice !== undefined && { lte: query.maxPrice })
                    }
                });
            }

            // Sell price condition
            if (query.minPrice !== undefined || query.maxPrice !== undefined) {
                priceConditions.push({
                    sellPrice: {
                        ...(query.minPrice !== undefined && { gte: query.minPrice }),
                        ...(query.maxPrice !== undefined && { lte: query.maxPrice })
                    }
                });
            }

            if (priceConditions.length > 0) {
                where.OR = where.OR ? [...where.OR, ...priceConditions] : priceConditions;
            }
        }

        return where;
    }

    /**
     * Build Prisma orderBy clause from sort parameter
     */
    private buildOrderBy(sort?: string): Prisma.WardrobeItemOrderByWithRelationInput | Prisma.WardrobeItemOrderByWithRelationInput[] {
        switch (sort) {
            case 'latest':
                return { createdAt: 'desc' };

            case 'trending':
                return [
                    { trendingScore: 'desc' },
                    { createdAt: 'desc' }
                ];

            case 'most-rented':
                return [
                    { rentalCount: 'desc' },
                    { viewCount: 'desc' }
                ];

            case 'price-asc':
                return [
                    { rentPricePerDay: 'asc' },
                    { sellPrice: 'asc' }
                ];

            case 'price-desc':
                return [
                    { rentPricePerDay: 'desc' },
                    { sellPrice: 'desc' }
                ];

            default:
                return { createdAt: 'desc' }; // Default: latest first
        }
    }
}
