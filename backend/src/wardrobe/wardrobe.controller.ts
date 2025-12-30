import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItemAvailability } from '@prisma/client';

@Controller('wardrobe')
export class WardrobeController {
    constructor(
        private readonly wardrobeService: WardrobeService,
        private readonly recommendationService: RecommendationService
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
     * Get marketplace items (public)
     * GET /wardrobe/marketplace
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
