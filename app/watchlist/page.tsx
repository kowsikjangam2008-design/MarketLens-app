import { WatchlistManager } from '@/components/watchlist/watchlist-manager';
import { Bookmark } from 'lucide-react';

export const metadata = {
  title: 'My Watchlist',
  description: 'Manage and monitor your personal portfolio of Indian stocks with live batch quotes on MarketLens.',
};

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Watchlist</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Your personal tracked list of Indian stocks saved locally on your device. Live prices are fetched via batch requests.
        </p>
      </div>

      <WatchlistManager />
    </div>
  );
}
