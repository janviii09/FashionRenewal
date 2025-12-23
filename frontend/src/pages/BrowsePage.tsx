import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { ItemCard } from '@/components/items/ItemCard';
import type { WardrobeItem, ItemCategory, ItemSize, ItemCondition, ItemFilters } from '@/types';

// Sample items for display
const sampleItems: WardrobeItem[] = [
  {
    id: '1',
    userId: 'u1',
    title: 'Designer Leather Jacket',
    description: 'Premium quality leather jacket in excellent condition.',
    brand: 'AllSaints',
    category: 'JACKET',
    size: 'M',
    condition: 'LIKE_NEW',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop'],
    rentPricePerDay: 25,
    sellPrice: 350,
    isAvailableForRent: true,
    isAvailableForSale: true,
    isAvailableForSwap: false,
    status: 'AVAILABLE',
    views: 245,
    favorites: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'u2',
    title: 'Vintage Floral Dress',
    description: 'Beautiful vintage dress perfect for special occasions.',
    brand: 'Reformation',
    category: 'DRESS',
    size: 'S',
    condition: 'GOOD',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop'],
    rentPricePerDay: 18,
    isAvailableForRent: true,
    isAvailableForSale: false,
    isAvailableForSwap: true,
    status: 'AVAILABLE',
    views: 189,
    favorites: 28,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'u3',
    title: 'Premium Sneakers',
    description: 'Limited edition sneakers in brand new condition.',
    brand: 'Nike',
    category: 'SHOES',
    size: 'M',
    condition: 'NEW',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop'],
    rentPricePerDay: 12,
    sellPrice: 220,
    isAvailableForRent: true,
    isAvailableForSale: true,
    isAvailableForSwap: false,
    status: 'AVAILABLE',
    views: 456,
    favorites: 67,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    userId: 'u4',
    title: 'Luxury Handbag',
    description: 'Elegant designer handbag for any occasion.',
    brand: 'Coach',
    category: 'BAG',
    size: 'ONE_SIZE',
    condition: 'LIKE_NEW',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop'],
    rentPricePerDay: 30,
    sellPrice: 450,
    isAvailableForRent: true,
    isAvailableForSale: true,
    isAvailableForSwap: false,
    status: 'AVAILABLE',
    views: 312,
    favorites: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    userId: 'u5',
    title: 'Classic Blazer',
    description: 'Timeless blazer perfect for work or events.',
    brand: 'Theory',
    category: 'JACKET',
    size: 'L',
    condition: 'GOOD',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop'],
    rentPricePerDay: 20,
    sellPrice: 280,
    isAvailableForRent: true,
    isAvailableForSale: true,
    isAvailableForSwap: true,
    status: 'AVAILABLE',
    views: 156,
    favorites: 21,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    userId: 'u6',
    title: 'Silk Evening Gown',
    description: 'Stunning silk gown for formal events.',
    brand: 'BCBG',
    category: 'DRESS',
    size: 'M',
    condition: 'LIKE_NEW',
    images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop'],
    rentPricePerDay: 45,
    isAvailableForRent: true,
    isAvailableForSale: false,
    isAvailableForSwap: false,
    status: 'AVAILABLE',
    views: 289,
    favorites: 54,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    userId: 'u7',
    title: 'Denim Jacket',
    description: 'Classic denim jacket with a modern fit.',
    brand: 'Levi\'s',
    category: 'JACKET',
    size: 'M',
    condition: 'GOOD',
    images: ['https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400&h=500&fit=crop'],
    rentPricePerDay: 15,
    sellPrice: 120,
    isAvailableForRent: true,
    isAvailableForSale: true,
    isAvailableForSwap: true,
    status: 'AVAILABLE',
    views: 178,
    favorites: 23,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    userId: 'u8',
    title: 'Summer Maxi Dress',
    description: 'Flowy maxi dress perfect for summer.',
    brand: 'Free People',
    category: 'DRESS',
    size: 'S',
    condition: 'NEW',
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop'],
    rentPricePerDay: 22,
    sellPrice: 180,
    isAvailableForRent: true,
    isAvailableForSale: true,
    isAvailableForSwap: false,
    status: 'AVAILABLE',
    views: 234,
    favorites: 41,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'SHIRT', label: 'Shirt' },
  { value: 'PANTS', label: 'Pants' },
  { value: 'DRESS', label: 'Dress' },
  { value: 'JACKET', label: 'Jacket' },
  { value: 'COAT', label: 'Coat' },
  { value: 'SKIRT', label: 'Skirt' },
  { value: 'SHOES', label: 'Shoes' },
  { value: 'ACCESSORIES', label: 'Accessories' },
  { value: 'BAG', label: 'Bag' },
  { value: 'OTHER', label: 'Other' },
];

