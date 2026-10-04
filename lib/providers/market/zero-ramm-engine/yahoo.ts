// Yahoo Finance upstream data access from 0xramm/Indian-Stock-Market-API v3.0

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

interface CrumbCache {
  crumb: string | null;
  cookie: string | null;
  expiresAt: number;
}

let crumbCache: CrumbCache = { crumb: null, cookie: null, expiresAt: 0 };

async function getCrumb(forceRefresh = false): Promise<{ crumb: string; cookie: string }> {
  if (!forceRefresh && crumbCache.crumb && crumbCache.cookie && Date.now() < crumbCache.expiresAt) {
    return { crumb: crumbCache.crumb, cookie: crumbCache.cookie };
  }

  try {
    const cookieRes = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(6000),
    });
    const setCookie = cookieRes.headers.get('set-cookie') || '';
    const cookie = setCookie.split(';')[0] || '';

    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, Cookie: cookie },
      signal: AbortSignal.timeout(6000),
    });

    if (!crumbRes.ok) {
      throw new Error(`Failed to fetch Yahoo crumb: ${crumbRes.status}`);
    }

    const crumb = (await crumbRes.text()).trim();
    crumbCache = { crumb, cookie, expiresAt: Date.now() + 50 * 60 * 1000 };
    return { crumb, cookie };
  } catch (err) {
    crumbCache = { crumb: null, cookie: null, expiresAt: 0 };
    throw err;
  }
}

async function yahooFetchAuthed(buildUrl: (crumb: string) => string): Promise<Response> {
  let { crumb, cookie } = await getCrumb();
  let res = await fetch(buildUrl(crumb), {
    headers: { 'User-Agent': UA, Cookie: cookie },
    signal: AbortSignal.timeout(8000),
  });

  if (res.status === 401) {
    ({ crumb, cookie } = await getCrumb(true));
    res = await fetch(buildUrl(crumb), {
      headers: { 'User-Agent': UA, Cookie: cookie },
      signal: AbortSignal.timeout(8000),
    });
  }

  return res;
}

interface RawField {
  raw?: unknown;
}

const raw = (field: unknown): number | null => {
  if (field && typeof field === 'object' && 'raw' in field) {
    const r = (field as RawField).raw;
    return typeof r === 'number' && Number.isFinite(r) ? r : null;
  }
  return typeof field === 'number' && Number.isFinite(field) ? field : null;
};

export interface StockDetailResult {
  companyName: string;
  currency: string;
  lastPrice: number | null;
  change: number | null;
  percentChange: number | null;
  previousClose: number | null;
  open: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  volume: number | null;
  marketCap: number | null;
  peRatio: number | null;
  dividendYield: number | null;
  bookValue: number | null;
  eps: number | null;
  sector: string;
  industry: string;
  lastUpdateEpoch: number | null;
}

export interface QuoteBatchItem {
  companyName: string;
  lastPrice: number | null;
  change: number | null;
  percentChange: number | null;
  volume: number | null;
  marketCap: number | null;
  peRatio: number | null;
}

export interface SearchItem {
  symbol: string;
  company_name: string;
  sector?: string;
  industry?: string;
  source: string;
  listing_date?: string;
}

