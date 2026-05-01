import React from 'react';
import type { SummaryLineMask, PaymentButtonMask } from '@/types/billing.panel';
import { formatCurrency } from '@/utils/currency';

interface Totals {
  gross:         number;
  item_discount: number;
  bill_discount: number;
  tax:           number;
  addons:        number;
  roundoff:      number;
  net:           number;
  items:         number;
  qty:           number;
}

interface Props {
  summaryMask:    SummaryLineMask[];
  paymentMask:    PaymentButtonMask[];
  totals:         Totals;
  customer:       { outstanding_paise: number } | null;
  cartEmpty:      boolean;
  onSettle:       (mode: string) => void;
}

function getValue(key: string, totals: Totals): number {
  switch (key) {
    case 'gross':         return totals.gross;
    case 'item_discount': return totals.item_discount;
    case 'bill_discount': return totals.bill_discount;
    case 'tax':           return totals.tax;
    case 'addons':        return totals.addons;
    case 'roundoff':      return totals.roundoff;
    case 'net':           return totals.net;
    default:              return 0;
  }
}

export const CartSummaryPanel: React.FC<Props> = ({
  summaryMask, paymentMask, totals, customer, cartEmpty, onSettle
}) => {
  const visibleLines = summaryMask
    .filter(l => l.visible)
    .sort((a, b) => a.order - b.order);

  const visibleButtons = paymentMask
    .filter(b => {
      if (!b.visible) return false;
      if (b.condition === 'customer_has_credit')
        return (customer?.outstanding_paise ?? 0) > 0;
      return true;
    })
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Summary lines */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="bg-white border border-outline-variant rounded p-3 space-y-1.5 shadow-sm">
          {visibleLines.map(line => {
            const val = getValue(line.line_key, totals);
            if (line.dim_if_zero && val === 0) return null;

            if (line.is_total) {
              return (
                <React.Fragment key={line.line_key}>
                  <div className="border-t-2 border-primary pt-2 mt-2 flex justify-between items-center">
                    <span className="font-black text-primary uppercase text-[14px]">{line.label}</span>
                    <span className="text-primary font-black text-[22px] font-mono leading-none">
                      {formatCurrency(val)}
                    </span>
                  </div>
                </React.Fragment>
              );
            }

            return (
              <div key={line.line_key} className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-on-surface-variant">{line.label}</span>
                <span className={[
                  'text-[12px] font-mono font-black',
                  line.sign === '-' ? 'text-red-600' : 'text-on-surface',
                ].join(' ')}>
                  {line.sign === '-' && val > 0 ? '-' : ''}{formatCurrency(val)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Items / Qty summary */}
        <div className="flex items-center gap-6 mt-3 px-1">
          <div>
            <div className="text-[9px] font-black text-on-surface-variant uppercase opacity-60">Items</div>
            <div className="text-2xl font-black text-primary leading-none">{totals.items}</div>
          </div>
          <div>
            <div className="text-[9px] font-black text-on-surface-variant uppercase opacity-60">Qty</div>
            <div className="text-2xl font-black text-primary leading-none">{totals.qty}</div>
          </div>
        </div>
      </div>

      {/* Payment buttons */}
      <div className="border-t border-outline-variant p-3 flex flex-col gap-2 shrink-0 bg-surface-container-low">
        {visibleButtons.map(btn => (
          <button
            key={btn.btn_key}
            disabled={cartEmpty}
            onClick={() => onSettle(btn.btn_key)}
            className={[
              'w-full h-12 rounded font-black text-[12px] uppercase tracking-widest transition-all shadow-sm',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              btn.variant === 'primary'
                ? 'bg-secondary text-on-secondary hover:opacity-90 active:scale-95'
                : 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-95',
            ].join(' ')}
          >
            {btn.hotkey && (
              <span className="text-[9px] font-black opacity-60 mr-2">[{btn.hotkey}]</span>
            )}
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
