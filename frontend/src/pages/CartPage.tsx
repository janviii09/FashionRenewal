import { ShoppingCart, Trash2, Plus, Minus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-foreground">Your cart is empty</h2>
                <p className="mt-2 text-center text-muted-foreground">
                    Add items to your cart to get started
                </p>
                <Link to="/browse">
                    <Button className="mt-6" variant="gradient">
                        Browse Items
                    </Button>
                </Link>
            </div>
        );
    }

    const total = getTotalPrice();

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
                            <Button variant="outline" size="sm" onClick={clearCart}>
                                Clear Cart
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {items.map((cartItem) => (
                                <div
                                    key={cartItem.item.id}
                                    className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
                                >
                                    {/* Image */}
                                    <Link to={`/items/${cartItem.item.id}`} className="shrink-0">
                                        <img
                                            src={cartItem.item.images[0] || '/placeholder.svg'}
                                            alt={cartItem.item.title}
                                            className="h-24 w-24 rounded-lg object-cover"
                                        />
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <Link to={`/items/${cartItem.item.id}`}>
                                            <h3 className="font-semibold text-foreground hover:text-primary">
                                                {cartItem.item.title}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-muted-foreground">{cartItem.item.brand}</p>

                                        {/* Type Badge */}
                                        <div className="mt-2 flex items-center gap-2">
                                            {cartItem.type === 'rent' ? (
                                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                    Rent
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                                                    Buy
                                                </span>
                                            )}
                                        </div>

                                        {/* Rental Dates */}
                                        {cartItem.type === 'rent' && cartItem.dateRange && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {format(new Date(cartItem.dateRange.from), 'MMM d')} -{' '}
                                                    {format(new Date(cartItem.dateRange.to), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        )}

                                        {/* Quantity (for buy items) */}
                                        {cartItem.type === 'buy' && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateQuantity(cartItem.item.id, (cartItem.quantity || 1) - 1)}
                                                    disabled={(cartItem.quantity || 1) <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-8 text-center text-sm font-medium">
                                                    {cartItem.quantity || 1}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateQuantity(cartItem.item.id, (cartItem.quantity || 1) + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price & Remove */}
                                    <div className="flex flex-col items-end justify-between">
                                        <div className="text-right">
                                            {cartItem.type === 'rent' && cartItem.dateRange ? (
                                                <>
                                                    <p className="text-lg font-bold text-foreground">
                                                        $
                                                        {(cartItem.item.rentPricePerDay || 0) *
                                                            (Math.ceil(
                                                                (new Date(cartItem.dateRange.to).getTime() -
                                                                    new Date(cartItem.dateRange.from).getTime()) /
                                                                (1000 * 60 * 60 * 24)
                                                            ) + 1)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ${cartItem.item.rentPricePerDay}/day
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-lg font-bold text-foreground">
                                                    ${(cartItem.item.sellPrice || 0) * (cartItem.quantity || 1)}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(cartItem.item.id)}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-card">
                            <h2 className="text-xl font-bold text-foreground">Order Summary</h2>

                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium text-foreground">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Service Fee</span>
                                    <span className="font-medium text-foreground">${(total * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-foreground">Total</span>
                                        <span className="text-lg font-bold text-foreground">
                                            ${(total * 1.05).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="mt-6 w-full"
                                variant="gradient"
                                size="lg"
                                onClick={() => navigate('/checkout')}
                            >
                                Proceed to Checkout
                            </Button>

                            <Link to="/browse">
                                <Button className="mt-3 w-full" variant="outline">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
