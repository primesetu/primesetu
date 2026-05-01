import React, { useEffect } from 'react';
import type { EntryFieldMask } from '@/types/billing.entry';
import { useEntryFields } from '@/hooks/useEntryFields';
import { formatCurrency } from '@/utils/currency';

interface DynamicEntryRowProps {
  mask:           EntryFieldMask[];
  rowNumber:      number;
  pendingProduct: any | null;
  onBarcode:      (code: string) => void;
  onSubmit:       (values: Record<string, string | number>) => void;
  qtyRef?:        React.RefObject<HTMLInputElement>;
}

export const DynamicEntryRow: React.FC<DynamicEntryRowProps> = ({
  mask, rowNumber, pendingProduct, onBarcode, onSubmit, qtyRef
}) => {
  const { visibleFields, values, setValue, reset, focusNext, focusFirst, refs } = useEntryFields(mask);

  // Sync readonly fields from pendingProduct
  useEffect(() => {
    if (pendingProduct) {
      setValue('description', pendingProduct.name || '');
      setValue('mrp', pendingProduct.mrp || 0);
      const qty = Number(values['qty']) || 1;
      const discPer = Number(values['disc_per']) || 0;
      const mrp = pendingProduct.mrp || 0;
      const discAmt = Math.round(mrp * discPer / 100);
      setValue('value', qty * (mrp - discAmt));
    } else {
      setValue('description', '');
      setValue('mrp', 0);
      setValue('value', 0);
    }
  }, [pendingProduct, values['qty'], values['disc_per']]);

  // Auto-focus first field (barcode) on mount
  useEffect(() => { focusFirst(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent, field: EntryFieldMask) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field.type === 'barcode') {
        onBarcode(String(values[field.field_key]));
        return;
      }
      const editableFields = visibleFields.filter(f => f.type !== 'readonly');
      const isLastEditable = editableFields[editableFields.length - 1]?.field_key === field.field_key;

      if (isLastEditable && pendingProduct) {
        onSubmit(values);
        reset();
      } else {
        focusNext(field.field_key);
      }
    }
  };

  // Build grid template from visible field widths
  // flex (width_px=0) means it takes remaining space
  const gridCols = visibleFields.map(f =>
    f.width_px === 0 ? '1fr' : `${f.width_px}px`
  ).join(' ');

  return (
    <div className="bg-surface-container-high border-b-2 border-primary p-2 shrink-0">
      <div className="grid gap-2 items-end" style={{ gridTemplateColumns: `50px ${gridCols}` }}>

        {/* S.No — always first, always static */}
        <div>
          <label className="block text-[9px] font-black text-on-surface-variant uppercase mb-1">S.No</label>
          <div className="h-8 flex items-center justify-center font-black text-on-surface-variant bg-surface-container rounded">
            {rowNumber}
          </div>
        </div>

        {/* Dynamic fields from mask */}
        {visibleFields.map(field => (
          <div key={field.field_key} className={field.width_px === 0 ? 'min-w-0' : ''}>
            <label className="block text-[9px] font-black text-on-surface-variant uppercase mb-1 truncate">
              {field.label}
            </label>

            {/* READONLY */}
            {field.type === 'readonly' && (
              <div className="h-8 bg-surface-container border-transparent px-2 rounded flex items-center justify-end text-on-surface-variant font-bold text-[12px] truncate">
                {field.field_key === 'mrp' || field.field_key === 'value'
                  ? formatCurrency(Number(values[field.field_key]) || 0)
                  : String(values[field.field_key] || '')}
              </div>
            )}

            {/* BARCODE */}
            {field.type === 'barcode' && (
              <input
                ref={el => {
                  refs.current[field.field_key] = el;
                  // expose for useBarcodeScanner hook compatibility
                  if (qtyRef && field.field_key === 'qty' && el) {
                    (qtyRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                  }
                }}
                className="w-full h-8 bg-surface-container-lowest border border-outline-variant px-2 rounded outline-none focus:border-primary focus:ring-1 focus:ring-primary font-black text-[12px]"
                placeholder={field.placeholder || ''}
                value={String(values[field.field_key] || '')}
                onChange={e => setValue(field.field_key, e.target.value)}
                onKeyDown={e => handleKeyDown(e, field)}
              />
            )}

            {/* NUMBER */}
            {field.type === 'number' && (
              <input
                ref={el => { refs.current[field.field_key] = el; }}
                type="number"
                min={field.min}
                max={field.max}
                className="w-full h-8 bg-surface-container-low border border-outline-variant text-[12px] font-black text-center rounded outline-none focus:border-primary focus:bg-white transition-colors"
                value={Number(values[field.field_key]) || 0}
                onChange={e => setValue(field.field_key, parseFloat(e.target.value) || 0)}
                onKeyDown={e => handleKeyDown(e, field)}
              />
            )}

            {/* SELECT */}
            {field.type === 'select' && (
              <select
                ref={el => { refs.current[field.field_key] = el as any; }}
                className="w-full h-8 bg-surface-container-low border border-outline-variant text-[10px] font-black px-1 rounded outline-none focus:border-primary"
                value={String(values[field.field_key] || '')}
                onChange={e => setValue(field.field_key, e.target.value)}
                onKeyDown={e => handleKeyDown(e, field)}
              >
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}

            {/* TEXT / LOOKUP */}
            {(field.type === 'text' || field.type === 'lookup') && (
              <input
                ref={el => { refs.current[field.field_key] = el; }}
                className="w-full h-8 bg-surface-container-low border border-outline-variant text-[12px] font-black text-center rounded outline-none focus:border-primary focus:bg-white transition-colors uppercase"
                value={String(values[field.field_key] || '')}
                onChange={e => setValue(field.field_key, e.target.value)}
                onKeyDown={e => handleKeyDown(e, field)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
