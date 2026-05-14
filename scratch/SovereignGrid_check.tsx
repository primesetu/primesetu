import React, { useState, useMemo, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trash2, DownloadCloud, CheckSquare, Square } from "lucide-react";
import { useGridKeyboard } from "@/hooks/useGridKeyboard";

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
  data: Record<string, any>;
  schema: GridColumn[];
  rowsCount: number;
  zoomLevel: number;
  modifiedRows: Set<number>;
  deletedRows: Set<number>;
  selectedRows: Set<number>;
  setSelectedRows: (rows: Set<number>) => void;
  validationErrors?: Record<number, boolean>;
  onCellChange: (r: number, c: number, val: any) => void;
  onRowDelete?: (r: number) => void;
  onPaste?: (r: number, c: number, text: string) => void;
  title?: string;
}

export const SovereignGrid = ({
  data,
  schema,
  rowsCount,
  zoomLevel,
  modifiedRows,
  deletedRows,
  selectedRows,
  setSelectedRows,
  validationErrors = {},
  onCellChange,
  onRowDelete,
  onPaste,
  title = "Sheet",
}: SovereignGridProps) => {
  const [selectedCell, setSelectedCell] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [anchorCell, setAnchorCell] = useState<{ r: number; c: number } | null>(null);
  const [selectionRange, setSelectionRange] = useState<{
    r1: number;
    c1: number;
    r2: number;
    c2: number;
  } | null>(null);
  const [nonContiguousCells, setNonContiguousCells] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isFillDragging, setIsFillDragging] = useState(false);
  const [fillRange, setFillRange] = useState<{
    r1: number;
    c1: number;
    r2: number;
    c2: number;
  } | null>(null);

  const getCellsInRange = (r1: number, c1: number, r2: number, c2: number) => {
    const cells: { r: number; c: number }[] = [];
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        cells.push({ r, c });
      }
    }
    return cells;
  };

  const [editingCell, setEditingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);

  const startEditing = useCallback((r: number, c: number, initialChar?: string) => {
    if (schema[c]?.readonly) return;
    
    // If we have a range and start typing, fill the entire range
    if (initialChar && selectionRange) {
      const cells = getCellsInRange(selectionRange.r1, selectionRange.c1, selectionRange.r2, selectionRange.c2);
      cells.forEach(cell => {
        if (!schema[cell.c].readonly) {
          const val = schema[cell.c].type === 'number' ? Number(initialChar) : initialChar.toUpperCase();
          onCellChange(cell.r, cell.c, val);
        }
      });
      return;
    }

    setEditingCell({ r, c });
    setEditValue(initialChar ?? data[`${r}-${c}`] ?? "");
  }, [schema, data, selectionRange, onCellChange]);

  const finishEditing = useCallback(() => {
    if (editingCell) {
      onCellChange(editingCell.r, editingCell.c, editValue);
      setEditingCell(null);
    }
  }, [editingCell, editValue, onCellChange]);

  // Export CSV Logic
  const handleExportCSV = useCallback(() => {
    const rowsToExport =
      selectedRows.size > 0
        ? Array.from(selectedRows).sort((a, b) => a - b)
        : Array.from({ length: rowsCount }, (_, i) => i + 1).filter(
            (r) => !deletedRows.has(r),
          );

    const headers = schema.map((col) => `"${col.label}"`).join(",");
    const rows: string[] = [];

    rowsToExport.forEach((r) => {
      const hasData = schema.some((_, ci) => data[`${r}-${ci}`]);
      if (!hasData) return;
      const row = schema
        .map((_, ci) => {
          const val = data[`${r}-${ci}`] ?? "";
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",");
      rows.push(row);
    });

    if (rows.length === 0) return;

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedRows, rowsCount, deletedRows, schema, data, title]);

  // Connect Keyboard Hook
  useGridKeyboard({
    selectedCell,
    setSelectedCell,
    editingCell,
    setEditingCell,
    rowsCount,
    columnsCount: schema.length,
    startEditing,
    finishEditing,
    handleCellChange: (r, c, val) => {
      // If we have a range and hit delete, clear the range
      if (val === "" && selectionRange) {
        const cells = getCellsInRange(selectionRange.r1, selectionRange.c1, selectionRange.r2, selectionRange.c2);
        cells.forEach(cell => onCellChange(cell.r, cell.c, ""));
      } else {
        onCellChange(r, c, val);
      }
    },
    anchorCell,
    setAnchorCell,
    selectionRange,
    setSelectionRange,
    editValue
  });

  // Range Selection Handlers
  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    if (e.ctrlKey || e.metaKey) {
      const key = `${r}-${c}`;
      const next = new Set(nonContiguousCells);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setNonContiguousCells(next);
      return;
    }

    setEditingCell(null);
    setNonContiguousCells(new Set());
    
    if (e.shiftKey && anchorCell) {
      setSelectionRange({ r1: anchorCell.r, c1: anchorCell.c, r2: r, c2: c });
      setSelectedCell({ r, c });
    } else {
      setAnchorCell({ r, c });
      setSelectedCell({ r, c });
      setSelectionRange({ r1: r, c1: c, r2: r, c2: c });
      setIsDragging(true);
    }
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (isDragging && anchorCell) {
      setSelectionRange({ r1: anchorCell.r, c1: anchorCell.c, r2: r, c2: c });
      setSelectedCell({ r, c });
    }
    if (isFillDragging && selectionRange) {
      const { r1, c1, r2, c2 } = selectionRange;
      const maxR = Math.max(r1, r2);
      const maxC = Math.max(c1, c2);
      const minR = Math.min(r1, r2);
      const minC = Math.min(c1, c2);

      // Determine drag direction (vertical or horizontal)
      if (r > maxR) {
        setFillRange({ r1: maxR + 1, c1: minC, r2: r, c2: maxC });
      } else if (c > maxC) {
        setFillRange({ r1: minR, c1: maxC + 1, r2: maxR, c2: c });
      } else {
        setFillRange(null);
      }
    }
  };

  const handleMouseUp = useCallback(() => {
    if (isFillDragging && fillRange && selectionRange) {
      const { r1, c1, r2, c2 } = selectionRange;
      const minR = Math.min(r1, r2);
      const maxR = Math.max(r1, r2);
      const minC = Math.min(c1, c2);
      const maxC = Math.max(c1, c2);

      const fr1 = fillRange.r1;
      const fc1 = fillRange.c1;
      const fr2 = fillRange.r2;
      const fc2 = fillRange.c2;

      const fMinR = Math.min(fr1, fr2);
      const fMaxR = Math.max(fr1, fr2);
      const fMinC = Math.min(fc1, fc2);
      const fMaxC = Math.max(fc1, fc2);

      const sourceWidth = maxC - minC + 1;
      const sourceHeight = maxR - minR + 1;

      for (let r = fMinR; r <= fMaxR; r++) {
        for (let c = fMinC; c <= fMaxC; c++) {
          // Identify source cell within selectionRange
          // Pattern repeats
          const sourceR = minR + ((r - fMinR) % sourceHeight);
          const sourceC = minC + ((c - fMinC) % sourceWidth);
          let val = data[`${sourceR}-${sourceC}`] ?? "";

          // Linear increment if numbers and dragging vertically
          if (typeof val === 'number' && sourceHeight === 1 && fMaxR > maxR) {
             val = val + (r - maxR);
          }

          if (!schema[c].readonly) {
            onCellChange(r, c, val);
          }
        }
      }
    }

    setIsDragging(false);
    setIsFillDragging(false);
    setFillRange(null);
  }, [isFillDragging, fillRange, selectionRange, data, onCellChange, schema]);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  // Copy Range Logic
  const handleCopy = useCallback((e: ClipboardEvent) => {
    if (editingCell || !selectionRange) return;
    
    const { r1, c1, r2, c2 } = selectionRange;
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);

    let tsv = "";
    for (let r = minR; r <= maxR; r++) {
      let row = "";
      for (let c = minC; c <= maxC; c++) {
        row += (data[`${r}-${c}`] ?? "") + (c === maxC ? "" : "\t");
      }
      tsv += row + (r === maxR ? "" : "\n");
    }

    e.clipboardData?.setData("text/plain", tsv);
    e.preventDefault();
  }, [editingCell, selectionRange, data]);

  useEffect(() => {
    window.addEventListener("copy", handleCopy);
    return () => window.removeEventListener("copy", handleCopy);
  }, [handleCopy]);
  
  // Paste Logic
  const handlePaste = useCallback((e: ClipboardEvent) => {
    // Only paste if a cell is selected and we are NOT currently editing (to avoid double paste in input)
    if (!selectedCell || editingCell) return;
    
    // Check if the target is NOT an input (to allow normal pasting inside editing input)
    if (document.activeElement?.tagName === "INPUT") return;

    const text = e.clipboardData?.getData("text");
    if (text && onPaste) {
      onPaste(selectedCell.r, selectedCell.c, text);
      e.preventDefault();
    }
  }, [editingCell, selectedCell, onPaste]);

  React.useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const isAllSelected =
    selectedRows.size === rowsCount - deletedRows.size && rowsCount > 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[var(--background-alt)]">
      {/* Grid Toolbar */}
      <div className="h-10 border-b border-[var(--border-subtle)] px-4 flex items-center justify-between bg-[var(--surface-container-low)] shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (isAllSelected) setSelectedRows(new Set());
              else
                setSelectedRows(
                  new Set(
                    Array.from({ length: rowsCount }, (_, i) => i + 1).filter(
                      (r) => !deletedRows.has(r),
                    ),
                  ),
                );
            }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare size={14} className="text-primary" />
            ) : (
              <Square size={14} />
            )}
            Select All
          </button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {selectedRows.size} Selected
          </span>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <DownloadCloud size={14} />
          Export CSV
        </button>
      </div>

      {/* Scroll Container */}
      <div className="flex-1 min-h-0 overflow-auto relative z-0">
        <div style={{ zoom: `${zoomLevel}%` }}>
          <table className="border-collapse table-fixed select-none bg-[var(--surface)] shadow-sm">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[var(--surface-container-low)]">
                <th className="w-12 border-b border-r border-[var(--border-subtle)] p-2 text-center text-[10px] font-black uppercase text-[var(--text-tertiary)]">
                  #
                </th>
                {schema.map((col, i) => (
                  <th
                    key={i}
                    style={{ width: col.width || "150px" }}
                    className="border-b border-r border-[var(--border-subtle)] p-2 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] bg-[var(--surface-container-low)]"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="w-16 border-b border-[var(--border-subtle)] p-2"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowsCount }, (_, i) => i + 1).map((r) => {
                if (deletedRows.has(r)) return null;
                const isRowSelected = selectedRows.has(r);

                return (
                  <tr
                    key={r}
                    className={cn(
                      "group transition-colors",
                      validationErrors[r]
                        ? "bg-rose-50 dark:bg-rose-900/10"
                        : "hover:bg-[var(--surface-container-low)]",
                      isRowSelected && "bg-[var(--primary)]/5",
                    )}
                  >
                    <td
                      onClick={() => {
                        const newSelection = new Set(selectedRows);
                        if (isRowSelected) newSelection.delete(r);
                        else newSelection.add(r);
                        setSelectedRows(newSelection);
                      }}
                      className={cn(
                        "border-r border-b border-[var(--border-subtle)] p-1 text-center text-[10px] font-bold relative cursor-pointer",
                        modifiedRows.has(r)
                          ? "bg-amber-50 text-amber-600 border-l-4 border-l-amber-500"
                          : "bg-[var(--surface-container-low)] text-[var(--text-tertiary)]",
                        isRowSelected && "bg-[var(--primary)] text-white",
                      )}
                    >
                      {r}
                    </td>
                    {schema.map((col, ci) => {
                      const isEditing =
                        editingCell?.r === r && editingCell?.c === ci;
                      const isSelected =
                        selectedCell?.r === r && selectedCell?.c === ci;
                      const val = data[`${r}-${ci}`] ?? "";

                      return (
                        <td
                          key={ci}
                          onMouseDown={(e) => handleCellMouseDown(r, ci, e)}
                          onMouseEnter={() => handleCellMouseEnter(r, ci)}
                          onDoubleClick={() => startEditing(r, ci)}
                          className={cn(
                            "border-r border-b border-[var(--border-subtle)] relative p-0 cursor-cell h-8",
                            isSelected && "ring-2 ring-inset ring-blue-500 z-20",
                            (selectionRange && 
                              r >= Math.min(selectionRange.r1, selectionRange.r2) && 
                              r <= Math.max(selectionRange.r1, selectionRange.r2) &&
                              ci >= Math.min(selectionRange.c1, selectionRange.c2) &&
                              ci <= Math.max(selectionRange.c1, selectionRange.c2)) 
                              ? "bg-blue-50 dark:bg-blue-900/20" 
                              : (fillRange && 
                                 r >= Math.min(fillRange.r1, fillRange.r2) && 
                                 r <= Math.max(fillRange.r1, fillRange.r2) &&
                                 ci >= Math.min(fillRange.c1, fillRange.c2) &&
                                 ci <= Math.max(fillRange.c1, fillRange.c2))
                                ? "bg-blue-100/50 dark:bg-blue-800/20 border-2 border-dashed border-blue-400"
                                : nonContiguousCells.has(`${r}-${ci}`) 
                                  ? "bg-blue-100 dark:bg-blue-800/30"
                                  : "bg-[var(--surface)]",
                          )}
                        >
                          {/* Fill Handle */}
                          {!isEditing && selectionRange && r === Math.max(selectionRange.r1, selectionRange.r2) && ci === Math.max(selectionRange.c1, selectionRange.c2) && (
                            <div 
                              className="absolute bottom-[-4px] right-[-4px] w-2.5 h-2.5 bg-blue-600 border border-white z-30 cursor-crosshair shadow-sm hover:scale-125 transition-transform"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsFillDragging(true);
                                setFillRange(null);
                              }}
                            />
                          )}

                          {isEditing ? (
                            <input
                              autoFocus
                              className="absolute inset-0 w-full h-full px-3 text-sm font-bold bg-[var(--surface)] dark:bg-slate-800 outline-none border-2 border-[var(--primary)] shadow-xl z-20"
                              value={editValue}
                            onChange={(e) => {
                                const col = schema[editingCell?.c ?? 0];
                                setEditValue(col?.type === 'number' ? e.target.value : e.target.value.toUpperCase());
                              }}
                              onBlur={finishEditing}
                            />
                          ) : (
                            <div
                              className={cn(
                                "px-3 text-[12px] font-medium truncate py-1.5 font-mono tracking-tight",
                                col.readonly && "opacity-50 font-normal italic",
                              )}
                            >
                              {val}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="border-b border-[var(--border-subtle)] text-center">
                      <button
                        onClick={() => onRowDelete?.(r)}
                        className="p-2 text-[var(--text-tertiary)] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
