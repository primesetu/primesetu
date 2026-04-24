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

# High-Fidelity Reports & Analytics Specification (Shoper9 Mapping)

This document details the retail intelligence requirements based on Shoper9 MIS & Reports.

## 1. Sales Intelligence (The "Daily Book")
- **Daily Sales Book**: Comprehensive log of every transaction with payment mode split.
- **Sales Analysis**: Multi-dimensional reporting by Brand, Category, and Style.
- **Monthly Comparison**: Year-over-Year (YoY) and Month-over-Month (MoM) velocity tracking.
- **Top Selling Items**: Identification of high-velocity SKUs for reordering.

## 2. Inventory Intelligence
- **Stock Aging**: Identification of slow-moving vs. dead stock (Sovereign AI can predict clearance timelines).
- **Stock Across Chain**: Real-time visibility of stock in other network nodes (Essential for inter-store transfers).
- **Stock Movement**: Traceability of every item from GI (Inward) to Final Bill.

## 3. Financial & Compliance
- **Gross Margin Report**: Profitability analysis at the item and bill level.
- **Tax Registers**: GST-ready reports (Sales/Purchase registers) for filing.
- **Tally Integration**: Automated XML export for Tally.ERP 9 / TallyPrime (Mapped from `AR_Reports_with_Tally.htm`).

## 4. Operational Governance (The "Shadow Audit")
- **Void/Cancelled Bills**: Log of every deleted or voided transaction with "Reason Codes".
- **Bill Reprint Report**: Tracking of potential fraud (Excessive reprints of the same bill).
- **Till Status**: End-of-shift cash reconciliation per cashier/counter.

## 5. High-Aesthetic Visualization (PrimeSetu Exclusive)
While Shoper9 provides tabular data, PrimeSetu translates these into:
- **Matrix Insights**: Predictive days-of-cover.
- **Heatmaps**: Store traffic vs. sales conversion.
- **Trend Lines**: Visualizing SKU velocity over time.

---
*Derived from: temp_chm/Reports/*
