import { SignalResult, FactorAssessment } from '@/types/signals';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinanceTerm } from '@/components/finance/finance-term';

interface SignalPanelProps {
  signals: SignalResult;
}

export function SignalPanel({ signals }: SignalPanelProps) {
  const getAssessmentBadge = (assessment: FactorAssessment) => {
    switch (assessment) {
      case 'POSITIVE':
        return <Badge variant="gain">Positive Bias</Badge>;
      case 'NEGATIVE':
        return <Badge variant="loss">Cautious / Negative</Badge>;
      case 'NEUTRAL':
        return <Badge variant="neutral">Neutral</Badge>;
      case 'UNAVAILABLE':
      default:
        return <Badge variant="unavailable">Unavailable</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden border-border/80">
      <CardHeader className="bg-muted/20 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg">Informational Market Signals</CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">
                {signals.confidenceScore !== null ? `${signals.confidenceScore}% Data Coverage` : 'Partial'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Factor analysis grounded exclusively in verified provider data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">{signals.signalLabel}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {/* Why this signal section */}
        <div className="rounded-lg bg-muted/40 border p-3 text-xs space-y-1">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>Why this signal?</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {signals.whyThisSignal}
          </p>
        </div>

        {/* Factors Breakdown Table / Grid */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
            Analyzed Factors
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {signals.factors.map((factor) => {
              const isAvailable = factor.status === 'AVAILABLE';

              return (
                <div
                  key={factor.id}
                  className={cn(
                    'p-3 rounded-lg border text-xs flex flex-col justify-between space-y-2',
                    isAvailable ? 'bg-card' : 'bg-muted/10 border-dashed border-muted-foreground/30 opacity-80'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span>{factor.name}</span>
                      <FinanceTerm termKey={factor.id === 'trend' ? 'sma' : factor.id === 'momentum' ? 'rsi' : factor.id === 'valuation' ? 'pe' : 'market_cap'} />
                    </div>
                    {getAssessmentBadge(factor.assessment)}
                  </div>

                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    {factor.explanation}
                  </p>

                  {factor.metricsUsed.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/75 font-mono pt-1 border-t border-border/40">
                      <span>Inputs:</span>
                      <span>{factor.metricsUsed.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Data limitations disclosure */}
        {signals.dataLimitations.length > 0 && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs space-y-1 text-amber-500 dark:text-amber-400">
            <div className="font-semibold flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Data Limitations (0xramm Provider)</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
              {signals.dataLimitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Mandatory Legal Disclaimer */}
        <div className="rounded-lg bg-muted/20 border p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-semibold text-foreground">Not Personalized Investment Advice</span>
            <p className="text-[11px] leading-relaxed">
              MarketLens signals are objective technical and quantitative summaries. They do not constitute financial advice, investment recommendations, or guarantees of profit.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
