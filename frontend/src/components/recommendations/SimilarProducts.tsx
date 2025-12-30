import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { wardrobeApi } from '@/lib/api';
import type { WardrobeItem } from '@/types';
import { ItemCard } from '@/components/items/ItemCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as React from 'react';

interface SimilarProductsProps {
    productId: number;
    title?: string;
}

export function SimilarProducts({ productId, title = "Similar Items" }: SimilarProductsProps) {
    const [recommendations, setRecommendations] = useState<WardrobeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset state when productId changes
        setRecommendations([]);
        setLoading(true);
        setError(null);

        fetchRecommendations();
    }, [productId]);

    const fetchRecommendations = async () => {
        // Edge case: Invalid product ID
        if (!productId || productId <= 0) {
            setError('Invalid product ID');
            setLoading(false);
            return;
        }

        try {
            const response = await wardrobeApi.getRecommendations(productId, 12);

            // Edge case: API returns unexpected data
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format');
            }

            setRecommendations(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch recommendations:', err);

            // User-friendly error messages
            if (err.response?.status === 404) {
                setError('Product not found');
            } else if (err.response?.status === 400) {
                setError('Invalid request');
            } else if (err.response?.status >= 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Failed to load recommendations');
            }
        } finally {
            setLoading(false);
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <section className="py-12 border-t" aria-label="Loading similar products">
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
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

    // Error state with retry option
    if (error) {
        return (
            <section className="py-12 border-t">
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

    // Edge case: No recommendations (don't show section)
    if (recommendations.length === 0) {
        return null;
    }

    return (
        <section className="py-12 border-t" aria-label={title}>
            <h2 className="text-2xl font-bold mb-6">{title}</h2>

            {/* Desktop: Horizontal Carousel */}
            <div className="hidden md:block">
                <ProductCarousel items={recommendations} />
            </div>

            {/* Mobile: Grid */}
            <div className="md:hidden">
                <div className="grid grid-cols-2 gap-4">
                    {recommendations.map(product => (
                        <ItemCard key={product.id} item={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface ProductCarouselProps {
    items: WardrobeItem[];
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
            const scrollAmount = 320; // Width of one card + gap
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
    }, [items]); // Re-run when items change

    // Edge case: No items
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            {/* Left Arrow - only show if can scroll left */}
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
                    </div>
                ))}
            </div>

            {/* Right Arrow - only show if can scroll right */}
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
