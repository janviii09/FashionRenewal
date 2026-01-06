import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto, UpdateCartItemDto, SyncCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get or create user's cart
     */
    async getOrCreateCart(userId: number) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        item: true,
                    },
                },
            },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            item: true,
                        },
                    },
                },
            });
        }

        return cart;
    }

    /**
     * Get user's cart
     */
    async getCart(userId: number) {
        return this.getOrCreateCart(userId);
    }

    /**
     * Add item to cart
     */
    async addItem(userId: number, dto: AddCartItemDto) {
        const cart = await this.getOrCreateCart(userId);

        // Validate item exists and is available
        const item = await this.prisma.wardrobeItem.findUnique({
            where: { id: dto.itemId },
        });

        if (!item) {
            throw new NotFoundException('Item not found');
        }

        // Check if item already in cart
        const existingCartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_itemId: {
                    cartId: cart.id,
                    itemId: dto.itemId,
                },
            },
        });

        if (existingCartItem) {
            // Update existing cart item
            return this.prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: {
                    quantity: dto.quantity || existingCartItem.quantity,
                    dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : existingCartItem.dateFrom,
                    dateTo: dto.dateTo ? new Date(dto.dateTo) : existingCartItem.dateTo,
                },
                include: {
                    item: true,
                },
            });
        }

        // Create new cart item
        return this.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                itemId: dto.itemId,
                type: dto.type,
                quantity: dto.quantity || 1,
                dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : null,
                dateTo: dto.dateTo ? new Date(dto.dateTo) : null,
            },
            include: {
                item: true,
            },
        });
    }

    /**
     * Update cart item
     */
    async updateItem(userId: number, cartItemId: number, dto: UpdateCartItemDto) {
        const cart = await this.getOrCreateCart(userId);

        const cartItem = await this.prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                cartId: cart.id,
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        return this.prisma.cartItem.update({
            where: { id: cartItemId },
            data: {
                quantity: dto.quantity,
                dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
                dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
            },
            include: {
                item: true,
            },
        });
    }

    /**
     * Remove item from cart
     */
    async removeItem(userId: number, cartItemId: number) {
        const cart = await this.getOrCreateCart(userId);

        const cartItem = await this.prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                cartId: cart.id,
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        await this.prisma.cartItem.delete({
            where: { id: cartItemId },
        });

        return { message: 'Item removed from cart' };
    }

    /**
     * Clear entire cart
     */
    async clearCart(userId: number) {
        const cart = await this.getOrCreateCart(userId);

        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return { message: 'Cart cleared' };
    }

    /**
     * Sync local cart with backend cart (merge logic)
     * Strategy: For duplicate items, keep maximum quantity
     */
    async syncCart(userId: number, dto: SyncCartDto) {
        const cart = await this.getOrCreateCart(userId);

        // Get existing cart items
        const existingItems = await this.prisma.cartItem.findMany({
            where: { cartId: cart.id },
        });

        // Create a map of existing items by itemId
        const existingItemsMap = new Map(
            existingItems.map((item) => [item.itemId, item])
        );

        // Process each local cart item
        for (const localItem of dto.items) {
            const existingItem = existingItemsMap.get(localItem.itemId);

            if (existingItem) {
                // Item exists in both - take maximum quantity
                const maxQuantity = Math.max(
                    existingItem.quantity,
                    localItem.quantity || 1
                );

                // For rent items, use the latest date range (from local cart)
                const dateFrom = localItem.dateFrom
                    ? new Date(localItem.dateFrom)
                    : existingItem.dateFrom;
                const dateTo = localItem.dateTo
                    ? new Date(localItem.dateTo)
                    : existingItem.dateTo;

                await this.prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: maxQuantity,
                        dateFrom,
                        dateTo,
                    },
                });
            } else {
                // Item only in local cart - add to backend
                await this.prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        itemId: localItem.itemId,
                        type: localItem.type,
                        quantity: localItem.quantity || 1,
                        dateFrom: localItem.dateFrom ? new Date(localItem.dateFrom) : null,
                        dateTo: localItem.dateTo ? new Date(localItem.dateTo) : null,
                    },
                });
            }
        }

        // Return merged cart
        return this.getCart(userId);
    }
}
