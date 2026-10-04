'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  LayoutDashboard,
  LineChart,
  SlidersHorizontal,
  Compass,
  Bookmark,
  GraduationCap,
  Settings,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchlistStore } from '@/hooks/use-watchlist';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/markets', label: 'Markets', icon: LineChart },
  { href: '/screener', label: 'Screener', icon: SlidersHorizontal },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/watchlist', label: 'Watchlist', icon: Bookmark, badgeKey: 'watchlist' },
  { href: '/learn', label: 'Learn & Glossary', icon: GraduationCap },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/about', label: 'About & Source', icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();
  const watchlistSymbols = useWatchlistStore((state) => state.symbols);

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card/60 backdrop-blur-md shrink-0 h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-foreground">MarketLens</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            Indian Markets
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const badgeCount = item.badgeKey === 'watchlist' ? watchlistSymbols.length : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </div>
              {badgeCount !== null && (
                <Badge
                  variant={isActive ? 'secondary' : 'outline'}
                  className={cn(
                    'text-[10px] h-4.5 px-1.5 tabular-nums font-semibold',
                    isActive && 'bg-primary-foreground/20 text-primary-foreground border-transparent'
                  )}
                >
                  {badgeCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t text-[11px] text-muted-foreground space-y-1 bg-muted/20">
        <p className="font-medium text-foreground/80">0xramm Data Provider</p>
        <p className="text-[10px]">Read-only analytics. No trading execution.</p>
      </div>
    </aside>
  );
}
