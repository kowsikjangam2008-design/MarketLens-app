'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  SlidersHorizontal,
  Bookmark,
  Wallet,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchlistStore } from '@/hooks/use-watchlist';

const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/markets', label: 'Markets', icon: LineChart },
  { href: '/paper-trading', label: 'Paper Sim', icon: Wallet },
  { href: '/watchlist', label: 'Watchlist', icon: Bookmark, badgeKey: 'watchlist' },
  { href: '/learn', label: 'Learn', icon: GraduationCap },
];

export function MobileNav() {
  const pathname = usePathname();
  const watchlistCount = useWatchlistStore((state) => state.symbols.length);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-lg border-t border-border px-2 py-1.5 flex items-center justify-around safe-area-bottom"
      aria-label="Mobile navigation"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const showBadge = item.badgeKey === 'watchlist' && watchlistCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors relative min-w-[56px]',
              isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" aria-hidden="true" />
              {showBadge && (
                <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[9px] font-bold h-3.5 min-w-[14px] px-1 rounded-full flex items-center justify-center">
                  {watchlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
