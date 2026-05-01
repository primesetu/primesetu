// RULE-021: Validation rules are metadata, not code.
// The UI reads these from DB and enforces them. It never invents them.

export type ValidationSeverity = 'error' | 'warn' | 'info';

export type ValidationTrigger =
  | 'on_barcode_resolve'   // fires after item is fetched
  | 'on_qty_change'        // fires on every qty keystroke
  | 'on_item_add'          // fires before item enters cart
  | 'on_bill_settle'       // fires when F8 is pressed
  | 'on_discount_apply';   // fires when disc% changes

export type ValidationRule = {
  rule_id:    string;
  trigger:    ValidationTrigger;
  field_key?: string;              // which field this rule targets (optional)
  severity:   ValidationSeverity;
  condition:  ValidationCondition;
  message:    string;              // shown to cashier verbatim
  block:      boolean;            // true = hard stop, false = warn and allow
};

export type ValidationCondition =
  | { type: 'qty_exceeds_stock' }
  | { type: 'qty_below_min';        min: number }
  | { type: 'disc_exceeds_max';     max_per: number }
  | { type: 'mrp_zero' }
  | { type: 'credit_requires_customer' }
  | { type: 'gst_rate_missing' }
  | { type: 'stock_zero' }
  | { type: 'cart_empty' };

export interface ValidationResult {
  rule_id:   string;
  severity:  ValidationSeverity;
  message:   string;
  block:     boolean;
  field_key?: string;
}
