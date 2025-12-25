import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WardrobeItem } from '@/types';

export interface CartItem {
    item: WardrobeItem;
    type: 'rent' | 'buy';
    dateRange?: { from: Date; to: Date }; // for rent items
    quantity?: number; // for buy items (default 1)
}

interface CartStore {
    items: CartItem[];
    addItem: (cartItem: CartItem) => void;
    removeItem: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (cartItem) => {
                const { items } = get();
                // Check if item already exists
                const existingIndex = items.findIndex((i) => i.item.id === cartItem.item.id);

                if (existingIndex >= 0) {
                    // Update existing item
                    const newItems = [...items];
                    if (cartItem.type === 'buy') {
                        newItems[existingIndex].quantity = (newItems[existingIndex].quantity || 1) + 1;
                    } else {
                        // For rent, replace with new date range
                        newItems[existingIndex] = cartItem;
                    }
                    set({ items: newItems });
                } else {
                    // Add new item
                    set({ items: [...items, { ...cartItem, quantity: cartItem.quantity || 1 }] });
                }
            },

            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((cartItem) => cartItem.item.id !== itemId),
                }));
            },

            updateQuantity: (itemId, quantity) => {
                set((state) => ({
                    items: state.items.map((cartItem) =>
                        cartItem.item.id === itemId
                            ? { ...cartItem, quantity: Math.max(1, quantity) }
                            : cartItem
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotalPrice: () => {
                const { items } = get();
                return items.reduce((total, cartItem) => {
                    if (cartItem.type === 'rent' && cartItem.dateRange) {
                        const days = Math.ceil(
                            (new Date(cartItem.dateRange.to).getTime() - new Date(cartItem.dateRange.from).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1;
                        return total + (cartItem.item.rentPricePerDay || 0) * days;
                    } else if (cartItem.type === 'buy') {
                        return total + (cartItem.item.sellPrice || 0) * (cartItem.quantity || 1);
                    }
                    return total;
                }, 0);
            },

            getItemCount: () => {
                return get().items.length;
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
