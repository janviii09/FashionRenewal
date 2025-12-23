import { Link } from 'react-router-dom';
import { Shirt, ShoppingBag, DollarSign, Star, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

const stats = [
  { label: 'Total Items', value: '12', icon: Shirt, color: 'primary' },
  { label: 'Active Rentals', value: '3', icon: ShoppingBag, color: 'secondary' },
  { label: 'Earnings', value: '$245', icon: DollarSign, color: 'success' },
  { label: 'Trust Score', value: '4.8', icon: Star, color: 'warning' },
];

const recentActivity = [
  { id: 1, text: 'John rented your Nike Jacket', time: '2 hours ago', type: 'rental' },
  { id: 2, text: 'Your rental of Blue Dress ends in 2 days', time: '5 hours ago', type: 'reminder' },
  { id: 3, text: 'Sarah left a 5-star review', time: '1 day ago', type: 'review' },
  { id: 4, text: 'New message from Mike', time: '2 days ago', type: 'message' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl gradient-bg p-6 text-primary-foreground lg:p-8">
        <h1 className="text-2xl font-bold lg:text-3xl">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="mt-2 text-primary-foreground/80">
          You have 3 active rentals and 2 pending requests.
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
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-muted`}>
                  <Icon className={`h-6 w-6 text-${stat.color}`} />
                </div>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <div className="mt-4 divide-y divide-border">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-4">
              <p className="text-foreground">{activity.text}</p>
              <span className="text-sm text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
