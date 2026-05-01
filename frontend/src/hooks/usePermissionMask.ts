import { useMemo } from 'react';
import type { PermissionMask } from '@/types/billing.permissions';

export const DEFAULT_PERMISSION_MASK: PermissionMask[] = [
  { action: 'discount_exceeds_limit', requires_pin: true,  pin_role: 'manager',    log_to_audit: true,  block_if_denied: true  },
  { action: 'void_bill',              requires_pin: true,  pin_role: 'manager',    log_to_audit: true,  block_if_denied: true  },
  { action: 'void_line',              requires_pin: true,  pin_role: 'supervisor', log_to_audit: true,  block_if_denied: true  },
  { action: 'price_override',         requires_pin: true,  pin_role: 'owner',      log_to_audit: true,  block_if_denied: true  },
  { action: 'credit_bill',            requires_pin: false, pin_role: 'supervisor', log_to_audit: true,  block_if_denied: false },
  { action: 'reopen_closed_bill',     requires_pin: true,  pin_role: 'owner',      log_to_audit: true,  block_if_denied: true  },
  { action: 'suspend_with_discount',  requires_pin: false, pin_role: 'manager',    log_to_audit: false, block_if_denied: false },
];

export function usePermissionMask(trnType: number): PermissionMask[] {
  // TODO: replace with useQuery(['permission-mask', trnType], ...)
  return useMemo(() => DEFAULT_PERMISSION_MASK, [trnType]);
}
