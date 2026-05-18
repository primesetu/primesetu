# ==============================================================================
# SMRITI RETAIL OS — TANSTACK TABLE (REACT TABLE V8) INTEGRATION BLUEPRINT
# Technical Comparison, Architecture Patterns, and Production-Grade Grid Examples
# ==============================================================================

This document provides a highly optimized blueprint for replacing heavy AG Grid tables or building new high-performance grids in Smriti Retail OS using **TanStack Table v8**.

---

## 1. Deep Research: TanStack Table vs. AG Grid

For high-speed, local retail POS billing and administration terminals, TanStack Table offers massive advantages:

| Technical Metric | AG Grid (v33) | TanStack Table (v8) | Retail OS Impact |
| :--- | :--- | :--- | :--- |
| **Bundle Size** | ⚠️ ~1.1 MB (Very Heavy) | ✅ **~15 kB (Ultra-Lightweight)** | Faster startup & initial load on offline terminals. |
| **DOM Overhead** | ⚠️ Dom-Heavy (thousands of nested wrapper `div`s) | ✅ **Zero Headless DOM** (Renders native HTML `<table>`) | Extremely low memory footprint on entry-level POS PCs. |
| **Styling Freedom** | ❌ Complex CSS overriding (enforces proprietary themes) | ✅ **100% Absolute Control** (Use Vanilla CSS / HSL Tailored) | Fits our dynamic 2D premium design aesthetic perfectly. |
| **Feature Set** | ✅ Heavy enterprise charts, grouping, pivot. | ✅ Core essentials: Sorting, Filtering, Selection, Virtualization. | Ideal for standard tables (Item master, Company selector). |

**Verdict:** 
Use **TanStack Table** for all standard list grids (Company Selector Registry, System Parameters, Bill Listings, Master lookups) to keep the PWA fast, lightweight, and modern. Keep AG Grid only if highly complex analytical pivots or heavy hierarchical groupings are explicitly required by the operator.

---

## 2. Core Architecture: Headless Concept

TanStack Table is **headless**. It does not render any UI elements. Instead, it provides state management, helpers, and data processing utilities, and lets React build the actual DOM using standard HTML `<table>` elements.

```
       Data Source (JSON Array) + Column Defs
                      │
                      ▼
            useReactTable Hook (v8)
                      │
        (Sorting, Filtering, Pagination State)
                      │
                      ▼
       React Native DOM Rendering (Custom CSS)
  ┌──────────────────────────────────────────────┐
  │ <table> <thead> <tbody> <tr> <td> Elements  │
  └──────────────────────────────────────────────┘
```

---

## 3. Working React Example: Company Selector Registry Grid

Here is the exact production-ready React component implementing **TanStack Table v8** to display a list of registered database companies with dynamic searching, sorting, and premium status actions:

```javascript
// frontend/src/components/CompanyTable.jsx
import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import './CompanyTable.css'; // Premium Vanilla CSS

export default function CompanyTable({ data, onSelectCompany }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // 1. Column Definitions (Strict Types, Cell Formatters)
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Company Name',
        cell: (info) => (
          <div className="company-info-cell">
            <span className="company-name-txt">{info.getValue()}</span>
            <span className="company-id-sub">ID: {info.row.original.id.slice(0, 8)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'db_name',
        header: 'Database Catalog',
        cell: (info) => <code className="db-code-badge">{info.getValue()}</code>,
      },
      {
        accessorKey: 'db_size',
        header: 'Storage Size',
        cell: (info) => {
          const mb = info.getValue();
          return <span>{mb ? `${mb.toFixed(2)} MB` : 'Calculating...'}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'System Status',
        cell: (info) => {
          const status = info.getValue();
          const isOk = status === 'ACTIVE';
          return (
            <span className={`status-pill ${isOk ? 'status-active' : 'status-offline'}`}>
              {status}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Operational Control',
        cell: (info) => (
          <button
            onClick={() => onSelectCompany(info.row.original.db_name)}
            className="action-btn-primary"
          >
            Launch POS Console →
          </button>
        ),
      },
    ],
    [onSelectCompany]
  );

  // 2. Initialize Hook Table Instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="tanstack-table-container">
      {/* Search Input Bar */}
      <div className="table-search-wrapper">
        <input
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="🔍 Search company name or database catalog..."
          className="table-search-input"
        />
      </div>

      {/* Headless HTML Table */}
      <table className="custom-premium-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="table-header-cell"
                >
                  <div className="header-cell-content">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {/* Sort Icons Indicator */}
                    <span className="sort-icon-indicator">
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? ' ↕️'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="table-body-row">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="table-body-cell">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 4. Premium Vanilla CSS Stylesheet (`CompanyTable.css`)

Here is the custom, vibrant HSL stylesheet to render the table with professional, dynamic 2D aesthetics:

```css
/* Custom Styling for TanStack Table Integration */
.tanstack-table-container {
    background: rgba(30, 41, 59, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.table-search-wrapper {
    margin-bottom: 16px;
}

.table-search-input {
    width: 100%;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 12px 16px;
    color: #ffffff;
    font-size: 14px;
    outline: none;
    transition: all 0.3s ease;
}

.table-search-input:focus {
    border-color: #06b6d4; /* Vibrant Cyan border */
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
}

.custom-premium-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    text-align: left;
}

.table-header-cell {
    background: rgba(15, 23, 42, 0.8);
    color: #94a3b8;
    padding: 14px 16px;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    user-select: none;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    transition: background-color 0.2s ease;
}

.table-header-cell:hover {
    background: rgba(15, 23, 42, 0.95);
    color: #ffffff;
}

.header-cell-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.sort-icon-indicator {
    font-size: 10px;
    opacity: 0.6;
}

.table-body-row {
    background: transparent;
    transition: all 0.2s ease;
}

.table-body-row:hover {
    background: rgba(255, 255, 255, 0.03);
}

.table-body-cell {
    padding: 14px 16px;
    font-size: 14px;
    color: #e2e8f0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    vertical-align: middle;
}

/* Custom Column Sub-styles */
.company-info-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.company-name-txt {
    font-weight: 600;
    color: #ffffff;
}

.company-id-sub {
    font-size: 11px;
    color: #64748b;
}

.db-code-badge {
    background: rgba(6, 182, 212, 0.1);
    color: #22d3ee;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
}

.status-pill {
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    display: inline-block;
}

.status-active {
    background: rgba(34, 197, 94, 0.1);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-offline {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.action-btn-primary {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    color: #ffffff;
    font-weight: 600;
    font-size: 13px;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
}

.action-btn-primary:active {
    transform: translateY(0);
}
```
