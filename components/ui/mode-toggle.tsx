'use client';

import { useSettingsStore } from '@/hooks/use-settings';
import { Button } from './button';
import { Sparkles, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  className?: string;
}

export function ModeToggle({ className }: ModeToggleProps) {
  const { mode, setMode } = useSettingsStore();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border bg-muted/30 p-1 text-xs font-medium',
        className
      )}
      role="group"
      aria-label="User experience mode toggle"
    >
      <Button
        variant={mode === 'beginner' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('beginner')}
        className={cn(
          'h-7 px-2.5 text-xs gap-1.5',
          mode === 'beginner' && 'shadow-xs'
        )}
        aria-pressed={mode === 'beginner'}
      >
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Beginner
      </Button>
      <Button
        variant={mode === 'advanced' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('advanced')}
        className={cn(
          'h-7 px-2.5 text-xs gap-1.5',
          mode === 'advanced' && 'shadow-xs'
        )}
        aria-pressed={mode === 'advanced'}
      >
        <BarChart2 className="h-3 w-3" aria-hidden="true" />
        Advanced
      </Button>
    </div>
  );
}
