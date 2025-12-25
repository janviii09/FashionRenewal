import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WardrobeItem } from '@/types';

interface WishlistStore {
    items: WardrobeItem[];
    addItem: (item: WardrobeItem) => void;
    removeItem: (itemId: number) => void;
    isInWishlist: (itemId: number) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const { items } = get();
                if (!items.find((i) => i.id === item.id)) {
                    set({ items: [...items, item] });
                }
            },

            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== itemId),
                }));
            },

            isInWishlist: (itemId) => {
                return get().items.some((item) => item.id === itemId);
            },

            clearWishlist: () => {
                set({ items: [] });
            },
        }),
        {
            name: 'wishlist-storage',
        }
    )
);
