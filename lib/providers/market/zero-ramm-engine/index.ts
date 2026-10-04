// 0xramm Indian Stock Market API v3.0 core router and endpoint handlers
// Exactly implements the endpoints documented in https://github.com/0xramm/Indian-Stock-Market-API

import {
  NSE_SYMBOLS_CACHE,
  determineExchange,
  formatCurrency,
  formatMarketCap,
  formatVolume,
  formatPercentage,
  formatRatio,
  searchInCache,
} from './format';
import {
  searchYahoo,
  searchYahooDirect,
  tryNseAutocomplete,
  getStockDetail,
  getQuoteBatch,
} from './yahoo';

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  hint?: string;
  note?: string;
  examples?: string[];
  [key: string]: unknown;
  data?: T;
}

const timestamp = (): string => new Date().toISOString().replace('T', ' ').slice(0, 19);

function parseResFormat(params: URLSearchParams): 'num' | 'val' | null {
  const res = (params.get('res') || 'val').toLowerCase();
  if (res !== 'num' && res !== 'val') return null;
  return res;
}

export async function handleSearch(params: URLSearchParams): Promise<ApiResponse> {
  const query = (params.get('q') || '').trim();
  if (!query) {
    return {
      status: 'error',
      message: 'Please provide a search query using ?q=SEARCH_TERM',
      examples: ['/search?q=indian oil', '/search?q=reliance'],
    };
  }

  const cacheResults = searchInCache(query);
  const [nseResults, yahooResults, yahooDirectResults] = await Promise.all([
    tryNseAutocomplete(query),
    searchYahoo(query),
    searchYahooDirect(query),
  ]);

  const seen = new Set<string>();
  interface CombinedResult {
    symbol: string;
    company_name: string;
    sector?: string;
    industry?: string;
    source: string;
    listing_date?: string;
    match_type?: string;
    nse_url?: string;
    bse_url?: string;
  }
  const results: CombinedResult[] = [];

  for (const r of [...nseResults, ...cacheResults, ...yahooResults, ...yahooDirectResults]) {
    if (r.symbol && !seen.has(r.symbol)) {
      seen.add(r.symbol);
      results.push({
        ...r,
        nse_url: `/stock?symbol=${r.symbol}.NS`,
        bse_url: `/stock?symbol=${r.symbol}.BO`,
      });
    }
  }

  return {
    status: 'success',
    query,
    total_results: results.length,
    results,
    note: 'Add .NS for NSE or .BO for BSE to the symbol. Default is NSE.',
    timestamp: timestamp(),
  };
}

export async function handleStock(params: URLSearchParams): Promise<ApiResponse> {
  const symbolInput = (params.get('symbol') || '').toUpperCase().trim();
  if (!symbolInput) {
    return {
      status: 'error',
      message: 'Please provide a stock symbol using ?symbol=STOCKNAME',
      hint: 'Use /search?q=company_name to find the correct symbol',
      examples: ['/stock?symbol=ITC (NSE - default)', '/stock?symbol=ITC.NS (NSE - explicit)', '/stock?symbol=ITC.BO (BSE)'],
    };
  }

  const resFormat = parseResFormat(params);
  if (resFormat === null) {
    return {
      status: 'error',
      message: 'Invalid response type. Use res=num for numbers only or res=val for values with units',
      examples: ['/stock?symbol=ITC&res=num', '/stock?symbol=ITC&res=val'],
    };
  }
  const withUnits = resFormat === 'val';

  const [cleanSymbol, exchangeSuffix] = determineExchange(symbolInput);
  const tickerSymbol = `${cleanSymbol}${exchangeSuffix}`;
  const exchangeName = exchangeSuffix === '.NS' ? 'NSE' : 'BSE';

  const detail = await getStockDetail(tickerSymbol);
  if (!detail) {
    return {
      status: 'error',
      message: `No data found for symbol: ${cleanSymbol} on ${exchangeName}. Stock may not exist or market is closed.`,
      hint: exchangeName === 'NSE' ? `Try the other exchange: ${cleanSymbol}.BO` : `Try the other exchange: ${cleanSymbol}.NS`,
      note: 'Markets are closed on weekends and holidays',
    };
  }

  return {
    status: 'success',
    symbol: cleanSymbol,
    exchange: exchangeName,
    ticker: tickerSymbol,
    response_format: withUnits ? 'values_with_units' : 'numeric_only',
    data: {
      company_name: detail.companyName,
      last_price: formatCurrency(detail.lastPrice, withUnits),
      change: formatCurrency(detail.change, withUnits),
      percent_change: formatPercentage(detail.percentChange, withUnits),
      previous_close: formatCurrency(detail.previousClose, withUnits),
      open: formatCurrency(detail.open, withUnits),
      day_high: formatCurrency(detail.dayHigh, withUnits),
      day_low: formatCurrency(detail.dayLow, withUnits),
      year_high: formatCurrency(detail.yearHigh, withUnits),
      year_low: formatCurrency(detail.yearLow, withUnits),
      volume: formatVolume(detail.volume, withUnits),
      market_cap: formatMarketCap(detail.marketCap, withUnits),
      pe_ratio: formatRatio(detail.peRatio, withUnits),
      dividend_yield: formatPercentage(detail.dividendYield, withUnits),
      book_value: formatCurrency(detail.bookValue, withUnits),
      earnings_per_share: formatCurrency(detail.eps, withUnits),
      sector: detail.sector,
      industry: detail.industry,
      currency: detail.currency,
      last_update: detail.lastUpdateEpoch ? new Date(detail.lastUpdateEpoch * 1000).toISOString().slice(0, 10) : 'N/A',
      timestamp: timestamp(),
    },
    alternate_exchange: {
      exchange: exchangeName === 'NSE' ? 'BSE' : 'NSE',
      ticker: exchangeName === 'NSE' ? `${cleanSymbol}.BO` : `${cleanSymbol}.NS`,
      api_url: exchangeName === 'NSE' ? `/stock?symbol=${cleanSymbol}.BO` : `/stock?symbol=${cleanSymbol}.NS`,
    },
  };
}

