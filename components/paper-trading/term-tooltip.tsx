'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { getFinancialTerm } from '@/lib/finance/terms';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TermTooltipProps {
  termId: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

export function TermTooltip({ termId, label, children, className }: TermTooltipProps) {
  const term = getFinancialTerm(termId);

  if (!term) {
    return <span className={className}>{children || label}</span>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 cursor-help group text-inherit ${className || ''}`}
            aria-label={`Definition for ${term.term}`}
          >
            {children || <span>{label || term.term}</span>}
            <Info className="h-3 w-3 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3 text-left space-y-1.5 shadow-lg bg-popover text-popover-foreground border">
          <div className="font-semibold text-xs tracking-tight text-foreground border-b pb-1">
            {term.term}
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {term.shortDefinition}
          </p>
          {term.simpleExample && (
            <div className="text-[10px] bg-muted/60 p-1.5 rounded border border-border/50 text-foreground/90 font-mono">
              <span className="font-semibold font-sans text-muted-foreground">Example: </span>
              {term.simpleExample}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
