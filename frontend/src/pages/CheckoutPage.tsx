import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
    });

    if (items.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
                <h2 className="text-2xl font-bold text-foreground">Your cart is empty</h2>
                <p className="mt-2 text-muted-foreground">Add items to checkout</p>
                <Button className="mt-6" onClick={() => navigate('/browse')}>
                    Browse Items
                </Button>
            </div>
        );
    }

    const subtotal = getTotalPrice();
    const serviceFee = subtotal * 0.05;
    const total = subtotal + serviceFee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate shipping info
        if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address) {
            toast({
                title: 'Missing information',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate order creation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Clear cart
        clearCart();

        toast({
            title: 'Order placed successfully!',
            description: 'You will receive a confirmation email shortly.',
        });

        setIsSubmitting(false);
        navigate('/dashboard/orders');
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate('/cart')} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Cart
                    </Button>
                    <h1 className="mt-4 text-3xl font-bold text-foreground">Checkout</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                                <div className="flex items-center gap-2 mb-6">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-bold text-foreground">Shipping Information</h2>
                                </div>

                                <div className="grid gap-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="fullName">Full Name *</Label>
                                            <Input
                                                id="fullName"
                                                value={shippingInfo.fullName}
                                                onChange={(e) =>
                                                    setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={shippingInfo.email}
                                                onChange={(e) =>
                                                    setShippingInfo({ ...shippingInfo, email: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={shippingInfo.phone}
                                            onChange={(e) =>
                                                setShippingInfo({ ...shippingInfo, phone: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="address">Street Address *</Label>
                                        <Input
                                            id="address"
                                            value={shippingInfo.address}
                                            onChange={(e) =>
                                                setShippingInfo({ ...shippingInfo, address: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={shippingInfo.city}
                                                onChange={(e) =>
                                                    setShippingInfo({ ...shippingInfo, city: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="state">State *</Label>
                                            <Input
                                                id="state"
                                                value={shippingInfo.state}
                                                onChange={(e) =>
                                                    setShippingInfo({ ...shippingInfo, state: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="zipCode">ZIP Code *</Label>
                                            <Input
                                                id="zipCode"
                                                value={shippingInfo.zipCode}
                                                onChange={(e) =>
                                                    setShippingInfo({ ...shippingInfo, zipCode: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                                <div className="flex items-center gap-2 mb-6">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-bold text-foreground">Payment Information</h2>
                                </div>

                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="cardNumber">Card Number</Label>
                                        <Input
                                            id="cardNumber"
                                            placeholder="1234 5678 9012 3456"
                                            value={paymentInfo.cardNumber}
                                            onChange={(e) =>
                                                setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="cardName">Cardholder Name</Label>
                                        <Input
                                            id="cardName"
                                            value={paymentInfo.cardName}
                                            onChange={(e) =>
                                                setPaymentInfo({ ...paymentInfo, cardName: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="expiryDate">Expiry Date</Label>
                                            <Input
                                                id="expiryDate"
                                                placeholder="MM/YY"
                                                value={paymentInfo.expiryDate}
                                                onChange={(e) =>
                                                    setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input
                                                id="cvv"
                                                placeholder="123"
                                                value={paymentInfo.cvv}
                                                onChange={(e) =>
                                                    setPaymentInfo({ ...paymentInfo, cvv: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                                    <p>💳 This is a demo. No actual payment will be processed.</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-card">
                                <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>

                                {/* Items */}
                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                    {items.map((cartItem) => (
                                        <div key={cartItem.item.id} className="flex gap-3">
                                            <img
                                                src={cartItem.item.images[0]}
                                                alt={cartItem.item.title}
                                                className="h-16 w-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {cartItem.item.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {cartItem.type === 'rent' ? 'Rent' : 'Buy'}
                                                    {cartItem.quantity && cartItem.quantity > 1 && ` × ${cartItem.quantity}`}
                                                </p>
                                                {cartItem.type === 'rent' && cartItem.dateRange && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(cartItem.dateRange.from), 'MMM d')} -{' '}
                                                        {format(new Date(cartItem.dateRange.to), 'MMM d')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="space-y-2 border-t border-border pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Service Fee</span>
                                        <span className="font-medium text-foreground">${serviceFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-border pt-2">
                                        <span className="text-lg font-bold text-foreground">Total</span>
                                        <span className="text-lg font-bold text-foreground">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Place Order Button */}
                                <Button
                                    type="submit"
                                    className="mt-6 w-full"
                                    variant="gradient"
                                    size="lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-5 w-5" />
                                            Place Order
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
