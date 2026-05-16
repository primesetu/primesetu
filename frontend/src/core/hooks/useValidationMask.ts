import { useMemo } from 'react';
import type { ValidationRule } from '@/types/billing.validation';

// DEFAULT VALIDATION MASK — mirrors all current inline alerts/checks.
// When DB returns rules for trnType 1300, this is overridden.
export const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  {
    rule_id:   'V-001',
    trigger:   'on_item_add',
    severity:  'error',
    condition: { type: 'stock_zero' },
    message:   'Item is out of stock. Cannot add to bill.',
    block:     true,
  },
  {
    rule_id:   'V-002',
    trigger:   'on_qty_change',
    severity:  'warn',
    condition: { type: 'qty_exceeds_stock' },
    message:   'Quantity exceeds available stock. Proceed with caution.',
    block:     false,
  },
  {
    rule_id:   'V-003',
    trigger:   'on_discount_apply',
    field_key: 'disc_per',
    severity:  'error',
    condition: { type: 'disc_exceeds_max', max_per: 30 },
    message:   'Discount exceeds maximum allowed (30%). Manager override required.',
    block:     true,
  },
  {
    rule_id:   'V-004',
    trigger:   'on_barcode_resolve',
    severity:  'error',
    condition: { type: 'mrp_zero' },
    message:   'MRP is zero. Item cannot be billed. Check Item Master.',
    block:     true,
  },
  {
    rule_id:   'V-005',
    trigger:   'on_barcode_resolve',
    severity:  'error',
    condition: { type: 'gst_rate_missing' },
    message:   'GST rate not configured for this item. Contact Admin.',
    block:     true,
  },
  {
    rule_id:   'V-006',
    trigger:   'on_bill_settle',
    severity:  'error',
    condition: { type: 'credit_requires_customer' },
    message:   'Customer selection is mandatory for Credit transactions.',
    block:     true,
  },
  {
    rule_id:   'V-007',
    trigger:   'on_bill_settle',
    severity:  'error',
    condition: { type: 'cart_empty' },
    message:   'Cannot settle an empty bill.',
    block:     true,
  },
  {
    rule_id:   'V-008',
    trigger:   'on_qty_change',
    severity:  'error',
    condition: { type: 'qty_below_min', min: 1 },
    message:   'Quantity cannot be less than 1.',
    block:     true,
  },
];

export function useValidationMask(trnType: number): ValidationRule[] {
  // TODO: replace with useQuery(['validation-mask', trnType], ...)
  return useMemo(() => DEFAULT_VALIDATION_RULES, [trnType]);
}
