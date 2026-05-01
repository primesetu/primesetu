// RULE-023: Every sensitive action requires a permission check.
// Permissions are never role-based. Always action-based.

export type OverrideAction =
  | 'discount_exceeds_limit'   // disc% > mask allowed max
  | 'void_bill'                // entire bill void
  | 'void_line'                // single line void
  | 'price_override'           // manual MRP edit
  | 'credit_bill'              // credit transaction
  | 'reopen_closed_bill'       // recall settled bill
  | 'suspend_with_discount';   // suspend a bill that has discounts

export interface PermissionMask {
  action:         OverrideAction;
  requires_pin:   boolean;       // false = just permission check, no PIN UI
  pin_role:       'manager' | 'owner' | 'supervisor';
  log_to_audit:   boolean;
  block_if_denied: boolean;
}

export interface OverrideRequest {
  action:      OverrideAction;
  context:     Record<string, string | number>;  // e.g. { disc_per: 45, item: 'SKU-001' }
  onApproved:  () => void;
  onDenied?:   () => void;
}

export interface OverrideSession {
  action:      OverrideAction;
  approved_by: string;          // manager code
  approved_at: string;          // ISO timestamp
  context:     Record<string, string | number>;
}
