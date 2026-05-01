/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================
 *
 * useGridMask — Institutional Hook for AcceptDisplayDtls Grid Masks
 *
 * This hook is the ONLY sanctioned way for any module to obtain
 * AG-Grid column definitions derived from AcceptDisplayDtls.
 *
 * It fetches the raw mask from the backend, passes it through
 * GridEngine.buildColDefs(), and returns ready-to-use ColDef[].
 *
 * Usage:
 *   const { colDefs, loading } = useGridMask(1300); // 1300 = Sales Bill
 *   <DataTable data={rows} columns={colDefs as any} loading={loading} />
 *
 * TrnType Registry:
 *   1100 → GRN (Purchase Inward)
 *   1110 → Purchase Return
 *   1200 → Stock Transfer Out
 *   1210 → Stock Transfer In
 *   1300 → Sales Bill (Billing Terminal)
 *   1310 → Sales Return
 *   1400 → Purchase Order
 *   1500 → Physical Stock / Inventory Audit
 * ============================================================ */

import { useState, useEffect, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { apiClient } from '@/api/client';
import { buildColDefs, type GridField, type GridEngineOptions } from '@/lib/GridEngine';

interface UseGridMaskResult {
  /** Ready-to-use AG-Grid ColDef[]. Cast to 'any' for DataTable: columns={colDefs as any} */
  colDefs: ColDef[];
  /** Raw GridField[] from the backend — only use if you need deep overrides */
  rawMask: GridField[];
  loading: boolean;
  error: string | null;
}

// In-memory cache: avoids repeated API calls for the same TrnType
// within the same browser session
const maskCache = new Map<number, GridField[]>();

/**
 * Fetches and transforms the AcceptDisplayDtls mask for a given transaction type
 * into ready-to-use AG-Grid column definitions.
 *
 * @param trnType - Shoper 9 Transaction Type (1100, 1300, 1400, etc.)
 * @param options - Optional GridEngine options for renderer overrides
 */
export function useGridMask(trnType: number, options?: GridEngineOptions): UseGridMaskResult {
  const [rawMask, setRawMask] = useState<GridField[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!trnType) return;

    // Return cached mask immediately
    if (maskCache.has(trnType)) {
      setRawMask(maskCache.get(trnType)!);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchMask() {
      try {
        setLoading(true);
        const response = await apiClient.get<GridField[]>(`/api/v1/config/legacy-mask/${trnType}`);
        const data = Array.isArray(response.data) ? response.data : [];
        maskCache.set(trnType, data);
        if (!cancelled) {
          setRawMask(data);
          setError(null);
        }
      } catch (err: any) {
        console.warn(`[GridEngine] Mask fetch failed for TrnType ${trnType}:`, err?.message);
        if (!cancelled) {
          setError(err.message || 'Mask fetch failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMask();
    return () => { cancelled = true; };
  }, [trnType]);

  // Rebuild ColDefs whenever rawMask or options change
  // options is intentionally excluded from deps — callers should memoize it
  const colDefs = useMemo(
    () => buildColDefs(rawMask, options ?? {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawMask]
  );

  return { colDefs, rawMask, loading, error };
}

/** Clear the in-memory mask cache (use after store settings change) */
export function invalidateGridMaskCache(trnType?: number) {
  if (trnType) {
    maskCache.delete(trnType);
  } else {
    maskCache.clear();
  }
}
