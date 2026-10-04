import { Metadata } from 'next';
import { StockDetailPageClient } from './stock-detail-client';

interface StockPageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const decoded = decodeURIComponent(symbol).toUpperCase();

  return {
    title: `${decoded} — Stock Quote & Metrics`,
    description: `Real-time quote, market statistics, valuation metrics, and informational signal analysis for ${decoded} on MarketLens.`,
    openGraph: {
      title: `${decoded} Stock Quote | MarketLens`,
      description: `Track live price, volume, and financial ratios for ${decoded}.`,
    },
  };
}

export default async function StockPage({ params }: StockPageProps) {
  const { symbol } = await params;
  const decodedSymbol = decodeURIComponent(symbol).toUpperCase();

  return <StockDetailPageClient symbol={decodedSymbol} />;
}
