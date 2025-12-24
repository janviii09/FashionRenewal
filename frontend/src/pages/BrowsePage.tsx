import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { ItemCard } from '@/components/items/ItemCard';
import { useToast } from '@/hooks/use-toast';
import { wardrobeApi } from '@/lib/api';
import type { WardrobeItem, ItemFilters } from '@/types';
import { ItemAvailability } from '@/types';

export default function BrowsePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [availability, setAvailability] = useState<ItemAvailability | ''>('');
  const [priceRange, setPriceRange] = useState([0, 100]);
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

      const response = await wardrobeApi.getMarketplaceItems(filters);
      setItems(response.data);
    } catch (error: any) {
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

  const clearFilters = () => {
    setCategory('');
    setAvailability('');
    setPriceRange([0, 100]);
    setSearchQuery('');
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
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Browse Marketplace</h1>
          <p className="mt-2 text-muted-foreground">
            Discover unique pieces from our community
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border bg-card p-6">
              <h2 className="font-semibold">Filters</h2>
              <div className="mt-6">
                <FilterContent />
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex gap-4">
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
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
                <Search className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No items found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
