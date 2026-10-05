'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, Clock, XCircle, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PaperOrder } from '@/types/paper-trading';
import { cn } from '@/lib/utils';

interface OrdersTableProps {
  orders: PaperOrder[];
  onCancelOrder: (orderId: string) => Promise<void>;
  isCancelling?: boolean;
  onExportCSV: () => void;
}

export function OrdersTable({
  orders,
  onCancelOrder,
  isCancelling = false,
  onExportCSV,
}: OrdersTableProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'EXECUTED' | 'CANCELLED'>('ALL');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/50 text-xs w-fit">
          {(['ALL', 'PENDING', 'EXECUTED', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors',
                filter === tab
                  ? 'bg-card text-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()} ({orders.filter((o) => tab === 'ALL' || o.status === tab).length})
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          disabled={orders.length === 0}
          className="h-8 text-xs gap-1.5 border-border/70 hover:bg-muted/60 self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Orders CSV</span>
        </Button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
          <div className="h-10 w-10 mx-auto rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">No orders found</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {filter === 'ALL'
              ? 'You have not placed any simulated paper orders yet.'
              : `No orders matching filter "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                  <th className="py-2.5 px-3 font-semibold">Time</th>
                  <th className="py-2.5 px-3 font-semibold">Symbol</th>
                  <th className="py-2.5 px-3 font-semibold">Side</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Qty</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Req Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Exec Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Charges</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredOrders.map((order) => {
                  const date = new Date(order.created_at);
                  const formattedTime = date.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const formattedDate = date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                        <span className="font-medium text-foreground block">{formattedTime}</span>
                        <span className="text-[10px]">{formattedDate}</span>
                      </td>

                      <td className="py-2.5 px-3 font-bold text-foreground">
                        <Link href={`/stocks/${order.symbol}`} className="hover:text-primary transition-colors">
                          {order.symbol}
                        </Link>
                      </td>

                      <td className="py-2.5 px-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-semibold border-0 px-2 py-0.5',
                            order.side === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          )}
                        >
                          {order.side}
                        </Badge>
                      </td>

                      <td className="py-2.5 px-3 text-muted-foreground font-medium">
                        {order.order_type}
                      </td>

                      <td className="py-2.5 px-3 text-right font-semibold text-foreground tabular-nums">
                        {order.quantity}
                      </td>

                      <td className="py-2.5 px-3 text-right text-muted-foreground tabular-nums">
                        {order.requested_price ? `₹${order.requested_price.toFixed(2)}` : 'Market'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-semibold text-foreground tabular-nums">
                        {order.executed_price ? `₹${order.executed_price.toFixed(2)}` : '—'}
                      </td>

                      <td className="py-2.5 px-3 text-right text-muted-foreground tabular-nums">
                        ₹{order.estimated_charges.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-medium border-0 px-2 py-0.5',
                            order.status === 'EXECUTED' && 'bg-emerald-500/10 text-emerald-600',
                            order.status === 'PENDING' && 'bg-amber-500/10 text-amber-600 animate-pulse',
                            order.status === 'CANCELLED' && 'bg-muted text-muted-foreground',
                            order.status === 'REJECTED' && 'bg-rose-500/10 text-rose-600'
                          )}
                        >
                          {order.status}
                        </Badge>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {order.status === 'PENDING' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isCancelling}
                            onClick={() => onCancelOrder(order.id)}
                            className="h-7 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                          >
                            Cancel
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
