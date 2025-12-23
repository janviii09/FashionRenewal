import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import type { WardrobeItem } from '@/types';

interface ItemCardProps {
  item: WardrobeItem;
  className?: string;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ItemCard({ item, className, showActions }: ItemCardProps) {
  const displayPrice = item.rentPricePerDay 
    ? `$${item.rentPricePerDay}/day` 
    : item.sellPrice 
      ? `$${item.sellPrice}` 
      : 'Contact for price';

  return (
    <Link
      to={`/items/${item.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg hover:border-primary/30',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={item.images[0] || '/placeholder.svg'}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Availability badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.isAvailableForRent && (
            <span className="rounded-full bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground backdrop-blur-sm">
              Rent
            </span>
          )}
          {item.isAvailableForSale && (
            <span className="rounded-full bg-secondary/90 px-2 py-0.5 text-xs font-medium text-secondary-foreground backdrop-blur-sm">
              Buy
            </span>
          )}
          {item.isAvailableForSwap && (
            <span className="rounded-full bg-accent/90 px-2 py-0.5 text-xs font-medium text-accent-foreground backdrop-blur-sm">
              Swap
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Handle favorite
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 text-muted-foreground shadow-md backdrop-blur-sm transition-all hover:bg-card hover:text-secondary hover:scale-110"
        >
          <Heart className="h-5 w-5" />
        </button>

        {/* Condition badge */}
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={item.condition} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 overflow-hidden">
            <h3 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{item.brand}</p>
          </div>
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {item.size}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">{displayPrice}</span>
          
          {/* Rating */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span>4.8</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
