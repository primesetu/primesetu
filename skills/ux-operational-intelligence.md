/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Skill: ux-operational-intelligence
 * ============================================================ */

# SKILL: Operational Intelligence & Predictive UX

This skill defines the visual and logical patterns for "Phase 5: Operational Intelligence." It governs how PrimeSetu visualizes foresight, node connectivity, and performance metrics.

---

## 1. PREDICTIVE STOCKOUT (Days of Cover - DoC)

The system must forecast when a SKU will reach zero stock based on historical sales velocity and current inventory levels.

### Visual Representation
- **High Risk (< 7 Days)**: `bg-rose-100 text-rose-600` badge + "Critical" label.
- **Medium Risk (7-14 Days)**: `bg-amber-100 text-amber-600` badge + "Watchlist" label.
- **Healthy (> 14 Days)**: `bg-emerald-100 text-emerald-600` badge + "Stable" label.

### Logic Pattern
```typescript
DaysOfCover = TotalStock / (AverageDailySales_30D || 1);
```
- If `AverageDailySales` is 0, default to a minimum velocity of 0.1 to avoid infinity.
- Always round to 1 decimal place (e.g., "4.2 Days").

---

## 2. HQ HEARTBEAT (Node Sync Pulse)

Sovereign Nodes must visualize their connectivity to the Head Office (HO) without using distracting "Loading" spinners.

### The "Pulse" Widget
- **Location**: Top Bar (Zone A) or Sidebar Footer.
- **Visual**: A small 8px breathing circle.
  - **Emerald Pulse**: Online & Fully Synched.
  - **Amber Pulse**: Online with Pending Queue (Syncing...).
  - **Rose Pulse**: Offline (Local Mode active).
- **Hover State**: Show tooltip with "Last Sync: 2m ago | 12 Vouchers Pending".

### Animation Rule
- Use `animate-pulse` for active syncing.
- Use `animate-none` for offline or idle states to reduce visual noise.

---

## 3. CASHIER PERFORMANCE (Scan Velocity)

Monitor operational efficiency to identify training needs or bottlenecks.

### Core Metrics
- **IPS (Items Per Second)**: Calculated from first scan to last scan in a bill.
- **Void Ratio**: Percentage of items scanned then removed.
- **Avg. Tender Time**: Seconds between F10 (Pay) and Finalize.

### Design Pattern
- Displayed in the **Manager Dashboard** using `Recharts` sparklines.
- Avoid showing these to the cashier during billing to prevent performance anxiety.

---

## 4. AUDIT VARIANCE RESOLUTION

Patterns for correcting book stock after a Physical Stock Audit (PSA).

- **Discrepancy Highlight**: Use `font-mono` with `+` (Emerald) or `-` (Rose) prefixes.
- **Voucher Action**: F10 on the Audit screen triggers an "Adjustment Journal."
- **Tally Bridge**: All adjustments must be tagged with `tally_sync_pending = true`.

---

**© 2026 AITDL Network · All Rights Reserved**
