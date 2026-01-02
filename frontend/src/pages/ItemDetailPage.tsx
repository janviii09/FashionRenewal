import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Heart,
    Share2,
    MapPin,
    Calendar,
    ShoppingBag,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check,
    Truck
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { StatusBadge } from '@/components/ui/status-badge';
import { TrustScore } from '@/components/ui/trust-score';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { SimilarProducts } from '@/components/recommendations/SimilarProducts';
import { BecauseYouViewed } from '@/components/recommendations/BecauseYouViewed';
import type { WardrobeItem } from '@/types';
import type { DateRange } from 'react-day-picker';

import { useActivityTracker } from '@/hooks/useActivityTracker';

// All item and owner data now fetched from API - no hardcoded data needed


export default function ItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated } = useAuthStore();
    const { addItem: addToCart } = useCartStore();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch real item data from API
    const [item, setItem] = useState<WardrobeItem | null>(null);
    const [loading, setLoading] = useState(true);
    const { trackEvent } = useActivityTracker();

    // Fetch item data
    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;

            // CLEAR STATE immediately to prevent showing old item
            setItem(null);
            setLoading(true);

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/wardrobe/${id}`);
                if (!response.ok) throw new Error('Item not found');

                const data = await response.json();
                setItem(data);

                // Track view activity
                trackEvent({
                    eventType: 'VIEW',
                    itemId: parseInt(id),
                    category: data.category
                });
            } catch (error) {
                console.error('Error fetching item:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load item',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id, trackEvent, toast]);

    // Owner data comes from API response
    const owner = item?.owner || null;

    if (loading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="mt-4 text-muted-foreground">Loading item...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center">
                <h2 className="text-xl font-semibold">Item not found</h2>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/browse')}>
                    Back to Browse
                </Button>
            </div>
        );
    }

    const rentalDays = dateRange?.from && dateRange?.to
        ? differenceInDays(dateRange.to, dateRange.from) + 1
        : 0;
    const totalPrice = rentalDays * (item.rentPricePerDay || 0);

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1));
    };

    const handleRentRequest = async () => {
        if (!isAuthenticated) {
            toast({
                title: 'Login required',
                description: 'Please log in to rent items',
                variant: 'destructive',
            });
            navigate('/login');
            return;
        }

        if (!dateRange?.from || !dateRange?.to) {
            toast({
                title: 'Select dates',
                description: 'Please select rental dates',
                variant: 'destructive',
            });
            return;
        }

        // Add to cart
        addToCart({
            item,
            type: 'rent',
            dateRange: { from: dateRange.from, to: dateRange.to },
        });

        toast({
            title: 'Added to cart!',
            description: `${item.title} has been added to your cart.`,
        });

        navigate('/cart');
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            toast({
                title: 'Login required',
                description: 'Please log in to purchase items',
                variant: 'destructive',
            });
            navigate('/login');
            return;
        }

        // Add to cart
        addToCart({
            item,
            type: 'buy',
            quantity: 1,
        });

        toast({
            title: 'Added to cart!',
            description: `${item.title} has been added to your cart.`,
        });

        navigate('/cart');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
                    {/* Image Gallery - Compact Myntra-style */}
                    <div className="flex gap-4 lg:flex-row flex-col-reverse">
                        {/* Thumbnail Column - Only show if multiple images */}
                        {item.images.length > 1 && (
                            <div className="flex lg:flex-col flex-row gap-3 lg:w-16 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[600px]">
                                {item.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`shrink-0 overflow-hidden rounded-lg border-2 transition-all ${index === currentImageIndex
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${item.title} ${index + 1}`}
                                            className="h-16 w-16 object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Image - Compact Size */}
                        <div className="relative w-full lg:w-[420px] aspect-[3/4] max-h-[560px] overflow-hidden rounded-xl bg-muted shadow-md">
                            <img
                                src={item.images[currentImageIndex]}
                                alt={item.title}
                                className="h-full w-full object-cover"
                            />

                            {/* Navigation arrows - only if multiple images */}
                            {item.images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                                    >
                                        <ChevronRight className="h-5 w-5 text-gray-700" />
                                    </button>
                                </>
                            )}

                            {/* Image indicator dots */}
                            {item.images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                                    {item.images.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1.5 rounded-full transition-all ${index === currentImageIndex
                                                ? 'w-6 bg-white'
                                                : 'w-1.5 bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Item Details - Compact Layout */}
                    <div className="space-y-4">
                        {/* Title & Actions */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                        {item.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        {item.size}
                                    </Badge>
                                </div>
                                <h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">{item.title}</h1>
                                <p className="mt-1 text-sm text-muted-foreground">{item.brand}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-full"
                                    onClick={() => setIsFavorite(!isFavorite)}
                                >
                                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                </Button>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Availability Badges */}
                        <div className="flex flex-wrap gap-1.5">
                            <StatusBadge status={item.condition} />
                            {(item.availability === 'AVAILABLE_FOR_RENT' || item.availability === 'AVAILABLE_FOR_BOTH') && (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 text-xs">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Available for Rent
                                </Badge>
                            )}
                            {(item.availability === 'AVAILABLE_FOR_SALE' || item.availability === 'AVAILABLE_FOR_BOTH') && (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 text-xs">
                                    <ShoppingBag className="mr-1 h-3 w-3" />
                                    Available for Sale
                                </Badge>
                            )}
                            {item.availability === 'AVAILABLE_FOR_SWAP' && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 text-xs">
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    Available for Swap
                                </Badge>
                            )}
                        </div>

                        {/* Pricing - Clean */}
                        <div className="py-3 border-b border-border/50">
                            {(item.availability === 'AVAILABLE_FOR_RENT' || item.availability === 'AVAILABLE_FOR_BOTH') && item.rentPricePerDay && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Rental Price</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-3xl font-bold text-foreground">${item.rentPricePerDay}</span>
                                        <span className="text-sm text-muted-foreground">/day</span>
                                    </div>
                                </div>
                            )}
                            {(item.availability === 'AVAILABLE_FOR_SALE' || item.availability === 'AVAILABLE_FOR_BOTH') && item.sellPrice && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground">or buy for</span>
                                    <span className="text-xl font-bold text-foreground">${item.sellPrice}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons - Tira Style */}
                        <div className="grid grid-cols-2 gap-3 py-4">
                            <Button
                                size="lg"
                                className="h-12 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold text-sm uppercase tracking-wide"
                                onClick={item.sellPrice ? handleBuyNow : handleRentRequest}
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Add to Bag
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 border-2 font-semibold text-sm uppercase tracking-wide"
                                onClick={() => setIsFavorite(!isFavorite)}
                            >
                                <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                                Wishlist
                            </Button>
                        </div>

                        {/* Delivery Options - Tira Style */}
                        <div className="py-4 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Truck className="h-5 w-5" />
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Delivery Options</h3>
                            </div>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Enter pincode"
                                    className="flex-1 h-10 px-3 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <Button variant="outline" className="text-pink-600 hover:text-pink-700 font-semibold">
                                    Check
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground mb-4">
                                Please enter PIN code to check delivery time & Pay on Delivery Availability
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span className="text-foreground">100% Original Products</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span className="text-foreground">Pay on delivery might be available</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                    <span className="text-foreground">Easy 7 days returns and exchanges</span>
                                </div>
                            </div>
                        </div>

                        {/* Rental Date Picker - Clean */}
                        {(item.availability === 'AVAILABLE_FOR_RENT' || item.availability === 'AVAILABLE_FOR_BOTH') && (
                            <div className="space-y-3 py-4 border-b border-border/50">
                                <h3 className="text-sm font-semibold text-foreground">Select Rental Period</h3>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-11 w-full justify-start text-left text-sm font-normal"
                                        >
                                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <span>
                                                        {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                                                    </span>
                                                ) : (
                                                    format(dateRange.from, 'MMM d, yyyy')
                                                )
                                            ) : (
                                                <span className="text-muted-foreground">Pick your rental dates</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                            disabled={{ before: addDays(new Date(), 1) }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                {rentalDays > 0 && (
                                    <div className="space-y-2 pt-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Duration</span>
                                            <span className="font-medium">{rentalDays} days</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Daily rate</span>
                                            <span className="font-medium">${item.rentPricePerDay}/day</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-2">
                                            <span className="text-sm font-semibold">Total</span>
                                            <span className="text-2xl font-bold text-primary">${totalPrice}</span>
                                        </div>
                                        <Button
                                            className="w-full mt-3 bg-black hover:bg-black/90 text-white"
                                            onClick={handleRentRequest}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                'Add to Cart'
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Buy Now Button */}
                        {item.isAvailableForSale && item.sellPrice && (
                            <Button
                                className="w-full h-11 bg-black hover:bg-black/90 text-white font-medium"
                                onClick={handleBuyNow}
                            >
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Buy Now - ${item.sellPrice}
                            </Button>
                        )}

                        {/* Description */}
                        <div className="py-4 border-b border-border/50">
                            <h3 className="text-sm font-semibold text-foreground mb-2">Product Description</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        </div>

                        {/* Item Specifications */}
                        <div className="py-4 border-b border-border/50">
                            <h3 className="text-sm font-semibold text-foreground mb-3">Product Details</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Brand</span>
                                    <span className="font-medium">{item.brand}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Size</span>
                                    <span className="font-medium">{item.size}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Condition</span>
                                    <span className="font-medium capitalize">{item.condition.toLowerCase().replace('_', ' ')}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Category</span>
                                    <span className="font-medium">{item.category}</span>
                                </div>
                            </div>
                        </div>

                        {/* Owner Info - Enhanced */}
                        {owner && (
                            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/20 p-6 shadow-sm">
                                <h3 className="mb-5 text-lg font-semibold text-foreground">Listed by</h3>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-border shadow-md">
                                        <AvatarImage src={owner.avatar} alt={owner.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-lg font-semibold text-white">
                                            {owner.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-lg font-semibold text-foreground">{owner.name}</p>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {owner.location}
                                        </div>
                                        <TrustScore score={owner.trustScore} size="sm" className="mt-3" />
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-background/50 p-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-foreground">{owner.itemsListed || 0}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Items Listed</p>
                                    </div>
                                    <div className="text-center border-l border-border">
                                        <p className="text-2xl font-bold text-foreground">{owner.rentalsCompleted || 0}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Rentals Completed</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping & Returns - New Section */}
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Shipping & Returns</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Local Pickup & Delivery</p>
                                        <p className="text-sm text-muted-foreground">Available in {owner?.location || 'your area'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <RefreshCw className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Easy Returns</p>
                                        <p className="text-sm text-muted-foreground">Return within 2 days if not satisfied</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personalized Recommendations */}
            <BecauseYouViewed
                currentItemId={parseInt(id || '1', 10)}
                currentItemCategory={item?.category}
            />

            {/* Similar Products Section */}
            <div className="container mx-auto px-4">
                <SimilarProducts productId={parseInt(id || '1', 10)} title="You May Also Like" />
            </div>
        </div>
    );
}
