import { StockQuote, HistoricalCandle } from '@/types/market';
import { SignalResult, SignalFactor, OverallSignalType } from '@/types/signals';
import { calculateRSI } from '@/lib/technical-analysis/rsi';
import { calculateSMA } from '@/lib/technical-analysis/sma';

/**
 * Analyzes market factors strictly based on available, validated data.
 * When data is missing, factors and signals remain UNAVAILABLE.
 * Never defaults missing data to zero or claims certainty.
 */
export function analyzeStockSignals(
  quote: StockQuote,
  candles?: HistoricalCandle[] | null
): SignalResult {
  const factors: SignalFactor[] = [];
  const dataLimitations: string[] = [];

  const hasCandles = Array.isArray(candles) && candles.length >= 20;

  // 1. Trend Factor (Requires historical candles)
  if (hasCandles) {
    const sma20 = calculateSMA(candles, 20);
    if (sma20 && sma20.latest !== null && quote.price !== null) {
      const isAbove = quote.price > sma20.latest;
      factors.push({
        id: 'trend',
        name: 'Price Trend',
        status: 'AVAILABLE',
        score: isAbove ? 70 : 30,
        assessment: isAbove ? 'POSITIVE' : 'NEGATIVE',
        explanation: `Current price (₹${quote.price}) is ${isAbove ? 'above' : 'below'} the 20-period SMA (₹${sma20.latest}).`,
        metricsUsed: ['Price', 'SMA(20)'],
      });
    } else {
      factors.push({
        id: 'trend',
        name: 'Price Trend',
        status: 'UNAVAILABLE',
        score: null,
        assessment: 'UNAVAILABLE',
        explanation: 'Insufficient data points to compute trend moving average.',
        metricsUsed: [],
      });
      dataLimitations.push('Trend calculation lacked sufficient candles.');
    }
  } else {
    factors.push({
      id: 'trend',
      name: 'Price Trend',
      status: 'UNAVAILABLE',
      score: null,
      assessment: 'UNAVAILABLE',
      explanation: 'Historical candlestick data is unavailable from the current provider.',
      metricsUsed: [],
    });
    dataLimitations.push('Historical OHLC data is not provided by the current market API.');
  }

  // 2. Momentum Factor (Requires historical candles)
  if (hasCandles) {
    const rsi14 = calculateRSI(candles, 14);
    if (rsi14 && rsi14.latest !== null) {
      let assessment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
      let score = 50;
      let exp = `RSI(14) is balanced at ${rsi14.latest}.`;

      if (rsi14.latest > 70) {
        assessment = 'NEGATIVE'; // Overbought
        score = 25;
        exp = `RSI(14) is overbought at ${rsi14.latest}.`;
      } else if (rsi14.latest < 30) {
        assessment = 'POSITIVE'; // Oversold rebound opportunity
        score = 75;
        exp = `RSI(14) is oversold at ${rsi14.latest}.`;
      } else if (rsi14.latest >= 50) {
        assessment = 'POSITIVE';
        score = 65;
        exp = `RSI(14) shows positive momentum at ${rsi14.latest}.`;
      }

      factors.push({
        id: 'momentum',
        name: 'Momentum',
        status: 'AVAILABLE',
        score,
        assessment,
        explanation: exp,
        metricsUsed: ['RSI(14)'],
      });
    } else {
      factors.push({
        id: 'momentum',
        name: 'Momentum',
        status: 'UNAVAILABLE',
        score: null,
        assessment: 'UNAVAILABLE',
        explanation: 'Insufficient data points to compute RSI momentum.',
        metricsUsed: [],
      });
    }
  } else {
    factors.push({
      id: 'momentum',
      name: 'Momentum',
      status: 'UNAVAILABLE',
      score: null,
      assessment: 'UNAVAILABLE',
      explanation: 'Historical candlestick data is unavailable from the current provider.',
      metricsUsed: [],
    });
  }

  // 3. Volume Factor (Can use quote volume if available, or candles)
  if (quote.volume !== null && quote.volume > 0) {
    factors.push({
      id: 'volume',
      name: 'Trading Activity',
      status: 'AVAILABLE',
      score: 55,
      assessment: 'NEUTRAL',
      explanation: `Reported trading volume: ${quote.volume.toLocaleString('en-IN')} shares. Relative baseline comparison unavailable without historical volume average.`,
      metricsUsed: ['Volume'],
    });
  } else {
    factors.push({
      id: 'volume',
      name: 'Trading Activity',
      status: 'UNAVAILABLE',
      score: null,
      assessment: 'UNAVAILABLE',
      explanation: 'Volume data is not available for this symbol.',
      metricsUsed: [],
    });
    dataLimitations.push('Session volume missing from provider response.');
  }

  // 4. Valuation Factor (P/E and Dividend Yield from quote)
  if (quote.pe !== null && quote.pe > 0) {
    let assessment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
    let score = 50;
    let exp = `Trailing P/E is ${quote.pe}.`;

    if (quote.pe < 18) {
      assessment = 'POSITIVE';
      score = 75;
      exp = `P/E ratio of ${quote.pe} suggests moderate to attractive valuation relative to broader market.`;
    } else if (quote.pe > 45) {
      assessment = 'NEGATIVE';
      score = 30;
      exp = `P/E ratio of ${quote.pe} reflects premium growth pricing or high valuation multiple.`;
    }

    factors.push({
      id: 'valuation',
      name: 'Valuation (P/E)',
      status: 'AVAILABLE',
      score,
      assessment,
      explanation: exp,
      metricsUsed: ['P/E Ratio', ...(quote.dividendYield !== null ? ['Dividend Yield'] : [])],
    });
  } else {
    factors.push({
      id: 'valuation',
      name: 'Valuation (P/E)',
      status: 'UNAVAILABLE',
      score: null,
      assessment: 'UNAVAILABLE',
      explanation: 'P/E ratio is not available from the current provider for this stock.',
      metricsUsed: [],
    });
    dataLimitations.push('Valuation metrics (P/E) unavailable.');
  }

  // 5. Fundamentals Factor (EPS and Market Cap)
  if (quote.eps !== null || quote.marketCap !== null) {
    const parts: string[] = [];
    if (quote.eps !== null) parts.push(`EPS: ₹${quote.eps}`);
    if (quote.marketCap !== null) {
      const inCr = (quote.marketCap / 10000000).toFixed(2);
      parts.push(`Market Cap: ₹${Number(inCr).toLocaleString('en-IN')} Cr`);
    }

    factors.push({
      id: 'fundamentals',
      name: 'Fundamental Snapshot',
      status: 'AVAILABLE',
      score: 55,
      assessment: quote.eps !== null && quote.eps > 0 ? 'POSITIVE' : 'NEUTRAL',
      explanation: parts.join(' | '),
      metricsUsed: ['EPS', 'Market Cap'],
    });
  } else {
    factors.push({
      id: 'fundamentals',
      name: 'Fundamental Snapshot',
      status: 'UNAVAILABLE',
      score: null,
      assessment: 'UNAVAILABLE',
      explanation: 'EPS and detailed financial statements are not supplied by the current provider.',
      metricsUsed: [],
    });
    dataLimitations.push('Fundamental metrics (EPS/Balance Sheet) unavailable.');
  }

  // Calculate Overall Signal
  const availableFactors = factors.filter((f) => f.status === 'AVAILABLE' && f.score !== null);
  const confidenceScore = Math.round((availableFactors.length / factors.length) * 100);

  let overallSignal: OverallSignalType = 'UNAVAILABLE';
  let signalLabel = 'Data Insufficient';
  let whyThisSignal = 'Key technical and historical data points are not provided by the current market-data provider. Meaningful signal derivation requires historical OHLC series.';

  if (availableFactors.length >= 3) {
    const avgScore = availableFactors.reduce((acc, f) => acc + (f.score ?? 50), 0) / availableFactors.length;
    if (avgScore >= 60) {
      overallSignal = 'INFORMATIONAL_POSITIVE';
      signalLabel = 'Informational: Positive Bias';
      whyThisSignal = 'Available valuation and market metrics lean constructive based on reported provider data.';
    } else if (avgScore <= 40) {
      overallSignal = 'INFORMATIONAL_CAUTIOUS';
      signalLabel = 'Informational: Cautious Bias';
      whyThisSignal = 'Available valuation metrics show premium multiples or elevated pricing relative to fundamentals.';
    } else {
      overallSignal = 'INFORMATIONAL_NEUTRAL';
      signalLabel = 'Informational: Balanced / Neutral';
      whyThisSignal = 'Available market data presents a balanced profile across reported indicators.';
    }
  }

  return {
    overallSignal,
    signalLabel,
    disclaimer: 'Informational market signal only. Not personalized investment advice.',
    confidenceScore,
    factors,
    whyThisSignal,
    dataLimitations,
    calculatedAt: new Date().toISOString(),
  };
}
