/**
 * Comprehensive Financial Glossary for MarketLens
 * Designed for beginner accessibility with clear, practical examples.
 */

export interface FinancialTermDefinition {
  id: string;
  term: string;
  shortDefinition: string;
  detailedExplanation: string;
  simpleExample: string;
  whyItMatters: string;
  category: 'valuation' | 'price' | 'technical' | 'market_structure' | 'fundamentals';
}

export const FINANCIAL_TERMS: Record<string, FinancialTermDefinition> = {
  market_cap: {
    id: 'market_cap',
    term: 'Market Capitalization (Market Cap)',
    shortDefinition: 'The total market value of a company\'s outstanding shares.',
    detailedExplanation: 'Market capitalization represents the total worth of a company as determined by the stock market. It is calculated by multiplying a company\'s current share price by its total number of outstanding shares. Companies are typically categorized into Large Cap, Mid Cap, and Small Cap based on this number.',
    simpleExample: 'If a company has 10 crore (100 million) shares and each share trades at ₹2,000, its Market Cap is ₹20,000 crore.',
    whyItMatters: 'It helps investors assess the size, stability, and risk profile of a company. Large-cap stocks tend to be more stable, while small-caps offer higher growth potential with higher volatility.',
    category: 'valuation',
  },
  ltp: {
    id: 'ltp',
    term: 'Last Traded Price (LTP)',
    shortDefinition: 'The price at which the most recent trade took place.',
    detailedExplanation: 'The Last Traded Price (LTP) is the exact rupee amount agreed upon between a buyer and seller in the latest completed transaction. Since market prices fluctuate continuously during market hours, the LTP reflects the most recent market consensus.',
    simpleExample: 'If someone just bought 50 shares of TCS at ₹3,850.50, the LTP becomes ₹3,850.50.',
    whyItMatters: 'LTP provides an immediate snapshot of current market valuation and is the reference price used to calculate day gains and losses.',
    category: 'price',
  },
  volume: {
    id: 'volume',
    term: 'Trading Volume',
    shortDefinition: 'The total number of shares traded during a given time period.',
    detailedExplanation: 'Volume counts how many shares changed hands between buyers and sellers during a single trading session (or specific candlestick timeframe). High volume indicates high liquidity and active market participation.',
    simpleExample: 'If 50 lakh (5,000,000) shares of Reliance were bought and sold today, today\'s trading volume is 50 lakh shares.',
    whyItMatters: 'A price rise backed by high volume confirms strong buyer conviction. A price move on very low volume might be temporary or easily reversed.',
    category: 'market_structure',
  },
  pe: {
    id: 'pe',
    term: 'Price-to-Earnings Ratio (P/E)',
    shortDefinition: 'How much investors are willing to pay for every ₹1 of company earnings.',
    detailedExplanation: 'The P/E ratio is calculated by dividing the current share price by the company\'s annual Earnings Per Share (EPS). It measures market expectations and whether a stock is relatively cheap or expensive compared to its peers.',
    simpleExample: 'If a stock trades at ₹500 and its annual profit per share is ₹25, the P/E ratio is 20 (₹500 / ₹25).',
    whyItMatters: 'A high P/E may indicate high expected future growth or an overvalued stock. A low P/E might signal an undervalued bargain or a company facing challenges.',
    category: 'valuation',
  },
  eps: {
    id: 'eps',
    term: 'Earnings Per Share (EPS)',
    shortDefinition: 'A company\'s net profit divided by the number of outstanding shares.',
    detailedExplanation: 'EPS represents the portion of a company\'s profit allocated to each individual share of common stock. It is a direct indicator of corporate profitability on a per-share basis.',
    simpleExample: 'If Infosys makes ₹25,000 crore in net profit and has 400 crore shares, its EPS is ₹62.50.',
    whyItMatters: 'Higher or consistently growing EPS signals healthy financial performance and provides the fundamental backbone for long-term stock price appreciation.',
    category: 'fundamentals',
  },
  dividend_yield: {
    id: 'dividend_yield',
    term: 'Dividend Yield',
    shortDefinition: 'The annual dividend payout expressed as a percentage of current share price.',
    detailedExplanation: 'Dividend yield indicates how much cash flow an investor receives annually for every rupee invested in the stock, irrespective of capital appreciation.',
    simpleExample: 'If a stock trades at ₹1,000 and pays an annual dividend of ₹30 per share, the dividend yield is 3% (₹30 / ₹1,000 * 100).',
    whyItMatters: 'Crucial for income-focused investors looking for steady cash returns alongside potential long-term growth.',
    category: 'fundamentals',
  },
  sector: {
    id: 'sector',
    term: 'Industry Sector',
    shortDefinition: 'The broad category of the economy in which a business operates.',
    detailedExplanation: 'Companies are classified into sectors (like Information Technology, Financials, Energy, Healthcare, Consumer Goods) depending on their primary business activities.',
    simpleExample: 'TCS and Infosys belong to Information Technology, while HDFC Bank and SBI belong to Financials.',
    whyItMatters: 'Stocks within the same sector often move together due to regulatory shifts, interest rate changes, or macroeconomic trends.',
    category: 'fundamentals',
  },
  price_change: {
    id: 'price_change',
    term: 'Price Change',
    shortDefinition: 'The absolute rupee difference between current price and previous closing price.',
    detailedExplanation: 'Calculated as: Current Price minus Previous Close. A positive number indicates a gain today; a negative number indicates a decline.',
    simpleExample: 'If a stock closed at ₹1,200 yesterday and is currently ₹1,230, the price change is +₹30.00.',
    whyItMatters: 'Shows the exact monetary movement of the asset in today\'s trading session.',
    category: 'price',
  },
  percentage_change: {
    id: 'percentage_change',
    term: 'Percentage Change (% Change)',
    shortDefinition: 'The relative price change expressed as a percentage of previous closing price.',
    detailedExplanation: 'Calculated as: (Price Change / Previous Close) * 100. This allows investors to compare performance across stocks regardless of their nominal share price.',
    simpleExample: 'A ₹30 rise on a ₹1,200 stock is a +2.5% change. A ₹30 rise on a ₹100 stock is a +30.0% change.',
    whyItMatters: 'Standardizes gains and losses so you can directly compare a ₹50 stock against a ₹5,000 stock.',
    category: 'price',
  },
  ohlc: {
    id: 'ohlc',
    term: 'OHLC (Open, High, Low, Close)',
    shortDefinition: 'The four crucial price points of a trading period.',
    detailedExplanation: 'Open is the first trade price; High is the highest price reached; Low is the lowest price touched; and Close is the final recorded price of the session. These form Japanese Candlesticks.',
    simpleExample: 'On Monday: Open ₹500, High ₹530, Low ₹495, Close ₹525.',
    whyItMatters: 'Provides a complete story of intraday buyer and seller battles rather than just a single closing number.',
    category: 'technical',
  },
  sma: {
    id: 'sma',
    term: 'Simple Moving Average (SMA)',
    shortDefinition: 'The average closing price calculated over a specific number of past periods.',
    detailedExplanation: 'SMA smooths out day-to-day price fluctuations by calculating the arithmetic mean of closing prices over a set timeframe (e.g. 20 days, 50 days, 200 days).',
    simpleExample: 'A 5-day SMA adds the closing prices of the last 5 days and divides by 5.',
    whyItMatters: 'When the current price is above the 50-day or 200-day SMA, the overall trend is considered upward. Crossing below signals downward pressure.',
    category: 'technical',
  },
  ema: {
    id: 'ema',
    term: 'Exponential Moving Average (EMA)',
    shortDefinition: 'A moving average that gives greater weight to recent price data.',
    detailedExplanation: 'Unlike SMA which treats all days equally, EMA reacts more quickly to recent price changes by assigning exponential weight to the newest price points.',
    simpleExample: 'A 20-day EMA will change direction faster than a 20-day SMA when a sudden price breakout occurs.',
    whyItMatters: 'Helps traders spot emerging trends and trend reversals earlier than traditional simple moving averages.',
    category: 'technical',
  },
  rsi: {
    id: 'rsi',
    term: 'Relative Strength Index (RSI)',
    shortDefinition: 'A momentum oscillator measuring the speed and change of price moves (0 to 100).',
    detailedExplanation: 'RSI evaluates whether a stock is overbought or oversold by comparing the magnitude of recent gains to recent losses over a standard 14-period window.',
    simpleExample: 'An RSI value above 70 typically indicates overbought conditions (potential pullback); below 30 suggests oversold conditions (potential rebound).',
    whyItMatters: 'Alerts investors when price moves have become overly extended in either direction.',
    category: 'technical',
  },
  macd: {
    id: 'macd',
    term: 'Moving Average Convergence Divergence (MACD)',
    shortDefinition: 'A trend-following momentum indicator showing the relationship between two EMAs.',
    detailedExplanation: 'MACD is calculated by subtracting the 26-period EMA from the 12-period EMA. A 9-period EMA of the MACD (the "Signal Line") is then plotted on top to trigger buy/sell momentum signals.',
    simpleExample: 'When the MACD line crosses above the Signal line, momentum is turning positive.',
    whyItMatters: 'Combines trend direction and momentum into a single visual tool.',
    category: 'technical',
  },
  bollinger_bands: {
    id: 'bollinger_bands',
    term: 'Bollinger Bands',
    shortDefinition: 'Volatility bands placed above and below a moving average.',
    detailedExplanation: 'Created by John Bollinger, these consist of a middle 20-day SMA and two outer bands calculated at standard deviation distances (usually 2 standard deviations). The bands widen during high volatility and contract during low volatility.',
    simpleExample: 'When price touches the upper band, the stock is statistically elevated; when it touches the lower band, it is statistically depressed.',
    whyItMatters: 'Identifies volatility squeezes and potential breakout points.',
    category: 'technical',
  },
  atr: {
    id: 'atr',
    term: 'Average True Range (ATR)',
    shortDefinition: 'A technical indicator measuring market volatility in rupee terms.',
    detailedExplanation: 'ATR calculates the average trading range over 14 periods, factoring in any price gaps between sessions. It does not indicate price direction, only the magnitude of volatility.',
    simpleExample: 'An ATR of ₹45 on a ₹1,000 stock means the price typically moves ₹45 per day on average.',
    whyItMatters: 'Essential for setting realistic stop-loss orders and sizing positions according to market volatility.',
    category: 'technical',
  },
  vwap: {
    id: 'vwap',
    term: 'Volume Weighted Average Price (VWAP)',
    shortDefinition: 'The average price of a stock weighted by the volume traded at each price level.',
    detailedExplanation: 'VWAP calculates the ratio of the total value traded to total volume traded throughout a single day. It provides a benchmark for institutional execution.',
    simpleExample: 'If a stock trades above its VWAP line, intraday buyers have maintained control.',
    whyItMatters: 'Institutions use VWAP to evaluate whether they executed orders at favorable prices relative to the rest of the market.',
    category: 'technical',
  },
  bid: {
    id: 'bid',
    term: 'Bid Price',
    shortDefinition: 'The highest price a buyer in the order book is willing to pay.',
    detailedExplanation: 'In an electronic limit order book, buyers post bids stating the maximum price they will accept. If you place a market sell order, your trade executes against the highest available bid.',
    simpleExample: 'If the highest buyer is offering ₹450.25, the Bid is ₹450.25.',
    whyItMatters: 'Shows what you can immediately sell your shares for right now.',
    category: 'market_structure',
  },
  ask: {
    id: 'ask',
    term: 'Ask / Offer Price',
    shortDefinition: 'The lowest price a seller in the order book is willing to accept.',
    detailedExplanation: 'Sellers post ask prices stating the minimum they will take for their shares. If you place a market buy order, your trade executes against the lowest available ask.',
    simpleExample: 'If the lowest seller is asking ₹450.50, the Ask is ₹450.50.',
    whyItMatters: 'Shows what you must pay to buy shares immediately.',
    category: 'market_structure',
  },
  spread: {
    id: 'spread',
    term: 'Bid-Ask Spread',
    shortDefinition: 'The difference between the lowest Ask price and the highest Bid price.',
    detailedExplanation: 'Calculated as: Ask Price minus Bid Price. A tight spread (e.g. ₹0.05) indicates high liquidity, while a wide spread indicates lower liquidity or high uncertainty.',
    simpleExample: 'If Bid is ₹450.25 and Ask is ₹450.35, the spread is ₹0.10.',
    whyItMatters: 'A tighter spread reduces friction costs for market participants.',
    category: 'market_structure',
  },
  beta: {
    id: 'beta',
    term: 'Beta',
    shortDefinition: 'A measure of a stock\'s volatility relative to the overall market (NIFTY 50).',
    detailedExplanation: 'A beta of 1.0 means the stock tends to move in tandem with the market index. A beta greater than 1.0 indicates higher volatility than the index; below 1.0 indicates lower volatility.',
    simpleExample: 'If a stock has a beta of 1.5 and the NIFTY rises 2%, the stock might be expected to rise ~3%.',
    whyItMatters: 'Helps risk-conscious investors choose stocks that align with their personal risk appetite.',
    category: 'valuation',
  },
  volatility: {
    id: 'volatility',
    term: 'Volatility',
    shortDefinition: 'The degree of variation of a trading price series over time.',
    detailedExplanation: 'Volatility quantifies how widely and rapidly prices swing up and down. Higher volatility implies higher short-term risk as well as higher potential reward.',
    simpleExample: 'A utility stock that moves 0.5% daily has low volatility. A tech stock that swings 5% daily has high volatility.',
    whyItMatters: 'Key metric for options pricing, risk management, and portfolio diversification.',
    category: 'price',
  },
  ipo: {
    id: 'ipo',
    term: 'Initial Public Offering (IPO)',
    shortDefinition: 'When a private company first sells shares to the public on a stock exchange.',
    detailedExplanation: 'An IPO transforms a privately held company into a publicly traded entity on exchanges like NSE or BSE, allowing it to raise capital from institutional and retail investors.',
    simpleExample: 'When Zomato or LIC first listed on NSE/BSE to let public retail investors buy shares.',
    whyItMatters: 'Allows early investors and founders to realize value and lets the public participate in a company\'s growth.',
    category: 'market_structure',
  },
  fifty_two_week_high: {
    id: 'fifty_two_week_high',
    term: '52-Week High',
    shortDefinition: 'The highest price at which a stock has traded over the past 52 weeks (1 year).',
    detailedExplanation: 'A popular technical milestone representing the upper price ceiling achieved in the last trading year.',
    simpleExample: 'If a stock reached ₹2,500 in March and hasn\'t exceeded that in 12 months, ₹2,500 is its 52-Week High.',
    whyItMatters: 'Crossing a 52-week high is often viewed by technicians as a strong bullish breakout signal.',
    category: 'price',
  },
  fifty_two_week_low: {
    id: 'fifty_two_week_low',
    term: '52-Week Low',
    shortDefinition: 'The lowest price at which a stock has traded over the past 52 weeks (1 year).',
    detailedExplanation: 'Represents the lowest point touched by the stock price during the preceding 365 days.',
    simpleExample: 'If a stock dipped to ₹1,400 in October, that marks its 52-Week Low.',
    whyItMatters: 'Provides a reference point for long-term price support or structural weakness.',
    category: 'price',
  },
};

/**
 * Look up a term by key (case-insensitive, tolerates spaces or underscores)
 */
export function getFinancialTerm(key: string): FinancialTermDefinition | undefined {
  if (!key) return undefined;
  const normalizedKey = key.toLowerCase().replace(/[\s-]+/g, '_');
  
  if (FINANCIAL_TERMS[normalizedKey]) {
    return FINANCIAL_TERMS[normalizedKey];
  }

  // Fallback search by term name or alias
  return Object.values(FINANCIAL_TERMS).find((item) => {
    return (
      item.id === normalizedKey ||
      item.term.toLowerCase().includes(normalizedKey) ||
      normalizedKey.includes(item.id)
    );
  });
}
