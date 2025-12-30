import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Shirt, RefreshCw, DollarSign, Users, ShoppingBag, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/marketplace/CategoryCard';
import { ItemCard } from '@/components/items/ItemCard';
import { wardrobeApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { WardrobeItem } from '@/types';
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



// Category hero sections
const categoryHeroSections = [
  {
    id: 'rent',
    title: 'RENT OUTFITS',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop',
    link: '/browse?availability=AVAILABLE_FOR_RENT',
  },
  {
    id: 'shop',
    title: 'SHOP PRELOVED',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop',
    link: '/browse?availability=AVAILABLE_FOR_SALE',
  },
  {
    id: 'sell',
    title: 'SELL WITH US',
    image: 'https://imgs.search.brave.com/lVBcto-jIDocZYBsH04apgKFvY2VNRedqoLG3s_J6Bs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9zdG9jay1tYXJr/ZXQtdHJhZGluZy1k/aWNlLWJ1eS1zZWxs/LWNvbmNlcHRfMTI4/NDkzNS01NTUyLmpw/Zz9zZW10PWFpc19o/eWJyaWQmdz03NDAm/cT04MA',
    link: '/dashboard/wardrobe',
  },
  {
    id: 'bags',
    title: 'BAGS & ACCESSORIES',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop',
    link: '/browse?category=accessories',
  },
];

export default function LandingPage() {
  const [trendingItems, setTrendingItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchTrendingItems = async () => {
      try {
        const response = await wardrobeApi.getMarketplaceItems();
        // Get first 4 items for trending section
        setTrendingItems(response.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch trending items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingItems();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="gradient-mesh absolute inset-0 opacity-60" />

        <div className="container relative mx-auto px-4 py-12 lg:py-20">
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
                  <p className="text-sm text-muted-foreground">Happy users</p>
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
                    <p className="text-xl font-bold text-foreground"></p>
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
                    <p className="text-xl font-bold text-foreground"></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One Wardrobe. Multiple Possibilities - Visual + Text Hybrid */}
      <section className="py-16 lg:py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Visual-heavy - Masonry Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Image 1 - Tall */}
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <img
                      src="https://imgs.search.brave.com/eri6Rxzk-kiACINDQqLG29XhS-E_iht5juOm0fIneok/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTIy/MjQ4Mjg2NS9waG90/by93b21hbi1yZW9y/Z2FuaXppbmctaGVy/LXdhcmRyb2JlLWlu/LWhlci1iZWRyb29t/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz0xa1ZkYlhGQUxy/SFNzeGV4NWV1blFr/YTAzNXZ3YW8yUDF5/SjVnejZnZS1ZPQ"
                      alt="Organizing wardrobe"
                      className="w-full h-80 object-cover"
                    />
                  </div>
                  {/* Image 3 - Short */}
                  <div className="relative overflow-hidden rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <img
                      src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop"
                      alt="Sustainable fashion"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>

                {/* Image 2 & 4 - Staggered */}
                <div className="space-y-4 pt-8">
                  <div className="relative overflow-hidden rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <img
                      src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop"
                      alt="Closet organization"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="relative overflow-hidden rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <img
                      src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop"
                      alt="Fashion styling"
                      className="w-full h-80 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-card rounded-2xl shadow-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-muted">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Verified Community</p>
                    <p className="text-xs text-muted-foreground">Trusted & Safe</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Concise, structured text */}
            <div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                One Wardrobe.
                <br />
                <span className="gradient-text">Multiple Possibilities.</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start by digitally organizing your personal wardrobe. No pressure to rent or sell.
                Later, when you're ready, choose to share, earn, or exchange — on your terms.
              </p>

              <div className="mt-8 space-y-6">
                {/* Point 1 */}
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-muted">
                    <Shirt className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Personal Wardrobe First</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add your clothes, keep them private, track what you own — no selling required.
                    </p>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-muted">
                    <RefreshCw className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Smart Decisions Later</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Convert items to rent, sell, or exchange anytime. Your wardrobe, your rules.
                    </p>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-muted">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Trusted Community</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Verified users, ratings, and accountability. Sustainable fashion made simple.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm italic text-muted-foreground border-l-2 border-primary pl-4">
                "Keep items private or make them available later — totally up to you. No subscription needed."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 lg:py-15">
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

      {/* Category Hero Sections */}
      <section className="py-12 lg:py-15">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Explore Our Marketplace
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover endless possibilities for your wardrobe
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {categoryHeroSections.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.title}
                image={category.image}
                link={category.link}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="bg-muted/50 py-12 lg:py-15">
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

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-2xl"></div>
                  <div className="mt-4 h-4 bg-muted rounded w-3/4"></div>
                  <div className="mt-2 h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))
            ) : trendingItems.length > 0 ? (
              trendingItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No items available yet. Be the first to list!</p>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Trust Signals */}
      <section className="border-t border-border bg-muted/30 py-12 lg:py-15">
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
      {/* CTA Section - Only show if not logged in */}
      {!isAuthenticated && (
        <section className="py-12 lg:py-15">
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
                        Get Started
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
      )}
    </div>
  );
}
