'use client';

import Link from 'next/link';
import { StockQuote } from '@/types/market';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PriceDisplay } from './price-display';
import { FinanceTerm } from '@/components/finance/finance-term';
import { Bookmark, ArrowUpDown } from 'lucide-react';
import { useWatchlistStore } from '@/hooks/use-watchlist';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface StockTableProps {
  quotes: StockQuote[];
  showWatchlistAction?: boolean;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'pe';

export function StockTable({ quotes, showWatchlistAction = true }: StockTableProps) {
  const { isInWatchlist, addSymbol, removeSymbol } = useWatchlistStore();
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                type="button"
                onClick={() => handleSort('symbol')}
                className="flex items-center gap-1 hover:text-foreground cursor-pointer font-medium"
              >
                <span>Stock / Company</span>
                <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
              </button>
            </TableHead>

            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleSort('price')}
                  className="flex items-center gap-1 hover:text-foreground cursor-pointer font-medium"
                >
                  <span>LTP (₹)</span>
                  <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                </button>
                <FinanceTerm termKey="ltp" />
              </div>
            </TableHead>

            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleSort('changePercent')}
                  className="flex items-center gap-1 hover:text-foreground cursor-pointer font-medium"
                >
                  <span>Change %</span>
                  <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                </button>
                <FinanceTerm termKey="percentage_change" />
              </div>
            </TableHead>

            <TableHead className="text-right hidden sm:table-cell">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleSort('volume')}
                  className="flex items-center gap-1 hover:text-foreground cursor-pointer font-medium"
                >
                  <span>Volume</span>
                  <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                </button>
                <FinanceTerm termKey="volume" />
              </div>
            </TableHead>

            <TableHead className="text-right hidden md:table-cell">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleSort('marketCap')}
                  className="flex items-center gap-1 hover:text-foreground cursor-pointer font-medium"
                >
                  <span>Market Cap (Cr)</span>
                  <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                </button>
                <FinanceTerm termKey="market_cap" />
              </div>
            </TableHead>

            <TableHead className="text-right hidden lg:table-cell">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleSort('pe')}
                  className="flex items-center gap-1 hover:text-foreground cursor-pointer font-medium"
                >
                  <span>P/E</span>
                  <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                </button>
                <FinanceTerm termKey="pe" />
              </div>
            </TableHead>

            {showWatchlistAction && <TableHead className="w-12 text-center">Watch</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedQuotes.map((quote) => {
            const bookmarked = isInWatchlist(quote.symbol);

            return (
              <TableRow key={quote.symbol} className="group hover:bg-muted/40">
                {/* Symbol & Name */}
                <TableCell className="font-medium">
                  <Link
                    href={`/stocks/${encodeURIComponent(quote.symbol)}`}
                    className="block group-hover:text-primary transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm">{quote.symbol}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                        {quote.exchange || 'NSE'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[160px] sm:max-w-xs">
                      {quote.name}
                    </div>
                  </Link>
                </TableCell>

                {/* LTP Price */}
                <TableCell className="text-right tabular-nums">
                  {quote.price !== null ? (
                    <span className="font-semibold">₹{quote.price.toFixed(2)}</span>
                  ) : (
                    <span className="text-muted-foreground/60 italic text-xs">Not available</span>
                  )}
                </TableCell>

                {/* Change % */}
                <TableCell className="text-right">
                  <PriceDisplay
                    price={quote.price}
                    change={quote.change}
                    changePercent={quote.changePercent}
                    showChange={true}
                    size="sm"
                    className="justify-end"
                  />
                </TableCell>

                {/* Volume */}
                <TableCell className="text-right tabular-nums text-xs hidden sm:table-cell text-muted-foreground">
                  {quote.volume !== null && quote.volume > 0 ? (
                    quote.volume.toLocaleString('en-IN')
                  ) : (
                    <span className="text-muted-foreground/60 italic">Not available</span>
                  )}
                </TableCell>

                {/* Market Cap */}
                <TableCell className="text-right tabular-nums text-xs hidden md:table-cell text-muted-foreground">
                  {quote.marketCap !== null && quote.marketCap > 0 ? (
                    `₹${(quote.marketCap / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}`
                  ) : (
                    <span className="text-muted-foreground/60 italic">Not available</span>
                  )}
                </TableCell>

                {/* P/E Ratio */}
                <TableCell className="text-right tabular-nums text-xs hidden lg:table-cell text-muted-foreground">
                  {quote.pe !== null ? (
                    quote.pe.toFixed(2)
                  ) : (
                    <span className="text-muted-foreground/60 italic">Not available</span>
                  )}
                </TableCell>

                {/* Watchlist Bookmark */}
                {showWatchlistAction && (
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => (bookmarked ? removeSymbol(quote.symbol) : addSymbol(quote.symbol))}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      aria-label={bookmarked ? `Remove ${quote.symbol} from watchlist` : `Add ${quote.symbol} to watchlist`}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${bookmarked ? 'fill-primary text-primary' : ''}`}
                        aria-hidden="true"
                      />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
