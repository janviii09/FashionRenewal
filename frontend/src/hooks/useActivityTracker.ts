import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

export type ActivityType =
    | 'VIEW'
    | 'CLICK'
    | 'WISHLIST_ADD'
    | 'WISHLIST_REMOVE'
    | 'CART_ADD'
    | 'CART_REMOVE'
    | 'RENTAL_COMPLETE'
    | 'PURCHASE_COMPLETE'
    | 'SEARCH';

interface TrackEventParams {
    eventType: ActivityType;
    itemId?: number;
    category?: string;
    metadata?: Record<string, any>;
}

/**
 * Hook for tracking user activity
 * Fire-and-forget, doesn't block UI
 */
export function useActivityTracker() {
    const { user } = useAuthStore();

    const trackEvent = useCallback(
        async (params: TrackEventParams) => {
            try {
                // Get or create session ID for guest users
                let sessionId = sessionStorage.getItem('session_id');
                if (!sessionId) {
                    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    sessionStorage.setItem('session_id', sessionId);
                }

                // Fire and forget - don't await
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/activity/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-session-id': sessionId,
                    },
                    body: JSON.stringify({
                        ...params,
                        timestamp: Date.now(),
                    }),
                    keepalive: true, // Ensures request completes even if page unloads
                }).catch((error) => {
                    // Silent fail - don't break UX
                    console.debug('Activity tracking failed:', error);
                });
            } catch (error) {
                // Silent fail
                console.debug('Activity tracking error:', error);
            }
        },
        [user]
    );

    return { trackEvent };
}
