import { getSupabaseClient } from '@/lib/supabase/client';
import { PAPER_TRADING_CONFIG } from '@/config/paperTrading';
import {
  calculateSimulatedCharges,
  applySlippage,
  calculateRealizedPnlOnSell,
  validateOrderInput,
} from '@/lib/paper-trading/calculator';
import type {
  PaperAccount,
  PaperOrder,
  PaperTrade,
  PaperPosition,
  PaperPortfolioSnapshot,
  PaperOrderRequest,
  PaperExecutionResult,
} from '@/types/paper-trading';

// In-browser fallback store key for development or when remote Supabase tables are pending migration
const LOCAL_STORAGE_KEY_PREFIX = 'marketlens_paper_portfolio_';

interface LocalStoreState {
  account: PaperAccount;
  orders: PaperOrder[];
  trades: PaperTrade[];
  positions: PaperPosition[];
  snapshots: PaperPortfolioSnapshot[];
}

function getLocalState(userId: string): LocalStoreState {
  if (typeof window === 'undefined') {
    return createInitialLocalState(userId);
  }
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read local paper trading state:', e);
  }
  const initial = createInitialLocalState(userId);
  saveLocalState(userId, initial);
  return initial;
}

function saveLocalState(userId: string, state: LocalStoreState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY_PREFIX}${userId}`,
      JSON.stringify(state)
    );
  } catch (e) {
    console.warn('Could not persist local paper trading state:', e);
  }
}

function createInitialLocalState(userId: string): LocalStoreState {
  const accountId = 'acc_' + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  return {
    account: {
      id: accountId,
      user_id: userId,
      starting_cash: PAPER_TRADING_CONFIG.DEFAULT_STARTING_CASH,
      cash_balance: PAPER_TRADING_CONFIG.DEFAULT_STARTING_CASH,
      created_at: now,
      updated_at: now,
    },
    orders: [],
    trades: [],
    positions: [],
    snapshots: [
      {
        id: 'snap_' + Math.random().toString(36).substring(2, 11),
        account_id: accountId,
        total_value: PAPER_TRADING_CONFIG.DEFAULT_STARTING_CASH,
        cash_balance: PAPER_TRADING_CONFIG.DEFAULT_STARTING_CASH,
        invested_value: 0,
        unrealized_pnl: 0,
        realized_pnl: 0,
        return_percent: 0,
        recorded_at: now,
      },
    ],
  };
}

export class PaperTradingService {
  /**
   * Tracks whether remote Supabase database tables have been initialized
   */
  static isRemoteDbReady: boolean = false;

  /**
   * Loads or creates a paper account for the authenticated user
   */
  static async getOrCreateAccount(
    userId: string
  ): Promise<{ account: PaperAccount; isFallback: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: existing, error: selectError } = await supabase
          .from('paper_accounts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          this.isRemoteDbReady = true;
          return { account: existing as PaperAccount, isFallback: false };
        }

        // Check if table missing (PGRST205 / 42P01)
        if (selectError && (selectError.code === 'PGRST205' || selectError.code === '42P01')) {
          this.isRemoteDbReady = false;
          console.info('Supabase paper_accounts table pending schema execution, using resilient local store.');
          const local = getLocalState(userId);
          return { account: local.account, isFallback: true };
        }

        // Create new account
        const now = new Date().toISOString();
        const { data: created, error: insertError } = await supabase
          .from('paper_accounts')
          .insert({
            user_id: userId,
            starting_cash: PAPER_TRADING_CONFIG.DEFAULT_STARTING_CASH,
            cash_balance: PAPER_TRADING_CONFIG.DEFAULT_STARTING_CASH,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();

        if (created) {
          this.isRemoteDbReady = true;
          // Record initial snapshot
          await supabase.from('paper_portfolio_snapshots').insert({
            account_id: created.id,
            total_value: PAPER_TRADING_CONFIG.DEFAULT_STARTING_CASH,
            cash_balance: PAPER_TRADING_CONFIG.DEFAULT_STARTING_CASH,
            invested_value: 0,
            unrealized_pnl: 0,
            realized_pnl: 0,
            return_percent: 0,
            recorded_at: now,
          });

          return { account: created as PaperAccount, isFallback: false };
        }

        if (insertError) {
          this.isRemoteDbReady = false;
          console.warn('Supabase insert error, falling back:', insertError.message);
        }
      } catch (err) {
        this.isRemoteDbReady = false;
        console.warn('Supabase query error, falling back:', err);
      }
    }

    // Fallback to local session persistence
    this.isRemoteDbReady = false;
    const local = getLocalState(userId);
    return { account: local.account, isFallback: true };
  }

  /**
   * Fetches all positions for the given account
   */
  static async getPositions(
    accountId: string,
    userId: string
  ): Promise<PaperPosition[]> {
    const supabase = getSupabaseClient();

    if (this.isRemoteDbReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('paper_positions')
          .select('*')
          .eq('account_id', accountId)
          .gt('quantity', 0);

        if (data && !error) {
          return data as PaperPosition[];
        }
      } catch (e) {
        // Fallback
      }
    }

    const local = getLocalState(userId);
    return local.positions.filter((p) => p.quantity > 0);
  }

  /**
   * Fetches all orders for the given account
   */
  static async getOrders(
    accountId: string,
    userId: string
  ): Promise<PaperOrder[]> {
    const supabase = getSupabaseClient();

    if (this.isRemoteDbReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('paper_orders')
          .select('*')
          .eq('account_id', accountId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          return data as PaperOrder[];
        }
      } catch (e) {
        // Fallback
      }
    }

    const local = getLocalState(userId);
    return [...local.orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Fetches all trades for the given account
   */
  static async getTrades(
    accountId: string,
    userId: string
  ): Promise<PaperTrade[]> {
    const supabase = getSupabaseClient();

    if (this.isRemoteDbReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('paper_trades')
          .select('*')
          .eq('account_id', accountId)
          .order('executed_at', { ascending: false });

        if (data && !error) {
          return data as PaperTrade[];
        }
      } catch (e) {
        // Fallback
      }
    }

    const local = getLocalState(userId);
    return [...local.trades].sort(
      (a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime()
    );
  }

  /**
   * Fetches snapshots for performance charting
   */
  static async getSnapshots(
    accountId: string,
    userId: string
  ): Promise<PaperPortfolioSnapshot[]> {
    const supabase = getSupabaseClient();

    if (this.isRemoteDbReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('paper_portfolio_snapshots')
          .select('*')
          .eq('account_id', accountId)
          .order('recorded_at', { ascending: true });

        if (data && !error) {
          return data as PaperPortfolioSnapshot[];
        }
      } catch (e) {
        // Fallback
      }
    }

    const local = getLocalState(userId);
    return [...local.snapshots].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
  }

  /**
   * Submits and executes a paper order (Market or Limit)
   */
  static async submitOrder(params: {
    userId: string;
    account: PaperAccount;
    request: PaperOrderRequest;
    marketPrice: number | null;
  }): Promise<PaperExecutionResult> {
    const { userId, account, request, marketPrice } = params;
    const { symbol, side, order_type, quantity, price, slippage_percent = 0 } = request;
    const exchange = request.exchange || 'NSE';

    // 1. Get existing position for validation
    const positions = await this.getPositions(account.id, userId);
    const cleanSym = (symbol.split('.')[0] || symbol).toUpperCase();
    const existingPosition =
      positions.find(
        (p) =>
          p.symbol.toUpperCase() === symbol.toUpperCase() ||
          p.symbol.toUpperCase() === cleanSym
      ) || null;

    // 2. Validate input
    const validation = validateOrderInput({
      symbol,
      side,
      orderType: order_type,
      quantity,
      limitPrice: price,
      marketPrice,
      availableCash: account.cash_balance,
      existingPosition,
      slippagePercent: slippage_percent,
    });

    if (!validation.isValid) {
      return { success: false, error: validation.error || 'Invalid order parameters.' };
    }

    const isMarket = order_type === 'MARKET';

    // 3. Handle Limit orders that cannot immediately fill
    if (!isMarket) {
      const limitPrice = price || 0;
      const canFillNow =
        marketPrice !== null &&
        ((side === 'BUY' && marketPrice <= limitPrice) ||
          (side === 'SELL' && marketPrice >= limitPrice));

      if (!canFillNow) {
        // Place as PENDING order
        return await this.createPendingOrder({
          userId,
          account,
          symbol,
          exchange,
          side,
          orderType: order_type,
          quantity,
          requestedPrice: limitPrice,
        });
      }
    }

    // 4. Execute immediate fill (Market order or immediate Limit fill)
    const baseFillPrice = isMarket ? (marketPrice || 0) : (price || marketPrice || 0);
    const executedPrice = applySlippage(baseFillPrice, side, slippage_percent);
    const grossValue = quantity * executedPrice;
    const charges = calculateSimulatedCharges(side, grossValue).total_charges;

    if (side === 'BUY') {
      return await this.executeBuyTransaction({
        userId,
        account,
        symbol,
        exchange,
        orderType: order_type,
        quantity,
        executedPrice,
        grossValue,
        charges,
        existingPosition,
      });
    } else {
      return await this.executeSellTransaction({
        userId,
        account,
        symbol,
        exchange,
        orderType: order_type,
        quantity,
        executedPrice,
        grossValue,
        charges,
        existingPosition: existingPosition!,
      });
    }
  }

  /**
   * Internal helper: Executes BUY transaction
   */
  private static async executeBuyTransaction(params: {
    userId: string;
    account: PaperAccount;
    symbol: string;
    exchange: string;
    orderType: string;
    quantity: number;
    executedPrice: number;
    grossValue: number;
    charges: number;
    existingPosition: PaperPosition | null;
  }): Promise<PaperExecutionResult> {
    const {
      userId,
      account,
      symbol,
      exchange,
      orderType,
      quantity,
      executedPrice,
      grossValue,
      charges,
      existingPosition,
    } = params;

    const totalCashDeduction = grossValue + charges;
    const newCashBalance = Number((account.cash_balance - totalCashDeduction).toFixed(2));
    const now = new Date().toISOString();
    const orderId = 'ord_' + Math.random().toString(36).substring(2, 11);
    const tradeId = 'trd_' + Math.random().toString(36).substring(2, 11);

    // Position updates
    const oldQty = existingPosition ? existingPosition.quantity : 0;
    const oldInvested = existingPosition ? existingPosition.invested_value : 0;
    const newQty = oldQty + quantity;
    const newInvested = Number((oldInvested + grossValue).toFixed(2));
    const newAvgPrice = Number((newInvested / newQty).toFixed(2));

    const updatedPosition: PaperPosition = {
      id: existingPosition?.id || 'pos_' + Math.random().toString(36).substring(2, 11),
      account_id: account.id,
      symbol: symbol.toUpperCase(),
      exchange,
      quantity: newQty,
      average_price: newAvgPrice,
      invested_value: newInvested,
      realized_pnl: existingPosition?.realized_pnl || 0,
      updated_at: now,
    };

    const newOrder: PaperOrder = {
      id: orderId,
      account_id: account.id,
      symbol: symbol.toUpperCase(),
      exchange,
      side: 'BUY',
      order_type: orderType as any,
      quantity,
      requested_price: executedPrice,
      executed_price: executedPrice,
      status: 'EXECUTED',
      estimated_charges: charges,
      realized_pnl: 0,
      created_at: now,
      executed_at: now,
    };

    const newTrade: PaperTrade = {
      id: tradeId,
      account_id: account.id,
      order_id: orderId,
      symbol: symbol.toUpperCase(),
      exchange,
      side: 'BUY',
      quantity,
      price: executedPrice,
      total_value: grossValue,
      charges,
      executed_at: now,
    };

    const supabase = getSupabaseClient();
    if (this.isRemoteDbReady && supabase) {
      try {
        const { error: accErr } = await supabase
          .from('paper_accounts')
          .update({ cash_balance: newCashBalance, updated_at: now })
          .eq('id', account.id);

        if (!accErr) {
          await supabase.from('paper_orders').insert(newOrder);
          await supabase.from('paper_trades').insert(newTrade);

          if (existingPosition) {
            await supabase
              .from('paper_positions')
              .update({
                quantity: newQty,
                average_price: newAvgPrice,
                invested_value: newInvested,
                updated_at: now,
              })
              .eq('id', existingPosition.id);
          } else {
            await supabase.from('paper_positions').insert(updatedPosition);
          }

          // Record Snapshot
          await supabase.from('paper_portfolio_snapshots').insert({
            account_id: account.id,
            total_value: Number((newCashBalance + newInvested).toFixed(2)),
            cash_balance: newCashBalance,
            invested_value: newInvested,
            unrealized_pnl: 0,
            realized_pnl: updatedPosition.realized_pnl,
            return_percent: Number(
              (((newCashBalance + newInvested - account.starting_cash) / account.starting_cash) * 100).toFixed(4)
            ),
            recorded_at: now,
          });

          account.cash_balance = newCashBalance;
          return { success: true, order: newOrder, trade: newTrade, position: updatedPosition };
        }
      } catch (err) {
        console.warn('Remote execution fallback:', err);
      }
    }

    // Local fallback update
    const local = getLocalState(userId);
    local.account.cash_balance = newCashBalance;
    local.account.updated_at = now;
    local.orders.unshift(newOrder);
    local.trades.unshift(newTrade);

    const cleanSymBuy = (symbol.split('.')[0] || symbol).toUpperCase();
    const posIdx = local.positions.findIndex(
      (p) =>
        p.symbol.toUpperCase() === symbol.toUpperCase() ||
        p.symbol.toUpperCase() === cleanSymBuy
    );
    if (posIdx >= 0) {
      local.positions[posIdx] = updatedPosition;
    } else {
      local.positions.push(updatedPosition);
    }

    local.snapshots.push({
      id: 'snap_' + Math.random().toString(36).substring(2, 11),
      account_id: account.id,
      total_value: Number((newCashBalance + newInvested).toFixed(2)),
      cash_balance: newCashBalance,
      invested_value: newInvested,
      unrealized_pnl: 0,
      realized_pnl: updatedPosition.realized_pnl,
      return_percent: Number(
        (((newCashBalance + newInvested - account.starting_cash) / account.starting_cash) * 100).toFixed(4)
      ),
      recorded_at: now,
    });

    saveLocalState(userId, local);
    account.cash_balance = newCashBalance;

    return { success: true, order: newOrder, trade: newTrade, position: updatedPosition };
  }

  /**
   * Internal helper: Executes SELL transaction with FIFO realized P&L
   */
  private static async executeSellTransaction(params: {
    userId: string;
    account: PaperAccount;
    symbol: string;
    exchange: string;
    orderType: string;
    quantity: number;
    executedPrice: number;
    grossValue: number;
    charges: number;
    existingPosition: PaperPosition;
  }): Promise<PaperExecutionResult> {
    const {
      userId,
      account,
      symbol,
      exchange,
      orderType,
      quantity,
      executedPrice,
      grossValue,
      charges,
      existingPosition,
    } = params;

    const netProceeds = grossValue - charges;
    const newCashBalance = Number((account.cash_balance + netProceeds).toFixed(2));
    const now = new Date().toISOString();

    // FIFO Realized P&L
    const realizedPnlThisTrade = calculateRealizedPnlOnSell(
      quantity,
      executedPrice,
      existingPosition.average_price,
      charges
    );
    const newAccumulatedRealizedPnl = Number(
      (existingPosition.realized_pnl + realizedPnlThisTrade).toFixed(2)
    );

    const remainingQty = existingPosition.quantity - quantity;
    const newInvestedValue = Number(
      (remainingQty * existingPosition.average_price).toFixed(2)
    );

    const updatedPosition: PaperPosition = {
      ...existingPosition,
      quantity: remainingQty,
      invested_value: newInvestedValue,
      average_price: remainingQty > 0 ? existingPosition.average_price : 0,
      realized_pnl: newAccumulatedRealizedPnl,
      updated_at: now,
    };

    const orderId = 'ord_' + Math.random().toString(36).substring(2, 11);
    const tradeId = 'trd_' + Math.random().toString(36).substring(2, 11);

    const newOrder: PaperOrder = {
      id: orderId,
      account_id: account.id,
      symbol: symbol.toUpperCase(),
      exchange,
      side: 'SELL',
      order_type: orderType as any,
      quantity,
      requested_price: executedPrice,
      executed_price: executedPrice,
      status: 'EXECUTED',
      estimated_charges: charges,
      realized_pnl: realizedPnlThisTrade,
      created_at: now,
      executed_at: now,
    };

    const newTrade: PaperTrade = {
      id: tradeId,
      account_id: account.id,
      order_id: orderId,
      symbol: symbol.toUpperCase(),
      exchange,
      side: 'SELL',
      quantity,
      price: executedPrice,
      total_value: grossValue,
      charges,
      executed_at: now,
    };

    const supabase = getSupabaseClient();
    if (this.isRemoteDbReady && supabase) {
      try {
        const { error: accErr } = await supabase
          .from('paper_accounts')
          .update({ cash_balance: newCashBalance, updated_at: now })
          .eq('id', account.id);

        if (!accErr) {
          await supabase.from('paper_orders').insert(newOrder);
          await supabase.from('paper_trades').insert(newTrade);

          if (remainingQty === 0) {
            await supabase
              .from('paper_positions')
              .update({
                quantity: 0,
                invested_value: 0,
                average_price: 0,
                realized_pnl: newAccumulatedRealizedPnl,
                updated_at: now,
              })
              .eq('id', existingPosition.id);
          } else {
            await supabase
              .from('paper_positions')
              .update({
                quantity: remainingQty,
                invested_value: newInvestedValue,
                realized_pnl: newAccumulatedRealizedPnl,
                updated_at: now,
              })
              .eq('id', existingPosition.id);
          }

          // Snapshot
          await supabase.from('paper_portfolio_snapshots').insert({
            account_id: account.id,
            total_value: Number((newCashBalance + newInvestedValue).toFixed(2)),
            cash_balance: newCashBalance,
            invested_value: newInvestedValue,
            unrealized_pnl: 0,
            realized_pnl: newAccumulatedRealizedPnl,
            return_percent: Number(
              (((newCashBalance + newInvestedValue - account.starting_cash) / account.starting_cash) * 100).toFixed(4)
            ),
            recorded_at: now,
          });

          account.cash_balance = newCashBalance;
          return { success: true, order: newOrder, trade: newTrade, position: updatedPosition };
        }
      } catch (err) {
        console.warn('Remote execution fallback:', err);
      }
    }

    // Local fallback update
    const local = getLocalState(userId);
    local.account.cash_balance = newCashBalance;
    local.account.updated_at = now;
    local.orders.unshift(newOrder);
    local.trades.unshift(newTrade);

    const cleanSymSell = (symbol.split('.')[0] || symbol).toUpperCase();
    const posIdx = local.positions.findIndex(
      (p) =>
        p.symbol.toUpperCase() === symbol.toUpperCase() ||
        p.symbol.toUpperCase() === cleanSymSell
    );
    if (posIdx >= 0) {
      local.positions[posIdx] = updatedPosition;
    }

    local.snapshots.push({
      id: 'snap_' + Math.random().toString(36).substring(2, 11),
      account_id: account.id,
      total_value: Number((newCashBalance + newInvestedValue).toFixed(2)),
      cash_balance: newCashBalance,
      invested_value: newInvestedValue,
      unrealized_pnl: 0,
      realized_pnl: newAccumulatedRealizedPnl,
      return_percent: Number(
        (((newCashBalance + newInvestedValue - account.starting_cash) / account.starting_cash) * 100).toFixed(4)
      ),
      recorded_at: now,
    });

    saveLocalState(userId, local);
    account.cash_balance = newCashBalance;

    return { success: true, order: newOrder, trade: newTrade, position: updatedPosition };
  }

  /**
   * Creates a PENDING limit order
   */
  private static async createPendingOrder(params: {
    userId: string;
    account: PaperAccount;
    symbol: string;
    exchange: string;
    side: 'BUY' | 'SELL';
    orderType: string;
    quantity: number;
    requestedPrice: number;
  }): Promise<PaperExecutionResult> {
    const { userId, account, symbol, exchange, side, orderType, quantity, requestedPrice } = params;
    const now = new Date().toISOString();
    const orderId = 'ord_' + Math.random().toString(36).substring(2, 11);
    const grossValue = quantity * requestedPrice;
    const charges = calculateSimulatedCharges(side, grossValue).total_charges;

    const newOrder: PaperOrder = {
      id: orderId,
      account_id: account.id,
      symbol: symbol.toUpperCase(),
      exchange,
      side,
      order_type: orderType as any,
      quantity,
      requested_price: requestedPrice,
      executed_price: null,
      status: 'PENDING',
      estimated_charges: charges,
      realized_pnl: 0,
      created_at: now,
      executed_at: null,
    };

    const supabase = getSupabaseClient();
    if (this.isRemoteDbReady && supabase) {
      try {
        const { error } = await supabase.from('paper_orders').insert(newOrder);
        if (!error) return { success: true, order: newOrder };
      } catch (err) {
        // Fallback
      }
    }

    const local = getLocalState(userId);
    local.orders.unshift(newOrder);
    saveLocalState(userId, local);

    return { success: true, order: newOrder };
  }

  /**
   * Cancels a pending order
   */
  static async cancelOrder(
    orderId: string,
    accountId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (this.isRemoteDbReady && supabase) {
      try {
        const { error } = await supabase
          .from('paper_orders')
          .update({ status: 'CANCELLED' })
          .eq('id', orderId)
          .eq('account_id', accountId)
          .eq('status', 'PENDING');

        if (!error) return { success: true };
      } catch (e) {
        // Fallback
      }
    }

    const local = getLocalState(userId);
    const order = local.orders.find((o) => o.id === orderId && o.status === 'PENDING');
    if (order) {
      order.status = 'CANCELLED';
      saveLocalState(userId, local);
      return { success: true };
    }

    return { success: false, error: 'Order not found or cannot be cancelled.' };
  }

  /**
   * Evaluates pending limit orders against current quotes and executes matches
   */
  static async checkAndExecutePendingOrders(
    account: PaperAccount,
    userId: string,
    quoteMap: Record<string, { price: number }>
  ): Promise<number> {
    const orders = await this.getOrders(account.id, userId);
    const pendingOrders = orders.filter((o) => o.status === 'PENDING');
    let filledCount = 0;

    for (const order of pendingOrders) {
      const quote = quoteMap[order.symbol] || quoteMap[order.symbol.toUpperCase()];
      if (!quote || quote.price <= 0) continue;

      const currentPrice = quote.price;
      const targetPrice = order.requested_price || 0;

      const shouldFill =
        (order.side === 'BUY' && currentPrice <= targetPrice) ||
        (order.side === 'SELL' && currentPrice >= targetPrice);

      if (shouldFill) {
        // Cancel pending order and submit fill
        await this.cancelOrder(order.id, account.id, userId);
        await this.submitOrder({
          userId,
          account,
          request: {
            symbol: order.symbol,
            exchange: order.exchange,
            side: order.side,
            order_type: 'MARKET',
            quantity: order.quantity,
          },
          marketPrice: currentPrice,
        });
        filledCount++;
      }
    }

    return filledCount;
  }

  /**
   * Resets account with initial virtual capital
   */
  static async resetAccount(
    accountId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    if (this.isRemoteDbReady && supabase) {
      try {
        const { data, error } = await supabase.rpc('reset_paper_account', {
          p_account_id: accountId,
        });

        if (data && !error) {
          return { success: true };
        }
      } catch (e) {
        // Fallback to manual reset
      }
    }

    const fresh = createInitialLocalState(userId);
    saveLocalState(userId, fresh);
    return { success: true };
  }
}
