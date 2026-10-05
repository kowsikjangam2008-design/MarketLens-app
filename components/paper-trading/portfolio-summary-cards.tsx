'use client';

import React from 'react';
import {
  Wallet,
  Coins,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Layers,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TermTooltip } from './term-tooltip';
import type { PaperPortfolioSummary } from '@/types/paper-trading';
import { cn } from '@/lib/utils';

interface PortfolioSummaryCardsProps {
  summary: PaperPortfolioSummary;
  holdingsCount: number;
}

function formatINR(val: number): string {
  return val.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function PortfolioSummaryCards({
  summary,
  holdingsCount,
}: PortfolioSummaryCardsProps) {
  const isTotalProfit = summary.total_pnl >= 0;
  const isTodayProfit = summary.today_pnl >= 0;
  const isUnrealizedProfit = summary.unrealized_pnl >= 0;
  const isRealizedProfit = summary.realized_pnl >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Portfolio Value */}
      <Card className="bg-card/70 border-border/80 shadow-sm relative overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <TermTooltip termId="portfolio_value" label="Total Portfolio Value" className="text-xs font-medium" />
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
            ₹{formatINR(summary.total_portfolio_value)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={cn(
                'font-semibold tabular-nums inline-flex items-center gap-0.5',
                summary.overall_return_percent >= 0 ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {summary.overall_return_percent >= 0 ? '+' : ''}
              {summary.overall_return_percent.toFixed(2)}%
            </span>
            <span className="text-muted-foreground text-[11px]">overall return</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Available Cash */}
      <Card className="bg-card/70 border-border/80 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <TermTooltip termId="available_cash" label="Available Cash" className="text-xs font-medium" />
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
            ₹{formatINR(summary.cash_balance)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Starting: <span className="font-semibold text-foreground/80 tabular-nums">₹{formatINR(summary.starting_capital)}</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Invested Value */}
      <Card className="bg-card/70 border-border/80 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <TermTooltip termId="holding" label="Invested Value" className="text-xs font-medium" />
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
            ₹{formatINR(summary.invested_value)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Active Holdings: <span className="font-semibold text-foreground/80 tabular-nums">{holdingsCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Total P&L & Today's P&L */}
      <Card className="bg-card/70 border-border/80 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <TermTooltip termId="realized_pnl" label="Total P&L" className="text-xs font-medium" />
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center',
                isTotalProfit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              )}
            >
              {isTotalProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          </div>
          <div
            className={cn(
              'text-2xl sm:text-3xl font-bold tracking-tight tabular-nums',
              isTotalProfit ? 'text-emerald-500' : 'text-rose-500'
            )}
          >
            {isTotalProfit ? '+' : ''}₹{formatINR(summary.total_pnl)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground text-[11px]">Today&apos;s P&L:</span>
            <span
              className={cn(
                'font-semibold tabular-nums text-xs',
                isTodayProfit ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {isTodayProfit ? '+' : ''}₹{formatINR(summary.today_pnl)} ({summary.today_pnl_percent >= 0 ? '+' : ''}{summary.today_pnl_percent.toFixed(2)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Extra Details Row: Unrealized & Realized breakdown */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-muted/30 border border-border/60 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <TermTooltip termId="unrealized_pnl" label="Unrealized P&L" className="text-xs font-medium text-muted-foreground" />
          </div>
          <div className="text-right">
            <span
              className={cn(
                'font-semibold tabular-nums text-sm',
                isUnrealizedProfit ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {isUnrealizedProfit ? '+' : ''}₹{formatINR(summary.unrealized_pnl)}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5 tabular-nums">
              ({summary.unrealized_pnl_percent >= 0 ? '+' : ''}{summary.unrealized_pnl_percent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="bg-muted/30 border border-border/60 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <TermTooltip termId="realized_pnl" label="Realized P&L" className="text-xs font-medium text-muted-foreground" />
          </div>
          <div className="text-right">
            <span
              className={cn(
                'font-semibold tabular-nums text-sm',
                isRealizedProfit ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {isRealizedProfit ? '+' : ''}₹{formatINR(summary.realized_pnl)}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">(FIFO closed trades)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
