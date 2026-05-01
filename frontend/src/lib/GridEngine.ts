/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================
 *
 * GridEngine — Centralized AcceptDisplayDtls → AG-Grid ColDef Mapper
 *
 * This is the SINGLE institutional source of truth for how Shoper 9
 * field metadata maps to the SMRITI-OS AG-Grid column definitions.
 * No module should contain its own mapMaskToColDefs implementation.
 *
 * Architecture:
 *   AcceptDisplayDtls (DB) → /api/v1/config/legacy-mask/:trnType (API)
 *     → GridField[] (useGridMask hook) → buildColDefs() → ColDef[]
 *       → <DataTable columns={colDefs as any} />
 * ============================================================ */

import React from 'react';
import type { ColDef } from 'ag-grid-community';
import { formatCurrency } from '@/utils/currency';

export interface GridField {
  field: string;
  headerName: string;
  visible: boolean;
  editable: boolean;
  width: number;
  align: 'left' | 'right' | 'center';
  pos: number;
}

/**
 * Custom renderer override for a specific column.
 * Receives the full AG-Grid params object.
 */
export type CellRendererFn = (params: any) => React.ReactNode;

/**
 * Options for buildColDefs.
 */
export interface GridEngineOptions {
  /**
   * Override cell renderers for specific column names (case-insensitive match).
   * Key: lowercase field name (e.g. 'exp_date', 'received_now')
   * Value: custom React renderer function
   */
  overrides?: Record<string, CellRendererFn>;

  /**
   * Additional ColDef properties to merge onto specific fields.
   * Key: lowercase field name
   */
  colDefMerge?: Record<string, Partial<ColDef>>;
}

// ─── Master Field Mapping Dictionary ───────────────────────────────────────
//
// Maps every known Shoper 9 AcceptDisplayDtls ColumnName to the corresponding
// SMRITI-OS data model property. Case-insensitive key matching is applied.
//
// Format: shoper9ColumnName (lowercase) → dataPropertyName

const FIELD_MAP: Record<string, string> = {
  // Barcode / Item Code
  'barcode':           'code',
  'itemcode':          'code',
  'item_code':         'code',
  'stockno':           'code',
  'barcodevalue':      'code',

  // Item Description / Name
  'itemdescription':   'name',
  'description':       'name',
  'itemname':          'name',
  'itemdesc':          'name',
  'item_name':         'name',
  'nm':                'name',

  // Qty
  'qty':               'qty',
  'quantity':          'qty',
  'docqty':            'qty',
  'actqty':            'qty',

  // MRP / Rate (Paise)
  'mrp':               'mrp',
  'rate':              'mrp',
  'unitprice':         'mrp',
  'itemrate':          'mrp',
  'itemrate_paise':    'mrp',
  'mrp_paise':         'mrp',

  // Discount
  'discper':           'discount_per',
  'disc_per':          'discount_per',
  'discountper':       'discount_per',
  'discountpercent':   'discount_per',

  // Line Total / Net Value (Paise)
  'value':             'total',
  'netvalue':          'total',
  'itemvalue':         'total',
  'total':             'total',
  'net_value':         'total',

  // Staff / Sales Person
  'staff':             'staff',
  'salespersoncd':     'staff',
  'salesstaff':        'staff',
  'salesperid':        'staff',

  // Size
  'size':              'size',
  'sizecd':            'size',

  // Colour
  'colour':            'colour',
  'color':             'colour',
  'colourcd':          'colour',
  'colorcode':         'colour',

  // Style / Article
  'style':             'style',
  'articleno':         'style',
  'stylecode':         'style',
  'merchid':           'style',

  // GRN / PO Specific
  'unitcostpaise':     'unit_cost_paise',
  'costrate':          'unit_cost_paise',
  'unitcost':          'unit_cost_paise',

  'qtyordered':        'qty_ordered',
  'docqtyord':         'qty_ordered',
  'orderedqty':        'qty_ordered',

  'qtyreceived':       'qty_received',
  'actqtyrcvd':        'qty_received',
  'receivedqty':       'qty_received',

  'batchno':           'batch_no',
  'batchsrlno':        'batch_no',
  'batch_no':          'batch_no',

  'expdate':           'exp_date',
  'expirydt':          'exp_date',
  'exp_date':          'exp_date',
  'expirydate':        'exp_date',

  'mfgdate':           'mfg_date',
  'manufacturedt':     'mfg_date',
  'mfg_date':          'mfg_date',

  // Physical Stock / Audit
  'systemqty':         'system_qty',
  'physicalqty':       'physical_qty',
  'sys_qty':           'system_qty',
  'phy_qty':           'physical_qty',
  'variance':          'variance',
};

// ─── Currency Fields (display as ₹ formatted from paise) ───────────────────
const CURRENCY_FIELDS = new Set([
  'mrp', 'rate', 'unitprice', 'itemrate', 'value', 'netvalue', 'total',
  'itemvalue', 'net_value', 'unitcostpaise', 'costrate', 'unitcost'
]);

