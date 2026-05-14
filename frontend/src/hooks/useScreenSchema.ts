/**
 * useScreenSchema — SmritiScreen Engine hooks
 *
 * A complete set of data-driven UI hooks backed by the migrated
 * Shoper9 configuration tables. Zero hardcoding.
 *
 * All data comes from sovereign PostgreSQL (s9 schema):
 *   - acceptdisplaydtls   → screen field schemas
 *   - paymodeacceptdisplaydtls → payment extra fields
 *   - tillacceptdisplaydtls    → day-open/close forms
 *   - genlookup               → dropdown values
 */

import { useState, useEffect, useCallback } from 'react';
import { api, apiClient } from '@/api/client';

// ── Shared types ─────────────────────────────────────────────────────────────

export type FieldType =
  | 'text' | 'number' | 'float' | 'date' | 'boolean'
  | 'dropdown' | 'barcode' | 'readonly' | 'memo';

export interface SmritiField {
  field: string;
  headerName: string;
  type: FieldType;
  visible: boolean;
  mandatory: boolean;
  pos: number;
  width: number;
  lookupRecid: number | null;
  lookupName: string | null;
  placeholder: string;
  isExtension: boolean;
  isBold: boolean;
  colour: string | null;     // CSS hex e.g. "#1a2b3c"
  bgColour: string | null;
  custmTable: string | null;
  acptWidth: number | null;
  acptPos: number | null;
}

export interface PayField {
  field: string;
  paycode: string;
  headerName: string;
  type: FieldType;
  mandatory: boolean;
  pos: number;
  width: number;
  colour: string | null;
  bgColour: string | null;
  colMapped: boolean;
}

export interface TillField {
  index: number;
  headerName: string;
  type: FieldType;
  mandatory: boolean;
  pos: number;
  width: number;
  colour: string | null;
  bgColour: string | null;
}

export interface LookupOption {
  code: string;
  label: string;
  recid: number;
}

// ── Module-level caches ───────────────────────────────────────────────────────

const _schemaCache = new Map<string, SmritiField[]>();
const _captionCache = new Map<number, Record<string, string>>();
const _lookupCache = new Map<number | string, LookupOption[]>();
const _pending = new Map<string, Promise<any>>();

function _cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (!_pending.has(key)) {
    _pending.set(key, fetcher().finally(() => _pending.delete(key)));
  }
  return _pending.get(key) as Promise<T>;
}

// ── Hook 1: Screen Field Schema ───────────────────────────────────────────────

/**
 * useScreenSchema
 * Returns the full field schema for any S9 transaction type.
 * Backed by AcceptDisplayDtls — covers all 15+ screens.
 *
 * @param trntype  1000=ItemMaster, 2100=Sales, 2200=Purchase, 1100=GRN, etc.
 * @param mode     'display' (for browse grids) or 'entry' (for forms)
 */
