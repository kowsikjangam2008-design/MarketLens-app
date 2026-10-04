import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import { AppShell } from '@/components/layout/app-shell';
import { APP_CONFIG } from '@/config/constants';

export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: `${APP_CONFIG.name} is a personal, read-only Indian stock-market information and analysis dashboard powered by the 0xramm Indian Stock Market API.`,
  keywords: [
    'Indian stock market',
    'NSE',
    'BSE',
    'NIFTY 50',
    'stock dashboard',
    'financial metrics',
    'MarketLens',
  ],
  authors: [{ name: 'MarketLens' }],
  creator: 'MarketLens',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://marketlens.vercel.app',
    title: `${APP_CONFIG.name} — Indian Stock Market Analysis`,
    description: APP_CONFIG.tagline,
    siteName: APP_CONFIG.name,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans selection:bg-primary/20 selection:text-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <AppShell>{children}</AppShell>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
