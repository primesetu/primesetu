/* ============================================================
 * SMRITI-OS — Universal Grid Engine
 * AppGrid: Schema-driven AG-Grid wrapper
 * v3.0 Architecture: "Build engines, not modules"
 * ============================================================ */
import React, { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';
import { Download, Plus, Trash2, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

// ── Types ───────────────────────────────────────────────────
export interface AppGridColumn {
  field: string;
  header: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'lookup';
  width?: number;
  editable?: boolean;
  required?: boolean;
  pinned?: 'left' | 'right';
  hide?: boolean;
  valueFormatter?: (val: any) => string;
}

export interface AppGridPermissions {
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
}

export interface AppGridProps {
  /** Unique ID for this grid instance */
  id: string;
  /** Column schema */
  columns: AppGridColumn[];
  /** Row data */
  data: any[];
  /** Called when a cell value changes */
  onRowChange?: (rowIndex: number, field: string, value: any, row: any) => void;
  /** Called when Add button clicked */
  onAdd?: () => void;
  /** Called with selected row IDs when Delete clicked */
  onDelete?: (selectedRows: any[]) => void;
  /** Permission set */
  permissions?: AppGridPermissions;
  /** Title shown above grid */
  title?: string;
  /** Placeholder text for search */
  searchPlaceholder?: string;
  /** Loading state */
  loading?: boolean;
  /** Height override (default: flex-1) */
  height?: string | number;
  /** Export filename prefix */
  exportFileName?: string;
}

// ── AppGrid Component ────────────────────────────────────────
export const AppGrid: React.FC<AppGridProps> = ({
  id,
  columns,
  data,
  onRowChange,
  onAdd,
  onDelete,
  permissions = { canCreate: true, canEdit: true, canDelete: true, canExport: true },
  title,
  searchPlaceholder = 'Search...',
  loading = false,
  height,
  exportFileName = 'smriti-export',
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const [search, setSearch] = React.useState('');
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);

  // ── Build AG-Grid ColDefs from AppGridColumn schema ──────
  const colDefs = useMemo<ColDef[]>(() => {
    const defs: ColDef[] = [
      {
        headerName: '#',
        valueGetter: (p) => (p.node?.rowIndex ?? 0) + 1,
        width: 52,
        pinned: 'left',
        editable: false,
        suppressMovable: true,
        cellStyle: {
          color: 'var(--text-secondary)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          textAlign: 'right',
        },
      },
    ];

    columns.forEach((col) => {
      if (col.hide) return;
      const def: ColDef = {
        field: col.field,
        headerName: col.header,
        width: col.width ?? 140,
        editable: permissions.canEdit && (col.editable !== false),
        pinned: col.pinned,
        filter: true,
        sortable: true,
        resizable: true,
        cellStyle: {
          fontFamily: col.type === 'number' ? 'var(--font-mono)' : 'var(--font-primary)',
          color: 'var(--text-primary)',
          fontSize: '13px',
        },
      };

      if (col.type === 'number') {
        def.type = 'numericColumn';
        def.cellStyle = {
          ...def.cellStyle as object,
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
        };
        if (col.valueFormatter) {
          def.valueFormatter = (p) => col.valueFormatter!(p.value);
        } else {
          def.valueFormatter = (p) =>
            p.value == null || isNaN(p.value) ? '' : Number(p.value).toLocaleString('en-IN');
        }
      }

      if (col.required) {
        def.cellStyle = (p) => ({
          ...(def.cellStyle as object),
          borderLeft: !p.value ? '2px solid var(--danger)' : undefined,
        });
      }

      defs.push(def);
    });

    return defs;
  }, [columns, permissions.canEdit]);

  // ── Grid ready ───────────────────────────────────────────
  const onGridReady = useCallback((e: GridReadyEvent) => {
    e.api.sizeColumnsToFit();
  }, []);

  // ── Cell value changed ───────────────────────────────────
  const onCellValueChanged = useCallback((e: CellValueChangedEvent) => {
    onRowChange?.(e.rowIndex ?? 0, e.colDef.field!, e.newValue, e.data);
  }, [onRowChange]);

  // ── Export to Excel ──────────────────────────────────────
  const handleExport = useCallback(() => {
    if (!permissions.canExport) return;
    const rows = data.map((row) => {
      const out: Record<string, any> = {};
      columns.forEach((c) => { out[c.header] = row[c.field] ?? ''; });
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${exportFileName}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [data, columns, permissions.canExport, exportFileName]);

  // ── Delete selected ──────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!permissions.canDelete || selectedRows.length === 0) return;
    if (confirm(`Delete ${selectedRows.length} selected row(s)?`)) {
      onDelete?.(selectedRows);
    }
  }, [selectedRows, permissions.canDelete, onDelete]);

  // ── Quick filter ─────────────────────────────────────────
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    gridRef.current?.api?.setGridOption('quickFilterText', e.target.value);
  }, []);

  // ── Default col def ──────────────────────────────────────
  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    editable: permissions.canEdit,
  }), [permissions.canEdit]);

  return (
    <div
      id={`app-grid-${id}`}
      className="flex flex-col h-full"
      style={{ fontFamily: 'var(--font-primary)' }}
    >
      {/* ── Toolbar ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border-default)',
          minHeight: 48,
        }}
      >
        {title && (
          <span
            className="font-semibold text-sm mr-2"
            style={{ color: 'var(--text-primary)', letterSpacing: '0.05em' }}
          >
            {title.toUpperCase()}
          </span>
        )}

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={13}
            className="absolute left-2 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
          />
          <input
            id={`app-grid-search-${id}`}
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            style={{
              paddingLeft: 26,
              fontSize: 12,
              height: 30,
              width: '100%',
              background: 'var(--surface-muted)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 0,
              outline: 'none',
            }}
          />
        </div>

        <div className="flex-1" />

        {/* Action Buttons */}
        {permissions.canDelete && selectedRows.length > 0 && (
          <button
            id={`app-grid-delete-${id}`}
            onClick={handleDelete}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', fontSize: 12, cursor: 'pointer',
              background: 'var(--danger)', color: '#fff',
              border: 'none', borderRadius: 0,
            }}
          >
            <Trash2 size={13} /> Delete ({selectedRows.length})
          </button>
        )}

        {permissions.canExport && (
          <button
            id={`app-grid-export-${id}`}
            onClick={handleExport}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', fontSize: 12, cursor: 'pointer',
              background: 'var(--surface-muted)', color: 'var(--text-primary)',
              border: '1px solid var(--border-default)', borderRadius: 0,
            }}
          >
            <Download size={13} /> Export
          </button>
        )}

        {permissions.canCreate && onAdd && (
          <button
            id={`app-grid-add-${id}`}
            onClick={onAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 12px', fontSize: 12, cursor: 'pointer',
              background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: 0, fontWeight: 600,
            }}
          >
            <Plus size={13} /> Add New
          </button>
        )}
      </div>

      {/* ── AG-Grid ─────────────────────────────────────── */}
      <div
        className="ag-theme-alpine flex-1"
        style={{
          height: height ?? '100%',
          '--ag-background-color': 'var(--surface)',
          '--ag-header-background-color': '#1a4a48',
          '--ag-header-foreground-color': '#ffffff',
          '--ag-odd-row-background-color': 'var(--surface-muted)',
          '--ag-row-hover-color': 'rgba(0,140,133,0.06)',
          '--ag-selected-row-background-color': 'rgba(0,140,133,0.12)',
          '--ag-font-family': 'var(--font-primary)',
          '--ag-font-size': '13px',
          '--ag-border-color': 'var(--border-subtle)',
          '--ag-row-border-color': 'var(--border-subtle)',
          '--ag-cell-horizontal-border': 'none',
          '--ag-border-radius': '0px',
        } as React.CSSProperties}
      >
        {loading ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--text-secondary)', fontSize: 13 }}
          >
            Loading...
          </div>
        ) : (
          <AgGridReact
            ref={gridRef}
            rowData={data}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            rowSelection="multiple"
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            onSelectionChanged={() =>
              setSelectedRows(gridRef.current?.api?.getSelectedRows() ?? [])
            }
            animateRows
            suppressCellFocus={false}
            enableCellTextSelection
            stopEditingWhenCellsLoseFocus
          />
        )}
      </div>
    </div>
  );
};

export default AppGrid;
