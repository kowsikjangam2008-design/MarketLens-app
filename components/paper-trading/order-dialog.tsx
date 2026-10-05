'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderEntryPanel } from './order-entry-panel';
import type {
  OrderSide,
  PaperPosition,
  PaperOrderRequest,
  PaperExecutionResult,
} from '@/types/paper-trading';

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableCash: number;
  positions: PaperPosition[];
  defaultSymbol?: string;
  defaultSide?: OrderSide;
  onSubmitOrder: (params: {
    request: PaperOrderRequest;
    marketPrice: number | null;
  }) => Promise<PaperExecutionResult>;
  isSubmitting?: boolean;
}

export function OrderDialog({
  open,
  onOpenChange,
  availableCash,
  positions,
  defaultSymbol = 'RELIANCE.NS',
  defaultSide = 'BUY',
  onSubmitOrder,
  isSubmitting = false,
}: OrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border/80">
        <DialogHeader className="sr-only">
          <DialogTitle>Simulate Paper Trade Order</DialogTitle>
        </DialogHeader>
        <OrderEntryPanel
          availableCash={availableCash}
          positions={positions}
          defaultSymbol={defaultSymbol}
          defaultSide={defaultSide}
          onSubmitOrder={onSubmitOrder}
          isSubmitting={isSubmitting}
          onOrderExecuted={(res) => {
            if (res.success) {
              setTimeout(() => {
                onOpenChange(false);
              }, 1200);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
