'use client';

import { useSettingsStore, UserMode } from '@/hooks/use-settings';
import { useWatchlistStore } from '@/hooks/use-watchlist';
import { useTheme } from 'next-themes';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Settings, Moon, Sun, Clock, Bookmark, Database, Trash2 } from 'lucide-react';
import { REFRESH_CONFIG } from '@/config/constants';
import { useState } from 'react';

const REFRESH_OPTIONS = [
  { label: '10 seconds (Frequent)', value: 10000 },
  { label: '30 seconds (Default)', value: 30000 },
  { label: '60 seconds (1 minute)', value: 60000 },
  { label: '120 seconds (2 minutes)', value: 120000 },
];

export default function SettingsPage() {
  const { mode, setMode, refreshIntervalMs, setRefreshIntervalMs } = useSettingsStore();
  const { symbols, reorderSymbols } = useWatchlistStore();
  const { theme, setTheme } = useTheme();
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleClearWatchlist = () => {
    if (confirm('Are you sure you want to clear your saved watchlist?')) {
      reorderSymbols([]);
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Application Settings</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Customize your analysis preferences, market polling speed, and local data storage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Experience Mode Setting */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">Experience Mode</CardTitle>
                <CardDescription className="mt-1">
                  Choose between a simplified beginner interface or an in-depth analytical view.
                </CardDescription>
              </div>
              <ModeToggle />
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2 pt-0">
            <p>
              <strong className="text-foreground">Beginner Mode:</strong> Highlights educational tooltips, simplifies complex ratios, and emphasizes plain-language definitions.
            </p>
            <p>
              <strong className="text-foreground">Advanced Mode:</strong> Displays technical analysis indicator controls, granular valuation multiples, and full market statistics.
            </p>
          </CardContent>
        </Card>

        {/* Polling Interval */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
              Controlled Refresh Interval
            </CardTitle>
            <CardDescription>
              Configure how frequently MarketLens queries the 0xramm API in the background. Polling automatically pauses when this browser tab is hidden.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REFRESH_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={refreshIntervalMs === opt.value ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setRefreshIntervalMs(opt.value)}
                  className="justify-start text-xs h-9 font-medium"
                >
                  <span className="w-2 h-2 rounded-full mr-2 bg-primary" />
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appearance Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Visual Theme</CardTitle>
            <CardDescription>
              MarketLens defaults to a dark financial theme designed for data contrast and reduced eye strain.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex items-center gap-3">
            <Button
              variant={theme === 'dark' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="gap-2 text-xs"
            >
              <Moon className="h-4 w-4" aria-hidden="true" />
              Dark Mode (Default)
            </Button>
            <Button
              variant={theme === 'light' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="gap-2 text-xs"
            >
              <Sun className="h-4 w-4" aria-hidden="true" />
              Light Mode
            </Button>
          </CardContent>
        </Card>

        {/* Watchlist Local Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-primary" aria-hidden="true" />
              Local Watchlist Storage
            </CardTitle>
            <CardDescription>
              Your watchlist is stored privately in your browser&apos;s localStorage. Currently tracking {symbols.length} stocks.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex items-center gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearWatchlist}
              disabled={symbols.length === 0}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear All Watchlist Stocks
            </Button>
            {clearedNotice && (
              <span className="text-xs text-gain animate-fade-in">Watchlist cleared successfully.</span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
