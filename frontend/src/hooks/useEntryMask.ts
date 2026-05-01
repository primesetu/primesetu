import { useMemo } from 'react';
import type { EntryFieldMask } from '@/types/billing.entry';

// DEFAULT MASK — mirrors the existing hardcoded Direct Entry Row exactly.
// When DB returns a mask for trnType 1300 (Sales), this is overridden.
export const DEFAULT_ENTRY_MASK: EntryFieldMask[] = [
  { field_key: 'stock_no',    label: 'Stock No',         type: 'barcode',  width_px: 150, placeholder: 'SCAN...', required: true,  tab_order: 1, visible: true },
  { field_key: 'description', label: 'Item Description', type: 'readonly', width_px: 0,   required: false, tab_order: 2, visible: true },
  { field_key: 'mrp',         label: 'MRP',              type: 'readonly', width_px: 100, required: false, tab_order: 3, visible: true },
  { field_key: 'qty',         label: 'Qty',              type: 'number',   width_px: 80,  required: true,  tab_order: 4, visible: true,  min: 1, max: 999, default_value: 1 },
  { field_key: 'value',       label: 'Value',            type: 'readonly', width_px: 100, required: false, tab_order: 5, visible: true },
  { field_key: 'disc_per',    label: 'Disc %',           type: 'number',   width_px: 80,  required: false, tab_order: 6, visible: true,  min: 0, max: 100, default_value: 0 },
  { field_key: 'promo',       label: 'Promo',            type: 'select',   width_px: 100, required: false, tab_order: 7, visible: true,
    options: [
      { label: 'NONE',      value: '' },
      { label: 'STAFF_10',  value: 'STAFF_10' },
      { label: 'EOY_SALE',  value: 'EOY_SALE' },
    ]
  },
  { field_key: 'staff',       label: 'Staff',            type: 'text',     width_px: 100, required: false, tab_order: 8, visible: true,  default_value: 'S-42' },
];

export function useEntryMask(trnType: number): EntryFieldMask[] {
  // TODO: replace with API call `useQuery(['entry-mask', trnType], ...)`
  // For now returns the default mask (mirrors existing hardcoded row)
  return useMemo(() => DEFAULT_ENTRY_MASK, [trnType]);
}
