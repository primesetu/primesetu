/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

# High-Fidelity Schemes & Promotions Specification (Shoper9 Mapping)

This document details the complex promotional logic engine based on Shoper9 Sales Promotions.

## 1. Promo Application Modes
- **Auto Mode**: System automatically applies the highest priority promo. No cashier intervention.
- **Manual Mode**: Cashier can select from a list of applicable promos (useful for "Choice of Gift").

## 2. Offer Types
- **Item Level**: Percentage/Amount discount on specific SKUs.
- **Bill Level**: Discount on total bill value.
- **Buy X Get Y**: 
    - **Same**: Buy 2 Get 1 Free (same SKU).
    - **Different**: Buy a Suit, Get a Tie Free.
- **Price-Offs**: Temporary markdown of base price.

## 3. Sophisticated Logic
- **Priority Engine**: Promos have numeric priority. System resolves conflicts using this weight.
- **Mandatory vs Optional Free Items**: 
    - If mandatory, billing is blocked until the free item is scanned.
    - If optional, system warns but allows checkout.
- **Discount Priority**: Toggle between "Item Level First" vs "Bill Level First".
- **Combination Offers**: Discount applied only if items from multiple categories are present (e.g., 1 Top + 1 Bottom).

## 4. Operational Awareness
- **F6 Toggle**: Quick view of applied Item Level vs. Bill Level promos.
- **Last Piece Discount**: Special handling for end-of-range items.

---
*Derived from: temp_chm/Sales/*
