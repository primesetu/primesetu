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

# High-Fidelity Billing Specification (Shoper9 Mapping)

This document details the high-speed billing requirements derived from Shoper9 POS.

## 1. Core Billing Shortcuts (Operational Efficiency)
To match "Terminal Mode" speeds, PrimeSetu must support:
- **F7**: Exact Cash (Instant settlement for exact change).
- **F8**: Multi-mode Settlement (Split between cash/card/points).
- **F9**: Bill Summary / Recalculate (Taxes, Add-ons, Deductions).
- **Alt+C**: Customer Selection (Disabled in Credit Billing mode).
- **Alt+5**: Void current bill (Requires Manager override).
- **Alt+6**: Reprint last bill.

## 2. Advanced Logic Parameters
Mapped from `Billing_Configuration.htm`:
- **Rate Alteration**: Can be enabled/disabled per role. Default is disabled for POS operators.
- **Stock Validation**: 
    - **Stage**: Scan-time validation vs. Settlement-time validation.
    - **Action**: "Allow with warning" vs "Hard Block".
- **LSQ (Least Saleable Quantity)**: Force minimum quantity per SKU scan (e.g., minimum 1 pair of socks).
- **Bill Suspension**: Support for "Customer stepped away" scenario with unique Recall ID.

## 3. Financial Controls
- **Round-off Strategy**: User-defined round-off logic (Nearest 1.00, 0.50, etc.).
- **Tax Calculation**: Automated HSN-based GST application. Support for Tax-inclusive vs. Tax-exclusive pricing at the master level.

## 4. Sales Advice Slips (Pre-Billing)
Pre-billing staging area for high-volume periods (Staging items before reaching the cashier).

---
*Derived from: temp_chm/Sales/*
