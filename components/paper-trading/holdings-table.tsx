'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Download, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TermTooltip } from './term-tooltip';
import type { PaperHolding } from '@/types/paper-trading';
import { cn } from '@/lib/utils';

interface HoldingsTableProps {
  holdings: PaperHolding[];
  onOpenTrade?: (symbol: string, side: 'BUY' | 'SELL') => void;
  onExportCSV: () => void;
}

export function HoldingsTable({
  holdings,
  onOpenTrade,
  onExportCSV,
}: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
        <div className="h-10 w-10 mx-auto rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
          <Layers className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-foreground">No active holdings</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          You currently have no open stock positions. Use the Order Entry panel to place your first simulated trade!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            Portfolio Holdings ({holdings.length})
          </h3>
          <span className="text-[11px] text-muted-foreground">Equity Delivery</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          className="h-8 text-xs gap-1.5 border-border/70 hover:bg-muted/60"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Holdings CSV</span>
        </Button>
      </div>

      <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                <th className="py-2.5 px-3 font-semibold">
                  <TermTooltip termId="holding" label="Symbol & Company" />
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">Qty</th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  <TermTooltip termId="average_price" label="Avg Price" />
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  <TermTooltip termId="execution_price" label="Current LTP" />
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">Invested</th>
                <th className="py-2.5 px-3 font-semibold text-right">Current Value</th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  <TermTooltip termId="unrealized_pnl" label="Unrealized P&L" />
                </th>
                <th className="py-2.5 px-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {holdings.map((holding) => {
                const isProfit = (holding.unrealized_pnl ?? 0) >= 0;
                const formattedAvg = holding.average_price.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const formattedCurrent = holding.current_price
                  ? holding.current_price.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : 'N/A';
                const formattedInvested = holding.invested_value.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const formattedCurrentVal = holding.current_value
                  ? holding.current_value.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : 'Unavailable';

                return (
                  <tr
                    key={`${holding.symbol}-${holding.exchange}`}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {/* Symbol & Company */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/stocks/${holding.symbol}`}
                          className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                        >
                          <span>{holding.symbol}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                        </Link>
                        <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                          {holding.company_name || holding.exchange}
                        </span>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-right font-semibold text-foreground tabular-nums">
                      {holding.quantity}
                    </td>

                    {/* Avg Buy Price */}
                    <td className="py-3 px-3 text-right text-muted-foreground tabular-nums">
                      ₹{formattedAvg}
                    </td>

                    {/* Current LTP */}
                    <td className="py-3 px-3 text-right tabular-nums">
                      {holding.is_quote_available ? (
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-foreground">₹{formattedCurrent}</span>
                          {holding.day_change_percent !== undefined && holding.day_change_percent !== null && (
                            <span
                              className={cn(
                                'text-[10px] font-medium flex items-center',
                                holding.day_change_percent >= 0 ? 'text-emerald-500' : 'text-rose-500'
                              )}
                            >
                              {holding.day_change_percent >= 0 ? '+' : ''}
                              {holding.day_change_percent.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-amber-500 text-[11px]">Price unavailable</span>
                      )}
                    </td>

                    {/* Invested Value */}
                    <td className="py-3 px-3 text-right text-muted-foreground tabular-nums">
                      ₹{formattedInvested}
                    </td>

                    {/* Current Value */}
                    <td className="py-3 px-3 text-right font-semibold text-foreground tabular-nums">
                      {holding.is_quote_available ? `₹${formattedCurrentVal}` : '—'}
                    </td>

                    {/* Unrealized P&L */}
                    <td className="py-3 px-3 text-right tabular-nums">
                      {holding.is_quote_available && holding.unrealized_pnl !== null ? (
                        <div className="flex flex-col items-end">
                          <span
                            className={cn(
                              'font-bold text-xs',
                              isProfit ? 'text-emerald-500' : 'text-rose-500'
                            )}
                          >
                            {isProfit ? '+' : ''}₹
                            {holding.unrealized_pnl.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-medium',
                              isProfit ? 'text-emerald-500' : 'text-rose-500'
                            )}
                          >
                            {isProfit ? '+' : ''}
                            {holding.unrealized_pnl_percent?.toFixed(2)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenTrade && onOpenTrade(holding.symbol, 'BUY')}
                          className="h-7 px-2 text-[11px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                        >
                          Buy More
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenTrade && onOpenTrade(holding.symbol, 'SELL')}
                          className="h-7 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                        >
                          Sell
                        </Button>
                      </div>
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