const sizes: { value: ItemSize; label: string }[] = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'ONE_SIZE', label: 'One Size' },
];

const conditions: { value: ItemCondition; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'WORN', label: 'Worn' },
];

export default function BrowsePage() {
  const [filters, setFilters] = useState<ItemFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return sampleItems.filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !item.title.toLowerCase().includes(query) &&
          !item.brand.toLowerCase().includes(query) &&
          !item.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (filters.category && item.category !== filters.category) {
        return false;
      }

      if (filters.size && item.size !== filters.size) {
        return false;
      }

      if (filters.condition && item.condition !== filters.condition) {
        return false;
      }

      if (filters.availability) {
        if (filters.availability === 'rent' && !item.isAvailableForRent) return false;
        if (filters.availability === 'sale' && !item.isAvailableForSale) return false;
        if (filters.availability === 'swap' && !item.isAvailableForSwap) return false;
      }

      const price = item.rentPricePerDay || 0;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [filters, searchQuery, priceRange]);

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 100]);
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || priceRange[0] > 0 || priceRange[1] < 100;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value as ItemCategory })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Size */}
      <div className="space-y-2">
        <Label>Size</Label>
        <Select
          value={filters.size}
          onValueChange={(value) => setFilters({ ...filters, size: value as ItemSize })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All sizes" />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label>Condition</Label>
        <Select
          value={filters.condition}
          onValueChange={(value) => setFilters({ ...filters, condition: value as ItemCondition })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any condition" />
          </SelectTrigger>
          <SelectContent>
            {conditions.map((cond) => (
              <SelectItem key={cond.value} value={cond.value}>
                {cond.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <Label>Availability</Label>
        <Select
          value={filters.availability}
          onValueChange={(value) => setFilters({ ...filters, availability: value as 'rent' | 'sale' | 'swap' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All options" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rent">For Rent</SelectItem>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="swap">For Swap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Price Range (per day)</Label>
          <span className="text-sm text-muted-foreground">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground">Browse Items</h1>
          <p className="mt-2 text-muted-foreground">
            Discover unique pieces from our community
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground">Filters</h2>
              <div className="mt-6">
                <FilterContent />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Mobile Filter */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        !
                      </span>
                    )}
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

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.category && (
                  <button
                    onClick={() => setFilters({ ...filters, category: undefined })}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-muted px-3 py-1 text-sm text-primary"
                  >
                    {categories.find(c => c.value === filters.category)?.label}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {filters.size && (
                  <button
                    onClick={() => setFilters({ ...filters, size: undefined })}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-muted px-3 py-1 text-sm text-primary"
                  >
                    {filters.size}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {filters.condition && (
                  <button
                    onClick={() => setFilters({ ...filters, condition: undefined })}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-muted px-3 py-1 text-sm text-primary"
                  >
                    {conditions.find(c => c.value === filters.condition)?.label}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Results count */}
            <p className="mb-6 text-sm text-muted-foreground">
              Showing {filteredItems.length} items
            </p>

            {/* Items Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
                <Search className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No items found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
