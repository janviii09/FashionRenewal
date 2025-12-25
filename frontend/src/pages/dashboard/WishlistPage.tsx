import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/items/ItemCard';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
    const { items, clearWishlist } = useWishlistStore();

    if (items.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Heart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-foreground">Your wishlist is empty</h2>
                <p className="mt-2 text-center text-muted-foreground">
                    Start adding items you love to your wishlist
                </p>
                <Link to="/browse">
                    <Button className="mt-6" variant="gradient">
                        Browse Items
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
                    <p className="mt-2 text-muted-foreground">
                        {items.length} {items.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
                {items.length > 0 && (
                    <Button variant="outline" onClick={clearWishlist}>
                        Clear All
                    </Button>
                )}
            </div>

            {/* Items Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}
