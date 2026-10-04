# MarketLens Data Sources & Limitations

## Primary Market Data Provider: 0xramm Indian Stock Market API

- **Repository:** [https://github.com/0xramm/Indian-Stock-Market-API](https://github.com/0xramm/Indian-Stock-Market-API)
- **Deployment Platform:** Self-hosted (typically Vercel / Railway)
- **Upstream Data Source:** Yahoo Finance (`yfinance` / Yahoo Finance public endpoints)
- **Authentication:** None required.
- **Symbol Formats:**
  - National Stock Exchange (NSE): `SYMBOL.NS` (e.g., `RELIANCE.NS`, `TCS.NS`)
  - Bombay Stock Exchange (BSE): `SYMBOL.BO` (e.g., `RELIANCE.BO`, `TCS.BO`)

---

## Documented & Implemented Endpoints

MarketLens communicates strictly with the documented endpoints of the 0xramm API:

| Endpoint | Method | Supported by 0xramm | Implemented in MarketLens | Notes |
|---|---|---|---|---|
| `/` | GET | Yes | Yes (Health check) | Basic service status |
| `/search?q={query}` | GET | Yes | Yes | Search by company name or ticker symbol |
| `/stock?symbol={SYMBOL}&res={num\|val}` | GET | Yes | Yes (`res=num`) | Fetches live quote data (price, change, volume, P/E, EPS, market cap, etc.) |
| `/stock/list?symbols={S1,S2}&res={num\|val}` | GET | Yes | Yes (`res=num`) | Batch quotes for watchlist, overview, and screener |
| `/symbols` | GET | Yes | Yes | Supported symbol universe |
| `/history` or `/candles` | GET | **NO** | **NO** (Stubbed with honest unavailable state) | **Unsupported by 0xramm** |
| `/ipo` | GET | **NO** | **NO** (Stubbed with honest unavailable state) | **Unsupported by 0xramm** |

---

## Zero-Fabrication Policy

1. **No Fake Historical Candles:** Because 0xramm does not provide an OHLC candlestick endpoint, MarketLens does **not** synthesize, extrapolate, or fabricate historical OHLC data. The chart UI cleanly explains that historical data is unsupported by the current provider.
2. **No Fake Technical Signals:** Technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, ATR, VWAP) require historical candles. Rather than executing on fake data, these modules are built as pure TypeScript libraries and will activate only when real OHLC data is provided.
3. **No Fake IPO Listings:** MarketLens does not manufacture mock IPO subscription numbers or dates.
4. **Honest Latency Claims:** MarketLens clearly displays `Provider data • Updated <timestamp>` rather than falsely claiming an "exchange-direct tick-by-tick real-time feed."

---

## How to Add a Secondary or Historical Provider

MarketLens utilizes a strict provider abstraction layer:
- `lib/providers/market/types.ts`: `MarketDataProvider`
- `lib/providers/historical/types.ts`: `HistoricalDataProvider`
- `lib/providers/ipo/types.ts`: `IPOProvider`

To add a historical provider (e.g. Upstox, Dhan, AlphaVantage, or EODHD):
1. Create `lib/providers/historical/<provider-name>.ts` implementing `HistoricalDataProvider`.
2. Update `getHistoricalDataProvider()` in `lib/providers/historical/index.ts`.
3. The `StockChart` component will immediately render real candles without modifying any UI components.
