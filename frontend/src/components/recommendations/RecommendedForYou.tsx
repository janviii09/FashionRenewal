import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { wardrobeApi } from '@/lib/api';
import type { WardrobeItem } from '@/types';
import { ItemCard } from '@/components/items/ItemCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as React from 'react';

interface RecommendedForYouProps {
    title?: string;
    limit?: number;
}

interface PersonalizedItem extends WardrobeItem {
    score?: number;
    reason?: string;
    reasonType?: string;
}

export function RecommendedForYou({
    title = "Recommended For You",
    limit = 16
}: RecommendedForYouProps) {
    const [recommendations, setRecommendations] = useState<PersonalizedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRecommendations();
    }, [limit]);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/wardrobe/personalized?limit=${limit}`,
                {
                    headers: {
                        'x-session-id': sessionStorage.getItem('session_id') || '',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }

            const data = await response.json();
            setRecommendations(data.recommendations || []);
        } catch (err: any) {
            console.error('Failed to fetch personalized recommendations:', err);
            setError('Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <section className="py-12" aria-label="Loading personalized recommendations">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-muted-foreground mb-6">
                    Curated just for you
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[3/4] bg-muted rounded-lg" />
                            <div className="mt-2 h-4 bg-muted rounded w-3/4" />
                            <div className="mt-1 h-4 bg-muted rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="py-12">
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <button
                            onClick={fetchRecommendations}
                            className="ml-2 underline hover:no-underline"
                        >
                            Try again
                        </button>
                    </AlertDescription>
                </Alert>
            </section>
        );
    }

    // No recommendations
    if (recommendations.length === 0) {
        return null;
    }

    return (
        <section className="py-12" aria-label={title}>
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-muted-foreground mb-6">
                    Curated based on your style and preferences
                </p>

                {/* Desktop: Horizontal Carousel */}
                <div className="hidden md:block">
                    <ProductCarousel items={recommendations} />
                </div>

                {/* Mobile: Grid */}
                <div className="md:hidden">
                    <div className="grid grid-cols-2 gap-4">
                        {recommendations.slice(0, 12).map(product => (
                            <div key={product.id} className="relative">
                                <ItemCard item={product} />
                                {product.reason && (
                                    <p className="mt-1 text-xs text-muted-foreground truncate">
                                        {product.reason}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

interface ProductCarouselProps {
    items: PersonalizedItem[];
}

function ProductCarousel({ items }: ProductCarouselProps) {
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

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            {/* Left Arrow */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
            )}

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-64">
                        <ItemCard item={product} />
                        {product.reason && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {product.reason}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Right Arrow */}
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
