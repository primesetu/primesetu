/**
 * SMRITI-OS — useClassDefaults Hook
 * ============================================================
 * Sovereign auto-populate engine for Item Master entry.
 *
 * When a user selects Brand (class1cd) × Category (class2cd),
 * this hook fetches all 7 inherited defaults from Class12combo
 * (81 sovereign S9 rows) and returns them ready to pre-fill
 * the item creation form.
 *
 * No hardcoding — all defaults derived from migrated S9 data.
 * ============================================================
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/api/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SizeOption {
  code: string;
  descr: string;
  is_pivotal: boolean;
  group_id: string | null;
  group_srl: number;
  ideal_ratio: number;
}

export interface LookupOption {
  code: string;
  descr: string;
}

export interface ClassDefaults {
  found: boolean;
  class1cd: string;
  class2cd: string;

  // ── The 7 Auto-Populate Fields ──────────────────────────────
  prod_tax_type:   string | null;   // → prodtaxtype in ItemMaster
  retail_markup:   number;           // → rtlmarkup %
  dealer_markup:   number;           // → dlrmarkup %
  pref_vendor:     string | null;    // → preferred vendor code
  batch_mode:      number;           // → batchapplicable (0/1)
  size_group:      string | null;    // → drives size grid display
  is_billable:     boolean;          // → isbillable flag

  // ── Extended Defaults ───────────────────────────────────────
  is_service:        boolean;
  is_consignment:    boolean;
  grade_applicable:  number;
  loc_applicable:    number;
  stop_sale_days:    number;
  batch_exp_format:  number | null;
  alt_vendors:       string[];

  // ── Pre-loaded dependent dropdowns ─────────────────────────
  size_options:      SizeOption[];
  subclass1_options: LookupOption[];
  subclass2_options: LookupOption[];

  hint?: string;
}

interface UseClassDefaultsReturn {
  defaults: ClassDefaults | null;
  isLoading: boolean;
  error: string | null;
  /** Call manually to refresh if class1cd/class2cd change outside state */
  refetch: () => void;
  /** Derived: does this combo use size grid? */
  hasSizeGrid: boolean;
  /** Derived: does this combo need batch/expiry tracking? */
  isBatchTracked: boolean;
}

// ── Module-level LRU cache (avoids re-fetching same combo) ────────────────────
const _cache = new Map<string, ClassDefaults>();
const CACHE_SIZE = 50;

function _cacheKey(class1: string, class2: string): string {
  return `${class1.trim().toUpperCase()}::${class2.trim().toUpperCase()}`;
}

function _putCache(key: string, val: ClassDefaults) {
  if (_cache.size >= CACHE_SIZE) {
    // Evict oldest entry
    const first = _cache.keys().next().value;
    if (first) _cache.delete(first);
  }
  _cache.set(key, val);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useClassDefaults(
  class1cd: string | null | undefined,
  class2cd: string | null | undefined
): UseClassDefaultsReturn {
  const [defaults, setDefaults] = useState<ClassDefaults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchDefaults = useCallback(async () => {
    const c1 = (class1cd || "").trim();
    const c2 = (class2cd || "").trim();

    if (!c1 || !c2) {
      setDefaults(null);
      return;
    }

    const key = _cacheKey(c1, c2);

    // Cache hit — instant return
    if (_cache.has(key)) {
      setDefaults(_cache.get(key)!);
      setError(null);
      return;
    }

    // Cancel any in-flight request for a previous combo
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/items/class-defaults", {
        params: { class1cd: c1, class2cd: c2 },
        signal: abortRef.current.signal,
      });

      const data: ClassDefaults = response.data;
      _putCache(key, data);
      setDefaults(data);
    } catch (err: any) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      const msg = err?.response?.data?.detail || "Failed to load class defaults";
      setError(msg);
      setDefaults(null);
    } finally {
      setIsLoading(false);
    }
  }, [class1cd, class2cd]);

  useEffect(() => {
    fetchDefaults();
    return () => abortRef.current?.abort();
  }, [fetchDefaults]);

  return {
    defaults,
    isLoading,
    error,
    refetch: fetchDefaults,
    hasSizeGrid: !!defaults?.size_group && (defaults?.size_options?.length ?? 0) > 0,
    isBatchTracked: (defaults?.batch_mode ?? 0) > 0,
  };
}


// ── Hook: Class1 list (all products) ─────────────────────────────────────────

export function useClass1List() {
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/items/class1list")
      .then((r) => setOptions(r.data || []))
      .catch(() => setOptions([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { options, isLoading };
}


// ── Hook: Class2 dependent dropdown ──────────────────────────────────────────

export function useClass2List(class1cd: string | null | undefined) {
  const [options, setOptions] = useState<LookupOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const c1 = (class1cd || "").trim();
    if (!c1) {
      setOptions([]);
      return;
    }
    setIsLoading(true);
    apiClient
      .get("/items/class2list", { params: { class1cd: c1 } })
      .then((r) => setOptions(r.data || []))
      .catch(() => setOptions([]))
      .finally(() => setIsLoading(false));
  }, [class1cd]);

  return { options, isLoading };
}


// ── Hook: Sizes for a combo ───────────────────────────────────────────────────

export function useSizeOptions(
  class1cd: string | null | undefined,
  class2cd: string | null | undefined
) {
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const c1 = (class1cd || "").trim();
    const c2 = (class2cd || "").trim();
    if (!c1 || !c2) {
      setSizes([]);
      return;
    }
    setIsLoading(true);
    apiClient
      .get("/items/sizes", { params: { class1cd: c1, class2cd: c2 } })
      .then((r) => setSizes(r.data || []))
      .catch(() => setSizes([]))
      .finally(() => setIsLoading(false));
  }, [class1cd, class2cd]);

  return { sizes, isLoading };
}


// ── Utility: apply defaults to a form state ──────────────────────────────────

/**
 * Helper to merge class defaults into an existing item form state.
 * Only fills fields that are currently empty/zero (respects manual overrides).
 *
 * Usage:
 *   const merged = applyClassDefaultsToForm(formState, defaults);
 */
export function applyClassDefaultsToForm<T extends Record<string, any>>(
  form: T,
  defaults: ClassDefaults | null
): T {
  if (!defaults || !defaults.found) return form;

  const updated: Record<string, any> = { ...form };

  if (!form.prodtaxtype && defaults.prod_tax_type) {
    updated.prodtaxtype = defaults.prod_tax_type;
  }
  if ((!form.rtlmarkup || form.rtlmarkup === 0) && defaults.retail_markup > 0) {
    updated.rtlmarkup = defaults.retail_markup;
  }
  if ((!form.dlrmarkup || form.dlrmarkup === 0) && defaults.dealer_markup > 0) {
    updated.dlrmarkup = defaults.dealer_markup;
  }
  if (!form.prefvendorid && defaults.pref_vendor) {
    updated.prefvendorid = defaults.pref_vendor;
  }
  if (form.batchapplicable === undefined || form.batchapplicable === null) {
    updated.batchapplicable = defaults.batch_mode;
  }
  if (form.gradeapplicable === undefined || form.gradeapplicable === null) {
    updated.gradeapplicable = defaults.grade_applicable;
  }
  if (form.locationapplicable === undefined || form.locationapplicable === null) {
    updated.locationapplicable = defaults.loc_applicable;
  }
  if (form.isbillable === undefined || form.isbillable === null) {
    updated.isbillable = defaults.is_billable;
  }
  if (form.isservice === undefined || form.isservice === null) {
    updated.isservice = defaults.is_service;
  }

  return updated as T;
}
