'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const StockChartWrapper = dynamic(
  () => import('./stock-chart').then((mod) => mod.StockChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-xl border bg-card/40 flex flex-col justify-center items-center p-6 space-y-4">
        <Skeleton className="w-full h-8" />
        <Skeleton className="w-full flex-1" />
        <Skeleton className="w-1/3 h-4" />
      </div>
    ),
  }
);
