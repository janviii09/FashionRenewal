import { useState, useEffect } from 'react';
import { Package, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ReviewDialog } from '@/components/reviews/ReviewDialog';
import { useToast } from '@/hooks/use-toast';
import { ordersApi } from '@/lib/api';
import type { Order } from '@/types';
import { OrderStatus } from '@/types';

export default function RentalsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersApi.getOrders();
            setOrders(response.data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load orders',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.COMPLETED:
                return 'bg-green-500/10 text-green-500';
            case OrderStatus.CANCELLED:
                return 'bg-red-500/10 text-red-500';
            case OrderStatus.PENDING_VALIDATION:
                return 'bg-yellow-500/10 text-yellow-500';
            case OrderStatus.DELIVERED:
            case OrderStatus.IN_TRANSIT:
                return 'bg-blue-500/10 text-blue-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Orders</h1>
                <p className="text-muted-foreground">Track your rentals and purchases</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Active Orders</div>
                    <div className="mt-2 text-2xl font-bold">
                        {orders.filter((o) =>
                            [OrderStatus.DELIVERED, OrderStatus.IN_TRANSIT, OrderStatus.DISPATCHED].includes(o.status)
                        ).length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Pending</div>
                    <div className="mt-2 text-2xl font-bold">
                        {orders.filter((o) =>
                            [OrderStatus.REQUESTED, OrderStatus.PENDING_VALIDATION, OrderStatus.APPROVED].includes(o.status)
                        ).length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Completed</div>
                    <div className="mt-2 text-2xl font-bold">
                        {orders.filter((o) => o.status === OrderStatus.COMPLETED).length}
                    </div>
                </Card>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <Card key={order.id} className="p-4">
                            <div className="flex gap-4">
                                {order.item?.images?.[0] && (
                                    <img
                                        src={order.item.images[0]}
                                        alt={order.item.title}
                                        className="h-20 w-20 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold">{order.item?.title || 'Item'}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Order #{order.id}
                                            </p>
                                        </div>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>

                                    {order.startDate && order.endDate && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {format(new Date(order.startDate), 'MMM d')} - {format(new Date(order.endDate), 'MMM d')}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">
                                            ${order.totalPrice || 0}
                                        </span>

                                        {/* Review button - only for COMPLETED orders */}
                                        {order.status === OrderStatus.COMPLETED && order.owner && (
                                            <ReviewDialog
                                                orderId={order.id}
                                                counterpartyName={order.owner.name || 'User'}
                                                onReviewSubmitted={fetchOrders}
                                            />
                                        )}
                                    </div>

                                    {order.requiresValidation && order.status === OrderStatus.PENDING_VALIDATION && (
                                        <div className="rounded-lg bg-yellow-500/10 p-2 text-sm text-yellow-600">
                                            ⚠️ Pending validation (high value or low trust score)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="p-8 text-center">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 font-semibold">No orders yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Start browsing the marketplace to rent or buy items
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}
