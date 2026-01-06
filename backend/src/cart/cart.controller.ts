import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto, SyncCartDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    async getCart(@Request() req) {
        return this.cartService.getCart(req.user.userId);
    }

    @Post('items')
    async addItem(@Request() req, @Body() dto: AddCartItemDto) {
        return this.cartService.addItem(req.user.userId, dto);
    }

    @Patch('items/:id')
    async updateItem(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(req.user.userId, id, dto);
    }

    @Delete('items/:id')
    async removeItem(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.cartService.removeItem(req.user.userId, id);
    }

    @Delete()
    async clearCart(@Request() req) {
        return this.cartService.clearCart(req.user.userId);
    }

    @Post('sync')
    async syncCart(@Request() req, @Body() dto: SyncCartDto) {
        return this.cartService.syncCart(req.user.userId, dto);
    }
}
