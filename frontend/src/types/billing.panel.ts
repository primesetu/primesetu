// RULE-016: Zone C layout is driven by PanelMask, not JSX.

export type PanelSectionType = 'customer' | 'cart_summary' | 'payment_actions';

export interface CustomerFieldMask {
  field_key:  string;           // 'name' | 'code' | 'loyalty_pts' | 'outstanding' | 'last_visit'
  label:      string;
  visible:    boolean;
  order:      number;
  highlight_if_nonzero?: boolean;  // outstanding > 0 → amber
  format?:    'currency' | 'points' | 'date' | 'text';
  dim_if_zero?: boolean;
}

export interface SummaryLineMask {
  line_key:    string;          // 'gross' | 'item_discount' | 'bill_discount' | 'tax' | 'roundoff' | 'net'
  label:       string;
  visible:     boolean;
  order:       number;
  is_total:    boolean;         // true → renders as TOTAL line (large, bold, bordered)
  sign?:       '+' | '-';      // for discount/deduction lines
  format:      'currency' | 'number';
  dim_if_zero?: boolean;       // hide visually when value is 0
}

export interface PaymentButtonMask {
  btn_key:    string;           // 'cash' | 'upi' | 'card' | 'credit'
  label:      string;
  visible:    boolean;
  order:      number;
  hotkey?:    string;           // 'F8' etc.
  variant:    'primary' | 'default';
  condition?: 'always' | 'customer_has_credit'; // show condition
}

export interface ZoneCMask {
  customer_fields:  CustomerFieldMask[];
  summary_lines:    SummaryLineMask[];
  payment_buttons:  PaymentButtonMask[];
}
