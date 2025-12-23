import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { AuthGuard } from '@nestjs/passport';
import { OrderType, OrderStatus } from '@prisma/client';
import { SubscriptionGuard } from '../subscription/subscription.guard';
import { IdempotencyGuard } from '../common/guards/idempotency.guard';

@Controller('marketplace')
export class MarketplaceController {
    constructor(private readonly marketplaceService: MarketplaceService) { }

    @UseGuards(AuthGuard('jwt'), SubscriptionGuard, IdempotencyGuard)
    @Post('request')
    createOrder(@Request() req, @Body() body: { itemId: number; type: OrderType; ownerId: number; startDate?: Date; endDate?: Date }) {
        return this.marketplaceService.createOrder({
            renter: { connect: { id: req.user.userId } },
            owner: { connect: { id: body.ownerId } },
            item: { connect: { id: body.itemId } },
            type: body.type,
            startDate: body.startDate,
            endDate: body.endDate,
        }, req.user.userId, req.idempotencyKey);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('order/:id/status')
    updateStatus(@Request() req, @Param('id') id: string, @Body() body: { status: OrderStatus; version?: number }) {
        return this.marketplaceService.updateOrderStatus(+id, body.status, req.user.userId, body.version);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('orders')
    getMyOrders(@Request() req, @Query('role') role: 'owner' | 'renter') {
        return this.marketplaceService.findAllOrders(req.user.userId, role || 'renter');
    }
}
