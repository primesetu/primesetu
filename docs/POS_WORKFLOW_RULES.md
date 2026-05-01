# 🛒 SMRITI-OS POS & Billing Workflow Rules

## 📖 Objective
This document preserves the legacy Shoper 9 operational protocols extracted from the `Sales` documentation and translates them into mandatory UI/UX rules for SMRITI-OS frontend development. All transactional modules (specifically `BillingModule.tsx` / `TrnType 1300`) MUST adhere to these behaviors.

## 1. The Direct Entry Grid Protocol
The core of SMRITI-OS billing is the **Direct Entry Grid**. Cashier speed is the highest priority.
*   **Zero-Click Scanning**: The Barcode/SKU input field MUST auto-focus on component mount. Scanning a barcode should instantly add the item to the grid.
*   **LSQ (Least Saleable Quantity)**: By default, the `Qty` column MUST automatically prefill with `1` (or the catalogued LSQ) upon successful scan to prevent manual entry delays.
*   **Real-time Rate Resolution**: The `Rate` (Retail Price) must resolve instantly upon scan.

## 2. Multi-Price & Batch Interruptions
While speed is critical, the system MUST halt the user if operational ambiguity exists (as defined in `Batch_Billing_Items_details_grid.htm`):
*   **Multi-Price SKUs**: If a scanned item resolves to multiple active price points (e.g., an old batch vs. a new batch), the grid MUST block insertion and trigger a **Multi-Price Browse Modal**, forcing the cashier to select the specific price point.
*   **Batch & Grade Selection**: For items tracked by Batch/Grade, a selection window must be surfaced. The item cannot be added to the cart until the cashier explicitly selects the batch (based on `Mfg Date`, `Exp Date`, or `Current Stock`).
*   **Non-Saleable Locations**: If the backend reports that an item resides exclusively in a "Non-Saleable" location, the frontend MUST block the addition to the cart and display a clear error.

## 3. Keyboard Supremacy (Hotkeys)
SMRITI-OS is a "Mouse-Optional" system. We must maintain strict keyboard parity with Shoper 9 terminals:
*   `[F3]` or `[Ctrl+F]`: Jump focus back to the global Search/Barcode scanner input.
*   `[F10]`: Instantly trigger the Payment Settlement / Tender modal.
*   `[Esc]`: Suspend the current bill or close the active modal.
*   `[Up/Down Arrows]`: Navigate the `DataTable` grid rows.
*   `[Delete]` / `[Backspace]`: If a grid row is focused, remove the item from the cart.

## 4. UI Rendering (Grid Governance)
As established in `GRID_GOVERNANCE.md`, developers **cannot hardcode** the columns for the Billing grid. 
The columns (Item Code, Description, Qty, Disc, Net Value) are strictly governed by the PostgreSQL `AcceptDisplayDtls` table via `TrnType 1300` and hydrated using the `useGridMask` hook.

## 5. The End-to-End Cashier Workflow (Execution Logic)
Developers must ensure the application flows exactly through these 5 phases without requiring the cashier to use a mouse:

### Phase 1: Header Initialization
1. When the billing screen opens, the cursor defaults to the **Customer/Sales Staff** fields.
2. The cashier types a phone number or presses `Enter` to proceed as a Walk-In customer.

### Phase 2: Direct Entry Grid (Scanning)
1. Cursor auto-focuses to the Sovereign Search bar.
2. **Action:** Cashier scans a barcode.
3. **System Response:** Item drops into the `DataTable`. `Qty` is prefilled with `1` (LSQ). `Rate` (MRP) is locked in.
4. **Modifying Items:** Cashier presses `Up Arrow` to highlight the row, types a new quantity, and presses `Enter`.

### Phase 3: The Footer (Review)
1. As items are scanned, the Footer instantly recalculates.
2. The cashier visibly sees the `Gross Value`, `Total Discount`, `Sales Tax`, and `Net Amount Receivable`.

### Phase 4: Tender & Settlement
1. Cashier presses **`F10`** (or `F8` for multi-tender). A Payment Settlement Modal opens.
2. **Splitting Tenders:** Cashier can accept multiple forms (Cash, Credit Card, Gift Coupon).
3. **Suspending:** Pressing **`Esc`** suspends the bill and prompts: *"Retain Payment Details?"*, allowing the cashier to serve the next customer.

### Phase 5: Final Submission
1. Once `Amount Receivable` hits zero, cashier hits **`Enter`** (or Ok).
2. The bill is committed to PostgreSQL, invoice prints automatically, the grid clears, and the cursor returns to the top.

---
*Note: Any developer modifying `BillingModule.tsx` or related cart components must verify that their changes do not break these core operational pillars and workflows.*
