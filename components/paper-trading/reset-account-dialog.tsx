'use client';

import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ResetAccountDialogProps {
  onResetConfirm: () => Promise<void>;
  isResetting?: boolean;
}

export function ResetAccountDialog({
  onResetConfirm,
  isResetting = false,
}: ResetAccountDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await onResetConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/30 gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Paper Account</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <div className="h-9 w-9 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold">
              Reset Paper Trading Account?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2">
            This will permanently delete your paper-trading orders, trades, positions and performance history and create a new account with ₹10,00,000 virtual capital.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-500/90 font-medium">
          Warning: This destructive action cannot be undone. All simulated track record data will be permanently wiped.
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isResetting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={isResetting}
            className="text-xs font-semibold gap-1.5"
          >
            {isResetting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <span>Confirm & Reset Account</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
