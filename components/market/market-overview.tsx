'use client';

import { StockQuote } from '@/types/market';
import { Card, CardContent } from '@/components/ui/card';
import { TopMovers } from './top-movers';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

interface MarketOverviewProps {
  quotes: StockQuote[];
  lastUpdated?: string | null;
}

export function MarketOverview({ quotes, lastUpdated }: MarketOverviewProps) {
  // Compute advance / decline across tracked quotes
  let advancing = 0;
  let declining = 0;
  let unchanged = 0;

  for (const q of quotes) {
    if (q.changePercent !== null && typeof q.changePercent === 'number') {
      if (q.changePercent > 0) advancing++;
      else if (q.changePercent < 0) declining++;
      else unchanged++;
    }
  }

  // Calculate Indian Market Status (IST: 09:15 - 15:30, Mon-Fri)
  const now = new Date();
  // IST offset is UTC + 5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  const day = ist.getDay(); // 0 is Sunday, 6 is Saturday
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = isWeekday && timeInMinutes >= 9 * 60 + 15 && timeInMinutes <= 15 * 60 + 30;

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & Breadth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Market Status Card */}
        <Card className="bg-card/70 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Market Session</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isMarketHours ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="font-bold text-sm">
                  {isMarketHours ? 'Market Open (IST)' : 'Market Closed'}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">NSE / BSE: 09:15 - 15:30 IST</p>
            </div>
            <Clock className="h-6 w-6 text-muted-foreground/40" aria-hidden="true" />
          </CardContent>
        </Card>

        {/* Advancing Stocks */}
        <Card className="bg-card/70 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Advancing (Tracked)</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-bold text-lg font-mono text-gain">{advancing}</span>
                <span className="text-xs text-muted-foreground">stocks</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Trading higher today</p>
            </div>
            <TrendingUp className="h-6 w-6 text-gain/40" aria-hidden="true" />
          </CardContent>
        </Card>

        {/* Declining Stocks */}
        <Card className="bg-card/70 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Declining (Tracked)</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-bold text-lg font-mono text-loss">{declining}</span>
                <span className="text-xs text-muted-foreground">stocks</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Trading lower today</p>
            </div>
            <TrendingDown className="h-6 w-6 text-loss/40" aria-hidden="true" />
          </CardContent>
        </Card>

        {/* Provider Source Verification */}
        <Card className="bg-card/70 border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Provider Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className="text-xs font-mono font-normal">
                  0xramm API
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {lastUpdated ? `Updated: ${lastUpdated}` : 'Live batch connection'}
              </p>
            </div>
            <ShieldCheck className="h-6 w-6 text-primary/40" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>

      {/* Top Movers */}
      <div className="space-y-3">
        <h3 className="text-base font-bold tracking-tight">Market Movers & Activity</h3>
        <TopMovers quotes={quotes} />
      </div>
    </div>
  );
}
