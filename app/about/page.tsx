import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ShieldCheck, Database, BarChart2, Info, AlertTriangle } from 'lucide-react';
import { APP_CONFIG, LEGAL_DISCLAIMERS } from '@/config/constants';

export const metadata = {
  title: 'About & Data Sources',
  description: 'Learn about MarketLens architecture, the 0xramm Indian Stock Market API, and TradingView Lightweight Charts attribution.',
};

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b pb-4 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">About {APP_CONFIG.name}</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground font-medium">
          &ldquo;{APP_CONFIG.tagline}&rdquo;
        </p>
      </div>

      <div className="space-y-6">
        {/* Core Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              Project Mission & Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-3 pt-0 leading-relaxed">
            <p>
              <strong>{APP_CONFIG.name}</strong> is a personal, read-only Indian stock-market information and analysis dashboard inspired by modern financial tools (Moneycontrol, TradingView, Kite, Groww), built with 100% original code, architecture, and UI.
            </p>
            <p>
              The application explicitly provides <strong>no buying, selling, order placement, brokerage, demat, or fund transfer capabilities</strong>. It is designed strictly for research, observation, and market literacy.
            </p>
          </CardContent>
        </Card>

        {/* Primary Market Data Provider */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" aria-hidden="true" />
                Market Data Provider
              </CardTitle>
              <Badge variant="outline" className="text-xs font-medium">
                Active Adapter
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-3 pt-0 leading-relaxed">
            <div className="p-3.5 rounded-lg bg-muted/40 border text-foreground font-medium">
              MarketLens uses the <strong>0xramm Indian Stock Market API</strong> as its current market-data provider.
            </div>

            <p>
              The 0xramm project identifies its upstream data source as Yahoo Finance and provides its own educational-use disclaimer. MarketLens obtains current stock quotes (price, day range, volume, market cap, P/E, EPS, dividend yield, sector) through this interface.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-foreground">Source Repository:</span>
              <Link
                href="https://github.com/0xramm/Indian-Stock-Market-API"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                https://github.com/0xramm/Indian-Stock-Market-API
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-amber-500 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              Exchanges & Regulatory Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-2.5 pt-0 leading-relaxed">
            <p>
              <strong>Not an Official NSE or BSE Product:</strong> MarketLens is an independent personal project and is NOT affiliated with, authorized by, or endorsed by the National Stock Exchange of India (NSE) or the Bombay Stock Exchange (BSE).
            </p>
            <p>
              <strong>No Exchange-Direct Feed:</strong> MarketLens does NOT claim to provide an exchange-direct, tick-by-tick real-time feed from NSE or BSE. All data is retrieved via the RESTful endpoints of the configured market provider.
            </p>
            <p>
              <strong>Zero-Fabrication Policy:</strong> When the provider cannot supply historical candlestick data or IPO information, MarketLens explicitly states that data is unavailable rather than generating synthetic candles, fictitious prices, or simulated ticks.
            </p>
          </CardContent>
        </Card>

        {/* TradingView Lightweight Charts Attribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" aria-hidden="true" />
              Charting Library Attribution
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-3 pt-0 leading-relaxed">
            <p>
              Charts powered by{' '}
              <Link
                href={LEGAL_DISCLAIMERS.tradingViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
              >
                TradingView Lightweight Charts
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
              .
            </p>
            <p className="text-xs">
              Licensed under the Apache License, Version 2.0. Copyright &copy; TradingView, Inc.
              The charting library handles visualization exclusively; all market data is supplied and normalized by MarketLens.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
