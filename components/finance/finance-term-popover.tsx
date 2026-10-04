'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FinancialTermDefinition } from '@/lib/finance/terms';
import { HelpCircle, Lightbulb, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import React from 'react';

interface FinanceTermPopoverProps {
  term: FinancialTermDefinition;
  children: React.ReactNode;
}

export function FinanceTermPopover({ term, children }: FinanceTermPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-3 shadow-xl" align="start">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">{term.term}</span>
            <Badge variant="outline" className="text-[10px] capitalize">
              {term.category.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            {term.shortDefinition}
          </p>
        </div>

        <div className="space-y-2 border-t pt-2 text-xs">
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span><strong className="text-foreground">Example:</strong> {term.simpleExample}</span>
          </div>
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <Target className="h-3.5 w-3.5 text-gain shrink-0 mt-0.5" aria-hidden="true" />
            <span><strong className="text-foreground">Why:</strong> {term.whyItMatters}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
