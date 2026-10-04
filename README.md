# MarketLens

> **“Understand the market. Make informed decisions.”**

MarketLens is a personal, read-only Indian stock-market information and analysis dashboard inspired by the clarity and utility of tools like Moneycontrol, TradingView, Kite, and Groww, but engineered with 100% original branding, architecture, and UI.

---

## 🚫 Explicit Non-Features

MarketLens is an analytical and educational research tool. It deliberately **DOES NOT** provide:
- Buying or selling stocks
- Placing orders
- Brokerage or Demat account functionality
- Payment processing or fund transfers
- Automated trading execution

---

## ⚡ Current Supported Capabilities & Limitations

MarketLens uses the **0xramm Indian Stock Market API** ([GitHub](https://github.com/0xramm/Indian-Stock-Market-API)) as its primary market-data provider, which sources data from Yahoo Finance.

| Feature | Supported Status | Details |
|---|---|---|
| **Live Stock Quotes** | ✅ Supported | Current LTP, day change, % change, volume, market cap, P/E, EPS, 52w range, sector |
| **Batch Quotes** | ✅ Supported | Efficient bulk fetching (`/stock/list?symbols=...&res=num`) for watchlist & overview |
| **Stock Search** | ✅ Supported | Search by company name or ticker symbol with debouncing (`/search?q=...`) |
| **Supported Symbols** | ✅ Supported | Listed symbol lookup (`/symbols`) |
| **Historical Candlestick Charts** | ⚠️ Explicitly Unavailable | The 0xramm API has no OHLC historical candle endpoint. In accordance with our **zero-fabrication policy**, MarketLens shows an explanatory unavailable state rather than faking candles. The complete Lightweight Charts v5 engine is built and ready for when an OHLC provider is added. |
| **IPO Subscription & Listings** | ⚠️ Explicitly Unavailable | Not supplied by current provider. Clear explanation displayed. |
| **Exchange-Direct Latency** | ⚠️ Disclaimer | Data is REST-polled via Yahoo Finance. MarketLens does **not** claim to provide a tick-by-tick exchange-direct feed from NSE/BSE. |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 15 (App Router, React 19, strict TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with semantic dark/light theme variables
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives + Lucide Icons
- **Data Fetching:** [TanStack Query](https://tanstack.com/query) v5 (stale-while-revalidate, controlled polling)
- **Validation:** [Zod](https://zod.dev/) (strict external API response validation, rejects `NaN`/`Infinity`)
- **Charting:** [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/) v5.2.1 (Client-side, unified v5 series API)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
- **Testing:** [Vitest](https://vitest.dev/) (Unit tests) + [Playwright](https://playwright.dev/) (E2E responsive tests)

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm (or pnpm/yarn)
- A deployed instance of the [0xramm Indian Stock Market API](https://github.com/0xramm/Indian-Stock-Market-API)

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# 0xramm Indian Stock Market API deployment URL (without trailing slash)
MARKET_API_BASE_URL=https://indian-stock-market-api.vercel.app

# Public app metadata
NEXT_PUBLIC_APP_NAME=MarketLens
NEXT_PUBLIC_DEFAULT_MARKET=India

# Refresh rate in milliseconds (default: 30000 = 30 seconds)
MARKET_REFRESH_INTERVAL_MS=30000
```

### 3. Installation
```bash
npm install
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Validation

```bash
# Run ESLint
npm run lint

# Run strict TypeScript check
npm run typecheck

# Run unit tests (Vitest)
npm run test

# Run end-to-end tests (Playwright)
npm run test:e2e

# Build for production
npm run build
```

---

## 🚀 Deployment to Vercel

1. Push your repository to GitHub (see instructions below).
2. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your `MarketLens` repository.
4. In the **Environment Variables** section, configure:
   - `MARKET_API_BASE_URL`: The URL of your deployed 0xramm API instance.
   - `NEXT_PUBLIC_APP_NAME`: `MarketLens`
   - `NEXT_PUBLIC_DEFAULT_MARKET`: `India`
5. Click **Deploy**. Vercel will automatically run `npm run build` and output a production deployment.

---

## 🐙 Publishing to GitHub

```bash
# Initialize git repository (if not already initialized)
git init

# Add all files (secrets and node_modules are excluded via .gitignore)
git add .

# Commit changes
git commit -m "feat: initial production release of MarketLens"

# Add your remote origin and push
git remote add origin https://github.com/<your-username>/MarketLens.git
git branch -M main
git push -u origin main
```

---

## ⚖️ Legal & Attributions

- **Data Attribution:** MarketLens uses the [0xramm Indian Stock Market API](https://github.com/0xramm/Indian-Stock-Market-API) as its market-data provider. 0xramm identifies its data source as Yahoo Finance and provides its own educational disclaimer.
- **Regulatory Disclosure:** MarketLens is an independent personal research application and is **not an official product of or affiliated with the National Stock Exchange of India (NSE) or the Bombay Stock Exchange (BSE)**.
- **Investment Disclaimer:** All information, metrics, and informational signals provided by MarketLens are strictly for research and educational purposes. **None of the contents constitute financial or investment advice.**
- **Charting Attribution:** Charts powered by [TradingView Lightweight Charts](https://www.tradingview.com/). Licensed under Apache License 2.0. Copyright &copy; TradingView, Inc.
