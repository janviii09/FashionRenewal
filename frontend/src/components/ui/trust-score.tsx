import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustScoreProps {
  score: number;
  maxScore?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrustScore({ 
  score, 
  maxScore = 5, 
  showValue = true, 
  size = 'md',
  className 
}: TrustScoreProps) {
  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = maxScore - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star 
          key={`full-${i}`} 
          className={cn(starSizes[size], 'fill-warning text-warning')} 
        />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className={cn(starSizes[size], 'text-muted-foreground/30')} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={cn(starSizes[size], 'fill-warning text-warning')} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star 
          key={`empty-${i}`} 
          className={cn(starSizes[size], 'text-muted-foreground/30')} 
        />
      ))}
      
      {/* Value */}
      {showValue && (
        <span className={cn(textSizes[size], 'ml-1 font-medium text-muted-foreground')}>
          {score.toFixed(1)}
        </span>
      )}
    </div>
  );
}
