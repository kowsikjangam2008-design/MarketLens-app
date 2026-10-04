/**
 * MarketLens Tracked Universe (NIFTY 50 Constituents)
 * Used for batch quotes, market overview, screener, and calculated movers.
 * Note: Symbols use .NS for National Stock Exchange of India.
 */

export interface TrackedStock {
  symbol: string;
  name: string;
  sector: string;
  exchange: 'NSE' | 'BSE';
}

export const TRACKED_UNIVERSE: TrackedStock[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd', sector: 'Information Technology', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', sector: 'Telecommunication', exchange: 'NSE' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', sector: 'Information Technology', exchange: 'NSE' },
  { symbol: 'ITC.NS', name: 'ITC Ltd', sector: 'Consumer Staples', exchange: 'NSE' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'LICI.NS', name: 'Life Insurance Corp of India', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', sector: 'Consumer Staples', exchange: 'NSE' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd', sector: 'Industrials', exchange: 'NSE' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd', sector: 'Information Technology', exchange: 'NSE' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd', sector: 'Consumer Discretionary', exchange: 'NSE' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Healthcare', exchange: 'NSE' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd', sector: 'Metals & Mining', exchange: 'NSE' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', sector: 'Consumer Discretionary', exchange: 'NSE' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'NTPC.NS', name: 'NTPC Ltd', sector: 'Utilities', exchange: 'NSE' },
  { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp Ltd', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corp of India Ltd', sector: 'Utilities', exchange: 'NSE' },
  { symbol: 'TITAN.NS', name: 'Titan Company Ltd', sector: 'Consumer Discretionary', exchange: 'NSE' },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd', sector: 'Information Technology', exchange: 'NSE' },
  { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'COALINDIA.NS', name: 'Coal India Ltd', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'NESTLEIND.NS', name: 'Nestle India Ltd', sector: 'Consumer Staples', exchange: 'NSE' },
  { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'GRASIM.NS', name: 'Grasim Industries Ltd', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'TECHM.NS', name: 'Tech Mahindra Ltd', sector: 'Information Technology', exchange: 'NSE' },
  { symbol: 'M&M.NS', name: 'Mahindra & Mahindra Ltd', sector: 'Consumer Discretionary', exchange: 'NSE' },
  { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'CIPLA.NS', name: 'Cipla Ltd', sector: 'Healthcare', exchange: 'NSE' },
  { symbol: 'HINDALCO.NS', name: 'Hindalco Industries Ltd', sector: 'Materials', exchange: 'NSE' },
  { symbol: 'DRREDDY.NS', name: 'Dr. Reddy\'s Laboratories Ltd', sector: 'Healthcare', exchange: 'NSE' },
  { symbol: 'BRITANNIA.NS', name: 'Britannia Industries Ltd', sector: 'Consumer Staples', exchange: 'NSE' },
  { symbol: 'EICHERMOT.NS', name: 'Eicher Motors Ltd', sector: 'Consumer Discretionary', exchange: 'NSE' },
  { symbol: 'DIVISLAB.NS', name: 'Divi\'s Laboratories Ltd', sector: 'Healthcare', exchange: 'NSE' },
  { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise Ltd', sector: 'Healthcare', exchange: 'NSE' },
  { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd', sector: 'Consumer Discretionary', exchange: 'NSE' },
  { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products Ltd', sector: 'Consumer Staples', exchange: 'NSE' },
  { symbol: 'BPCL.NS', name: 'Bharat Petroleum Corp Ltd', sector: 'Energy', exchange: 'NSE' },
  { symbol: 'SHRIRAMFIN.NS', name: 'Shriram Finance Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance Co Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance Co Ltd', sector: 'Financials', exchange: 'NSE' },
  { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto Ltd', sector: 'Consumer Discretionary', exchange: 'NSE' },
  { symbol: 'BEL.NS', name: 'Bharat Electronics Ltd', sector: 'Industrials', exchange: 'NSE' },
];

export const TRACKED_SYMBOLS: string[] = TRACKED_UNIVERSE.map((s) => s.symbol);

export const DEFAULT_HOMEPAGE_SYMBOLS: string[] = [
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'INFY.NS',
  'ICICIBANK.NS',
  'BHARTIARTL.NS',
  'SBIN.NS',
  'ITC.NS',
];
