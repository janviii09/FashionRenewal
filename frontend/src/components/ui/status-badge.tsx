import { cn } from '@/lib/utils';
import type { OrderStatus, ItemCondition } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus | ItemCondition | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'default' | 'secondary' }> = {
  // Order statuses
  REQUESTED: { label: 'Requested', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  DISPATCHED: { label: 'Dispatched', variant: 'default' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  IN_USE: { label: 'In Use', variant: 'default' },
  RETURN_REQUESTED: { label: 'Return Requested', variant: 'warning' },
  RETURNED: { label: 'Returned', variant: 'secondary' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  DISPUTED: { label: 'Disputed', variant: 'destructive' },
  // Item conditions
  NEW: { label: 'New', variant: 'success' },
  LIKE_NEW: { label: 'Like New', variant: 'success' },
  GOOD: { label: 'Good', variant: 'default' },
  FAIR: { label: 'Fair', variant: 'warning' },
  WORN: { label: 'Worn', variant: 'secondary' },
  // Item availability
  AVAILABLE: { label: 'Available', variant: 'success' },
  RENTED: { label: 'Rented', variant: 'warning' },
  SOLD: { label: 'Sold', variant: 'secondary' },
  UNAVAILABLE: { label: 'Unavailable', variant: 'destructive' },
};

const variantStyles = {
  success: 'bg-success-muted text-success border-success/20',
  warning: 'bg-warning-muted text-warning-foreground border-warning/20',
  destructive: 'bg-destructive-muted text-destructive border-destructive/20',
  default: 'bg-primary-muted text-primary border-primary/20',
  secondary: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[config.variant],
        className
      )}
    >
      {config.label}
    </span>
  );
}