// NSE autocomplete (best effort, non-fatal if Akamai blocks)
export async function tryNseAutocomplete(query: string): Promise<SearchItem[]> {
  try {
    const headers = {
      'User-Agent': UA,
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.nseindia.com/',
      'X-Requested-With': 'XMLHttpRequest',
    };
    const homeRes = await fetch('https://www.nseindia.com', { headers, signal: AbortSignal.timeout(3000) });
    const cookie = (homeRes.headers.get('set-cookie') || '').split(';')[0];
    await new Promise((resolve) => setTimeout(resolve, 500));

    const reqHeaders: Record<string, string> = { ...headers };
    if (cookie) {
      reqHeaders.Cookie = cookie;
    }

    const res = await fetch(`https://www.nseindia.com/api/search/autocomplete?q=${encodeURIComponent(query)}`, {
      headers: reqHeaders,
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    interface NseSymbolItem {
      result_sub_type?: string;
      symbol: string;
      symbol_info: string;
      listing_date?: string;
    }
    return (data.symbols || [])
      .filter((item: NseSymbolItem) => item.result_sub_type === 'equity')
      .map((item: NseSymbolItem) => ({
        symbol: item.symbol,
        company_name: item.symbol_info,
        listing_date: item.listing_date,
        source: 'nse_api',
      }));
  } catch {
    return [];
  }
}

// Direct ticker lookup fallback
export async function searchYahooDirect(query: string): Promise<SearchItem[]> {
  const symbol = query.toUpperCase().replace(/\s+/g, '');
  if (!symbol) return [];
  const detail = await getStockDetail(`${symbol}.NS`);
  if (!detail) return [];
  return [
    {
      symbol,
      company_name: detail.companyName,
      sector: detail.sector,
      industry: detail.industry,
      source: 'yahoo_direct',
    },
  ];
}

// Yahoo search
export async function searchYahoo(query: string): Promise<SearchItem[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=15`;
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const data = await res.json();
    interface YahooQuote {
      symbol?: string;
      longname?: string;
      shortname?: string;
      sector?: string;
      industry?: string;
    }
    return ((data.quotes as YahooQuote[]) || [])
      .filter((q) => q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO')))
      .map((q) => ({
        symbol: (q.symbol || '').replace(/\.(NS|BO)$/, ''),
        company_name: q.longname || q.shortname || q.symbol || '',
        sector: q.sector || 'N/A',
        industry: q.industry || 'N/A',
        source: 'yahoo',
      }));
  } catch {
    return [];
  }
}

// Full detail for one ticker: price + fundamentals + sector/industry in a single call
export async function getStockDetail(tickerSymbol: string): Promise<StockDetailResult | null> {
  try {
    const modules = 'price,summaryDetail,defaultKeyStatistics,assetProfile';
    const res = await yahooFetchAuthed(
      (crumb) =>
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(tickerSymbol)}?modules=${modules}&crumb=${encodeURIComponent(crumb)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.quoteSummary?.result?.[0];
    if (!result) return null;

    const { price = {}, summaryDetail = {}, defaultKeyStatistics = {}, assetProfile = {} } = result;
    if (raw(price.regularMarketPrice) === null) return null;

    return {
      companyName: price.longName || price.shortName || tickerSymbol,
      currency: price.currency || 'INR',
      lastPrice: raw(price.regularMarketPrice),
      change: raw(price.regularMarketChange),
      percentChange: raw(price.regularMarketChangePercent) !== null ? (raw(price.regularMarketChangePercent) as number) * 100 : null,
      previousClose: raw(price.regularMarketPreviousClose),
      open: raw(price.regularMarketOpen) ?? raw(summaryDetail.open),
      dayHigh: raw(price.regularMarketDayHigh),
      dayLow: raw(price.regularMarketDayLow),
      yearHigh: raw(summaryDetail.fiftyTwoWeekHigh),
      yearLow: raw(summaryDetail.fiftyTwoWeekLow),
      volume: raw(price.regularMarketVolume),
      marketCap: raw(price.marketCap) ?? raw(summaryDetail.marketCap),
      peRatio: raw(summaryDetail.trailingPE),
      dividendYield: raw(summaryDetail.dividendYield) !== null ? (raw(summaryDetail.dividendYield) as number) * 100 : null,
      bookValue: raw(defaultKeyStatistics.bookValue),
      eps: raw(defaultKeyStatistics.trailingEps),
      sector: assetProfile.sector || 'N/A',
      industry: assetProfile.industry || 'N/A',
      lastUpdateEpoch: raw(price.regularMarketTime),
    };
  } catch (err) {
    console.error(`[0xramm-engine] Failed to getStockDetail for ${tickerSymbol}:`, err);
    return null;
  }
}

// Batch quote for /stock/list
export async function getQuoteBatch(tickerSymbols: string[]): Promise<Record<string, QuoteBatchItem>> {
  if (tickerSymbols.length === 0) return {};
  try {
    const res = await yahooFetchAuthed(
      (crumb) =>
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(tickerSymbols.join(','))}&crumb=${encodeURIComponent(crumb)}`
    );
    if (!res.ok) return {};
    const data = await res.json();
    const byTicker: Record<string, QuoteBatchItem> = {};
    interface YahooQuoteResponseItem {
      symbol: string;
      longName?: string;
      shortName?: string;
      regularMarketPrice?: number;
      regularMarketChange?: number;
      regularMarketChangePercent?: number;
      regularMarketVolume?: number;
      marketCap?: number;
      trailingPE?: number;
    }
    for (const q of (data?.quoteResponse?.result || []) as YahooQuoteResponseItem[]) {
      byTicker[q.symbol] = {
        companyName: q.longName || q.shortName || q.symbol,
        lastPrice: q.regularMarketPrice ?? null,
        change: q.regularMarketChange ?? null,
        percentChange: q.regularMarketChangePercent ?? null,
        volume: q.regularMarketVolume ?? null,
        marketCap: q.marketCap ?? null,
        peRatio: q.trailingPE ?? null,
      };
    }
    return byTicker;
  } catch (err) {
    console.error('[0xramm-engine] Failed to getQuoteBatch:', err);
    return {};
  }
}
