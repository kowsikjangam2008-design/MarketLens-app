import { MetadataRoute } from 'next';
import { TRACKED_SYMBOLS } from '@/config/market-universe';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://marketlens.vercel.app';

  const staticRoutes = [
    '',
    '/markets',
    '/screener',
    '/discover',
    '/watchlist',
    '/learn',
    '/settings',
    '/about',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const stockRoutes = TRACKED_SYMBOLS.map((symbol) => ({
    url: `${baseUrl}/stocks/${encodeURIComponent(symbol)}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...stockRoutes];
}
