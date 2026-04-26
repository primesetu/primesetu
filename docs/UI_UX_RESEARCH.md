# PrimeSetu "Sovereign Classic" UI/UX Analysis & Plan

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

This document outlines the research and implementation strategy for the PrimeSetu Retail OS, specifically focusing on achieving **Institutional Parity** with Tally Shoper 9 while maintaining a premium, modern aesthetic.

## 1. Visual Language Research (Shoper 9)

Shoper 9 (and Tally in general) prioritizes **density** and **keyboard efficiency** over visual whitespace. The "Sovereign Classic" design system bridges this with modern "Glassmorphism" and "Sleek ERP" aesthetics.

### Key Visual Pillars:
1.  **High Information Density**: Minimizing padding to show maximum data points (SKUs, batches, prices) without scrolling.
2.  **The "Gateway" Hierarchy**: Grouping 50+ features into 5-6 core logical domains (POS, WAREHOUSE, FINANCE, HO, SYSTEM).
3.  **Visual Depth**: Using dark backgrounds (Navy) for navigation and light backgrounds (Cream) for data entry to reduce eye strain during 12-hour retail shifts.
4.  **Action Persistence**: Function keys (F1-F12) must always be visible or easily accessible via a persistent button bar.

---

## 2. Component Mapping & Tokens

| Shoper 9 Element | PrimeSetu Component | Styling Token |
| :--- | :--- | :--- |
| **Main Menu** | `Sidebar.tsx` | `var(--navy)` background, `var(--gold)` icons. |
| **Active Screen Header** | `TopBar.tsx` | `font-serif` (Playfair Display) for the title. |
| **Button Bar** | `FunctionBar.tsx` | Vertical floating bar or bottom fixed bar. |
| **Data Grid** | `ShoperGrid.tsx` | Zebra striping, `tbl-header` (all caps, wide tracking). |
| **Input Fields** | `finput` utility | `var(--cream)` background, `focus:border-saffron`. |

---

## 3. Implementation Roadmap

### Phase 1: Navigation & Layout (COMPLETED)
- [x] **Design Tokens**: Overhauled `index.css` with the Shoper 9 palette.
- [x] **Registry Categorization**: Assigned categories (POS, FINANCE, etc.) to all modules.
- [x] **Sidebar Logic**: Implemented grouped navigation with role-based visibility.

### Phase 2: Core Module Modernization (IN PROGRESS)
- [x] **Dashboard**: Updated to use `shoper-card` and `shoper-panel` structures.
- [ ] **Billing (POS)**: Refactor the fullscreen mode to include the right-hand F-Key bar.
- [ ] **Item Master**: Implement a high-density grid for SKU management with "Filter-as-you-type".

### Phase 3: Institutional Polish (PLANNED)
- [ ] **Shortcut Guard**: Global listener to prevent `Ctrl+W` or `Alt+F4` from accidental exits.
- [ ] **Thermal Print Engine**: Fine-tuning the receipt layout for 80mm thermal printers.
- [ ] **Tally-style Search**: Implementing a "Go To" modal (Alt+G) that searches across all menus.
