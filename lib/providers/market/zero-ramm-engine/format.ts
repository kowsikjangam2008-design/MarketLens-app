// Pure formatting/lookup helpers from 0xramm/Indian-Stock-Market-API v3.0

export const NSE_SYMBOLS_CACHE: Record<string, string> = {
  'indian oil': 'IOC', ioc: 'IOC',
  reliance: 'RELIANCE', 'reliance industries': 'RELIANCE',
  tcs: 'TCS', 'tata consultancy': 'TCS',
  infosys: 'INFY', infy: 'INFY',
  'hdfc bank': 'HDFCBANK', hdfc: 'HDFCBANK',
  'icici bank': 'ICICIBANK', icici: 'ICICIBANK',
  itc: 'ITC',
  'bharti airtel': 'BHARTIARTL', airtel: 'BHARTIARTL',
  sbi: 'SBIN', 'state bank': 'SBIN',
  wipro: 'WIPRO',
  'hindustan unilever': 'HINDUNILVR', hul: 'HINDUNILVR',
  maruti: 'MARUTI', 'maruti suzuki': 'MARUTI',
  'asian paints': 'ASIANPAINT',
  'bajaj finance': 'BAJFINANCE',
  titan: 'TITAN',
  'larsen toubro': 'LT', lt: 'LT',
  ongc: 'ONGC',
  ntpc: 'NTPC',
  'power grid': 'POWERGRID',
  'coal india': 'COALINDIA',
  adani: 'ADANIENT', 'adani enterprises': 'ADANIENT',
  'sun pharma': 'SUNPHARMA',
  'dr reddy': 'DRREDDY',
  cipla: 'CIPLA',
  mahindra: 'M&M', 'm&m': 'M&M',
};

export function determineExchange(symbolInput: string): [string, string] {
  const symbol = symbolInput.toUpperCase().trim();
  if (symbol.endsWith('.NS')) return [symbol.slice(0, -3), '.NS'];
  if (symbol.endsWith('.BO')) return [symbol.slice(0, -3), '.BO'];
  return [symbol, '.NS'];
}

const isEmpty = (v: unknown): boolean => v === null || v === undefined || v === 'N/A';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(value: unknown, withUnit = true): number | string | { value: number | string; unit: string } {
  if (isEmpty(value)) return withUnit ? { value: 'N/A', unit: 'INR' } : 'N/A';
  const v = Number(value);
  if (Number.isNaN(v)) return withUnit ? { value: 'N/A', unit: 'INR' } : 'N/A';
  return withUnit ? { value: round2(v), unit: 'INR' } : round2(v);
}

export function formatMarketCap(value: unknown, withUnit = true): number | string | { value: number | string; unit: string } {
  if (isEmpty(value)) return withUnit ? { value: 'N/A', unit: 'INR' } : 'N/A';
  const v = Number(value);
  if (Number.isNaN(v)) return withUnit ? { value: 'N/A', unit: 'INR' } : 'N/A';
  if (!withUnit) return round2(v);
  if (v >= 1e7) return { value: round2(v / 1e7), unit: 'Crores INR' };
  if (v >= 1e5) return { value: round2(v / 1e5), unit: 'Lakhs INR' };
  return { value: round2(v), unit: 'INR' };
}

export function formatVolume(value: unknown, withUnit = true): number | string | { value: number | string; unit: string } {
  if (isEmpty(value)) return withUnit ? { value: 'N/A', unit: 'Shares' } : 'N/A';
  const v = Math.trunc(Number(value));
  if (Number.isNaN(v)) return withUnit ? { value: 'N/A', unit: 'Shares' } : 'N/A';
  if (!withUnit) return v;
  if (v >= 1e7) return { value: round2(v / 1e7), unit: 'Crores Shares' };
  if (v >= 1e5) return { value: round2(v / 1e5), unit: 'Lakhs Shares' };
  return { value: v, unit: 'Shares' };
}

export function formatPercentage(value: unknown, withUnit = true): number | string | { value: number | string; unit: string } {
  if (isEmpty(value)) return withUnit ? { value: 'N/A', unit: '%' } : 'N/A';
  const v = round2(Number(value));
  if (Number.isNaN(v)) return withUnit ? { value: 'N/A', unit: '%' } : 'N/A';
  return withUnit ? { value: v, unit: '%' } : v;
}

export function formatRatio(value: unknown, withUnit = true): number | string | { value: number | string; unit: string } {
  if (isEmpty(value) || value === 0) return withUnit ? { value: 'N/A', unit: 'x' } : 'N/A';
  const v = round2(Number(value));
  if (Number.isNaN(v)) return withUnit ? { value: 'N/A', unit: 'x' } : 'N/A';
  return withUnit ? { value: v, unit: 'x' } : v;
}

export interface CachedSearchResult {
  symbol: string;
  company_name: string;
  match_type: 'exact' | 'partial';
  source: 'cache';
}

export function searchInCache(query: string): CachedSearchResult[] {
  const queryLower = query.toLowerCase().trim();
  const results: CachedSearchResult[] = [];
  const exact = NSE_SYMBOLS_CACHE[queryLower];
  if (exact) {
    results.push({
      symbol: exact,
      company_name: query,
      match_type: 'exact',
      source: 'cache',
    });
    return results;
  }
  for (const [key, symbol] of Object.entries(NSE_SYMBOLS_CACHE)) {
    if (queryLower.includes(key) || key.includes(queryLower)) {
      results.push({
        symbol,
        company_name: key.replace(/\b\w/g, (c) => c.toUpperCase()),
        match_type: 'partial',
        source: 'cache',
      });
    }
  }
  return results;
}
