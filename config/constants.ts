/**
 * Application constants for MarketLens
 */

export const APP_CONFIG = {
  name: 'MarketLens',
  tagline: 'Understand the market. Make informed decisions.',
  description: 'A personal, read-only Indian stock-market information and analysis dashboard.',
  version: '1.0.0',
  defaultMarket: 'India',
  defaultExchange: 'NSE',
  currency: 'INR',
  currencySymbol: '₹',
};

export const REFRESH_CONFIG = {
  defaultIntervalMs: 30000, // 30 seconds
  minIntervalMs: 10000,     // 10 seconds
  maxIntervalMs: 120000,    // 2 minutes
  staleTimeQuotesMs: 25000, // 25 seconds (less than refresh interval)
  staleTimeSymbolsMs: 3600000, // 1 hour
  staleTimeSearchMs: 60000, // 1 minute
};

export const MARKET_HOURS = {
  timezone: 'Asia/Kolkata',
  openHour: 9,
  openMinute: 15,
  closeHour: 15,
  closeMinute: 30,
  preMarketOpenHour: 9,
  preMarketOpenMinute: 0,
};

export const LEGAL_DISCLAIMERS = {
  notAdvice: 'MarketLens is an informational and research dashboard. Nothing on this website constitutes investment advice, financial recommendation, or trading instruction.',
  providerData: 'Data is provided by the 0xramm Indian Stock Market API (backed by Yahoo Finance). Latency and freshness depend on the upstream provider.',
  noExchangeDirect: 'MarketLens does NOT claim to provide an exchange-direct tick-by-tick real-time feed from NSE or BSE.',
  chartsAttribution: 'Charts powered by TradingView Lightweight Charts (Apache 2.0).',
  tradingViewUrl: 'https://www.tradingview.com/',
};
