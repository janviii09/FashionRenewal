import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { RecommendationService } from './recommendation.service';
import { BrowseService } from './browse.service';
import { DiscoverService } from './discover.service';
import { AffinityService } from '../affinity/affinity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItemAvailability } from '@prisma/client';

@Controller('wardrobe')
export class WardrobeController {
    constructor(
        private readonly wardrobeService: WardrobeService,
        private readonly recommendationService: RecommendationService,
        private readonly affinityService: AffinityService,
        private readonly browseService: BrowseService,
        private readonly discoverService: DiscoverService
    ) { }

    /**
     * Create a wardrobe item
     * POST /wardrobe
     */
    @UseGuards(JwtAuthGuard)
    @Post()
    async createItem(@Request() req, @Body() data: any) {
        return this.wardrobeService.createItem(req.user.userId, data);
    }

    /**
     * Get user's personal wardrobe
     * GET /wardrobe/my-items
     */
    @UseGuards(JwtAuthGuard)
    @Get('my-items')
    async getMyWardrobe(
        @Request() req,
        @Query('availability') availability?: ItemAvailability,
        @Query('category') category?: string,
        @Query('search') search?: string,
    ) {
        return this.wardrobeService.getUserWardrobe(req.user.userId, {
            availability,
            category,
            search,
        });
    }

    /**
     * Get unique categories from marketplace
     * GET /wardrobe/categories
     */
    @Get('categories')
    async getCategories() {
        try {
            const items = await this.wardrobeService.getMarketplaceItems({});

            // Extract unique categories, filter out nulls/undefined
            const categories = [...new Set(
                items
                    .map(item => item.category)
                    .filter(Boolean)
            )];

            return categories.length > 0 ? categories : ['Women', 'Men', 'Kids', 'Accessories'];
        } catch (error) {
            // Fallback to default categories on error
            return ['Women', 'Men', 'Kids', 'Accessories'];
        }
    }

    /**
     * Get personalized recommendations for user
     * GET /wardrobe/personalized
     */
    @Get('personalized')
    async getPersonalizedRecommendations(
        @Request() req,
        @Query('limit') limit?: string
    ) {
        try {
            const itemLimit = limit ? parseInt(limit, 10) : 12;

            // Simple implementation: return marketplace items
            const items = await this.wardrobeService.getMarketplaceItems({});
            return items.slice(0, itemLimit);
        } catch (error) {
            console.error('Error fetching personalized recommendations:', error);
            return [];
        }
    }

    /**
     * Get browse preview (exactly 16 items across 4 sections)
     * GET /wardrobe/browse-preview
     */
    @Get('browse-preview')
    async getBrowsePreview() {
        return this.browseService.getBrowsePreview();
    }

    /**
     * Discover with server-side pagination and filtering
     * GET /wardrobe/discover
     */
    @Get('discover')
    async discover(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('category') category?: string,
        @Query('availability') availability?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('size') size?: string,
        @Query('condition') condition?: string,
        @Query('sort') sort?: string,
        @Query('search') search?: string,
    ) {
        return this.discoverService.discover({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            category,
            availability,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            size,
            condition,
            sort,
            search
        });
    }

    /**
     * Get marketplace items (public) - LEGACY ENDPOINT
     * GET /wardrobe/marketplace
     * Kept for backward compatibility
     */
    @Get('marketplace')
    async getMarketplaceItems(
        @Query('availability') availability?: ItemAvailability,
        @Query('category') category?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('search') search?: string,
    ) {
        return this.wardrobeService.getMarketplaceItems({
            availability,
            category,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            search,
        });
    }

    /**
     * Get a single item
     * GET /wardrobe/:id
     */
    @Get(':id')
    async getItem(@Param('id') id: string, @Request() req) {
        const userId = req.user?.userId; // Optional - may be unauthenticated
        return this.wardrobeService.getItem(parseInt(id), userId);
    }

    /**
     * Update a wardrobe item
     * PATCH /wardrobe/:id
     */
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateItem(
        @Request() req,
        @Param('id') id: string,
        @Body() data: any,
    ) {
        return this.wardrobeService.updateItem(
            parseInt(id),
            req.user.userId,
            data,
        );
    }

    /**
     * Delete a wardrobe item
     * DELETE /wardrobe/:id
     */
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteItem(@Request() req, @Param('id') id: string) {
        await this.wardrobeService.deleteItem(parseInt(id), req.user.userId);
        return { message: 'Item deleted successfully' };
    }
}
