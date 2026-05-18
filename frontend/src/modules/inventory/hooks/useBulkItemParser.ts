// ============================================================
// SMRITI-OS — useBulkItemParser
// Zero Cloud . Sovereign . AI-Governed
// ============================================================
// System Architect : Jawahar R Mallah
// Organisation     : AITDL Network
// (c) 2026 - All Rights Reserved
//
// Purpose:
//   1. Fetches Sysparam-driven ItemMaster field config from backend
//   2. Parses tab-separated Excel clipboard data into typed item payloads
//   3. Submits to /api/v1/items/bulk-import (5-step atomic pipeline)
//   4. Returns progress, validation errors, and pipeline summary
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/api/client';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface AnalcodeField {
  column: string;
  caption: string;
  enabled: boolean;
  genlookup_recid: number;
  type: string;
  max_len: number;
}

export interface FieldDef {
  column: string;
  caption: string;
  type: string;
  max_len?: number;
  genlookup_recid?: number;
  enabled?: boolean;
}

export interface ItemFieldConfig {
  captions: Record<string, string>;
  enabled: Record<string, boolean>;
  analcode_recids: Record<number, number>;
  analcode_captions: Record<number, string>;
  analcode_enabled: Record<number, boolean>;
}

export interface BulkImportTemplate {
  required_fields: FieldDef[];
  optional_fields: FieldDef[];
  classification_fields: FieldDef[];
  analcode_fields: AnalcodeField[];
}

export interface BulkImportTemplateResponse {
  template: BulkImportTemplate;
  sysparam_config: ItemFieldConfig;
  pipeline_info: {
    max_batch_size: number;
    endpoint: string;
    method: string;
    content_type: string;
    note: string;
  };
}

export interface ParsedItem {
  [key: string]: string | number | boolean | null;
}

export interface ParseError {
  row: number;
  column: string;
  message: string;
}

export interface BulkImportResult {
  status: string;
  items_inserted: number;
  items_skipped: number;
  items_errored: number;
  genlookup_inserted: number;
  combo_inserted: number;
  stock_rows_init: number;
  errors: Array<{ stockno: string; error: string }>;
}

export interface UseBulkItemParserState {
  isLoadingConfig:   boolean;
  isSubmitting:      boolean;
  config:            ItemFieldConfig | null;
  template:          BulkImportTemplate | null;
  parsedItems:       ParsedItem[];
  parseErrors:       ParseError[];
  importResult:      BulkImportResult | null;
  progress:          number;   // 0-100
  error:             string | null;
}

// ──────────────────────────────────────────────────────────────
// Column Header → DB Column Name Resolver
// ──────────────────────────────────────────────────────────────

/**
 * Builds a reverse map: "Product" → "class1cd", "Fibre" → "analcode1", etc.
 * Case-insensitive. Uses Sysparam captions for dynamic label matching.
 */
