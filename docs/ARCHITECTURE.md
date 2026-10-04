# MarketLens Architecture & Technical Design

## High-Level Architecture

```
[ Browser / Client ]
  │  ▲
  │  │ JSON over HTTP
  ▼  │
[ Next.js App Router (Client & Server Components) ]
  │  ▲
  │  │ Internal Routes: /api/market/...
  ▼  │
[ Next.js Server-Side API Routes ]
  │  ▲
  │  │ Abstraction: MarketDataProvider / ZeroRammMarketProvider
  │  │ Validation: Zod schemas rejecting NaN/Infinity
  │  │ Normalization: safe nullable fields
  ▼  │
[ 0xramm Indian Stock Market API ]
  │  ▲
  ▼  │
[ Yahoo Finance (Underlying Data Source) ]
```

---

## Key Design Principles

1. **Centralized Provider Abstraction:**
   - Client components never fetch from external providers directly.
   - All external calls pass through `app/api/market/...` route handlers.
   - Provider interface `MarketDataProvider` exposes explicit capability flags:
     ```typescript
     capabilities = {
       quotes: true,
       batchQuotes: true,
       search: true,
       symbols: true,
       historical: false,
       ipo: false
     }
     ```

2. **Strict Validation with Zod:**
   - Raw JSON payloads from external sources are never type-casted directly.
   - Preprocessing filters out invalid numbers (`NaN`, `Infinity`, non-numeric strings).
   - Missing fields are preserved as `null`, never defaulted to `0`.

3. **Client-Safe Lightweight Charts v5:**
   - `StockChart` uses the current v5 unified series API: `chart.addSeries(CandlestickSeries, options)`.
   - Dynamically imported with `ssr: false` via `StockChartWrapper`.
   - `autoSize: true` handles responsive element resizing without manual recalculation.

4. **Performance & Controlled Polling:**
   - TanStack Query caches stock quotes with a 25-second stale time.
   - Background polling is paused when the user switches tabs (via the Page Visibility API).
   - Batching combines up to 50 stock requests into a single `/stock/list` call, avoiding component-level N+1 query storms.

5. **Accessibility & Responsive Polish:**
   - Semantic HTML and ARIA labels on all interactive controls.
   - Contained horizontal scrolling for wide data tables (`overflow-x-auto`).
   - Mobile-adaptive bottom sheets and desktop popovers for financial definitions.
   - Gains and losses communicate direction via both color and icons (`ArrowUpRight`, `ArrowDownRight`).
