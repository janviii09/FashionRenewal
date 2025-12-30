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


// Helper to track wishlist events
const trackWishlistEvent = (eventType: 'WISHLIST_ADD' | 'WISHLIST_REMOVE', itemId: string) => {
  try {
    const sessionId = sessionStorage.getItem('session_id') || 
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
    
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/activity/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({
        eventType,
        itemId: parseInt(itemId, 10),
        timestamp: Date.now(),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch (error) {
    // Silent fail
  }
};

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
