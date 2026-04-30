# 🏛️ SMRITI-OS: AI DATA GRID PROTOCOL
> Version: 1.0.0 | Effective: 2026-04-30
> Status: MANDATORY · SOVEREIGN · NON-NEGOTIABLE

## 1. THE GOLDEN RULE
All tabular data, lists requiring industrial-grade processing, and audit ledgers MUST be rendered using the centralized `DataTable` (AG Grid Wrapper) component.

## 2. BANNED ELEMENTS
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` (Functional UI)
- `react-table` or other 3rd party grid libraries
- Manual `div`-based list rendering for operational data

## 3. EXCEPTIONS
- **Print Layouts**: Tax Invoices (A4/Thermal) may use legacy table structures for fixed position precision.
- **Micro-Feeds**: Dashboard activity feeds (if < 10 items) may use simple cards.

## 4. IMPLEMENTATION STANDARDS
- **Keyboard Parity**: Every grid must support arrow key navigation.
- **Theme Awareness**: Use `ag-theme-quartz` with Sovereign UI overrides.
- **Vedic Speed**: Large datasets (> 100 rows) must use virtual scrolling (default in DataTable).

## 5. ENFORCEMENT
Any PR/Commit containing legacy table structures in functional modules will be REJECTED by AGENT-QA.
