import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number | null;
  change?: number | null;
  changePercent?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showChange?: boolean;
  className?: string;
}

export function PriceDisplay({
  price,
  change,
  changePercent,
  size = 'md',
  showChange = true,
  className,
}: PriceDisplayProps) {
  if (price === null || price === undefined) {
    return (
      <div className={cn('text-muted-foreground/60 italic text-sm', className)}>
        Price not available
      </div>
    );
  }

  const isPositive = typeof changePercent === 'number' && changePercent > 0;
  const isNegative = typeof changePercent === 'number' && changePercent < 0;
  const isZero = typeof changePercent === 'number' && changePercent === 0;

  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-3xl font-bold',
  }[size];

  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn('tabular-nums tracking-tight text-foreground', sizeClasses)}>
        ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>

      {showChange && changePercent !== null && changePercent !== undefined && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs tabular-nums font-medium px-1.5 py-0.5 rounded',
            isPositive && 'bg-gain/15 text-gain',
            isNegative && 'bg-loss/15 text-loss',
            isZero && 'bg-muted text-muted-foreground'
          )}
        >
          {isPositive && <ArrowUpRight className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />}
          {isNegative && <ArrowDownRight className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />}
          {isZero && <Minus className="h-3 w-3" aria-hidden="true" />}
          <span>
            {change !== null && change !== undefined && (
              <span>
                {change > 0 ? '+' : ''}
                {change.toFixed(2)}
                {' ('}
              </span>
            )}
            {changePercent > 0 ? '+' : ''}
            {changePercent.toFixed(2)}%
            {change !== null && change !== undefined && ')'}
          </span>
          <span className="sr-only">
            {isPositive ? 'Gain' : isNegative ? 'Loss' : 'Unchanged'}
          </span>
        </span>
      )}
    </div>
  );
}
