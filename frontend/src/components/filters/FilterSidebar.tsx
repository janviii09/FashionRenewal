import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ItemAvailability, ItemCondition } from '@/types';
import { cn } from '@/lib/utils';
import { wardrobeApi } from '@/lib/api';

export interface FilterState {
    category: string;
    availability: ItemAvailability | '';
    minPrice: number;
    maxPrice: number;
    sizes: string[];
    conditions: ItemCondition[];
}

interface FilterSidebarProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    itemCount: number;
    onClose?: () => void; // For mobile
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const conditions: ItemCondition[] = [ItemCondition.LIKE_NEW, ItemCondition.GOOD, ItemCondition.FAIR];

export function FilterSidebar({ filters, onFilterChange, itemCount, onClose }: FilterSidebarProps) {
    const [categories, setCategories] = useState<string[]>([]);
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        availability: true,
        price: true,
        size: false,
        condition: false,
    });

    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await wardrobeApi.getCategories();
                setCategories(['All Categories', ...response.data]);
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback to default categories
                setCategories(['All Categories', 'Women', 'Men', 'Kids']);
            }
        };
        fetchCategories();
    }, []);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleClearAll = () => {
        onFilterChange({
            category: '',
            availability: '',
            minPrice: 0,
            maxPrice: 1000,
            sizes: [],
            conditions: [],
        });
    };

    const activeFilterCount = [
        filters.category,
        filters.availability,
        filters.sizes.length > 0,
        filters.conditions.length > 0,
        filters.minPrice > 0 || filters.maxPrice < 1000,
    ].filter(Boolean).length;

    return (
        <aside className="w-full md:w-64 bg-card border-r border-border h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-lg text-foreground">Filters</h2>
                    {activeFilterCount > 0 && (
                        <span className="text-xs text-muted-foreground">{activeFilterCount} active</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleClearAll}>
                            Clear All
                        </Button>
                    )}
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 space-y-6">
                {/* Category */}
                <div>
                    <button
                        onClick={() => toggleSection('category')}
                        className="flex items-center justify-between w-full mb-3"
                    >
                        <span className="font-semibold text-sm text-foreground">Category</span>
                        {expandedSections.category ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                    {expandedSections.category && (
                        <div className="space-y-1">
                            {categories.map((cat, index) => (
                                <button
                                    key={cat}
                                    onClick={() => onFilterChange({ ...filters, category: index === 0 ? '' : cat })}
                                    className={cn(
                                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                        (index === 0 && !filters.category) || filters.category === cat
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Availability */}
                <div>
                    <button
                        onClick={() => toggleSection('availability')}
                        className="flex items-center justify-between w-full mb-3"
                    >
                        <span className="font-semibold text-sm text-foreground">Availability</span>
                        {expandedSections.availability ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                    {expandedSections.availability && (
                        <div className="space-y-2">
                            {[
                                { value: '', label: 'All' },
                                { value: ItemAvailability.AVAILABLE_FOR_RENT, label: 'For Rent' },
                                { value: ItemAvailability.AVAILABLE_FOR_SALE, label: 'For Sale' },
                                { value: ItemAvailability.AVAILABLE_FOR_SWAP, label: 'For Swap' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onFilterChange({ ...filters, availability: option.value as ItemAvailability | '' })}
                                    className={cn(
                                        'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                        filters.availability === option.value
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-muted-foreground hover:bg-muted'
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Range */}
                <div>
                    <button
                        onClick={() => toggleSection('price')}
                        className="flex items-center justify-between w-full mb-3"
                    >
                        <span className="font-semibold text-sm text-foreground">Price Range</span>
                        {expandedSections.price ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                    {expandedSections.price && (
                        <div className="space-y-4">
                            <Slider
                                min={0}
                                max={1000}
                                step={10}
                                value={[filters.minPrice, filters.maxPrice]}
                                onValueChange={([min, max]) => onFilterChange({ ...filters, minPrice: min, maxPrice: max })}
                            />
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>${filters.minPrice}</span>
                                <span>${filters.maxPrice}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Size */}
                <div>
                    <button
                        onClick={() => toggleSection('size')}
                        className="flex items-center justify-between w-full mb-3"
                    >
                        <span className="font-semibold text-sm text-foreground">Size</span>
                        {expandedSections.size ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                    {expandedSections.size && (
                        <div className="grid grid-cols-3 gap-2">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => {
                                        const newSizes = filters.sizes.includes(size)
                                            ? filters.sizes.filter(s => s !== size)
                                            : [...filters.sizes, size];
                                        onFilterChange({ ...filters, sizes: newSizes });
                                    }}
                                    className={cn(
                                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                                        filters.sizes.includes(size)
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-foreground border-border hover:bg-muted'
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Condition */}
                <div>
                    <button
                        onClick={() => toggleSection('condition')}
                        className="flex items-center justify-between w-full mb-3"
                    >
                        <span className="font-semibold text-sm text-foreground">Condition</span>
                        {expandedSections.condition ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                    {expandedSections.condition && (
                        <div className="space-y-2">
                            {conditions.map((condition) => (
                                <div key={condition} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={condition}
                                        checked={filters.conditions.includes(condition)}
                                        onCheckedChange={(checked) => {
                                            const newConditions = checked
                                                ? [...filters.conditions, condition]
                                                : filters.conditions.filter(c => c !== condition);
                                            onFilterChange({ ...filters, conditions: newConditions });
                                        }}
                                    />
                                    <Label htmlFor={condition} className="text-sm cursor-pointer">
                                        {condition.replace('_', ' ')}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Count */}
            <div className="sticky bottom-0 bg-card border-t border-border p-4">
                <p className="text-sm text-muted-foreground text-center">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} found
                </p>
            </div>
        </aside>
    );
}