// ─── Quantity Fields (center-aligned, bold) ────────────────────────────────
const QTY_FIELDS = new Set([
  'qty', 'quantity', 'docqty', 'actqty', 'qtyordered', 'qtyreceived',
  'systemqty', 'physicalqty', 'variance'
]);

// ─── Description Fields (multi-line rich renderer) ─────────────────────────
const DESCRIPTION_FIELDS = new Set([
  'itemdescription', 'description', 'itemname', 'itemdesc', 'item_name', 'nm'
]);

/**
 * Maps a Shoper 9 field name to the SMRITI-OS data model property.
 * Falls back to the original field name if no mapping exists.
 */
function resolveDataKey(fieldName: string): string {
  return FIELD_MAP[fieldName.toLowerCase()] || fieldName;
}

/**
 * Builds a description/multi-line cell renderer for item name columns.
 */
function buildDescriptionRenderer() {
  return (params: any) => {
    const item = params.data;
    if (!item) return null;
    // Use the module-level React import — no dynamic require needed
    return React.createElement('div', { className: 'flex flex-col py-1.5 leading-tight' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-0.5' },
        React.createElement('span', { className: 'font-black text-on-surface uppercase text-[13px]' }, item.name),
        item.size && React.createElement('span', { className: 'text-[8px] font-black bg-surface-container border border-outline-variant px-1' }, item.size)
      ),
      React.createElement('div', { className: 'flex items-center gap-3 text-[10px] text-on-surface-variant' },
        item.code && React.createElement('span', { className: 'font-mono bg-surface-container-low px-1' }, item.code),
        item.style && React.createElement('span', { className: 'font-bold' }, `ART: ${item.style}`),
        (item.subclass1 || item.subclass2) && React.createElement('span', { className: 'italic' },
          `(${[item.subclass1, item.subclass2].filter(Boolean).join(' / ')})`
        )
      )
    );
  };
}

/**
 * Institutional AG-Grid ColDef builder from AcceptDisplayDtls GridField[].
 *
 * @param mask - GridField[] from useGridMask() / /api/v1/config/legacy-mask/:trnType
 * @param options - Optional renderer overrides and ColDef merge patches
 * @returns AG-Grid ColDef[] ready to pass to <DataTable columns={colDefs as any} />
 */
export function buildColDefs(
  mask: GridField[],
  options: GridEngineOptions = {}
): ColDef[] {
  const { overrides = {}, colDefMerge = {} } = options;

  return mask
    .filter(m => m.visible)
    .sort((a, b) => a.pos - b.pos)
    .map(m => {
      const fieldLower = m.field.toLowerCase();
      const dataKey = resolveDataKey(m.field);
      const isDescription = DESCRIPTION_FIELDS.has(fieldLower);
      const isCurrency = CURRENCY_FIELDS.has(fieldLower);
      const isQty = QTY_FIELDS.has(fieldLower);

      const col: ColDef = {
        headerName: m.headerName.toUpperCase(),
        field: dataKey,
        width: m.width || 120,
        sortable: true,
        resizable: true,
        cellClass: [
          'font-medium text-[13px] border-r border-outline-variant/20',
          isCurrency ? 'text-right font-mono'    : '',
          isQty      ? 'text-center font-black text-primary' : '',
          m.align === 'right' ? 'text-right' : '',
          m.align === 'center' ? 'text-center' : '',
        ].filter(Boolean).join(' '),
        headerClass: 'font-black text-[10px] tracking-widest bg-surface-container text-on-surface-variant uppercase',
      };

      // ── Value Getter: resolve paise-aware numeric data ──────────────────
      col.valueGetter = (params: any) => {
        const item = params.data;
        if (!item) return '';
        return item[dataKey] ?? item[m.field] ?? item[m.field.toLowerCase()] ?? '';
      };

      // ── Value Formatter: currency fields ────────────────────────────────
      if (isCurrency) {
        col.valueFormatter = (params: any) => {
          const val = params.value;
          if (val == null || val === '') return '—';
          return formatCurrency(Number(val));
        };
      }

      // ── Description Field: Rich Multi-Line Renderer ──────────────────────
      if (isDescription) {
        col.flex = 1;
        col.minWidth = 320;
        col.cellRenderer = buildDescriptionRenderer();
        col.valueGetter = undefined; // renderer gets full params.data
      }

      // ── Module Override: custom renderer from calling module ────────────
      const overrideKey = fieldLower;
      if (overrides[overrideKey]) {
        col.cellRenderer = overrides[overrideKey];
      }

      // ── ColDef Merge: additional AG-Grid props from module ──────────────
      if (colDefMerge[overrideKey]) {
        Object.assign(col, colDefMerge[overrideKey]);
      }

      return col;
    });
}
