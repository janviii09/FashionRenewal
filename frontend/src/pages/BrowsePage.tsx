import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/items/ItemCard';
import { CategoryShowcase } from '@/components/marketplace/CategoryShowcase';
import { wardrobeApi } from '@/lib/api';
import type { WardrobeItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface BrowsePreview {
  featured: WardrobeItem[];
  trending: WardrobeItem[];
  mostRented: WardrobeItem[];
  newlyAdded: WardrobeItem[];
  meta: {
    totalMarketplaceItems: number;
    responseTime: string;
  };
}

// Category images
const categories = [
  {
    id: 'dresses',
    title: 'Dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    link: '/discover?category=dress',
  },
  {
    id: 'outerwear',
    title: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    link: '/discover?category=jacket',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
    link: '/discover?category=accessories',
  },
  {
    id: 'shoes',
    title: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
    link: '/discover?category=shoes',
  },
];

export default function BrowsePage() {
  const [preview, setPreview] = useState<BrowsePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await wardrobeApi.getBrowsePreview();
      setPreview(response.data);
    } catch (error: any) {
      console.error('Error fetching browse preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to load items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BrowseSkeleton />;
  }

  if (!preview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Failed to load</h2>
          <Button onClick={fetchPreview}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Browse Fashion</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover curated collections from our marketplace. Preview trending items,
            popular rentals, and fresh arrivals.
          </p>
        </div>

        {/* Category Showcase */}
        <CategoryShowcase
          title="Shop by Category"
          subtitle="Find exactly what you're looking for"
          categories={categories}
        />

        {/* Featured Items */}
        {preview.featured.length > 0 && (
          <Section
            title="Featured Items"
            subtitle="Handpicked for quality and style"
            items={preview.featured}
            icon={<Star className="h-6 w-6" />}
            iconColor="text-yellow-500"
          />
        )}

        {/* Trending Today */}
        {preview.trending.length > 0 && (
          <Section
            title="Trending Today"
            subtitle="What's hot right now"
            items={preview.trending}
            icon={<TrendingUp className="h-6 w-6" />}
            iconColor="text-pink-500"
          />
        )}

        {/* Most Rented This Week */}
        {preview.mostRented.length > 0 && (
          <Section
            title="Most Rented This Week"
            subtitle="Popular choices from our community"
            items={preview.mostRented}
            icon={<Sparkles className="h-6 w-6" />}
            iconColor="text-purple-500"
          />
        )}

        {/* Newly Added */}
        {preview.newlyAdded.length > 0 && (
          <Section
            title="Newly Added"
            subtitle="Fresh arrivals to the marketplace"
            items={preview.newlyAdded}
            icon={<Clock className="h-6 w-6" />}
            iconColor="text-blue-500"
          />
        )}

        {/* CTA to Discover */}
        <div className="mt-20 mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-12 text-center">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Explore More?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Browse our complete collection of items with advanced filters, sorting, and search.
              </p>
              <Link to="/discover">
                <Button variant="gradient" size="lg" className="min-w-[300px] text-lg h-14">
                  View All Items
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Filter by category, price, size, condition, and more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  subtitle: string;
  items: WardrobeItem[];
  icon?: React.ReactNode;
  iconColor?: string;
}

function Section({ title, subtitle, items, icon, iconColor }: SectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className={iconColor}>{icon}</div>}
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function BrowseSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 w-64 bg-muted rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-muted rounded mx-auto animate-pulse" />
        </div>

        {/* Category Skeleton */}
        <div className="mb-16">
          <div className="h-8 w-48 bg-muted rounded mb-6 animate-pulse" />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Sections Skeleton */}
        {[...Array(4)].map((_, sectionIndex) => (
          <div key={sectionIndex} className="mt-16">
            <div className="h-8 w-64 bg-muted rounded mb-6 animate-pulse" />
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