export async function handleStockList(params: URLSearchParams): Promise<ApiResponse> {
  const symbolsParam = params.get('symbols') || '';
  if (!symbolsParam.trim()) {
    return {
      status: 'error',
      message: 'Please provide stock symbols using ?symbols=STOCK1,STOCK2',
      examples: ['/stock/list?symbols=ITC,TCS,INFY (default NSE)', '/stock/list?symbols=ITC.NS,TCS.BO,INFY (mixed exchanges)'],
    };
  }

  const resFormat = parseResFormat(params);
  if (resFormat === null) {
    return {
      status: 'error',
      message: 'Invalid response type. Use res=num for numbers only or res=val for values with units',
    };
  }
  const withUnits = resFormat === 'val';

  const rawList = symbolsParam.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  const parsed = rawList.map((s) => {
    const [cleanSymbol, exchangeSuffix] = determineExchange(s);
    return {
      cleanSymbol,
      exchangeName: exchangeSuffix === '.NS' ? 'NSE' : 'BSE',
      tickerSymbol: `${cleanSymbol}${exchangeSuffix}`,
    };
  });

  const quotes = await getQuoteBatch(parsed.map((p) => p.tickerSymbol));

  const results = parsed.map(({ cleanSymbol, exchangeName, tickerSymbol }) => {
    const q = quotes[tickerSymbol];
    if (!q) {
      return { symbol: cleanSymbol, exchange: exchangeName, ticker: tickerSymbol, error: 'No data available' };
    }
    return {
      symbol: cleanSymbol,
      exchange: exchangeName,
      ticker: tickerSymbol,
      company_name: q.companyName,
      last_price: formatCurrency(q.lastPrice, withUnits),
      change: formatCurrency(q.change, withUnits),
      percent_change: formatPercentage(q.percentChange, withUnits),
      volume: formatVolume(q.volume, withUnits),
      market_cap: formatMarketCap(q.marketCap, withUnits),
      pe_ratio: formatRatio(q.peRatio, withUnits),
    };
  });

  return {
    status: 'success',
    response_format: withUnits ? 'values_with_units' : 'numeric_only',
    count: results.length,
    stocks: results,
    timestamp: timestamp(),
  };
}

export function handleSymbols(): ApiResponse {
  const symbolsList = Object.entries(NSE_SYMBOLS_CACHE).map(([company, symbol]) => ({
    search_term: company,
    symbol,
    nse_ticker: `${symbol}.NS`,
    bse_ticker: `${symbol}.BO`,
    api_url_nse: `/stock?symbol=${symbol}.NS`,
    api_url_bse: `/stock?symbol=${symbol}.BO`,
  }));

  return {
    status: 'success',
    total_symbols: symbolsList.length,
    symbols: symbolsList,
    note: 'Most stocks are available on both NSE (.NS) and BSE (.BO). Default is NSE.',
  };
}

export function handleHome(): ApiResponse {
  return {
    status: 'success',
    message: 'NSE/BSE Stock Price API with Smart Search & Flexible Output',
    version: '3.0',
    features: [
      'Support for both NSE and BSE exchanges',
      'Automatic exchange detection from symbol suffix',
      'Multi-source search (Local Cache + Yahoo Finance)',
      'Real-time stock prices via Yahoo Finance',
      '30+ pre-cached popular stock symbols',
      'Flexible output: Simple numbers OR Values with units',
      'Smart number formatting for readability',
    ],
    exchanges: {
      NSE: { description: 'National Stock Exchange', suffix: '.NS', example: 'ITC.NS, RELIANCE.NS', default: true },
      BSE: { description: 'Bombay Stock Exchange', suffix: '.BO', example: 'ITC.BO, RELIANCE.BO', default: false },
    },
    endpoints: {
      '/search': { description: 'Search for stocks by company name', method: 'GET', parameters: 'q=SEARCH_TERM' },
      '/stock': { description: 'Get single stock details', method: 'GET', parameters: 'symbol=STOCK_SYMBOL, res=num|val (optional)' },
      '/stock/list': { description: 'Get multiple stock details (batched, no sector field)', method: 'GET', parameters: 'symbols=STOCK1,STOCK2, res=num|val (optional)' },
      '/symbols': { description: 'List all available cached symbols', method: 'GET' },
    },
  };
}

/**
 * Route an internal 0xramm request string (e.g. "/stock?symbol=RELIANCE.NS&res=num")
 */
export async function execute0xrammRoute(pathWithQuery: string): Promise<ApiResponse> {
  const [pathname, queryString] = pathWithQuery.split('?');
  const params = new URLSearchParams(queryString || '');

  switch (pathname) {
    case '':
    case '/':
      return handleHome();
    case '/search':
      return await handleSearch(params);
    case '/stock':
      return await handleStock(params);
    case '/stock/list':
      return await handleStockList(params);
    case '/symbols':
      return handleSymbols();
    default:
      return { status: 'error', message: `Unknown endpoint: ${pathname}` };
  }
}
