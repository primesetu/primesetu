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

# Walkthrough — Master Registry & Predictive Intelligence (Phases 4-5)

This walkthrough documents the technical implementation of the Sovereign Master Registry and the Predictive Analytics engine for PrimeSetu.

## 1. Unified Master Registry (Catalogue)
We consolidated disparate data entities into a unified interface.
- **Backend**: `catalogue.py` handles multi-entity search across `Product`, `Partner`, and `GeneralLookup`.
- **Relationship Matrix**: Behavioral insights are calculated dynamically in `/api/v1/catalogue/partners/{id}/matrix`.
- **UI**: `MasterRegistry.tsx` features a reactive side-panel for deep-data awareness.

## 2. Institutional Compliance (Tally Bridge)
A production-grade accounting integration was implemented.
- **Logic**: `integration.py` generates Tally-compliant XML sales vouchers.
- **Workflow**: Access via **Config Module > Corporate Bridge**.

## 3. Handheld Integration (PDT)
Bulk inventory management was modernized.
- **Engine**: A CSV-based PDT import engine was built to handle mass barcode audits.
- **UI**: Functional file-upload trigger in the Config module.

## 4. Predictive Intelligence
Introduced AI-governed forecasting.
- **Metric**: **Days of Cover (DOC)** calculated as `Current Stock / Average Daily Sales`.
- **Insight**: Predictive cards in the Management Dashboard provide stockout warnings and reorder suggestions.

## 5. Sovereign Multilingual
The OS now speaks 14 Indic languages.
- **Dictionary**: `i18n.ts` supports Hindi, Tamil, Marathi, and more.
- **Integration**: `useLanguage` hook powers the global sidebar labels.

## 6. Global Command Bar (Omnisearch)
A professional-grade navigation suite was added.
- **Shortcut**: `Ctrl+K` opens the Sovereign Command Bar.
- **Functionality**: Fuzzy search for modules and quick-action shortcuts (F1-F10).

## 7. Infrastructure Stability (Phase 6)
Resolved critical production runtime errors and established a stable hosting architecture.
- **Backend**: FastAPI migrated to **Render.com** (with Python 3.12.3 pinning and `render.yaml` orchestration).
- **Frontend**: Hosted on **Cloudflare Pages** with automated CI/CD.
- **Hydration Fix**: Completely removed `VitePWA` and un-registered legacy Service Workers to solve the persistent `Illegal constructor` error during React hydration.
- **Security Guard**: Added a robust `MessageChannel` polyfill in `index.html` to handle restricted browser environments (like PWAs or secure corporate proxies).

---

### Verification Checklist
- [x] Universal Search returns Items and Customers.
- [x] Tally XML passes basic tag verification.
- [x] PDT import processes 2-column CSV files.
- [x] DOC calculation updates after stock changes.
- [x] Sidebar labels update on language switch.
- [x] Command Bar jump works for all 6 modules.
- [x] Production Dashboard loads without "Illegal constructor" error.
- [x] Cross-origin requests succeed between Cloudflare and Render.
