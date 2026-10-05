'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowDownUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sliders,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TermTooltip } from './term-tooltip';
import { useStockQuote } from '@/hooks/use-stock-quote';
import {
  calculateSimulatedCharges,
  applySlippage,
  validateOrderInput,
} from '@/lib/paper-trading/calculator';
import { PAPER_TRADING_CONFIG } from '@/config/paperTrading';
import type {
  OrderSide,
  OrderType,
  PaperPosition,
  PaperOrderRequest,
  PaperExecutionResult,
} from '@/types/paper-trading';
import { cn } from '@/lib/utils';

interface OrderEntryPanelProps {
  availableCash: number;
  positions: PaperPosition[];
  defaultSymbol?: string;
  defaultSide?: OrderSide;
  onOrderExecuted?: (result: PaperExecutionResult) => void;
  onSubmitOrder: (params: {
    request: PaperOrderRequest;
    marketPrice: number | null;
  }) => Promise<PaperExecutionResult>;
  isSubmitting?: boolean;
}

const POPULAR_SYMBOLS = [
  'RELIANCE.NS',
  'TCS.NS',
  'INFY.NS',
  'HDFCBANK.NS',
  'ICICIBANK.NS',
  'TATAMOTORS.NS',
  'ITC.NS',
  'SBIN.NS',
];

