import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WardrobeItem } from '@/types';
import { ItemCard } from '@/components/items/ItemCard';
import * as React from 'react';

interface BecauseYouViewedProps {
    currentItemId: number;
    currentItemCategory?: string;
    title?: string;
}

interface PersonalizedItem extends WardrobeItem {
    score?: number;
    reason?: string;
    reasonType?: string;
}

export function BecauseYouViewed({
    currentItemId,
    currentItemCategory,
    title = "Because You Viewed This"
}: BecauseYouViewedProps) {
    const [recommendations, setRecommendations] = useState<PersonalizedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [currentItemId]);

    const fetchRecommendations = async () => {
        setLoading(true);

        try {
            // Get personalized recommendations
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/wardrobe/personalized?limit=12`,
                {
                    headers: {
                        'x-session-id': sessionStorage.getItem('session_id') || '',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                // Filter out current item
                const filtered = (data.recommendations || []).filter(
                    (item: PersonalizedItem) => item.id !== currentItemId.toString()
                );
                setRecommendations(filtered.slice(0, 12));
            }
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-12 border-t">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-6">{title}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-muted rounded-lg" />
                                <div className="mt-2 h-4 bg-muted rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <section className="py-12 border-t" aria-label={title}>
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-muted-foreground mb-6">
                    More items you might like
                </p>

                {/* Desktop: Carousel */}
                <div className="hidden md:block">
                    <SimpleCarousel items={recommendations} />
                </div>

                {/* Mobile: Grid */}
                <div className="md:hidden">
                    <div className="grid grid-cols-2 gap-4">
                        {recommendations.map(product => (
                            <ItemCard key={product.id} item={product} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function SimpleCarousel({ items }: { items: PersonalizedItem[] }) {
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const updateScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 320;
            const newPosition = direction === 'left'
                ? scrollRef.current.scrollLeft - scrollAmount
                : scrollRef.current.scrollLeft + scrollAmount;

            scrollRef.current.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            });
        }
    };

    React.useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', updateScrollButtons);
            updateScrollButtons();

            return () => {
                scrollContainer.removeEventListener('scroll', updateScrollButtons);
            };
        }
    }, [items]);

    return (
        <div className="relative">
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
            )}

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-64">
                        <ItemCard item={product} />
                    </div>
                ))}
            </div>

            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            )}
        </div>
    );
}
