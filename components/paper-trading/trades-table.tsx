'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Download, History, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PaperTrade } from '@/types/paper-trading';
import { cn } from '@/lib/utils';

interface TradesTableProps {
  trades: PaperTrade[];
  onExportCSV: () => void;
}

type SortField = 'date' | 'symbol' | 'side' | 'value';

export function TradesTable({ trades, onExportCSV }: TradesTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      let diff = 0;
      if (sortField === 'date') {
        diff = new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime();
      } else if (sortField === 'symbol') {
        diff = a.symbol.localeCompare(b.symbol);
      } else if (sortField === 'side') {
        diff = a.side.localeCompare(b.side);
      } else if (sortField === 'value') {
        diff = b.total_value - a.total_value;
      }
      return sortAsc ? -diff : diff;
    });
  }, [trades, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (trades.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
        <div className="h-10 w-10 mx-auto rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
          <History className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">No trades executed yet</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Completed fills will appear here along with simulated prices, values, and transaction fees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          Execution Trade History ({trades.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          className="h-8 text-xs gap-1.5 border-border/70 hover:bg-muted/60"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Trades CSV</span>
        </Button>
      </div>

      <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground select-none">
                <th
                  onClick={() => toggleSort('date')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    <span>Date & Time</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('symbol')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    <span>Symbol</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('side')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    <span>Side</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">Quantity</th>
                <th className="py-2.5 px-3 font-semibold text-right">Fill Price</th>
                <th
                  onClick={() => toggleSort('value')}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-foreground"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Value</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">Charges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {sortedTrades.map((trade) => {
                const date = new Date(trade.executed_at);
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
                  <tr key={trade.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      <span className="font-medium text-foreground block">{formattedTime}</span>
                      <span className="text-[10px]">{formattedDate}</span>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-foreground">
                      <Link href={`/stocks/${trade.symbol}`} className="hover:text-primary transition-colors">
                        {trade.symbol}
                      </Link>
                    </td>

                    <td className="py-2.5 px-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold border-0 px-2 py-0.5',
                          trade.side === 'BUY'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        )}
                      >
                        {trade.side}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-3 text-right font-semibold text-foreground tabular-nums">
                      {trade.quantity}
                    </td>

                    <td className="py-2.5 px-3 text-right text-muted-foreground tabular-nums font-medium">
                      ₹{trade.price.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-foreground tabular-nums">
                      ₹{trade.total_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-2.5 px-3 text-right text-muted-foreground tabular-nums">
                      ₹{trade.charges.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
