import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ItemGrid } from '@/components/items/ItemGrid';
import { FilterSidebar, FilterState } from '@/components/filters/FilterSidebar';
import { SortDropdown, SortOption, sortOptions } from '@/components/filters/SortDropdown';
import { Pagination } from '@/components/pagination/Pagination';
import { wardrobeApi } from '@/lib/api';
import type { WardrobeItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 24;

interface DiscoverResponse {
    items: WardrobeItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export default function DiscoverFashionPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { toast } = useToast();

    // State
    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Initialize filters from URL or localStorage
    const [filters, setFilters] = useState<FilterState>(() => {
        // Try URL first
        const category = searchParams.get('category');
        const availability = searchParams.get('availability');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const size = searchParams.get('size');
        const condition = searchParams.get('condition');

        if (category || availability || minPrice || maxPrice || size || condition) {
            return {
                category: category || '',
                availability: availability || '',
                minPrice: minPrice ? Number(minPrice) : 0,
                maxPrice: maxPrice ? Number(maxPrice) : 1000,
                sizes: size ? [size] : [],
                conditions: condition ? [condition] : [],
            };
        }

        // Try localStorage
        const stored = localStorage.getItem('discover_filters');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored filters:', e);
            }
        }

        // Defaults
        return {
            category: '',
            availability: '',
            minPrice: 0,
            maxPrice: 1000,
            sizes: [],
            conditions: [],
        };
    });

    // Initialize sort from URL
    const [sortOption, setSortOption] = useState<SortOption>(() => {
        const sortParam = searchParams.get('sort');
        return sortOptions.find(opt => opt.field === sortParam) || sortOptions[0];
    });

    // Initialize page from URL
    const [currentPage, setCurrentPage] = useState(() => {
        const pageParam = searchParams.get('page');
        return pageParam ? Number(pageParam) : 1;
    });

    // Fetch items when filters/sort/page change
    useEffect(() => {
        fetchItems();
    }, [filters, sortOption, currentPage]);

    // Sync to URL and localStorage
    useEffect(() => {
        const params = new URLSearchParams();

        // Add filters to URL
        if (filters.category) params.set('category', filters.category);
        if (filters.availability) params.set('availability', filters.availability);
        if (filters.minPrice > 0) params.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice < 1000) params.set('maxPrice', String(filters.maxPrice));
        if (filters.sizes.length > 0) params.set('size', filters.sizes[0]);
        if (filters.conditions.length > 0) params.set('condition', filters.conditions[0]);

        // Add sort to URL
        if (sortOption.field !== 'createdAt') params.set('sort', sortOption.field);

        // Add page to URL
        if (currentPage > 1) params.set('page', String(currentPage));

        setSearchParams(params, { replace: true });

        // Save to localStorage
        localStorage.setItem('discover_filters', JSON.stringify(filters));
    }, [filters, sortOption, currentPage]);

    const fetchItems = async () => {
        try {
            setLoading(true);

            const response = await wardrobeApi.discover({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                category: filters.category || undefined,
                availability: filters.availability || undefined,
                minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
                maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : undefined,
                size: filters.sizes[0] || undefined,
                condition: filters.conditions[0] || undefined,
                sort: sortOption.field || 'latest' // Use field property from SortOption
            });

            const data = response.data as DiscoverResponse;
            setItems(data.items);
            setPagination(data.pagination);
        } catch (error: any) {
            console.error('Error fetching items:', error);
            toast({
                title: 'Error',
                description: 'Failed to load items. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSortChange = (newSort: SortOption) => {
        setSortOption(newSort);
        setCurrentPage(1); // Reset to first page when sort changes
    };

    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, pagination.total);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link to="/" className="hover:text-foreground transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link to="/browse" className="hover:text-foreground transition-colors">
                            Browse
                        </Link>
                        <span>/</span>
                        <span className="text-foreground font-medium">Discover Fashion</span>
                    </nav>

                    {/* Title */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Discover Fashion</h1>
                            <p className="mt-2 text-muted-foreground">
                                Explore our complete collection with advanced filters
                            </p>
                        </div>

                        {/* Mobile Filter Button */}
                        <Button
                            variant="outline"
                            className="md:hidden"
                            onClick={() => setShowMobileFilters(true)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Desktop Filter Sidebar */}
                    <div className="hidden md:block">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            itemCount={pagination.total}
                        />
                    </div>

                    {/* Mobile Filter Sidebar (Overlay) */}
                    {showMobileFilters && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                                onClick={() => setShowMobileFilters(false)}
                            />
                            <div className="fixed inset-y-0 left-0 w-80 z-50 md:hidden">
                                <FilterSidebar
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    itemCount={pagination.total}
                                    onClose={() => setShowMobileFilters(false)}
                                />
                            </div>
                        </>
                    )}

                    {/* Items Grid */}
                    <div className="flex-1">
                        {/* Sort & Count */}
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <p className="text-sm text-muted-foreground">
                                {loading ? (
                                    'Loading...'
                                ) : pagination.total > 0 ? (
                                    `Showing ${startItem}-${endItem} of ${pagination.total} items`
                                ) : (
                                    'No items found'
                                )}
                            </p>
                            <SortDropdown value={sortOption} onChange={handleSortChange} />
                        </div>

                        {/* Items */}
                        <ItemGrid
                            items={items}
                            loading={loading}
                            emptyMessage="No items match your filters. Try adjusting your search criteria."
                            hideOwnItems={true}
                        />

                        {/* Pagination */}
                        {!loading && pagination.totalPages > 1 && (
                            <div className="mt-12">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}

                        {/* Back to Browse CTA */}
                        {!loading && pagination.total === 0 && (
                            <div className="mt-12 text-center">
                                <Link to="/browse">
                                    <Button variant="outline" size="lg">
                                        ← Back to Browse
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
