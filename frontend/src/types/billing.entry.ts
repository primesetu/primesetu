export type EntryFieldType = 'barcode' | 'number' | 'select' | 'text' | 'lookup' | 'readonly';

export interface EntryFieldMask {
  field_key:     string;
  label:         string;
  type:          EntryFieldType;
  width_px?:     number;
  placeholder?:  string;
  required:      boolean;
  tab_order:     number;
  visible:       boolean;
  options?:      { label: string; value: string }[];
  min?:          number;
  max?:          number;
  default_value?: string | number;
  hint?:         string;
}

export type EntryPayload = Record<string, string | number>;
