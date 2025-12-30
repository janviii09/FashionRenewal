import { WardrobeItem } from '@/types';
import { ItemCard } from './ItemCard';
import { Loader2 } from 'lucide-react';

interface ItemGridProps {
    items: WardrobeItem[];
    loading?: boolean;
    emptyMessage?: string;
    columns?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
}

export function ItemGrid({
    items,
    loading = false,
    emptyMessage = 'No items found',
    columns = { sm: 2, md: 3, lg: 3, xl: 4 }
}: ItemGridProps) {
    if (loading) {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="aspect-square bg-muted rounded-2xl"></div>
                        <div className="mt-4 h-4 bg-muted rounded w-3/4"></div>
                        <div className="mt-2 h-4 bg-muted rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                    <Loader2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Items Found</h3>
                <p className="text-muted-foreground text-center max-w-md">{emptyMessage}</p>
            </div>
        );
    }

    const gridClasses = `grid gap-6 
    ${columns.sm ? `sm:grid-cols-${columns.sm}` : 'sm:grid-cols-2'} 
    ${columns.md ? `md:grid-cols-${columns.md}` : 'md:grid-cols-3'} 
    ${columns.lg ? `lg:grid-cols-${columns.lg}` : 'lg:grid-cols-3'} 
    ${columns.xl ? `xl:grid-cols-${columns.xl}` : 'xl:grid-cols-4'}`;

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
                <ItemCard key={item.id} item={item} />
            ))}
        </div>
    );
}
