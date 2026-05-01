// RULE-022: Hotkey bindings are metadata. The UI registers them, never defines them.

export type HotkeyVariant = 'default' | 'primary' | 'danger';

export type HotkeyAction =
  | 'new_bill'
  | 'suspend_bill'
  | 'recall_bill'
  | 'settle_bill'
  | 'exact_cash'
  | 'open_discount'
  | 'open_addons'
  | 'open_item_search'
  | 'open_customer_search'
  | 'focus_barcode'
  | 'focus_qty'
  | 'delete_last_item'
  | 'void_bill';

export interface HotkeyMask {
  hotkey_id:  string;          // 'HK-001'
  key:        string;          // 'f8' | 'f2' | 'ctrl+4' | 'alt+m'
  label:      string;          // 'SETTLE BILL'
  action:     HotkeyAction;
  variant:    HotkeyVariant;
  visible:    boolean;         // show in footer bar?
  order:      number;          // footer bar position
  enabled:    boolean;
  condition?: 'always' | 'cart_non_empty' | 'item_selected'; // when active
}
