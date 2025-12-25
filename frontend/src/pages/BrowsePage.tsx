import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { ItemCard } from '@/components/items/ItemCard';
import { CategoryShowcase } from '@/components/marketplace/CategoryShowcase';
import { useToast } from '@/hooks/use-toast';
import { wardrobeApi } from '@/lib/api';
import type { WardrobeItem, ItemFilters } from '@/types';
import { ItemAvailability } from '@/types';

// Category images - using generated images
const categories = [
  {
    id: 'dresses',
    title: 'Dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    link: '/browse?category=dress',
  },
  {
    id: 'outerwear',
    title: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    link: '/browse?category=jacket',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
    link: '/browse?category=accessories',
  },
  {
    id: 'shoes',
    title: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop',
    link: '/browse?category=shoes',
  },
];

export default function BrowsePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [availability, setAvailability] = useState<ItemAvailability | ''>('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showPreview, setShowPreview] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const filters: ItemFilters = {
        search: searchQuery || undefined,
        category: category || undefined,
        availability: availability || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      };

      console.log('🔍 Fetching marketplace items with filters:', filters);
      const response = await wardrobeApi.getMarketplaceItems(filters);
      console.log('✅ Marketplace API response:', response.data);
      console.log('📊 Number of items:', response.data.length);
      setItems(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching marketplace items:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery, category, availability, priceRange]);

  useEffect(() => {
    console.log('🔄 Items state updated:', items);
    console.log('📏 Items length:', items.length);
  }, [items]);

  // Hide preview when user applies any filter
  useEffect(() => {
    if (searchQuery || category || availability) {
      setShowPreview(false);
    }
  }, [searchQuery, category, availability]);

  const clearFilters = () => {
    setCategory('');
    setAvailability('');
    setSearchQuery('');
    setPriceRange([0, 100]);
    setShowPreview(true); // Show preview again when filters are cleared
  };

  const hasActiveFilters = category || availability || priceRange[0] > 0 || priceRange[1] < 100;

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <Input
          placeholder="e.g., Jacket, Dress"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        <Select value={availability} onValueChange={(value) => setAvailability(value as ItemAvailability)}>
          <SelectTrigger>
            <SelectValue placeholder="All options" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ItemAvailability.AVAILABLE_FOR_RENT}>For Rent</SelectItem>
            <SelectItem value={ItemAvailability.AVAILABLE_FOR_SALE}>For Sale</SelectItem>
            <SelectItem value={ItemAvailability.AVAILABLE_FOR_SWAP}>For Swap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Price Range</Label>
          <span className="text-sm text-muted-foreground">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={100}
          step={5}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}

      <div className="container mx-auto px-4 py-8">
        {/* Preview Section - Show first 6 items */}
        {showPreview && items.length > 0 && (
          <section className="mb-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold">Discover Fashion</h2>
                <p className="mt-2 text-muted-foreground">
                  Fresh items
                </p>
              </div>
              {items.length > 6 && (
                <Button variant="outline" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                  Show More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.slice(0, 6).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {items.length > 6 && (
              <div className="mt-8 text-center">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                  View All {items.length} Items
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Category Showcase */}
        <CategoryShowcase
          title="Shop by Category"
          subtitle="Find exactly what you're looking for"
          categories={categories}
        />

        {/* Shop by Availability */}
        <section className="mt-16 mb-12">
          <h2 className="text-2xl font-bold mb-6">Shop by Type</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <button
              onClick={() => setAvailability(ItemAvailability.AVAILABLE_FOR_RENT)}
              className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 text-left transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
              <h3 className="relative text-2xl font-bold text-foreground">Rent Outfits</h3>
              <p className="relative mt-2 text-muted-foreground">Designer pieces for special occasions</p>
            </button>
            <button
              onClick={() => setAvailability(ItemAvailability.AVAILABLE_FOR_SALE)}
              className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 text-left transition-all hover:border-secondary hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-secondary/10 blur-3xl transition-all group-hover:bg-secondary/20" />
              <h3 className="relative text-2xl font-bold text-foreground">Shop Preloved</h3>
              <p className="relative mt-2 text-muted-foreground">Sustainable fashion at great prices</p>
            </button>
            <button
              onClick={() => setAvailability(ItemAvailability.AVAILABLE_FOR_SWAP)}
              className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 text-left transition-all hover:border-accent hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl transition-all group-hover:bg-accent/20" />
              <h3 className="relative text-2xl font-bold text-foreground">Swap Items</h3>
              <p className="relative mt-2 text-muted-foreground">Exchange with the community</p>
            </button>
          </div>
        </section>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold">Filters</h2>
              <div className="mt-6">
                <FilterContent />
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <p className="mb-6 text-sm text-muted-foreground">
              Showing {items.length} items
            </p>

            {items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20">
                <Search className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-6 text-xl font-semibold">No items found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" className="mt-6" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
