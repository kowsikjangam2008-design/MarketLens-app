import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateSimulatedCharges,
  applySlippage,
  calculateUnrealizedPnl,
  calculateRealizedPnlOnSell,
  validateOrderInput,
  buildPortfolioSummary,
} from '@/lib/paper-trading/calculator';
import { PaperTradingService } from '@/lib/paper-trading/service';
import { PAPER_TRADING_CONFIG } from '@/config/paperTrading';
import type { PaperPosition } from '@/types/paper-trading';

describe('Paper Trading Engine - Unit Tests', () => {
  describe('Simulated Charges Calculation', () => {
    it('calculates realistic delivery charges for BUY orders', () => {
      const grossValue = 100000; // ₹1,00,000
      const charges = calculateSimulatedCharges('BUY', grossValue);

      expect(charges.brokerage).toBe(0);
      expect(charges.stt).toBe(100); // 0.1% of 100,000 = 100
      expect(charges.exchange_charges).toBeCloseTo(2.97, 2); // 0.00297%
      expect(charges.stamp_duty).toBeCloseTo(15.0, 2); // 0.015% on buy
      expect(charges.sebi_charges).toBeCloseTo(0.1, 2);
      expect(charges.gst).toBeGreaterThan(0);
      expect(charges.total_charges).toBeGreaterThan(118);
    });

    it('omits stamp duty on SELL orders', () => {
      const grossValue = 100000;
      const charges = calculateSimulatedCharges('SELL', grossValue);

      expect(charges.stamp_duty).toBe(0);
      expect(charges.stt).toBe(100);
      expect(charges.total_charges).toBeLessThan(
        calculateSimulatedCharges('BUY', grossValue).total_charges
      );
    });

    it('returns zero charges when gross value is zero or negative', () => {
      const charges = calculateSimulatedCharges('BUY', 0);
      expect(charges.total_charges).toBe(0);
      expect(charges.stt).toBe(0);
    });
  });

  describe('Slippage Simulation', () => {
    it('applies 0% slippage exactly as base price', () => {
      expect(applySlippage(2450.5, 'BUY', 0)).toBe(2450.5);
      expect(applySlippage(2450.5, 'SELL', 0)).toBe(2450.5);
    });

    it('increases buy price when slippage is positive', () => {
      const price = 1000;
      const slippage = 0.001; // 0.1%
      expect(applySlippage(price, 'BUY', slippage)).toBe(1001);
    });

    it('decreases sell price when slippage is positive', () => {
      const price = 1000;
      const slippage = 0.001; // 0.1%
      expect(applySlippage(price, 'SELL', slippage)).toBe(999);
    });
  });

  describe('P&L Calculations', () => {
    it('computes unrealized profit and percentage accurately', () => {
      const { unrealizedPnl, unrealizedPnlPercent } = calculateUnrealizedPnl(10, 100, 120);
      expect(unrealizedPnl).toBe(200); // (120 - 100) * 10
      expect(unrealizedPnlPercent).toBe(20); // 20%
    });

    it('computes unrealized loss accurately', () => {
      const { unrealizedPnl, unrealizedPnlPercent } = calculateUnrealizedPnl(10, 100, 85);
      expect(unrealizedPnl).toBe(-150);
      expect(unrealizedPnlPercent).toBe(-15);
    });

    it('computes FIFO realized P&L on sell after deducting simulated charges', () => {
      const sellQty = 10;
      const sellPrice = 150;
      const avgBuyPrice = 100;
      const charges = 25;

      // Gross profit = 10 * (150 - 100) = 500; Net = 500 - 25 = 475
      const realizedPnl = calculateRealizedPnlOnSell(sellQty, sellPrice, avgBuyPrice, charges);
      expect(realizedPnl).toBe(475);
    });
  });

  describe('Order Validation Rules', () => {
    it('validates a correct market buy with sufficient cash', () => {
      const result = validateOrderInput({
        symbol: 'RELIANCE.NS',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 10,
        marketPrice: 2000,
        availableCash: 50000,
      });

      expect(result.isValid).toBe(true);
      expect(result.estimatedCost).toBeGreaterThan(20000);
    });

    it('rejects buy when cash is insufficient', () => {
      const result = validateOrderInput({
        symbol: 'RELIANCE.NS',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 100,
        marketPrice: 2000,
        availableCash: 50000, // Needs > 200,000
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Insufficient virtual cash');
    });

    it('rejects sell when holdings are insufficient', () => {
      const existingPos: PaperPosition = {
        id: 'pos-1',
        account_id: 'acc-1',
        symbol: 'TCS.NS',
        exchange: 'NSE',
        quantity: 5,
        average_price: 3500,
        invested_value: 17500,
        realized_pnl: 0,
        updated_at: new Date().toISOString(),
      };

      const result = validateOrderInput({
        symbol: 'TCS.NS',
        side: 'SELL',
        orderType: 'MARKET',
        quantity: 10, // owns only 5
        marketPrice: 3600,
        availableCash: 10000,
        existingPosition: existingPos,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Insufficient holdings');
    });

    it('rejects market order when market price is unavailable', () => {
      const result = validateOrderInput({
        symbol: 'INFY.NS',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 10,
        marketPrice: null,
        availableCash: 50000,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Current market price is unavailable');
    });

    it('rejects invalid or non-integer quantities', () => {
      const result = validateOrderInput({
        symbol: 'INFY.NS',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: -5,
        marketPrice: 1500,
        availableCash: 50000,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('positive integer');
    });
  });

  describe('Portfolio Summary Builder', () => {
    it('aggregates portfolio metrics with live quotes and cash', () => {
      const positions: PaperPosition[] = [
        {
          id: 'pos-1',
          account_id: 'acc-1',
          symbol: 'RELIANCE.NS',
          exchange: 'NSE',
          quantity: 10,
          average_price: 2000,
          invested_value: 20000,
          realized_pnl: 0,
          updated_at: new Date().toISOString(),
        },
      ];

      const quoteMap = {
        'RELIANCE.NS': { price: 2200, changePercent: 2.5, companyName: 'Reliance Industries' },
      };

      const { summary, holdings } = buildPortfolioSummary({
        cashBalance: 980000,
        startingCash: 1000000,
        positions,
        quoteMap,
        accumulatedRealizedPnl: 500,
      });

      expect(summary.total_portfolio_value).toBe(980000 + 22000); // 10,02,000
      expect(summary.invested_value).toBe(20000);
      expect(summary.unrealized_pnl).toBe(2000);
      expect(summary.realized_pnl).toBe(500);
      expect(summary.total_pnl).toBe(2500);
      expect(summary.overall_return_percent).toBeCloseTo(0.2, 2);
      expect(holdings[0]!.current_price).toBe(2200);
      expect(holdings[0]!.unrealized_pnl).toBe(2000);
    });

    it('handles quote unavailability gracefully without zeroing portfolio', () => {
      const positions: PaperPosition[] = [
        {
          id: 'pos-1',
          account_id: 'acc-1',
          symbol: 'UNLISTED.NS',
          exchange: 'NSE',
          quantity: 10,
          average_price: 100,
          invested_value: 1000,
          realized_pnl: 0,
          updated_at: new Date().toISOString(),
        },
      ];

      const { summary, holdings } = buildPortfolioSummary({
        cashBalance: 500000,
        startingCash: 1000000,
        positions,
        quoteMap: {}, // Empty quotes
        accumulatedRealizedPnl: 0,
      });

      expect(holdings[0]!.is_quote_available).toBe(false);
      expect(holdings[0]!.current_price).toBeNull();
      // Total value retains invested value rather than crashing to 0
      expect(summary.total_portfolio_value).toBe(501000);
    });
  });

  describe('PaperTradingService End-to-End Simulation Workflow', () => {
    const testUserId = 'test-sim-user-' + Math.random().toString(36).substring(2, 7);

    it('initializes a new paper account with ₹10,00,000 virtual capital', async () => {
      const { account } = await PaperTradingService.getOrCreateAccount(testUserId);
      expect(account.starting_cash).toBe(1000000);
      expect(account.cash_balance).toBe(1000000);
    });

    it('executes simulated Market Buy, updates cash, positions, and orders', async () => {
      const { account } = await PaperTradingService.getOrCreateAccount(testUserId);
      const initialCash = account.cash_balance;

      const result = await PaperTradingService.submitOrder({
        userId: testUserId,
        account,
        request: {
          symbol: 'RELIANCE.NS',
          exchange: 'NSE',
          side: 'BUY',
          order_type: 'MARKET',
          quantity: 10,
        },
        marketPrice: 2000,
      });

      expect(result.success).toBe(true);
      expect(result.order?.status).toBe('EXECUTED');
      expect(result.order?.executed_price).toBe(2000);
      expect(result.position?.quantity).toBe(10);
      expect(result.position?.average_price).toBe(2000);
      expect(account.cash_balance).toBeLessThan(initialCash - 20000); // 20000 + charges
    });

    it('executes partial Market Sell, updates holdings and computes FIFO realized P&L', async () => {
      const { account } = await PaperTradingService.getOrCreateAccount(testUserId);
      const cashBeforeSell = account.cash_balance;

      // Sell 4 of the 10 RELIANCE shares at ₹2500
      const sellResult = await PaperTradingService.submitOrder({
        userId: testUserId,
        account,
        request: {
          symbol: 'RELIANCE.NS',
          exchange: 'NSE',
          side: 'SELL',
          order_type: 'MARKET',
          quantity: 4,
        },
        marketPrice: 2500,
      });

      expect(sellResult.success).toBe(true);
      expect(sellResult.position?.quantity).toBe(6);
      expect(sellResult.order?.realized_pnl).toBeGreaterThan(1900); // 4 * (2500 - 2000) = 2000 minus charges
      expect(account.cash_balance).toBeGreaterThan(cashBeforeSell);
    });

    it('creates and cancels pending Limit order safely', async () => {
      const { account } = await PaperTradingService.getOrCreateAccount(testUserId);
      const cashBefore = account.cash_balance;

      // Buy Limit order below current market price (e.g. ₹1500 when market is ₹2000)
      const limitResult = await PaperTradingService.submitOrder({
        userId: testUserId,
        account,
        request: {
          symbol: 'TCS.NS',
          exchange: 'NSE',
          side: 'BUY',
          order_type: 'LIMIT',
          quantity: 5,
          price: 1500,
        },
        marketPrice: 2000,
      });

      expect(limitResult.success).toBe(true);
      expect(limitResult.order?.status).toBe('PENDING');

      // Cancel pending order
      const cancelRes = await PaperTradingService.cancelOrder(
        limitResult.order!.id,
        account.id,
        testUserId
      );
      expect(cancelRes.success).toBe(true);

      // Verify cash balance was never deducted for cancelled order
      expect(account.cash_balance).toBe(cashBefore);
    });

    it('resets paper account back to ₹10,00,000 on confirmed reset', async () => {
      const { account } = await PaperTradingService.getOrCreateAccount(testUserId);
      const resetRes = await PaperTradingService.resetAccount(account.id, testUserId);
      expect(resetRes.success).toBe(true);

      const refreshed = await PaperTradingService.getOrCreateAccount(testUserId);
      expect(refreshed.account.cash_balance).toBe(1000000);

      const positions = await PaperTradingService.getPositions(refreshed.account.id, testUserId);
      expect(positions.length).toBe(0);
    });
  });
});
