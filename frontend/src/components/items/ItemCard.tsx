import { Link } from 'react-router-dom';
import { Heart, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { WardrobeItem } from '@/types';
import { ItemAvailability } from '@/types';

interface ItemCardProps {
  item: WardrobeItem;
  className?: string;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export function ItemCard({ item, className, showActions, onEdit, onDelete }: ItemCardProps) {
  const displayPrice = item.rentPricePerDay
    ? `$${item.rentPricePerDay}/day`
    : item.sellPrice
      ? `$${item.sellPrice}`
      : 'Not for sale';

  const getAvailabilityBadge = () => {
    switch (item.availability) {
      case ItemAvailability.AVAILABLE_FOR_RENT:
        return <span className="rounded-full bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground backdrop-blur-sm">Rent</span>;
      case ItemAvailability.AVAILABLE_FOR_SALE:
        return <span className="rounded-full bg-secondary/90 px-2 py-0.5 text-xs font-medium text-secondary-foreground backdrop-blur-sm">Buy</span>;
      case ItemAvailability.AVAILABLE_FOR_SWAP:
        return <span className="rounded-full bg-accent/90 px-2 py-0.5 text-xs font-medium text-accent-foreground backdrop-blur-sm">Swap</span>;
      case ItemAvailability.PERSONAL_ONLY:
        return <span className="rounded-full bg-muted/90 px-2 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">Personal</span>;
      default:
        return null;
    }
  };

  return (
    <div className={cn('group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg hover:border-primary/30', className)}>
      <Link to={`/items/${item.id}`} className="flex flex-col flex-1">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={item.images[0] || '/placeholder.svg'}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Availability badge */}
          <div className="absolute left-3 top-3">
            {getAvailabilityBadge()}
          </div>

          {/* Condition badge */}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-card/80 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
              {item.condition}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 overflow-hidden">
              <h3 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.brand || 'No brand'}</p>
            </div>
            {item.size && (
              <span className="shrink-0 text-sm font-medium text-muted-foreground">
                {item.size}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">{displayPrice}</span>
            {item.owner && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>⭐ {item.owner.trustScore.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Actions for owner */}
      {showActions && (
        <div className="flex gap-2 border-t p-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              onEdit?.();
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onDelete?.();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
