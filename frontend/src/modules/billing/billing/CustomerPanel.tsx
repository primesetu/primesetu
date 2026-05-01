import React from 'react';
import { Search, X, AlertTriangle, Star } from 'lucide-react';
import type { CustomerFieldMask } from '@/types/billing.panel';
import type { CustomerRecord } from '@/api/customer';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';

interface Props {
  mask:         CustomerFieldMask[];
  customer:     CustomerRecord | null;
  trnMode:      string;
  searchValue:  string;
  onSearchChange: (val: string) => void;
  onClear:      () => void;
  onOpenBrowse: () => void;
  className?:   string;
}

function formatField(key: string, value: any, format?: string): string {
  if (value == null || value === '') return '—';
  if (format === 'currency') return formatCurrency(value);
  if (format === 'points')   return `${Number(value).toLocaleString('en-IN')} pts`;
  if (format === 'date') {
    try { return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return value; }
  }
  return String(value);
}

export const CustomerPanel: React.FC<Props> = ({
  mask, customer, trnMode, searchValue, onSearchChange, onClear, onOpenBrowse, className
}) => {
  const visibleFields = mask
    .filter(f => f.visible)
    .sort((a, b) => a.order - b.order);

  const isCredit     = trnMode === 'Credit';
  const hasOutstanding = (customer?.outstanding_paise ?? 0) > 0;

  return (
    <div className={cn("border-b border-outline-variant p-3 shrink-0", className)}>
      {/* Search bar */}
      <div className="relative mb-2">
        <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          className={[
            'w-full h-8 pl-7 pr-7 rounded border text-[11px] font-black outline-none transition-all uppercase',
            isCredit && !customer
              ? 'bg-red-50 border-red-300 ring-1 ring-red-200 placeholder:text-red-400'
              : 'bg-surface-container-lowest border-outline-variant focus:border-primary',
          ].join(' ')}
          placeholder={isCredit ? 'MANDATORY — SEARCH CUSTOMER' : 'Phone / Code / Name [F2]'}
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          onFocus={onOpenBrowse}
        />
        {customer && (
          <button onClick={onClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-red-500 transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Customer data — only when resolved */}
      {customer ? (
        <div className="bg-surface-container rounded p-2 space-y-1">
          {visibleFields.map(f => {
            // Map legacy keys to new schema
            const fieldKey = f.field_key === 'loyalty_pts' ? 'loyalty_points' 
                          : f.field_key === 'outstanding' ? 'outstanding_paise'
                          : f.field_key === 'last_visit'  ? 'created_at'
                          : f.field_key;

            const val = customer[fieldKey as keyof CustomerRecord];
            const isZero = val === 0 || val === '';
            const isOutstanding = fieldKey === 'outstanding_paise';
            const isLoyalty = fieldKey === 'loyalty_points';
            if (f.dim_if_zero && isZero) return null;

            return (
              <div key={f.field_key} className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-on-surface-variant tracking-wide">
                  {f.label}
                </span>
                <span className={[
                  'text-[11px] font-black',
                  isOutstanding && hasOutstanding ? 'text-amber-600' : '',
                  isLoyalty ? 'text-primary' : 'text-on-surface',
                ].join(' ')}>
                  {isLoyalty && <Star size={9} className="inline mr-0.5 mb-0.5" />}
                  {formatField(f.field_key, val, f.format)}
                  {isOutstanding && hasOutstanding && (
                    <AlertTriangle size={10} className="inline ml-1 text-amber-500" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-[10px] font-black uppercase text-on-surface-variant/40 py-2 tracking-widest">
          {isCredit ? '⚠ CREDIT BILL REQUIRES CUSTOMER' : 'WALK-IN RETAIL'}
        </div>
      )}
    </div>
  );
};
