'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Coins,
  ArrowDownUp,
  RefreshCw,
  LogOut,
  Layers,
  Clock,
  History,
  LineChart as ChartIcon,
  ShieldAlert,
  Database,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { usePaperPortfolio } from '@/hooks/use-paper-portfolio';
import { AuthCard } from '@/components/paper-trading/auth-card';
import { PortfolioSummaryCards } from '@/components/paper-trading/portfolio-summary-cards';
import { OrderEntryPanel } from '@/components/paper-trading/order-entry-panel';
import { HoldingsTable } from '@/components/paper-trading/holdings-table';
import { OrdersTable } from '@/components/paper-trading/orders-table';
import { TradesTable } from '@/components/paper-trading/trades-table';
import { PerformanceChart } from '@/components/paper-trading/performance-chart';
import { ResetAccountDialog } from '@/components/paper-trading/reset-account-dialog';
import { OrderDialog } from '@/components/paper-trading/order-dialog';
import { PAPER_TRADING_CONFIG } from '@/config/paperTrading';

export default function PaperTradingPage() {
  const { user, isLoading: isAuthLoading, sendOtp, signOut, simulateLocalSignIn } = useSupabaseAuth();
  const portfolio = usePaperPortfolio(user?.id ?? null);

  const [activeTab, setActiveTab] = useState<string>('holdings');
  const [modalSymbol, setModalSymbol] = useState<string>('RELIANCE.NS');
  const [modalSide, setModalSide] = useState<'BUY' | 'SELL'>('BUY');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);

  const handleOpenTrade = (symbol: string, side: 'BUY' | 'SELL') => {
    setModalSymbol(symbol);
    setModalSide(side);
    setIsTradeModalOpen(true);
  };

  // 1. Loading State
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-medium">
          Loading paper trading environment...
        </span>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!user) {
    return (
      <div className="py-6 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Paper Trading Simulator
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Experience the real Indian market with ₹10,00,000 of simulated virtual money. Zero real financial risk.
          </p>
        </div>

        <AuthCard
          onSendOtp={sendOtp}
          onLocalSignIn={simulateLocalSignIn}
        />

        <div className="max-w-md mx-auto text-center">
          <p className="text-[11px] text-muted-foreground">
            {PAPER_TRADING_CONFIG.LABELS.VIRTUAL_MONEY_DISCLAIMER}
          </p>
        </div>
      </div>
    );
  }

  // 3. Authenticated Dashboard State
  return (
    <div className="space-y-6 py-2">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Paper Trading Portfolio
            </h1>
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary font-medium">
              Virtual Sim
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Signed in as <span className="font-medium text-foreground">{user.email || 'Authenticated Trader'}</span>
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <ResetAccountDialog
            onResetConfirm={async () => {
              await portfolio.resetAccount();
            }}
            isResetting={portfolio.isResettingAccount}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Database Status Notice if using fallback */}
      {portfolio.isFallback && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 shrink-0" />
            <span>
              <strong>Local Active Session:</strong> Cloud tables in Supabase pending SQL schema setup. Your portfolio is currently persisted locally.
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">
            See docs/SUPABASE-PAPER-TRADING.md
          </span>
        </div>
      )}

      {/* Portfolio Summary KPI Cards */}
      <PortfolioSummaryCards
        summary={portfolio.summary}
        holdingsCount={portfolio.holdings.length}
      />

      {/* Main Grid: Left Tabs (Holdings, Orders, Trades, Performance), Right Order Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-border/50">
              <TabsList className="bg-muted/50 p-1 h-9">
                <TabsTrigger value="holdings" className="text-xs gap-1.5 px-3">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Holdings</span>
                  {portfolio.holdings.length > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                      {portfolio.holdings.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="orders" className="text-xs gap-1.5 px-3">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Orders</span>
                  {portfolio.orders.length > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                      {portfolio.orders.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="trades" className="text-xs gap-1.5 px-3">
                  <History className="h-3.5 w-3.5" />
                  <span>Trades</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="text-xs gap-1.5 px-3">
                  <ChartIcon className="h-3.5 w-3.5" />
                  <span>Performance</span>
                </TabsTrigger>
              </TabsList>

              {/* Mobile Quick Trade Trigger */}
              <div className="lg:hidden">
                <Button
                  size="sm"
                  onClick={() => setIsTradeModalOpen(true)}
                  className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-sm"
                >
                  <ArrowDownUp className="h-3.5 w-3.5" />
                  <span>Place Order</span>
                </Button>
              </div>
            </div>

            {/* Tab 1: Holdings */}
            <TabsContent value="holdings" className="pt-3">
              <HoldingsTable
                holdings={portfolio.holdings}
                onOpenTrade={handleOpenTrade}
                onExportCSV={portfolio.exportHoldingsCSV}
              />
            </TabsContent>

            {/* Tab 2: Orders */}
            <TabsContent value="orders" className="pt-3">
              <OrdersTable
                orders={portfolio.orders}
                onCancelOrder={async (id) => {
                  await portfolio.cancelOrder(id);
                }}
                isCancelling={portfolio.isCancellingOrder}
                onExportCSV={portfolio.exportOrdersCSV}
              />
            </TabsContent>

            {/* Tab 3: Trades */}
            <TabsContent value="trades" className="pt-3">
              <TradesTable
                trades={portfolio.trades}
                onExportCSV={portfolio.exportTradesCSV}
              />
            </TabsContent>

            {/* Tab 4: Performance Chart */}
            <TabsContent value="performance" className="pt-3">
              <PerformanceChart snapshots={portfolio.snapshots} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Order Entry Panel (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <OrderEntryPanel
            availableCash={portfolio.summary.available_cash}
            positions={portfolio.positions}
            defaultSymbol="RELIANCE.NS"
            onSubmitOrder={portfolio.submitOrder}
            isSubmitting={portfolio.isSubmittingOrder}
          />
        </div>
      </div>

      {/* Floating or Modal Order Dialog */}
      <OrderDialog
        open={isTradeModalOpen}
        onOpenChange={setIsTradeModalOpen}
        availableCash={portfolio.summary.available_cash}
        positions={portfolio.positions}
        defaultSymbol={modalSymbol}
        defaultSide={modalSide}
        onSubmitOrder={portfolio.submitOrder}
        isSubmitting={portfolio.isSubmittingOrder}
      />

      {/* Regulatory Simulated Disclaimer */}
      <div className="pt-4 border-t border-border/50 text-center">
        <p className="text-[11px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {PAPER_TRADING_CONFIG.LABELS.VIRTUAL_MONEY_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