function buildCaptionToColumnMap(tmpl: BulkImportTemplate): Record<string, string> {
  const map: Record<string, string> = {};
  const addField = (f: FieldDef) => {
    if (f.caption) map[f.caption.toLowerCase().trim()] = f.column;
    if (f.column)  map[f.column.toLowerCase().trim()]  = f.column; // allow raw column name too
  };

  tmpl.required_fields.forEach(addField);
  tmpl.optional_fields.forEach(addField);
  tmpl.classification_fields.forEach(addField);
  tmpl.analcode_fields.forEach(addField);

  // Static aliases (Shoper 9 grid captions from screenshot)
  const staticAliases: Record<string, string> = {
    'stock no':        'stockno',
    'stockno':         'stockno',
    'brand':           'class2cd',
    'product':         'class1cd',
    'item description':'itemdesc',
    'item desc':       'itemdesc',
    'retail price':    'retail_price',
    'dealer price':    'dealer_price',
    'cost price':      'currentcost',
    'last purc.price': 'lastpurchprice',
    'last purc price': 'lastpurchprice',
    'product tax':     'prodtaxtype',
    'source tax':      'srctaxtype',
    'final mrp':       'finalmrp',
    'l.s.q':           'leastsalableqty',
    'lsq':             'leastsalableqty',
    'image id':        'imageid',
    'imageid':         'imageid',
    'inventory (y/n)': 'isinventoryitem',
    'tax incl (y/n)':  'isrptaxinclusive',
    'billable (y/n)':  'isbillable',
    'service (y/n)':   'isservice',
    'regular item':    'regularind',
    'hsn code':        'analcode32',
    'hsn':             'analcode32',
    'department':      'superclass1',
    'buyer':           'superclass2',
    'style':           'subclass1cd',
    'shade':           'subclass2cd',
    'color':           'subclass2cd',
    'size':            'sizecd',

    // --- Custom Excel Template Aliases (ITEM MASTER TT NEW) ---
    // Row 0 aliases
    'superclass1.1':   'superclass2',
    'class1':          'class1cd',
    'class2':          'class2cd',
    'subclass1':       'subclass1cd',
    'decr':            'itemdesc',
    'ac1':             'analcode1',
    'ac2':             'analcode2',
    'ac3':             'analcode3',
    'ac4':             'analcode4',
    'ac5':             'analcode5',
    'subclass2':       'subclass2cd',
    'ac6':             'analcode6',
    'ac7':             'analcode7',
    'costprice':       'currentcost',
    'retailprice':     'retail_price',
    'producttax':      'prodtaxtype',
    'ac31':            'analcode31', // Sometimes HSN is mapped here
    
    // Row 1 aliases
    'barcode no':           'stockno',
    'purchase class':       'superclass1',
    // 'department' is already mapped above
    'merchandise category': 'class1cd',
    'class':                'class2cd',
    'sub-class':            'subclass1cd',
    'item - discription':   'itemdesc',
    'heels':                'analcode1',
    'gender':               'analcode2',
    'uppper material':      'analcode3',
    'outsole':              'analcode4',
    'vendor code':          'analcode5',
    'product style code':   'subclass2cd',
    'brand name':           'analcode6',
    // 'cost price' is already mapped above
    'planned mrp':          'retail_price',
    // -----------------------------------------------------------
  };
  Object.assign(map, staticAliases);

  return map;
}

// ──────────────────────────────────────────────────────────────
// Type Coercion (Excel text → typed JSON value)
// ──────────────────────────────────────────────────────────────

function coerceValue(
  raw: string,
  fieldDef: FieldDef | undefined,
): string | number | boolean | null {
  if (!raw || raw.trim() === '') return null;
  const v = raw.trim();

  if (!fieldDef) return v; // unknown field → raw string

  switch (fieldDef.type) {
    case 'decimal':
      return parseFloat(v.replace(/,/g, '')) || 0;
    case 'integer':
      return parseInt(v, 10) || 0;
    case 'boolean': {
      const lower = v.toLowerCase();
      return ['y', 'yes', 'true', '1'].includes(lower);
    }
    default:
      // Truncate to max_len if specified
      return fieldDef.max_len ? v.slice(0, fieldDef.max_len) : v;
  }
}

// ──────────────────────────────────────────────────────────────
// TSV Parser (Tab-Separated Values from Excel clipboard)
// ──────────────────────────────────────────────────────────────

function parseTSV(
  tsv: string,
  captionMap: Record<string, string>,
  allFields: FieldDef[],
): { items: ParsedItem[]; errors: ParseError[] } {
  const fieldDefMap: Record<string, FieldDef> = {};
  allFields.forEach(f => { fieldDefMap[f.column] = f; });

  const lines = tsv
    .split(/\r?\n/)
    .map(l => l.trimEnd())
    .filter(l => l.length > 0);

  if (lines.length < 2) {
    return { items: [], errors: [{ row: 0, column: '', message: 'No data rows found after header.' }] };
  }

  // Row 0 = headers
  const rawHeaders = lines[0].split('\t');
  const columns = rawHeaders.map(h => captionMap[h.toLowerCase().trim()] || h.trim());

  const items: ParsedItem[] = [];
  const errors: ParseError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('\t');
    const item: ParsedItem = {};
    let hasData = false;

    columns.forEach((col, idx) => {
      const raw = cells[idx] ?? '';
      if (raw.trim()) hasData = true;
      item[col] = coerceValue(raw, fieldDefMap[col]);
    });

    if (!hasData) continue; // skip blank rows

    // Validate required fields
    if (!item['stockno']) {
      errors.push({ row: i + 1, column: 'stockno', message: 'StockNo is required' });
    }
    if (!item['class1cd']) {
      errors.push({ row: i + 1, column: 'class1cd', message: 'Product (class1cd) is required' });
    }
    if (!item['class2cd']) {
      errors.push({ row: i + 1, column: 'class2cd', message: 'Brand (class2cd) is required' });
    }

    items.push(item);
  }

  return { items, errors };
}

