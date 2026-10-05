import { PAPER_TRADING_CONFIG } from '@/config/paperTrading';
import type {
  OrderSide,
  OrderType,
  PaperPosition,
  TradeCostBreakdown,
  PaperPortfolioSummary,
  PaperHolding,
} from '@/types/paper-trading';

/**
 * Calculates simulated Indian equity delivery charges based on config/paperTrading.ts
 */
export function calculateSimulatedCharges(
  side: OrderSide,
  grossValue: number
): TradeCostBreakdown {
  if (!PAPER_TRADING_CONFIG.ENABLE_SIMULATED_CHARGES || grossValue <= 0) {
    return {
      brokerage: 0,
      stt: 0,
      exchange_charges: 0,
      gst: 0,
      sebi_charges: 0,
      stamp_duty: 0,
      total_charges: 0,
    };
  }

  const { CHARGES } = PAPER_TRADING_CONFIG;

  // 1. Brokerage
  const brokerage =
    grossValue * CHARGES.BROKERAGE_PERCENT + CHARGES.BROKERAGE_FLAT_INR;

  // 2. STT (Securities Transaction Tax) - 0.1% on delivery (both Buy & Sell)
  const stt = Math.round(grossValue * CHARGES.STT_PERCENT);

  // 3. Exchange Turnover Charges (NSE: ~0.00297%)
  const exchangeCharges = Number(
    (grossValue * CHARGES.EXCHANGE_TURNOVER_PERCENT).toFixed(2)
  );

  // 4. SEBI Turnover Charges (₹10 per crore)
  const sebiCharges = Number(
    (grossValue * CHARGES.SEBI_TURNOVER_PERCENT).toFixed(2)
  );

  // 5. GST (18% on Brokerage + Exchange charges + SEBI charges)
  const gstBase = brokerage + exchangeCharges + sebiCharges;
  const gst = Number((gstBase * CHARGES.GST_PERCENT).toFixed(2));

  // 6. Stamp Duty (0.015% on BUY only)
  const stampDuty =
    side === 'BUY'
      ? Number((grossValue * CHARGES.STAMP_DUTY_BUY_PERCENT).toFixed(2))
      : 0;

  // Total
  const totalCharges = Number(
    (brokerage + stt + exchangeCharges + gst + sebiCharges + stampDuty).toFixed(2)
  );

  return {
    brokerage: Number(brokerage.toFixed(2)),
    stt,
    exchange_charges: exchangeCharges,
    gst,
    sebi_charges: sebiCharges,
    stamp_duty: stampDuty,
    total_charges: totalCharges,
  };
}

/**
 * Applies simulated slippage to execution price
 */
export function applySlippage(
  basePrice: number,
  side: OrderSide,
  slippagePercent: number = PAPER_TRADING_CONFIG.DEFAULT_SLIPPAGE_PERCENT
): number {
  if (basePrice <= 0) return 0;
  const clampedSlippage = Math.max(
    0,
    Math.min(slippagePercent, PAPER_TRADING_CONFIG.MAX_ALLOWED_SLIPPAGE_PERCENT)
  );

  if (clampedSlippage === 0) {
    return Number(basePrice.toFixed(2));
  }

  if (side === 'BUY') {
    return Number((basePrice * (1 + clampedSlippage)).toFixed(2));
  } else {
    return Math.max(0.05, Number((basePrice * (1 - clampedSlippage)).toFixed(2)));
  }
}

/**
 * Calculates unrealized P&L for a position
 */
export function calculateUnrealizedPnl(
  quantity: number,
  averagePrice: number,
  currentPrice: number | null
): { unrealizedPnl: number; unrealizedPnlPercent: number } {
  if (quantity <= 0 || averagePrice <= 0 || currentPrice === null || currentPrice <= 0) {
    return { unrealizedPnl: 0, unrealizedPnlPercent: 0 };
  }

  const pnl = (currentPrice - averagePrice) * quantity;
  const pnlPercent = ((currentPrice - averagePrice) / averagePrice) * 100;

  return {
    unrealizedPnl: Number(pnl.toFixed(2)),
    unrealizedPnlPercent: Number(pnlPercent.toFixed(2)),
  };
}

/**
 * Calculates FIFO Realized P&L when selling shares from a position
 * Accounting rule: Realized P&L = Gross Sell Value - (Sold Quantity * Average Cost Basis) - Charges
 */
export function calculateRealizedPnlOnSell(
  sellQuantity: number,
  sellPrice: number,
  averageBuyPrice: number,
  sellCharges: number
): number {
  if (sellQuantity <= 0 || sellPrice <= 0) return 0;
  const grossSellValue = sellQuantity * sellPrice;
  const costBasis = sellQuantity * averageBuyPrice;
  const netRealizedPnl = grossSellValue - costBasis - sellCharges;
  return Number(netRealizedPnl.toFixed(2));
}

/**
 * Validates order inputs before submission
 */
