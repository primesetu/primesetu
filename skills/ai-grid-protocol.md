# Institutional Metadata Protocol (Rule-016) — SMRITI-OS Standard
> Version: 2.0.0 | Effective: 2026-05-01
> Status: MANDATORY | Governance: Institutional (Phase 2)

## 🔴 THE GOLDEN RULE
**"Tabular data is metadata, not code."**
Every data grid in SMRITI-OS MUST be driven by the `AcceptDisplayDtls` table. Hardcoding column definitions in React components is strictly FORBIDDEN.

---

## 1. ARCHITECTURAL FLOW
1. **Database**: `public.acceptdisplaydtls` stores `trn_type`, `field`, `headerName`, `width`, `visible`, `editable`, `align`, and `pos`.
2. **Backend**: `GET /api/configuration/legacy-mask/{trn_type}` returns the sorted mask.
3. **Frontend Hook**: `useGridMask(trn_type)` fetches and provides the `mask` array.
4. **Implementation**: The `DataTable` component maps this mask to AG Grid `ColDef`.

---

## 2. TRN_TYPE REGISTRY
Common transaction types to use for `useGridMask()`:
- **1300**: Retail Billing / POS Cart
- **1100**: Goods Receipt Note (GRN)
- **1200**: Sales Return
- **1400**: Stock Transfer / Issue
- **1500**: Item Inquiry / Inventory Search
- **2000**: Customer Master / CRM

---

## 3. IMPLEMENTATION PATTERN (MANDATORY)

```tsx
// 1. Fetch Mask
const { mask, loading: maskLoading } = useGridMask(1300);

// 2. Generate Columns
const dynamicCols = useMemo(() => {
  return mask
    .filter(m => m.visible)
    .sort((a, b) => a.pos - b.pos)
    .map(m => ({
      header: m.headerName.toUpperCase(),
      field: m.field,
      width: m.width,
      editable: m.editable,
      align: m.align === 'right' ? 'right' : 'left',
      // Add custom accessors if needed for complex fields
      ...(m.field === 'total' && {
        accessor: (item: any) => formatCurrency(item.total)
      })
    }));
}, [mask]);

// 3. Render Grid
<DataTable 
  data={items}
  loading={maskLoading}
  columns={dynamicCols}
/>
```

---

## 4. AESTHETIC STANDARDS
- **Density**: 11px Labels / 14px Tabular Data.
- **Headers**: Uppercase, tracking-widest, bold.
- **Alignment**: 
  - Numbers/Currency: Right-aligned (`align: 'right'`).
  - Text/Names: Left-aligned.
  - Status/Codes: Center-aligned.
- **Interactivity**: 
  - Double-click to select/recall.
  - Keyboard navigation enabled (Tab/Arrow keys).

---

## 5. DIRECT ENTRY SYNC
When using a "Direct Entry Row" (Input bar) above a grid, it MUST share the same `grid-cols` layout as the `DataTable` columns to ensure vertical alignment.

---

## 6. ENFORCEMENT (AGENT-QA)
Any module containing an AG Grid instance without a corresponding `useGridMask` hook will be REJECTED with a **SCORE 0/10**.

*"Memory, Not Code."*
