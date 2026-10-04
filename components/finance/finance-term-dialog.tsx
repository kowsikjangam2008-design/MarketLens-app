'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { FinancialTermDefinition } from '@/lib/finance/terms';
import { Badge } from '@/components/ui/badge';
import { BookOpen, HelpCircle, Lightbulb, Target } from 'lucide-react';

interface FinanceTermDialogProps {
  term: FinancialTermDefinition;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FinanceTermDialog({
  term,
  isOpen,
  onOpenChange,
}: FinanceTermDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-[10px]">
              {term.category.replace('_', ' ')}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            {term.term}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-foreground/90">
            {term.shortDefinition}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm">
          {/* Detailed explanation */}
          <div className="rounded-lg bg-muted/40 p-3.5 space-y-1.5 border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Detailed Explanation
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {term.detailedExplanation}
            </p>
          </div>

          {/* Simple Example */}
          <div className="rounded-lg bg-muted/40 p-3.5 space-y-1.5 border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 dark:text-amber-400">
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
              Simple Real-World Example
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {term.simpleExample}
            </p>
          </div>

          {/* Why It Matters */}
          <div className="rounded-lg bg-muted/40 p-3.5 space-y-1.5 border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gain">
              <Target className="h-3.5 w-3.5" aria-hidden="true" />
              Why It Matters
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {term.whyItMatters}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
