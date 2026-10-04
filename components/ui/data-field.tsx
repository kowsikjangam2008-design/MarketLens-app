import * as React from 'react';
import { cn } from '@/lib/utils';
import { FinanceTerm } from '@/components/finance/finance-term';

interface DataFieldProps {
  label: string;
  value: React.ReactNode;
  termKey?: string;
  className?: string;
  valueClassName?: string;
  prefix?: string;
  suffix?: string;
}

export function DataField({
  label,
  value,
  termKey,
  className,
  valueClassName,
  prefix,
  suffix,
}: DataFieldProps) {
  const isAvailable = value !== null && value !== undefined && value !== '';

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <span>{label}</span>
        {termKey && <FinanceTerm termKey={termKey} />}
      </div>
      <div
        className={cn(
          'text-sm font-semibold tracking-tight',
          !isAvailable && 'text-muted-foreground/60 font-normal italic',
          valueClassName
        )}
      >
        {isAvailable ? (
          <>
            {prefix}
            {value}
            {suffix}
          </>
        ) : (
          'Not available'
        )}
      </div>
    </div>
  );
}
