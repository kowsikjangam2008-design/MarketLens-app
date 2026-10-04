import { BarChart3, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ChartPlaceholderProps {
  symbol: string;
}

export function ChartPlaceholder({ symbol }: ChartPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/30 min-h-[360px] space-y-4">
      <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
        <BarChart3 className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h4 className="text-base font-semibold text-foreground">
          Historical Chart Unavailable
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          The 0xramm Indian Stock Market API supplies current market quotes for{' '}
          <span className="font-semibold text-foreground">{symbol}</span>, but does
          not provide historical candlestick (OHLCV) endpoints.
        </p>
      </div>

      <div className="rounded-lg bg-muted/40 border p-3 max-w-md text-left text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" aria-hidden="true" />
          <span>Zero-Fabrication Policy</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          MarketLens strictly avoids generating fake candles, synthetic price histories, or simulated ticks.
          The complete Lightweight Charts v5 visualization engine is ready and will render real data as soon as an OHLC provider adapter is connected.
        </p>
      </div>

      <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1">
        <span>Charts powered by</span>
        <Link
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
        >
          TradingView Lightweight Charts
          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
