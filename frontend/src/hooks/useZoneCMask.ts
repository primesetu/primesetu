import { useMemo } from 'react';
import type { ZoneCMask } from '@/types/billing.panel';

export const DEFAULT_ZONE_C_MASK: ZoneCMask = {
  customer_fields: [
    { field_key: 'code',        label: 'Code',         visible: true,  order: 1, format: 'text' },
    { field_key: 'name',        label: 'Name',         visible: true,  order: 2, format: 'text' },
    { field_key: 'loyalty_pts', label: 'Loyalty',      visible: true,  order: 3, format: 'points', dim_if_zero: true },
    { field_key: 'outstanding', label: 'Outstanding',  visible: true,  order: 4, format: 'currency', highlight_if_nonzero: true },
    { field_key: 'last_visit',  label: 'Last Visit',   visible: true,  order: 5, format: 'date' },
  ],
  summary_lines: [
    { line_key: 'gross',         label: 'Gross Value',         visible: true,  order: 1, is_total: false, format: 'currency' },
    { line_key: 'item_discount', label: 'Item Discount',       visible: true,  order: 2, is_total: false, sign: '-', format: 'currency', dim_if_zero: true },
    { line_key: 'bill_discount', label: 'Bill Discount [F6]',  visible: true,  order: 3, is_total: false, sign: '-', format: 'currency', dim_if_zero: true },
    { line_key: 'tax',           label: 'Total Taxes',         visible: true,  order: 4, is_total: false, format: 'currency' },
    { line_key: 'addons',        label: 'Add-ons / Deductions',visible: true,  order: 5, is_total: false, format: 'currency', dim_if_zero: true },
    { line_key: 'roundoff',      label: 'Round Off',           visible: true,  order: 6, is_total: false, format: 'currency', dim_if_zero: true },
    { line_key: 'net',           label: 'Net Amount',          visible: true,  order: 7, is_total: true,  format: 'currency' },
  ],
  payment_buttons: [
    { btn_key: 'cash',   label: 'CASH',         visible: true,  order: 1, hotkey: 'F8', variant: 'primary',  condition: 'always' },
    { btn_key: 'upi',    label: 'UPI / QR',     visible: true,  order: 2, variant: 'default', condition: 'always' },
    { btn_key: 'card',   label: 'CARD POS',     visible: true,  order: 3, variant: 'default', condition: 'always' },
    { btn_key: 'credit', label: 'STORE CREDIT', visible: true,  order: 4, variant: 'default', condition: 'customer_has_credit' },
  ],
};

export function useZoneCMask(trnType: number): ZoneCMask {
  // TODO: replace with useQuery(['zone-c-mask', trnType], ...)
  return useMemo(() => DEFAULT_ZONE_C_MASK, [trnType]);
}