// ──────────────────────────────────────────────────────────────
// The Hook
// ──────────────────────────────────────────────────────────────

export function useBulkItemParser() {
  const [state, setState] = useState<UseBulkItemParserState>({
    isLoadingConfig: false,
    isSubmitting:    false,
    config:          null,
    template:        null,
    parsedItems:     [],
    parseErrors:     [],
    importResult:    null,
    progress:        0,
    error:           null,
  });

  const captionMapRef = useRef<Record<string, string>>({});
  const allFieldsRef  = useRef<FieldDef[]>([]);

  // ── 1. Load Sysparam-driven field config + template ──────────
  const loadConfig = useCallback(async () => {
    setState(s => ({ ...s, isLoadingConfig: true, error: null }));
    try {
      const res = await apiClient.get<BulkImportTemplateResponse>('/items/bulk-import/template');
      const data = res.data;

      const tmpl = data.template;
      const allFields: FieldDef[] = [
        ...tmpl.required_fields,
        ...tmpl.optional_fields,
        ...tmpl.classification_fields,
        ...tmpl.analcode_fields,
      ];

      captionMapRef.current = buildCaptionToColumnMap(tmpl);
      allFieldsRef.current  = allFields;

      setState(s => ({
        ...s,
        isLoadingConfig: false,
        config:          data.sysparam_config,
        template:        tmpl,
      }));
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Failed to load item config';
      setState(s => ({ ...s, isLoadingConfig: false, error: msg }));
    }
  }, []);

  // ── 2. Parse clipboard text (Tab-Separated from Excel) ───────
  const parseClipboard = useCallback((tsvText: string) => {
    if (!captionMapRef.current || !allFieldsRef.current.length) {
      setState(s => ({ ...s, error: 'Load config first before parsing.' }));
      return;
    }

    const { items, errors } = parseTSV(tsvText, captionMapRef.current, allFieldsRef.current);

    setState(s => ({
      ...s,
      parsedItems:  items,
      parseErrors:  errors,
      importResult: null,
      progress:     0,
      error: errors.length > 0 ? `${errors.length} validation error(s) found.` : null,
    }));
  }, []);

  // ── 3. Parse from paste event (onPaste handler) ──────────────
  const onPaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const text = (e as React.ClipboardEvent).clipboardData?.getData('text')
              ?? (e as ClipboardEvent).clipboardData?.getData('text')
              ?? '';
    if (text) parseClipboard(text);
  }, [parseClipboard]);

  // ── 4. Submit to backend bulk-import pipeline ─────────────────
  const submitImport = useCallback(async (customItems?: ParsedItem[]) => {
    const items = customItems ?? state.parsedItems;
    if (!items.length) {
      setState(s => ({ ...s, error: 'No items to import. Parse clipboard first.' }));
      return;
    }

    setState(s => ({ ...s, isSubmitting: true, progress: 10, error: null, importResult: null }));

    try {
      setState(s => ({ ...s, progress: 30 }));

      const res = await apiClient.post<BulkImportResult>('/items/bulk-import', items);

      setState(s => ({
        ...s,
        isSubmitting: false,
        progress:     100,
        importResult: res.data,
        error: res.data.items_errored > 0
          ? `${res.data.items_errored} item(s) had errors. Check importResult.errors.`
          : null,
      }));
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Bulk import failed';
      setState(s => ({ ...s, isSubmitting: false, progress: 0, error: msg }));
    }
  }, [state.parsedItems]);

  // ── 5. Reset ─────────────────────────────────────────────────
  const reset = useCallback(() => {
    setState(s => ({
      ...s,
      parsedItems:  [],
      parseErrors:  [],
      importResult: null,
      progress:     0,
      error:        null,
    }));
  }, []);

  return {
    ...state,
    loadConfig,
    parseClipboard,
    onPaste,
    submitImport,
    reset,
    /** All active columns (for grid header rendering) */
    activeColumns: allFieldsRef.current,
    /** Caption → DB column reverse map */
    captionMap: captionMapRef.current,
  };
}
