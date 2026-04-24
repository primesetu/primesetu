/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

# High-Fidelity Inventory Specification (Shoper9 Mapping)

This document details the robust inventory management requirements based on Shoper9 Stock Management.

## 1. Goods Inwards (GI) & Outwards (GO)
- **Size-wise Grid**: Mandatory support for grid-based entry for apparel and footwear.
- **Transaction Types**:
    - **Purchase**: Vendor to Store.
    - **Transfer In/Out**: Store to Store (Inter-branch).
    - **Approval Receipt/Issue**: Temporary movement for customer trials.
- **Loading Mechanisms**:
    - **PT File**: Legacy text file format for bulk data.
    - **PDT (Portable Data Terminal)**: Direct import from handheld scanners.
- **Operational Shortcuts**:
    - `F4`: Delete Row.
    - `Ctrl+I`: Override MRP (Requires authorization).
    - `Ctrl+T`: Toggle between Item Description and Classification view.

## 2. Physical Stock Management (PSM) — The Governance Loop
The PSM workflow is a 6-step process for ensuring book-stock integrity.

| Phase | Description | PrimeSetu Strategy |
|-------|-------------|-------------------|
| **1. History** | View previous audit logs | Time-series audit tracking |
| **2. Commence** | Freeze book stock for audit | Snapshot-based stock freezing |
| **3. Record** | Capture physical counts | Barcode scanning + AI discrepancy detection |
| **4. Summary** | Progress tracking | Real-time "Gap" dashboard |
| **5. Loading** | Opening stock for new store | Bulk CSV/Excel importer |
| **6. Update** | Adjust computed to match physical | Auto-generation of Adjustment Vouchers |

## 3. Barcode Studio
- **Print Against Trans**: Automatic printing of labels during GI (Inwarding).
- **Design Layouts**: Support for standard (Laser) and Thermal printers.
- **Direct Scan Printing**: Scan an item to print a replacement label instantly.

## 4. Audit Trails
Sizewise audit trails for every stock movement (Who, When, What, Why).

---
*Derived from: temp_chm/Stock/*
