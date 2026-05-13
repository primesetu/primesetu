import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trash2, DownloadCloud, CheckSquare, Square } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent, CellValueChangedEvent, RowClassParams } from "ag-grid-community";

export interface GridColumn {
  key: string;
  label: string;
  width?: string;
  readonly?: boolean;
  type?: "text" | "number" | "select";
  options?: string[];
  required?: boolean;
  f2Type?: string;
  f2Category?: string;
}

interface SovereignGridProps {
  data: any[];
  schema: GridColumn[];
  zoomLevel?: number;
  modifiedRows: Set<string | number>;
  deletedRows: Set<string | number>;
  selectedRows: Set<string | number>;
  setSelectedRows: (rows: Set<string | number>) => void;
  validationErrors?: Record<string | number, boolean>;
  onCellChange: (rowIndex: number, field: string, value: any, rowData: any) => void;
  onRowDelete?: (rowIndex: number) => void;
  title?: string;
}

export const SovereignGrid = ({
  data,
  schema,
  zoomLevel = 100,
  modifiedRows,
  deletedRows,
  selectedRows,
  setSelectedRows,
  validationErrors = {},
  onCellChange,
  onRowDelete,
  title = "Sheet",
}: SovereignGridProps) => {
  const gridRef = useRef<AgGridReact>(null);

  const colDefs = useMemo<ColDef[]>(() => {
    const defs: ColDef[] = [
      {
        headerName: "#",
        valueGetter: (p) => (p.node?.rowIndex ?? 0) + 1,
        width: 60,
        pinned: "left",
        editable: false,
        suppressMovable: true,
        headerCheckboxSelection: true,
        checkboxSelection: true,
        cellStyle: {
          color: "var(--text-secondary, rgba(255,255,255,0.4))",
          fontSize: "11px",
          fontFamily: "var(--font-mono, monospace)",
          textAlign: "center",
          fontWeight: "900",
        },
      },
    ];

    schema.forEach((col) => {
      const def: ColDef = {
        field: col.key,
        headerName: col.label,
        width: col.width ? parseInt(col.width) : 150,
        editable: !col.readonly,
        sortable: true,
        filter: true,
        resizable: true,
        cellStyle: (p) => {
          let style: any = {
            fontFamily: col.type === "number" ? "var(--font-mono, monospace)" : "inherit",
            fontSize: "12px",
            fontWeight: "700",
            color: "rgba(255,255,255,0.8)",
          };
          if (col.readonly) {
            style.opacity = 0.5;
            style.fontStyle = "italic";
            style.fontWeight = "400";
          }
          if (col.required && !p.value) {
            style.borderLeft = "2px solid #ef4444";
          }
          if (modifiedRows.has(p.node?.rowIndex ?? -1)) {
            style.color = "#fbbf24"; // amber-400
          }
          return style;
        },
      };

      if (col.type === "number") {
        def.type = "numericColumn";
        def.valueFormatter = (p) =>
          p.value == null || isNaN(p.value) ? "" : Number(p.value).toLocaleString("en-IN");
      }

      defs.push(def);
    });

    // Action column
    defs.push({
      headerName: "",
      width: 60,
      pinned: "right",
      editable: false,
      sortable: false,
      filter: false,
      cellRenderer: (p: any) => {
        return (
          <button
            onClick={() => onRowDelete && onRowDelete(p.node?.rowIndex ?? -1)}
            className="w-full h-full flex items-center justify-center text-white/20 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        );
      },
    });

    return defs;
  }, [schema, modifiedRows, onRowDelete]);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
  }), []);

  const onCellValueChanged = useCallback(
    (e: CellValueChangedEvent) => {
      if (e.rowIndex !== null) {
        onCellChange(e.rowIndex, e.colDef.field!, e.newValue, e.data);
      }
    },
    [onCellChange]
  );

  const onSelectionChanged = useCallback(() => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    if (selectedNodes) {
      const selected = new Set<number>();
      selectedNodes.forEach((node) => {
        if (node.rowIndex !== null) selected.add(node.rowIndex);
      });
      setSelectedRows(selected);
    }
  }, [setSelectedRows]);

  const getRowClass = useCallback(
    (params: RowClassParams) => {
      if (params.node.rowIndex !== null) {
        if (validationErrors[params.node.rowIndex]) return "bg-rose-500/10";
        if (modifiedRows.has(params.node.rowIndex)) return "bg-amber-500/5 border-l-2 border-amber-500";
      }
      return "";
    },
    [validationErrors, modifiedRows]
  );

  const handleExportCSV = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv({ fileName: `${title.replace(/ /g, "_")}_Export.csv` });
  }, [title]);

  // Transform data to only show non-deleted rows
  // To keep index matching, we pass the data as is, and filter by function if needed, 
  // but to preserve index mapping for onCellChange it is easier to not filter out the array elements 
  // but just hide them. AG-Grid has `isExternalFilterPresent` / `doesExternalFilterPass`
  const isExternalFilterPresent = useCallback(() => deletedRows.size > 0, [deletedRows]);
  const doesExternalFilterPass = useCallback(
    (node: any) => {
      return !deletedRows.has(node.rowIndex);
    },
    [deletedRows]
  );

  useEffect(() => {
    gridRef.current?.api?.onFilterChanged();
  }, [deletedRows]);

  const isAllSelected = selectedRows.size > 0 && selectedRows.size === data.length - deletedRows.size;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#020617]">
      {/* Grid Toolbar — Glassmorphic */}
      <div className="h-10 border-b border-white/5 px-4 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-xl shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (isAllSelected) {
                gridRef.current?.api.deselectAll();
              } else {
                gridRef.current?.api.selectAllFiltered();
              }
            }}
            className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-blue-400 transition-all"
          >
            {isAllSelected ? <CheckSquare size={14} className="text-blue-500" /> : <Square size={14} />}
            Select All
          </button>
          <div className="w-px h-4 bg-white/5 mx-2" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
            {selectedRows.size} SKUs Isolated
          </span>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/70 hover:text-emerald-400 transition-all"
        >
          <DownloadCloud size={14} />
          Export Sovereign Ledger
        </button>
      </div>

      {/* Grid Container */}
      <div 
        className="flex-1 min-h-0 ag-theme-alpine-dark w-full"
        style={{
          zoom: `${zoomLevel}%`,
          "--ag-background-color": "transparent",
          "--ag-header-background-color": "rgba(15, 23, 42, 0.95)",
          "--ag-header-foreground-color": "rgba(255, 255, 255, 0.5)",
          "--ag-odd-row-background-color": "rgba(255, 255, 255, 0.02)",
          "--ag-row-hover-color": "rgba(59, 130, 246, 0.05)",
          "--ag-selected-row-background-color": "rgba(59, 130, 246, 0.1)",
          "--ag-font-family": "var(--font-primary, sans-serif)",
          "--ag-font-size": "11px",
          "--ag-border-color": "rgba(255, 255, 255, 0.05)",
          "--ag-row-border-color": "rgba(255, 255, 255, 0.02)",
          "--ag-cell-horizontal-border": "none",
        } as React.CSSProperties}
      >
        <AgGridReact
          ref={gridRef}
          rowData={data}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          onCellValueChanged={onCellValueChanged}
          onSelectionChanged={onSelectionChanged}
          getRowClass={getRowClass}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          animateRows
          enableCellTextSelection
          suppressCellFocus={false}
          stopEditingWhenCellsLoseFocus
        />
      </div>
    </div>
  );
};
