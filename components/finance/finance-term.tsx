'use client';

import { useState } from 'react';
import { getFinancialTerm } from '@/lib/finance/terms';
import { useIsMobile } from '@/hooks/use-media-query';
import { useSettingsStore } from '@/hooks/use-settings';
import { FinanceTermDialog } from './finance-term-dialog';
import { FinanceTermPopover } from './finance-term-popover';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinanceTermProps {
  termKey: string;
  className?: string;
  showIconOnly?: boolean;
  label?: string;
}

export function FinanceTerm({
  termKey,
  className,
  showIconOnly = true,
  label,
}: FinanceTermProps) {
  const term = getFinancialTerm(termKey);
  const isMobile = useIsMobile();
  const mode = useSettingsStore((state) => state.mode);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!term) {
    return null;
  }

  const isBeginner = mode === 'beginner';

  const triggerContent = (
    <button
      type="button"
      onClick={isMobile ? () => setDialogOpen(true) : undefined}
      aria-label={`Learn about ${term.term}`}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors cursor-pointer',
        isBeginner && 'text-primary/90 hover:text-primary',
        className
      )}
    >
      {label && <span>{label}</span>}
      <Info
        className={cn(
          'h-3.5 w-3.5 shrink-0',
          isBeginner ? 'stroke-[2.2] text-primary' : 'stroke-[1.7] opacity-75'
        )}
        aria-hidden="true"
      />
    </button>
  );

  return (
    <>
      {isMobile ? (
        <>
          {triggerContent}
          <FinanceTermDialog
            term={term}
            isOpen={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </>
      ) : (
        <FinanceTermPopover term={term}>{triggerContent}</FinanceTermPopover>
      )}
    </>
  );
}
