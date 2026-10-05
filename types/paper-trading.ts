/**
 * TypeScript Interfaces for MarketLens Paper Trading Engine
 * Strictly typed with exact numeric semantics for financial calculations.
 */

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL_M';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';

export interface PaperAccount {
  id: string;
  user_id: string;
  starting_cash: number;
  cash_balance: number;
  created_at: string;
  updated_at: string;
}

export interface PaperOrder {
  id: string;
  account_id: string;
  symbol: string;
  exchange: string;
  side: OrderSide;
  order_type: OrderType;
  quantity: number;
  requested_price: number | null;
  executed_price: number | null;
  status: OrderStatus;
  estimated_charges: number;
  realized_pnl: number;
  created_at: string;
  executed_at: string | null;
}

export interface PaperTrade {
  id: string;
  account_id: string;
  order_id: string | null;
  symbol: string;
  exchange: string;
  side: OrderSide;
  quantity: number;
  price: number;
  total_value: number;
  charges: number;
  executed_at: string;
}

export interface PaperPosition {
  id: string;
  account_id: string;
  symbol: string;
  exchange: string;
  quantity: number;
  average_price: number;
  invested_value: number;
  realized_pnl: number;
  updated_at: string;
}

export interface PaperHolding extends PaperPosition {
  company_name?: string;
  current_price: number | null;
  current_value: number | null;
  unrealized_pnl: number | null;
  unrealized_pnl_percent: number | null;
  is_quote_available: boolean;
  day_change_percent?: number | null;
}

export interface PaperPortfolioSnapshot {
  id: string;
  account_id: string;
  total_value: number;
  cash_balance: number;
  invested_value: number;
  unrealized_pnl: number;
  realized_pnl: number;
  return_percent: number;
  recorded_at: string;
}

export interface PaperPortfolioSummary {
  total_portfolio_value: number;
  cash_balance: number;
  available_cash: number;
  invested_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  realized_pnl: number;
  total_pnl: number;
  today_pnl: number;
  today_pnl_percent: number;
  overall_return_percent: number;
  starting_capital: number;
}

export interface TradeCostBreakdown {
  brokerage: number;
  stt: number;
  exchange_charges: number;
  gst: number;
  sebi_charges: number;
  stamp_duty: number;
  total_charges: number;
}

export interface PaperOrderRequest {
  symbol: string;
  exchange?: string;
  side: OrderSide;
  order_type: OrderType;
  quantity: number;
  price?: number;
  slippage_percent?: number;
}

export interface PaperExecutionResult {
  success: boolean;
  order?: PaperOrder;
  trade?: PaperTrade;
  position?: PaperPosition;
  error?: string;
}