export function validateOrderInput(params: {
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  limitPrice?: number | null;
  marketPrice?: number | null;
  availableCash: number;
  existingPosition?: PaperPosition | null;
  slippagePercent?: number;
}): { isValid: boolean; error?: string; estimatedCost?: number; estimatedPrice?: number } {
  const {
    symbol,
    side,
    orderType,
    quantity,
    limitPrice,
    marketPrice,
    availableCash,
    existingPosition,
    slippagePercent = 0,
  } = params;

  if (!symbol || symbol.trim() === '') {
    return { isValid: false, error: 'Please select or enter a valid stock symbol.' };
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { isValid: false, error: 'Enter a valid positive integer quantity.' };
  }

  // Price determination
  let executionPrice = 0;
  if (orderType === 'MARKET') {
    if (!marketPrice || marketPrice <= 0) {
      return { isValid: false, error: 'Current market price is unavailable.' };
    }
    executionPrice = applySlippage(marketPrice, side, slippagePercent);
  } else if (orderType === 'LIMIT') {
    if (!limitPrice || limitPrice <= 0) {
      return { isValid: false, error: 'Enter a valid limit price greater than ₹0.' };
    }
    executionPrice = limitPrice;
  } else {
    return { isValid: false, error: `Order type ${orderType} is currently not supported.` };
  }

  const grossValue = quantity * executionPrice;
  const charges = calculateSimulatedCharges(side, grossValue).total_charges;

  if (side === 'BUY') {
    const totalRequiredCash = grossValue + charges;
    if (totalRequiredCash > availableCash) {
      const shortage = (totalRequiredCash - availableCash).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
      });
      return {
        isValid: false,
        error: `Insufficient virtual cash. Need ₹${totalRequiredCash.toFixed(2)}, shortage of ₹${shortage}.`,
        estimatedCost: totalRequiredCash,
        estimatedPrice: executionPrice,
      };
    }
    return {
      isValid: true,
      estimatedCost: totalRequiredCash,
      estimatedPrice: executionPrice,
    };
  } else {
    // SELL
    const currentHeldQuantity = existingPosition ? existingPosition.quantity : 0;
    if (currentHeldQuantity < quantity) {
      return {
        isValid: false,
        error: `Insufficient holdings. You own ${currentHeldQuantity} shares of ${symbol}, cannot sell ${quantity}.`,
        estimatedCost: grossValue - charges,
        estimatedPrice: executionPrice,
      };
    }
    return {
      isValid: true,
      estimatedCost: grossValue - charges,
      estimatedPrice: executionPrice,
    };
  }
}

/**
 * Builds complete portfolio summary with real-time quotes
 */
export function buildPortfolioSummary(params: {
  cashBalance: number;
  startingCash: number;
  positions: PaperPosition[];
  quoteMap: Record<string, { price: number; changePercent?: number; companyName?: string }>;
  accumulatedRealizedPnl: number;
}): {
  summary: PaperPortfolioSummary;
  holdings: PaperHolding[];
} {
  const { cashBalance, startingCash, positions, quoteMap, accumulatedRealizedPnl } = params;

  let totalInvested = 0;
  let totalHoldingsCurrentValue = 0;
  let totalUnrealizedPnl = 0;
  let totalTodayPnl = 0;

  const holdings: PaperHolding[] = positions
    .filter((pos) => pos.quantity > 0)
    .map((pos) => {
      const quote = quoteMap[pos.symbol] || quoteMap[pos.symbol.toUpperCase()];
      const isQuoteAvailable = Boolean(quote && typeof quote.price === 'number' && quote.price > 0);
      const currentPrice = isQuoteAvailable && quote ? quote.price : null;

      const investedValue = Number((pos.quantity * pos.average_price).toFixed(2));
      totalInvested += investedValue;

      let currentValue: number | null = null;
      let unrealizedPnl: number | null = null;
      let unrealizedPnlPercent: number | null = null;

      if (isQuoteAvailable && currentPrice !== null && quote) {
        currentValue = Number((pos.quantity * currentPrice).toFixed(2));
        unrealizedPnl = Number((currentValue - investedValue).toFixed(2));
        unrealizedPnlPercent =
          investedValue > 0
            ? Number(((unrealizedPnl / investedValue) * 100).toFixed(2))
            : 0;

        totalHoldingsCurrentValue += currentValue;
        totalUnrealizedPnl += unrealizedPnl;

        if (typeof quote.changePercent === 'number') {
          // Today's P&L contribution = current value * (changePercent / 100)
          const dayChangeFrac = quote.changePercent / 100;
          totalTodayPnl += currentValue * dayChangeFrac;
        }
      } else {
        // Fallback: If quote unavailable, preserve invested value as conservative placeholder
        // without pretending it's zero or fabricating a price
        totalHoldingsCurrentValue += investedValue;
      }

      return {
        ...pos,
        invested_value: investedValue,
        company_name: quote?.companyName,
        current_price: currentPrice,
        current_value: currentValue,
        unrealized_pnl: unrealizedPnl,
        unrealized_pnl_percent: unrealizedPnlPercent,
        is_quote_available: isQuoteAvailable,
        day_change_percent: quote?.changePercent,
      };
    });

  const totalPortfolioValue = Number((cashBalance + totalHoldingsCurrentValue).toFixed(2));
  const totalPnl = Number((totalUnrealizedPnl + accumulatedRealizedPnl).toFixed(2));
  const overallReturnPercent =
    startingCash > 0
      ? Number((((totalPortfolioValue - startingCash) / startingCash) * 100).toFixed(2))
      : 0;

  const todayPnlPercent =
    totalPortfolioValue > 0
      ? Number(((totalTodayPnl / totalPortfolioValue) * 100).toFixed(2))
      : 0;

  const summary: PaperPortfolioSummary = {
    total_portfolio_value: totalPortfolioValue,
    cash_balance: Number(cashBalance.toFixed(2)),
    available_cash: Number(cashBalance.toFixed(2)),
    invested_value: Number(totalInvested.toFixed(2)),
    unrealized_pnl: Number(totalUnrealizedPnl.toFixed(2)),
    unrealized_pnl_percent:
      totalInvested > 0
        ? Number(((totalUnrealizedPnl / totalInvested) * 100).toFixed(2))
        : 0,
    realized_pnl: Number(accumulatedRealizedPnl.toFixed(2)),
    total_pnl: totalPnl,
    today_pnl: Number(totalTodayPnl.toFixed(2)),
    today_pnl_percent: todayPnlPercent,
    overall_return_percent: overallReturnPercent,
    starting_capital: startingCash,
  };

  return { summary, holdings };
}
