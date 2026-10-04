import { MarketDataProvider } from '@/types/market';
import { zeroRammProvider } from './zero-ramm';

/**
 * Returns the currently active market data provider.
 * Follows provider abstraction pattern so additional adapters can easily be registered.
 */
export function getMarketDataProvider(): MarketDataProvider {
  return zeroRammProvider;
}

export { zeroRammProvider };
export * from './types';
