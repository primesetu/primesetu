# SMRITI-OS Institutional Grid Governance Policy

## 🔒 Objective
To prevent structural degradation of the SMRITI-OS AG-Grid DataTables and to maintain exact functional and visual parity with the legacy Shoper 9 retail configurations defined in the backend `AcceptDisplayDtls` table.

## 📜 The "Zero-Hardcoding" Protocol
No developer is permitted to hardcode `columns` or field mappings directly within React components when using the `DataTable` component for transactional grids.

### ❌ **ILLEGAL PATTERN (BANNED)**
```tsx
// BANNED: Manual Column Definitions
<DataTable 
  data={items} 
  columns={[
    { header: "ITEM CODE", accessor: "sku" },
    { header: "QTY", accessor: "qty" }
  ]} 
/>
```

### ✅ **REQUIRED PATTERN (ENFORCED)**
```tsx
// REQUIRED: Institutional Grid Engine hook
import { useGridMask } from '@/hooks/useGridMask';

const { colDefs, loading } = useGridMask(1300); // 1300 = TrnType

<DataTable 
  data={items} 
  columns={colDefs as any}
  loading={loading}
/>
```

## 🛠️ Overriding Field Renderers
If a specific module requires custom editable inputs (e.g., Qty adjustment in Purchase Orders or Barcode scanning in GRN), you MUST use the `overrides` dictionary provided by `useGridMask` powered by the `GridEngine`. 

```tsx
const { colDefs } = useGridMask(1100, {
  overrides: {
    'physical_qty': (params) => (
      <Input type="number" onChange={...} value={params.data.physical_qty} />
    )
  }
});
```
This ensures the Column Header text, width, visibility, and data-key are governed by the Database, while only the specific Cell Renderer is intercepted by React.

## 🛑 ESLint Enforcement
This protocol is statically analyzed and enforced at commit time via ESLint AST validation in `eslint.config.js`. 
Any attempt to pass an `ArrayExpression` or an unapproved variable name to `DataTable columns={...}` will result in a **fatal linting error** (`[SMRITI-OS GRID POLICY]`).
