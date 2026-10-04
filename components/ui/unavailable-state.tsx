import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnavailableStateProps {
  title?: string;
  reason?: string;
  className?: string;
}

export function UnavailableState({
  title = 'Data unavailable from the current source.',
  reason = 'The current market data provider (0xramm) does not support this data feed.',
  className,
}: UnavailableStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground animate-fade-in',
        className
      )}
    >
      <Info className="h-8 w-8 text-muted-foreground/70 mb-2" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-xs max-w-md">{reason}</p>
    </div>
  );
}
