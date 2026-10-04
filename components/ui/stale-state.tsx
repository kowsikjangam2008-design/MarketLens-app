import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StaleStateProps {
  lastUpdated?: string | null;
  className?: string;
}

export function StaleState({ lastUpdated, className }: StaleStateProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded',
        className
      )}
    >
      <Clock className="h-3 w-3" aria-hidden="true" />
      <span>Provider data</span>
      {lastUpdated && (
        <>
          <span>•</span>
          <span>Last updated: {lastUpdated}</span>
        </>
      )}
    </div>
  );
}
