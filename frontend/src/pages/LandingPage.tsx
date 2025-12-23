import { Link } from 'react-router-dom';
import { ArrowRight, Shirt, RefreshCw, DollarSign, Users, ShoppingBag, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assests/hero-fashion.jpg';


const steps = [
  {
    icon: Shirt,
    title: 'List Your Items',
    description: 'Upload photos and set your prices. Your wardrobe becomes a source of income.',
  },
  {
    icon: RefreshCw,
    title: 'Rent, Sell, or Swap',
    description: 'Choose how you want to share. Flexible options for every item.',
  },
  {
    icon: DollarSign,
    title: 'Earn & Save',
    description: 'Make money from items you rarely wear. Access designer pieces at a fraction of the cost.',
  },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '200K+', label: 'Items Listed' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '$2M+', label: 'Earned by Users' },
];

// Sample featured items for display
const featuredItems = [
  {
    id: '1',
    title: 'Designer Leather Jacket',
    brand: 'AllSaints',
    price: '$25/day',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    condition: 'Like New',
  },
  {
    id: '2',
    title: 'Vintage Floral Dress',
    brand: 'Reformation',
    price: '$18/day',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    condition: 'Good',
  },
  {
    id: '3',
    title: 'Premium Sneakers',
    brand: 'Nike',
    price: '$12/day',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
    condition: 'New',
  },
  {
    id: '4',
    title: 'Luxury Handbag',
    brand: 'Coach',
    price: '$30/day',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
    condition: 'Like New',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="gradient-mesh absolute inset-0 opacity-60" />

        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Hero Content */}
            <div className="animate-slide-up">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary-muted px-4 py-1.5 text-sm font-medium text-primary">
                <Star className="mr-2 h-4 w-4 fill-primary" />
                Sustainable Fashion Revolution
              </span>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Your Wardrobe,{' '}
                <span className="gradient-text">Reimagined</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Join the peer-to-peer fashion marketplace where you can rent, sell, and swap clothing.
                Access designer pieces, earn from your closet, and embrace sustainable fashion.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button variant="gradient" size="xl">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="hero" size="xl">
                    Browse Items
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-primary to-secondary"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">50,000+ happy users</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={heroImage}
                  alt="Fashion flat lay with designer clothing"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>

              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 animate-float rounded-2xl border border-border bg-card p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-muted">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Earned this month</p>
                    <p className="text-xl font-bold text-foreground">$1,240</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 -top-6 animate-float rounded-2xl border border-border bg-card p-4 shadow-xl" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Items rented</p>
                    <p className="text-xl font-bold text-foreground">2,847</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start sharing your wardrobe in three simple steps
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-300 hover:shadow-lg hover:border-primary/30"
                >
                  <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full gradient-bg text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-muted text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="bg-muted/50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Trending Now
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Discover what's popular in our community
              </p>
            </div>
            <Link to="/browse">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredItems.map((item) => (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg hover:border-primary/30"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
                      {item.condition}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                  <h3 className="mt-1 font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-lg font-bold text-foreground">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl gradient-bg p-12 lg:p-16">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl font-extrabold text-primary-foreground lg:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-primary-foreground/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-t border-border bg-muted/30 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Why Choose FashionRenewal?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We've built a platform you can trust
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-muted">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Secure Transactions</h3>
              <p className="mt-3 text-muted-foreground">
                All payments are protected. We hold funds until delivery is confirmed.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Verified Users</h3>
              <p className="mt-3 text-muted-foreground">
                Every user is verified. Trust scores help you choose reliable partners.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-muted">
                <Star className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Quality Guaranteed</h3>
              <p className="mt-3 text-muted-foreground">
                All items are verified for quality. Not satisfied? Full refund guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 lg:p-16">
                <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                  Ready to Transform Your Wardrobe?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Join thousands of fashion lovers who are earning from their closets and accessing designer pieces at a fraction of the cost.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link to="/signup">
                    <Button variant="gradient" size="lg">
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 gradient-mesh opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
