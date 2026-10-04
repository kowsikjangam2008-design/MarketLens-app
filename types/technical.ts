/**
 * Technical analysis indicator result types
 */

export interface IndicatorPoint<T> {
  time: number | string;
  value: T;
}

export interface SMAResult {
  period: number;
  values: IndicatorPoint<number>[];
  latest: number | null;
}

export interface EMAResult {
  period: number;
  values: IndicatorPoint<number>[];
  latest: number | null;
}

export interface RSIResult {
  period: number;
  values: IndicatorPoint<number>[];
  latest: number | null;
  isOverbought: boolean;
  isOversold: boolean;
}

export interface MACDValue {
  macd: number;
  signal: number;
  histogram: number;
}

export interface MACDResult {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  values: IndicatorPoint<MACDValue>[];
  latest: MACDValue | null;
}

export interface BollingerValue {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
}

export interface BollingerBandsResult {
  period: number;
  stdDevMultiplier: number;
  values: IndicatorPoint<BollingerValue>[];
  latest: BollingerValue | null;
}

export interface ATRResult {
  period: number;
  values: IndicatorPoint<number>[];
  latest: number | null;
}

export interface VWAPResult {
  values: IndicatorPoint<number>[];
  latest: number | null;
}
