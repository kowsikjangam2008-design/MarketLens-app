/**
 * Signal Analysis types
 * Strictly distinguishing between available factors and unavailable factors.
 * Never defaults missing data to zero.
 */

export type FactorStatus = 'AVAILABLE' | 'UNAVAILABLE';

export type FactorAssessment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'UNAVAILABLE';

export interface SignalFactor {
  id: 'trend' | 'momentum' | 'volume' | 'technical_structure' | 'fundamentals' | 'valuation';
  name: string;
  status: FactorStatus;
  score: number | null; // 0-100 or null if unavailable
  assessment: FactorAssessment;
  explanation: string;
  metricsUsed: string[];
}

export type OverallSignalType = 
  | 'INFORMATIONAL_POSITIVE'
  | 'INFORMATIONAL_NEUTRAL'
  | 'INFORMATIONAL_CAUTIOUS'
  | 'UNAVAILABLE';

export interface SignalResult {
  overallSignal: OverallSignalType;
  signalLabel: string; // e.g. "Informational: Positive Bias" or "Data Insufficient"
  disclaimer: string; // "Not personalized investment advice."
  confidenceScore: number | null; // percentage of required factors that were available
  factors: SignalFactor[];
  whyThisSignal: string;
  dataLimitations: string[];
  calculatedAt: string;
}
