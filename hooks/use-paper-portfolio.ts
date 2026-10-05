'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaperTradingService } from '@/lib/paper-trading/service';
import { buildPortfolioSummary } from '@/lib/paper-trading/calculator';
import { useBatchQuotes } from '@/hooks/use-batch-quotes';
import type {
  PaperAccount,
  PaperOrder,
  PaperTrade,
  PaperPosition,
  PaperPortfolioSnapshot,
  PaperPortfolioSummary,
  PaperHolding,
  PaperOrderRequest,
  PaperExecutionResult,
} from '@/types/paper-trading';

export function usePaperPortfolio(userId: string | null) {
  const queryClient = useQueryClient();

  // 1. Fetch Account
  const accountQuery = useQuery({
    queryKey: ['paper-account', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await PaperTradingService.getOrCreateAccount(userId);
    },
    enabled: Boolean(userId),
    staleTime: 10000,
  });

  const account = accountQuery.data?.account || null;
  const isFallback = accountQuery.data?.isFallback || false;

  // 2. Fetch Positions
  const positionsQuery = useQuery({
    queryKey: ['paper-positions', account?.id, userId],
    queryFn: async () => {
      if (!account || !userId) return [];
      return await PaperTradingService.getPositions(account.id, userId);
    },
    enabled: Boolean(account?.id && userId),
    staleTime: 0,
  });

  // 3. Fetch Orders
  const ordersQuery = useQuery({
    queryKey: ['paper-orders', account?.id, userId],
    queryFn: async () => {
      if (!account || !userId) return [];
      return await PaperTradingService.getOrders(account.id, userId);
    },
    enabled: Boolean(account?.id && userId),
    staleTime: 0,
  });

  // 4. Fetch Trades
  const tradesQuery = useQuery({
    queryKey: ['paper-trades', account?.id, userId],
    queryFn: async () => {
      if (!account || !userId) return [];
      return await PaperTradingService.getTrades(account.id, userId);
    },
    enabled: Boolean(account?.id && userId),
    staleTime: 0,
  });

  // 5. Fetch Snapshots
  const snapshotsQuery = useQuery({
    queryKey: ['paper-snapshots', account?.id, userId],
    queryFn: async () => {
      if (!account || !userId) return [];
      return await PaperTradingService.getSnapshots(account.id, userId);
    },
    enabled: Boolean(account?.id && userId),
    staleTime: 1000,
  });

  const positions = positionsQuery.data || [];
  const orders = ordersQuery.data || [];
  const trades = tradesQuery.data || [];
  const snapshots = snapshotsQuery.data || [];

  // Extract unique symbols to fetch live quotes via 0xramm batch endpoint
  const symbolsToQuote = useMemo(() => {
    const syms = new Set<string>();
    positions.forEach((p) => {
      if (p.quantity > 0) syms.add(p.symbol);
    });
    orders.forEach((o) => {
      if (o.status === 'PENDING') syms.add(o.symbol);
    });
    return Array.from(syms);
  }, [positions, orders]);

  // Fetch real-time batch quotes for all portfolio stocks
  const batchQuotesQuery = useBatchQuotes(symbolsToQuote, {
    enabled: symbolsToQuote.length > 0,
    autoRefresh: true,
  });

  // Create fast lookup map for quotes
  const quoteMap = useMemo(() => {
    const map: Record<string, { price: number; changePercent?: number; companyName?: string }> = {};
    if (batchQuotesQuery.data) {
      batchQuotesQuery.data.forEach((q) => {
        if (q.price !== null) {
          map[q.symbol.toUpperCase()] = {
            price: q.price,
            changePercent: q.changePercent ?? undefined,
            companyName: q.name,
          };
          const bare = (q.symbol.split('.')[0] || '').toUpperCase();
          if (bare && !map[bare]) {
            map[bare] = {
              price: q.price,
              changePercent: q.changePercent ?? undefined,
              companyName: q.name,
            };
          }
        }
      });
    }
    return map;
  }, [batchQuotesQuery.data]);

  // Check and execute pending limit orders whenever quotes update
  useEffect(() => {
    if (account && userId && Object.keys(quoteMap).length > 0) {
      PaperTradingService.checkAndExecutePendingOrders(account, userId, quoteMap).then((filled) => {
        if (filled > 0) {
          queryClient.invalidateQueries({ queryKey: ['paper-orders'] });
          queryClient.invalidateQueries({ queryKey: ['paper-positions'] });
          queryClient.invalidateQueries({ queryKey: ['paper-trades'] });
          queryClient.invalidateQueries({ queryKey: ['paper-account'] });
        }
      });
    }
  }, [account, userId, quoteMap, queryClient]);

  // Compute accumulated realized P&L from trades/positions
  const accumulatedRealizedPnl = useMemo(() => {
    return positions.reduce((acc, p) => acc + (p.realized_pnl || 0), 0);
  }, [positions]);

  // Calculate complete portfolio summary
  const { summary, holdings } = useMemo(() => {
    if (!account) {
      const emptySummary: PaperPortfolioSummary = {
        total_portfolio_value: 0,
        cash_balance: 0,
        available_cash: 0,
        invested_value: 0,
        unrealized_pnl: 0,
        unrealized_pnl_percent: 0,
        realized_pnl: 0,
        total_pnl: 0,
        today_pnl: 0,
        today_pnl_percent: 0,
        overall_return_percent: 0,
        starting_capital: 1000000,
      };
      return { summary: emptySummary, holdings: [] as PaperHolding[] };
    }

    return buildPortfolioSummary({
      cashBalance: account.cash_balance,
      startingCash: account.starting_cash,
      positions,
      quoteMap,
      accumulatedRealizedPnl,
    });
  }, [account, positions, quoteMap, accumulatedRealizedPnl]);

  // Order Submission Mutation
  const orderMutation = useMutation({
    mutationFn: async ({
      request,
      marketPrice,
    }: {
      request: PaperOrderRequest;
      marketPrice: number | null;
    }): Promise<PaperExecutionResult> => {
      if (!account || !userId) {
        throw new Error('Not authenticated.');
      }
      return await PaperTradingService.submitOrder({
        userId,
        account,
        request,
        marketPrice,
      });
    },
    onSuccess: async (res) => {
      if (res.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['paper-account'] }),
          queryClient.invalidateQueries({ queryKey: ['paper-positions'] }),
          queryClient.invalidateQueries({ queryKey: ['paper-orders'] }),
          queryClient.invalidateQueries({ queryKey: ['paper-trades'] }),
          queryClient.invalidateQueries({ queryKey: ['paper-snapshots'] }),
        ]);
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['paper-positions'] }),
          queryClient.refetchQueries({ queryKey: ['paper-account'] }),
          queryClient.refetchQueries({ queryKey: ['paper-orders'] }),
          queryClient.refetchQueries({ queryKey: ['paper-trades'] }),
        ]);
      }
    },
  });

  // Cancel Order Mutation
  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!account || !userId) throw new Error('Not authenticated.');
      return await PaperTradingService.cancelOrder(orderId, account.id, userId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['paper-orders'] });
      await queryClient.refetchQueries({ queryKey: ['paper-orders'] });
    },
  });

  // Reset Account Mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!account || !userId) throw new Error('Not authenticated.');
      return await PaperTradingService.resetAccount(account.id, userId);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['paper-account'] }),
        queryClient.invalidateQueries({ queryKey: ['paper-positions'] }),
        queryClient.invalidateQueries({ queryKey: ['paper-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['paper-trades'] }),
        queryClient.invalidateQueries({ queryKey: ['paper-snapshots'] }),
      ]);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['paper-positions'] }),
        queryClient.refetchQueries({ queryKey: ['paper-account'] }),
      ]);
    },
  });

  // CSV Exporters
  const exportOrdersCSV = useCallback(() => {
    if (orders.length === 0) return;
    const headers = ['Order ID', 'Date', 'Symbol', 'Exchange', 'Side', 'Type', 'Quantity', 'Requested Price', 'Executed Price', 'Status', 'Charges', 'Realized P&L'];
    const rows = orders.map((o) => [
      o.id,
      o.created_at,
      o.symbol,
      o.exchange,
      o.side,
      o.order_type,
      o.quantity,
      o.requested_price ?? '',
      o.executed_price ?? '',
      o.status,
      o.estimated_charges,
      o.realized_pnl,
    ]);
    downloadCSV('marketlens_paper_orders.csv', headers, rows);
  }, [orders]);

  const exportTradesCSV = useCallback(() => {
    if (trades.length === 0) return;
    const headers = ['Trade ID', 'Date', 'Order ID', 'Symbol', 'Exchange', 'Side', 'Quantity', 'Price', 'Total Value', 'Charges'];
    const rows = trades.map((t) => [
      t.id,
      t.executed_at,
      t.order_id ?? '',
      t.symbol,
      t.exchange,
      t.side,
      t.quantity,
      t.price,
      t.total_value,
      t.charges,
    ]);
    downloadCSV('marketlens_paper_trades.csv', headers, rows);
  }, [trades]);

  const exportHoldingsCSV = useCallback(() => {
    if (holdings.length === 0) return;
    const headers = ['Symbol', 'Company', 'Quantity', 'Avg Price', 'Current Price', 'Invested Value', 'Current Value', 'Unrealized P&L', 'Unrealized P&L %'];
    const rows = holdings.map((h) => [
      h.symbol,
      h.company_name ?? '',
      h.quantity,
      h.average_price,
      h.current_price ?? 'N/A',
      h.invested_value,
      h.current_value ?? 'N/A',
      h.unrealized_pnl ?? 'N/A',
      h.unrealized_pnl_percent ?? 'N/A',
    ]);
    downloadCSV('marketlens_paper_holdings.csv', headers, rows);
  }, [holdings]);

  const isLoading =
    accountQuery.isLoading ||
    positionsQuery.isLoading ||
    ordersQuery.isLoading ||
    tradesQuery.isLoading;

  return {
    account,
    summary,
    holdings,
    positions,
    orders,
    trades,
    snapshots,
    quoteMap,
    isFallback,
    isLoading,
    isQuotesLoading: batchQuotesQuery.isLoading,
    refetchQuotes: () => batchQuotesQuery.refetch(),
    submitOrder: orderMutation.mutateAsync,
    isSubmittingOrder: orderMutation.isPending,
    cancelOrder: cancelMutation.mutateAsync,
    isCancellingOrder: cancelMutation.isPending,
    resetAccount: resetMutation.mutateAsync,
    isResettingAccount: resetMutation.isPending,
    exportOrdersCSV,
    exportTradesCSV,
    exportHoldingsCSV,
  };
}

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.map((cell) => `"${cell}"`).join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
