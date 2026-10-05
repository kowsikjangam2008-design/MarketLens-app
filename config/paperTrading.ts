/**
 * Configuration for MarketLens Simulated Paper Trading Engine
 * Centralizes starting capital, simulated regulatory charges, and slippage defaults.
 */

export const PAPER_TRADING_CONFIG = {
  // Default Starting Virtual Capital
  DEFAULT_STARTING_CASH: 1000000, // ₹10,00,000

  // Simulated Charges Configuration
  ENABLE_SIMULATED_CHARGES: true,

  // Realistic Indian Equity Delivery Simulated Cost Model
  CHARGES: {
    // Brokerage: ₹0 for delivery or optional flat ₹20
    BROKERAGE_FLAT_INR: 0,
    BROKERAGE_PERCENT: 0,

    // Securities Transaction Tax (STT): 0.1% on both Buy and Sell for Delivery
    STT_PERCENT: 0.001, // 0.1%

    // Exchange Transaction Charges (NSE): ~0.00297%
    EXCHANGE_TURNOVER_PERCENT: 0.0000297,

    // GST: 18% applied on (Brokerage + Exchange Charges + SEBI Turnover Charges)
    GST_PERCENT: 0.18,

    // SEBI Turnover Fees: ₹10 per crore (0.0001%)
    SEBI_TURNOVER_PERCENT: 0.000001,

    // Stamp Duty: 0.015% applied on BUY orders only
    STAMP_DUTY_BUY_PERCENT: 0.00015,
  },

  // Slippage Configuration
  DEFAULT_SLIPPAGE_PERCENT: 0.0, // 0.0% default as specified
  MAX_ALLOWED_SLIPPAGE_PERCENT: 0.05, // 5% max configurable

  // Labels for UI clarity
  LABELS: {
    CHARGES_DISCLAIMER: 'Simulated charges',
    SLIPPAGE_DISCLAIMER: 'Simulated slippage',
    VIRTUAL_MONEY_DISCLAIMER:
      'Paper trading is simulated and does not represent real trade execution. Prices, fills, slippage, and transaction costs may differ from actual market conditions.',
  },
} as const;
