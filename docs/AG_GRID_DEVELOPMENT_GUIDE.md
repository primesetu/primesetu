# 📊 SMRITI-OS AG Grid Development & User Workflow

## 📖 Objective
This document outlines the standard operating procedure (SOP) for developers implementing `DataTable` (our wrapper for AG Grid) across SMRITI-OS, and defines the exact user experience (UX) expected by our cashiers and store managers.

## 🧑‍💻 1. Developer Implementation Workflow

Developers must adhere to this strict sequence when building any module that requires tabular data (Billing, Item Master, Inventory Audit, etc.).

### Step 1: The `useGridMask` Hook
Do **not** define `colDefs` manually. Always fetch the grid structure from the backend using the Transaction Type (`TrnType`), which queries the `AcceptDisplayDtls` legacy schema.
```tsx
import { useGridMask } from '@/hooks/useGridMask';

// Fetch configuration for TrnType 1300 (Billing)
const { colDefs, loading } = useGridMask(1300);
```

### Step 2: Injecting Custom Cell Renderers (Overrides)
If the user needs to interact with the grid (e.g., editing quantities, selecting batches), you must inject React components using the `overrides` parameter. This leaves the database in control of column width/visibility, but gives React control of the interactivity.
```tsx
const { colDefs } = useGridMask(1300, {
  overrides: {
    'qty': (params) => (
      <Input 
        type="number" 
        value={params.data.quantity} 
        onChange={(e) => updateCart(params.data.id, e.target.value)}
        autoFocus={params.node.rowIndex === 0} // Standardize focus on new items
      />
    )
  }
});
```

### Step 3: Rendering the `DataTable`
Render the Sovereign UI `DataTable`. Ensure you pass down necessary props for row selection or pagination if the module requires it.
```tsx
import { DataTable } from '@/components/ui/SovereignUI';

<DataTable 
  columns={colDefs as any} 
  data={cartItems} 
  loading={loading}
/>
```

---

## 👩‍💼 2. User Experience (UX) Workflow
SMRITI-OS users (especially Cashiers) expect a lightning-fast, keyboard-driven interface mirroring Shoper 9. Developers must ensure the `DataTable` implementation does not break these user workflows.

### A. The "Mouse-Free" Navigation Workflow
*   **Up/Down Arrows**: Users will use the keyboard arrows to move up and down the grid rows. If they highlight a row, they expect `Enter` to open that row for editing (if applicable).
*   **Tab Traversal**: Pressing `Tab` must move the focus horizontally across editable cells (e.g., from `Qty` to `Discount %`). It must not trap the focus inside the grid forever.
*   **Deletion**: Highlighting a row and pressing `Delete` or `Backspace` must immediately trigger a row removal (if the user has permission to delete items, like in the Billing Cart).

### B. The "Heavy Data" Workflow (Managers/Auditors)
For modules like **Item Master** or **Warehouse Dashboard**, store managers expect enterprise-grade data manipulation.
*   **Filtering**: Users expect to click the column header to apply Excel-like filtering (e.g., "Show me only SKUs starting with 'APP'").
*   **Sorting**: Clicking a column header must instantly sort the data ascending/descending.
*   **Data Export**: Users expect a right-click context menu (or a dedicated action button above the grid) to "Export to Excel/CSV", which AG Grid handles natively if configured.

### C. The "Interruption" Workflow (Errors & Warnings)
*   If a user types an invalid quantity (e.g., negative numbers in PO), the grid cell must instantly show a red error border (via SMRITI-OS design tokens: `border-status-error`).
*   The grid should never silently fail; invalid input inside a grid override must block the `F10` settlement action.

---
*Note: The `DataTable` component abstracts the complexity of AG Grid. Stick to the `useGridMask` pattern, and you will automatically inherit the correct theming, padding, and Shoper 9 architectural parity.*
