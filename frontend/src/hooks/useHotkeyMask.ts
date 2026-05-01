import { useMemo } from 'react';
import type { HotkeyMask } from '@/types/billing.hotkeys';

export const DEFAULT_HOTKEY_MASK: HotkeyMask[] = [
  { hotkey_id: 'HK-001', key: 'f2',     label: 'CUSTOMER',    action: 'open_customer_search', variant: 'default',  visible: true,  order: 1, enabled: true, condition: 'always' },
  { hotkey_id: 'HK-002', key: 'f3',     label: 'FOCUS QTY',   action: 'focus_qty',            variant: 'default',  visible: false, order: 2, enabled: true, condition: 'always' },
  { hotkey_id: 'HK-003', key: 'f6',     label: 'DISCOUNT',    action: 'open_discount',        variant: 'default',  visible: true,  order: 3, enabled: true, condition: 'cart_non_empty' },
  { hotkey_id: 'HK-004', key: 'f7',     label: 'EXACT CASH',  action: 'exact_cash',           variant: 'default',  visible: true,  order: 4, enabled: true, condition: 'cart_non_empty' },
  { hotkey_id: 'HK-005', key: 'f8',     label: 'SETTLE BILL', action: 'settle_bill',          variant: 'primary',  visible: true,  order: 5, enabled: true, condition: 'cart_non_empty' },
  { hotkey_id: 'HK-006', key: 'f9',     label: 'VIEW TOTALS', action: 'open_addons',          variant: 'default',  visible: true,  order: 6, enabled: true, condition: 'always' },
  { hotkey_id: 'HK-007', key: 'f11',    label: 'FOCUS SCAN',  action: 'focus_barcode',        variant: 'default',  visible: false, order: 7, enabled: true, condition: 'always' },
  { hotkey_id: 'HK-008', key: 'f12',    label: 'SUSPEND',     action: 'suspend_bill',         variant: 'danger',   visible: true,  order: 8, enabled: true, condition: 'cart_non_empty' },
  { hotkey_id: 'HK-009', key: 'ctrl+4', label: 'ADD-ONS',     action: 'open_addons',          variant: 'default',  visible: false, order: 9, enabled: true, condition: 'always' },
  { hotkey_id: 'HK-010', key: 'ctrl+d', label: 'DELETE ITEM', action: 'delete_last_item',     variant: 'danger',   visible: false, order: 10, enabled: true, condition: 'cart_non_empty' },
  { hotkey_id: 'HK-011', key: 'alt+m',  label: 'CUSTOMER',    action: 'open_customer_search', variant: 'default',  visible: false, order: 11, enabled: true, condition: 'always' },
];

export function useHotkeyMask(trnType: number): HotkeyMask[] {
  // TODO: replace with useQuery(['hotkey-mask', trnType], ...)
  return useMemo(() => DEFAULT_HOTKEY_MASK, [trnType]);
}
