import { IPOItem, IPOProvider } from '@/types/market';

/**
 * IPO Data Provider implementation.
 * Because 0xramm Indian Stock Market API has NO IPO endpoint,
 * this provider explicitly marks ipo as false and throws an error when requested.
 * NEVER fake IPO data.
 */
export class UnavailableIPOProvider implements IPOProvider {
  public readonly name = 'IPO Provider (None configured)';
  public readonly capabilities = {
    ipo: false,
  };

  public async getIPOs(): Promise<IPOItem[]> {
    throw new Error('IPO data is not available from the current provider.');
  }
}

export const defaultIPOProvider = new UnavailableIPOProvider();

export function getIPOProvider(): IPOProvider {
  return defaultIPOProvider;
}
