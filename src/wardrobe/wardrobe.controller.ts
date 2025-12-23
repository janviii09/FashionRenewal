import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('wardrobe')
export class WardrobeController {
    constructor(private readonly wardrobeService: WardrobeService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() createWardrobeDto: Prisma.WardrobeItemCreateWithoutOwnerInput) {
        return this.wardrobeService.createItem({
            ...createWardrobeDto,
            owner: { connect: { id: req.user.userId } },
        });
    }

    @Get()
    findAll(@Query() query: { category?: string; status?: any }) {
        const where: Prisma.WardrobeItemWhereInput = {};
        if (query.category) where.category = query.category;
        if (query.status) where.status = query.status;
        return this.wardrobeService.findAll({ where });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.wardrobeService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateWardrobeDto: Prisma.WardrobeItemUpdateInput) {
        return this.wardrobeService.updateItem({
            where: { id: +id },
            data: updateWardrobeDto,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.wardrobeService.deleteItem({ id: +id });
    }
}
