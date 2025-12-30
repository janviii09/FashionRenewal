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
    Check
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
    const { trackActivity } = useActivityTracker();

    // Fetch item data
    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3000/wardrobe/${id}`);
                if (!response.ok) throw new Error('Item not found');

                const data = await response.json();
                setItem(data);

                // Track view activity
                trackActivity('VIEW', parseInt(id));
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
    }, [id, trackActivity, toast]);

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

            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                            <img
                                src={item.images[currentImageIndex]}
                                alt={item.title}
                                className="h-full w-full object-cover"
                            />

                            {item.images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            {/* Image indicators */}
                            {item.images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                                    {item.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`h-2 w-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-primary' : 'bg-background/60'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {item.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {item.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${index === currentImageIndex ? 'border-primary' : 'border-transparent'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${item.title} ${index + 1}`}
                                            className="h-20 w-20 object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Item Details */}
                    <div className="space-y-6">
                        {/* Title & Actions */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">{item.title}</h1>
                                <p className="mt-1 text-lg text-muted-foreground">{item.brand}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsFavorite(!isFavorite)}
                                    className={isFavorite ? 'text-secondary' : ''}
                                >
                                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                                </Button>
                                <Button variant="outline" size="icon">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{item.size}</Badge>
                            <StatusBadge status={item.condition} />
                            {(item.availability === 'AVAILABLE_FOR_RENT' || item.availability === 'AVAILABLE_FOR_BOTH') && (
                                <Badge className="bg-success/10 text-success hover:bg-success/20">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    For Rent
                                </Badge>
                            )}
                            {(item.availability === 'AVAILABLE_FOR_SALE' || item.availability === 'AVAILABLE_FOR_BOTH') && (
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                                    <ShoppingBag className="mr-1 h-3 w-3" />
                                    For Sale
                                </Badge>
                            )}
                            {item.availability === 'AVAILABLE_FOR_SWAP' && (
                                <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    For Swap
                                </Badge>
                            )}
                        </div>

                        {/* Price */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-baseline gap-4">
                                {(item.availability === 'AVAILABLE_FOR_RENT') && item.rentPricePerDay && (
                                    <div>
                                        <span className="text-3xl font-bold text-foreground">${item.rentPricePerDay}</span>
                                        <span className="text-muted-foreground">/day</span>
                                    </div>
                                )}
                                {(item.availability === 'AVAILABLE_FOR_SALE') && item.sellPrice && (
                                    <div className="text-muted-foreground">
                                        or <span className="font-semibold text-foreground">${item.sellPrice}</span> to buy
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rental Date Picker */}
                        {item.availability === 'AVAILABLE_FOR_RENT' && (
                            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                                <h3 className="font-semibold text-foreground">Select Rental Dates</h3>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, 'MMM d, yyyy')
                                                )
                                            ) : (
                                                'Pick a date range'
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
                                    <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{rentalDays} days × ${item.rentPricePerDay}</p>
                                            <p className="text-lg font-bold text-foreground">Total: ${totalPrice}</p>
                                        </div>
                                        <Button
                                            variant="gradient"
                                            onClick={handleRentRequest}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Add to Cart
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Buy Now */}
                        {item.isAvailableForSale && item.sellPrice && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full"
                                onClick={handleBuyNow}
                            >
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Buy Now for ${item.sellPrice}
                            </Button>
                        )}

                        {/* Description */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-foreground">Description</h3>
                            <p className="text-muted-foreground">{item.description}</p>
                        </div>

                        {/* Owner Info */}
                        {owner && (
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="mb-4 font-semibold text-foreground">Listed by</h3>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage src={owner.avatar} alt={owner.name} />
                                        <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">{owner.name}</p>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            {owner.location}
                                        </div>
                                        <TrustScore score={owner.trustScore} size="sm" className="mt-2" />
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-foreground">{owner.itemsListed}</p>
                                        <p className="text-sm text-muted-foreground">Items Listed</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-foreground">{owner.rentalsCompleted}</p>
                                        <p className="text-sm text-muted-foreground">Rentals Completed</p>
                                    </div>
                                </div>
                            </div>
                        )}
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
