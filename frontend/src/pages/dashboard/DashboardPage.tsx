import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, ShoppingBag, DollarSign, Star, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { wardrobeApi, ordersApi } from '@/lib/api';
import type { WardrobeItem, Order } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsRes, ordersRes] = await Promise.all([
          wardrobeApi.getMyWardrobe(),
          ordersApi.getOrders(),
        ]);
        setItems(itemsRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeRentals = orders.filter(o => o.status === 'ACTIVE').length;
  const totalItems = items.length;
  const trustScore = user?.trustScore || 0;

  const stats = [
    { label: 'Total Items', value: totalItems.toString(), icon: Shirt, color: 'primary' },
    { label: 'Active Rentals', value: activeRentals.toString(), icon: ShoppingBag, color: 'secondary' },
    { label: 'Total Orders', value: orders.length.toString(), icon: DollarSign, color: 'success' },
    { label: 'Trust Score', value: trustScore.toFixed(1), icon: Star, color: 'warning' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl gradient-bg p-6 text-primary-foreground lg:p-8">
        <h1 className="text-2xl font-bold lg:text-3xl">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="mt-2 text-primary-foreground/80">
          {activeRentals > 0
            ? `You have ${activeRentals} active rental${activeRentals > 1 ? 's' : ''}.`
            : 'Start by adding items to your wardrobe or browse the marketplace!'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/dashboard/wardrobe">
            <Button variant="hero" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add New Item
            </Button>
          </Link>
          <Link to="/browse">
            <Button variant="ghost" size="lg" className="text-primary-foreground hover:bg-primary-foreground/10">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/dashboard/wardrobe">
            <Button variant="outline" className="w-full justify-start">
              <Shirt className="mr-2 h-4 w-4" />
              Manage Wardrobe
            </Button>
          </Link>
          <Link to="/dashboard/rentals">
            <Button variant="outline" className="w-full justify-start">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Rentals
            </Button>
          </Link>
          <Link to="/browse">
            <Button variant="outline" className="w-full justify-start">
              <Star className="mr-2 h-4 w-4" />
              Browse Items
            </Button>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      {totalItems === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <Shirt className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Your wardrobe is empty</h3>
          <p className="mt-2 text-muted-foreground">
            Add your first item to start renting, selling, or swapping!
          </p>
          <Link to="/dashboard/wardrobe">
            <Button variant="gradient" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Item
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