export function useScreenSchema(
  trntype: number,
  mode: 'display' | 'entry' = 'display',
  enabled = true
) {
  const [fields, setFields] = useState<SmritiField[]>([]);
  const [recidMap, setRecidMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `schema_${trntype}_${mode}`;

  useEffect(() => {
    if (!enabled || !trntype) return;

    if (_schemaCache.has(cacheKey)) {
      setFields(_schemaCache.get(cacheKey)!);
      return;
    }

    setLoading(true);
    _cached(cacheKey, () =>
      apiClient.get(`/lookup/schema/fields?trntype=${trntype}&mode=${mode}`)
        .then(res => {
          const f = res.data?.fields || [];
          _schemaCache.set(cacheKey, f);
          return { fields: f, recidMap: res.data?.recidMap || {} };
        })
    )
      .then(({ fields: f, recidMap: rm }) => {
        setFields(f);
        setRecidMap(rm);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [trntype, mode, enabled]);

  /** AG Grid-compatible columnDefs from the schema */
  const toColumnDefs = useCallback((overrides: Record<string, any> = {}) => {
    return fields.map(f => ({
      colId:      f.field,
      field:      f.field,
      headerName: f.headerName,
      width:      f.width,
      hide:       !f.visible,
      cellStyle:  {
        ...(f.colour   ? { color: f.colour }            : {}),
        ...(f.bgColour ? { backgroundColor: f.bgColour } : {}),
        ...(f.isBold   ? { fontWeight: 'bold' }          : {}),
      },
      ...(overrides[f.field] || {}),
    }));
  }, [fields]);

  return { fields, recidMap, loading, error, toColumnDefs };
}


// ── Hook 2: Caption Map ───────────────────────────────────────────────────────

/**
 * useCaptions
 * Lightweight: returns columnname→caption map for a trntype.
 * Use this when you only need headers, not the full schema.
 */
export function useCaptions(trntype: number, enabled = true) {
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (_captionCache.has(trntype)) {
      setCaptions(_captionCache.get(trntype)!);
      return;
    }
    setLoading(true);
    _cached(`captions_${trntype}`, () =>
      apiClient.get(`/lookup/schema/captions?trntype=${trntype}`)
        .then(res => res.data as Record<string, string>)
    )
      .then(data => {
        _captionCache.set(trntype, data);
        setCaptions(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [trntype, enabled]);

  /** resolve(fieldName) → caption or fallback */
  const resolve = (field: string, fallback = field) =>
    captions[field.toLowerCase()] || fallback;

  return { captions, resolve, loading };
}


// ── Hook 3: Payment Mode Extra Fields ─────────────────────────────────────────

/**
 * usePayFields
 * Returns the extra capture fields for a given payment mode.
 * Backed by PaymodeAcceptDisplayDtls.
 *
 * CARD (2) → AuthCode, BankName, BatchNo
 * UPI  (4) → UTRNo, PhoneNo, UPIApp
 * etc.
 */
export function usePayFields(paymode: number | null, enabled = true) {
  const [fields, setFields] = useState<PayField[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || paymode === null) return;
    const key = `payfields_${paymode}`;
    setLoading(true);
    _cached(key, () =>
      apiClient.get(`/lookup/schema/payfields?paymode=${paymode}`)
        .then(res => (res.data?.fields || []) as PayField[])
    )
      .then(setFields)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [paymode, enabled]);

  return { fields, loading };
}

/** Fetch all payment modes' extra fields at once */
export function useAllPayFields(enabled = true) {
  const [grouped, setGrouped] = useState<Record<number, { label: string; fields: PayField[] }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    _cached('payfields_all', () =>
      apiClient.get('/lookup/schema/payfields')
        .then(res => res.data)
    )
      .then(setGrouped)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [enabled]);

  return { grouped, loading };
}


// ── Hook 4: Till Operation Fields ─────────────────────────────────────────────

/**
 * useTillFields
 * Returns field schema for cash till operations (Day Open / Close / Petty Cash).
 * Backed by TillAcceptDisplayDtls.
 */
export function useTillFields(tilltrntype: number | null, enabled = true) {
  const [fields, setFields] = useState<TillField[]>([]);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || tilltrntype === null) return;
    const key = `tillfields_${tilltrntype}`;
    setLoading(true);
    _cached(key, () =>
      apiClient.get(`/lookup/schema/tillfields?tilltrntype=${tilltrntype}`)
        .then(res => res.data)
    )
      .then((data: any) => {
        setFields(data?.fields || []);
        setLabel(data?.label || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tilltrntype, enabled]);

  return { fields, label, loading };
}


// ── Hook 5: Generic GenLookup Dropdown ───────────────────────────────────────

/**
 * useLookup
 * Returns code→label pairs from GenLookup for a given RecID or semantic name.
 * Cached module-level to prevent repeat fetches across components.
 */
export function useLookup(recidOrName: number | string, enabled = true) {
  const [options, setOptions] = useState<LookupOption[]>(
    () => _lookupCache.get(recidOrName) || []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (_lookupCache.has(recidOrName)) {
      setOptions(_lookupCache.get(recidOrName)!);
      return;
    }
    const endpoint = typeof recidOrName === 'number'
      ? `/lookup/${recidOrName}`
      : `/lookup/by-name/${recidOrName}`;
    const key = `lookup_${recidOrName}`;
    setLoading(true);
    _cached(key, () =>
      apiClient.get(endpoint).then(res => res.data as LookupOption[])
    )
      .then(data => {
        _lookupCache.set(recidOrName, data);
        setOptions(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [recidOrName, enabled]);

  /** Resolve a code → human-readable label */
  const resolve = (code: string | null | undefined): string => {
    if (!code) return '';
    return _lookupCache.get(recidOrName)?.find(o => o.code === code)?.label ?? code;
  };

  return { options, loading, resolve };
}


// ── Hook 6: TrnType Names ─────────────────────────────────────────────────────

export function useTrnTypeNames(enabled = true) {
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    _cached('trntype_names', () =>
      apiClient.get('/lookup/meta/trntypes').then(res => res.data)
    )
      .then(setNames)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [enabled]);

  return { names, loading };
}


// ── Convenience constant: well-known TrnType codes ────────────────────────────
export const TrnTypes = {
  ITEM_MASTER:   1000,
  GRN:           1100,
  STOCK_ISSUE:   1200,
  SALES_RETURN:  1300,
  PHYS_STOCK:    1400,
  PURCH_RETURN:  1500,
  SALES:         2100,
  PURCHASE:      2200,
  TRANSFER:      2300,
  PRICE_CHANGE:  2400,
  CUSTOMER:      3100,
  VENDOR:        4100,
  DAY_OPEN:      9100,
  DAY_CLOSE:     9200,
  PETTY_CASH:    9300,
} as const;