export function OrderEntryPanel({
  availableCash,
  positions,
  defaultSymbol = 'RELIANCE.NS',
  defaultSide = 'BUY',
  onOrderExecuted,
  onSubmitOrder,
  isSubmitting = false,
}: OrderEntryPanelProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [side, setSide] = useState<OrderSide>(defaultSide);
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [slippagePercent, setSlippagePercent] = useState<number>(0);
  const [showChargesDetails, setShowChargesDetails] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Normalize symbol (default to .NS if suffix omitted)
  const normalizedSymbol = useMemo(() => {
    const s = symbol.trim().toUpperCase();
    if (!s) return '';
    return s.includes('.') ? s : `${s}.NS`;
  }, [symbol]);

  // Fetch real-time market quote for the entered symbol
  const quoteQuery = useStockQuote(normalizedSymbol, {
    enabled: Boolean(normalizedSymbol),
    autoRefresh: true,
  });

  const marketPrice = quoteQuery.data?.price ?? null;
  const companyName = quoteQuery.data?.name;
  const isQuoteLoading = quoteQuery.isLoading;

  // Existing held position for this symbol
  const existingPosition = useMemo(() => {
    return (
      positions.find(
        (p) =>
          p.symbol.toUpperCase() === normalizedSymbol.toUpperCase() ||
          p.symbol.toUpperCase() === symbol.trim().toUpperCase()
      ) || null
    );
  }, [positions, normalizedSymbol, symbol]);

  const heldQuantity = existingPosition ? existingPosition.quantity : 0;

  // Execution price computation
  const numericLimitPrice = parseFloat(limitPrice) || 0;
  const basePrice = orderType === 'MARKET' ? (marketPrice ?? 0) : numericLimitPrice;
  const effectivePrice = applySlippage(basePrice, side, slippagePercent);
  const grossValue = quantity > 0 && effectivePrice > 0 ? quantity * effectivePrice : 0;
  const chargesBreakdown = calculateSimulatedCharges(side, grossValue);

  // Validation
  const validation = useMemo(() => {
    return validateOrderInput({
      symbol: normalizedSymbol,
      side,
      orderType,
      quantity,
      limitPrice: numericLimitPrice,
      marketPrice,
      availableCash,
      existingPosition,
      slippagePercent,
    });
  }, [
    normalizedSymbol,
    side,
    orderType,
    quantity,
    numericLimitPrice,
    marketPrice,
    availableCash,
    existingPosition,
    slippagePercent,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid || isSubmitting) return;

    setResultMessage(null);

    try {
      const result = await onSubmitOrder({
        request: {
          symbol: normalizedSymbol,
          exchange: normalizedSymbol.endsWith('.BO') ? 'BSE' : 'NSE',
          side,
          order_type: orderType,
          quantity,
          price: orderType === 'LIMIT' ? numericLimitPrice : undefined,
          slippage_percent: slippagePercent,
        },
        marketPrice,
      });

      if (result.success) {
        setResultMessage({
          type: 'success',
          text:
            orderType === 'MARKET'
              ? `Executed simulated ${side} order for ${quantity} shares of ${normalizedSymbol} @ ₹${result.order?.executed_price?.toFixed(2)}!`
              : `Placed simulated LIMIT ${side} order for ${quantity} shares of ${normalizedSymbol} @ ₹${numericLimitPrice.toFixed(2)} (Status: PENDING).`,
        });
        if (onOrderExecuted) onOrderExecuted(result);
      } else {
        setResultMessage({
          type: 'error',
          text: result.error || 'Failed to place order.',
        });
      }
    } catch (err) {
      setResultMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error placing order.',
      });
    }
  };

  return (
    <Card className="border-border/80 bg-card/80 backdrop-blur-sm shadow-md">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 text-primary" />
            Order Entry
            <Badge variant="outline" className="text-[10px] font-normal border-primary/30 text-primary">
              Virtual Sim
            </Badge>
          </CardTitle>
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">Available Virtual Cash</span>
            <span className="text-xs font-bold text-foreground tabular-nums">
              ₹{availableCash.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Side Switcher (BUY / SELL) */}
          <div className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={cn(
                'py-1.5 text-xs font-semibold rounded-md transition-all',
                side === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              BUY (Long)
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={cn(
                'py-1.5 text-xs font-semibold rounded-md transition-all',
                side === 'SELL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              SELL (Short/Exit)
            </button>
          </div>

          {/* 2. Symbol Input with popular chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="symbol-input" className="text-xs font-medium text-foreground/90">
                Stock Symbol
              </label>
              {heldQuantity > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  You own: <strong className="text-foreground tabular-nums">{heldQuantity}</strong> shares
                </span>
              )}
            </div>
            <Input
              id="symbol-input"
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value);
                setResultMessage(null);
              }}
              placeholder="e.g. RELIANCE, TCS.NS"
              className="h-9 text-xs font-medium uppercase tabular-nums"
              required
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {POPULAR_SYMBOLS.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymbol(s)}
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded border transition-colors',
                    normalizedSymbol === s
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {s.replace('.NS', '')}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Live Price Banner */}
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground block">
                {companyName || normalizedSymbol}
              </span>
              <div className="flex items-center gap-1.5">
                {isQuoteLoading ? (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Fetching live LTP...</span>
                  </div>
                ) : marketPrice !== null ? (
                  <>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      ₹{marketPrice.toFixed(2)}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-semibold tabular-nums',
                        (quoteQuery.data?.changePercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      )}
                    >
                      {(quoteQuery.data?.changePercent ?? 0) >= 0 ? '+' : ''}
                      {quoteQuery.data?.changePercent?.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <span className="text-amber-500 font-medium text-[11px]">
                    Current market price unavailable
                  </span>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] font-normal border-border">
              {normalizedSymbol.endsWith('.BO') ? 'BSE' : 'NSE'}
            </Badge>
          </div>

          {/* 4. Order Type & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <TermTooltip termId={orderType === 'MARKET' ? 'market_order' : 'limit_order'} label="Order Type" className="text-xs font-medium text-foreground/90" />
              <div className="grid grid-cols-2 gap-1 bg-muted/40 p-0.5 rounded-md border">
                <button
                  type="button"
                  onClick={() => setOrderType('MARKET')}
                  className={cn(
                    'py-1 text-[11px] font-medium rounded transition-colors',
                    orderType === 'MARKET' ? 'bg-card font-semibold text-foreground shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  Market
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('LIMIT')}
                  className={cn(
                    'py-1 text-[11px] font-medium rounded transition-colors',
                    orderType === 'LIMIT' ? 'bg-card font-semibold text-foreground shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  Limit
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="quantity-input" className="text-xs font-medium text-foreground/90">
                Quantity
              </label>
              <Input
                id="quantity-input"
                type="number"
                min="1"
                step="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                className="h-9 text-xs tabular-nums"
                required
              />
            </div>
          </div>

          {/* Quantity quick steppers */}
          <div className="flex gap-1.5">
            {[5, 10, 25, 50, 100].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className="text-[10px] px-2 py-0.5 rounded bg-muted/30 border border-border/50 text-muted-foreground hover:text-foreground tabular-nums"
              >
                +{q}
              </button>
            ))}
          </div>

          {/* 5. Limit Price Input (Only when LIMIT) */}
          {orderType === 'LIMIT' && (
            <div className="space-y-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <label htmlFor="limit-price-input" className="text-xs font-medium text-foreground flex items-center justify-between">
                <span>Limit Price (₹)</span>
                {marketPrice && (
                  <button
                    type="button"
                    onClick={() => setLimitPrice(marketPrice.toFixed(2))}
                    className="text-[10px] text-primary hover:underline"
                  >
                    Use LTP (₹{marketPrice.toFixed(2)})
                  </button>
                )}
              </label>
              <Input
                id="limit-price-input"
                type="number"
                step="0.05"
                min="0.05"
                placeholder={marketPrice ? marketPrice.toFixed(2) : '0.00'}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="h-9 text-xs tabular-nums"
                required
              />
              <p className="text-[10px] text-muted-foreground leading-tight">
                {side === 'BUY'
                  ? 'Fills automatically when market price drops to or below this price.'
                  : 'Fills automatically when market price rises to or above this price.'}
              </p>
            </div>
          )}

          {/* 6. Simulated Slippage & Charges Toggle */}
          <div className="text-xs bg-muted/20 border border-border/60 rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <TermTooltip termId="slippage" label="Simulated Slippage" className="text-[11px] text-muted-foreground" />
              <select
                aria-label="Simulated Slippage Percentage"
                value={slippagePercent}
                onChange={(e) => setSlippagePercent(parseFloat(e.target.value))}
                className="h-6 text-[10px] bg-background border rounded px-1.5 text-foreground tabular-nums"
              >
                <option value={0}>0% (Exact quote)</option>
                <option value={0.0005}>0.05%</option>
                <option value={0.001}>0.10%</option>
                <option value={0.002}>0.20%</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <button
                type="button"
                onClick={() => setShowChargesDetails(!showChargesDetails)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <span>{PAPER_TRADING_CONFIG.LABELS.CHARGES_DISCLAIMER}: ₹{chargesBreakdown.total_charges.toFixed(2)}</span>
                <HelpCircle className="h-3 w-3" />
              </button>
              <span className="text-[10px] text-muted-foreground">Delivery</span>
            </div>

            {/* Charges breakdown details */}
            {showChargesDetails && (
              <div className="text-[10px] pt-1.5 space-y-1 text-muted-foreground border-t border-border/40">
                <div className="flex justify-between">
                  <span>Brokerage:</span>
                  <span className="tabular-nums">₹{chargesBreakdown.brokerage.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>STT (0.1%):</span>
                  <span className="tabular-nums">₹{chargesBreakdown.stt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Exchange Turnover (0.00297%):</span>
                  <span className="tabular-nums">₹{chargesBreakdown.exchange_charges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="tabular-nums">₹{chargesBreakdown.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SEBI Turnover:</span>
                  <span className="tabular-nums">₹{chargesBreakdown.sebi_charges.toFixed(2)}</span>
                </div>
                {side === 'BUY' && (
                  <div className="flex justify-between">
                    <span>Stamp Duty (0.015%):</span>
                    <span className="tabular-nums">₹{chargesBreakdown.stamp_duty.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. Total Calculation Summary */}
          <div className="p-3 rounded-lg bg-card border border-border flex flex-col gap-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Gross Trade Value:</span>
              <span className="font-medium text-foreground tabular-nums">
                ₹{grossValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Simulated Charges:</span>
              <span className="font-medium text-foreground tabular-nums">
                ₹{chargesBreakdown.total_charges.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border/60 font-semibold text-sm">
              <span className="text-foreground">
                {side === 'BUY' ? 'Total Required Cash:' : 'Net Realized Proceeds:'}
              </span>
              <span className={cn('tabular-nums', side === 'BUY' ? 'text-primary' : 'text-emerald-500')}>
                ₹
                {(side === 'BUY'
                  ? grossValue + chargesBreakdown.total_charges
                  : Math.max(0, grossValue - chargesBreakdown.total_charges)
                ).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* 8. Validation Error Message */}
          {!validation.isValid && validation.error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{validation.error}</span>
            </div>
          )}

          {/* 9. Execution Result Notice */}
          {resultMessage && (
            <div
              className={cn(
                'p-2.5 rounded-lg text-xs flex items-start gap-2',
                resultMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-500'
              )}
            >
              {resultMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{resultMessage.text}</span>
            </div>
          )}

          {/* 10. Submit Button */}
          <Button
            type="submit"
            disabled={!validation.isValid || isSubmitting || isQuoteLoading}
            className={cn(
              'w-full h-10 font-semibold text-xs tracking-wide transition-all',
              side === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            )}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Simulating Execution...</span>
              </div>
            ) : (
              <span>
                {side === 'BUY' ? 'Buy' : 'Sell'} {quantity} {normalizedSymbol} (
                {orderType === 'MARKET' ? 'Market' : 'Limit'})
              </span>
            )}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground leading-tight">
            Virtual simulation only. No real money or brokerage execution involved.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
