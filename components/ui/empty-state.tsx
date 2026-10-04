import { FolderSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  title = 'No records found',
  description = 'Try searching with a different stock ticker or company name.',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center text-muted-foreground animate-fade-in',
        className
      )}
    >
      <FolderSearch className="h-10 w-10 text-muted-foreground/50 mb-3" aria-hidden="true" />
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs max-w-sm">{description}</p>
    </div>
  );
}
