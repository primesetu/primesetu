import React, { useState, useEffect, useMemo } from "react";
import { 
  Layers, Database, Loader2, Maximize2, Minimize2, X, Plus, 
  ShieldCheck, AlertTriangle, Box, ChevronRight, Settings2, Package, Search, Trash2, Save, Percent,
  RotateCcw, ChevronLeft, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, DownloadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, apiClient } from "@/api/client";
import { cn } from "@/lib/utils";

// Sovereign Architecture Imports
import { SovereignShell } from "@/components/sovereign/SovereignShell";
import { useSysParams } from "@/hooks/useSysParams";

// TanStack Table Imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";

/**
 * Premium Interactive Editable Cell Component
 */
const EditableCell = ({
  value: initialValue,
  index,
  id,
  onCellChange,
  disabled,
  type = "text",
  options,
}: {
  value: any;
  index: number;
  id: string;
  onCellChange: (index: number, id: string, value: any) => void;
  disabled: boolean;
  type?: "text" | "number" | "select" | "boolean";
  options?: string[];
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    if (value !== initialValue) {
      onCellChange(index, id, value);
    }
  };

  if (disabled) {
    return (
      <span className="px-2 py-1 text-xs font-bold text-white/30 italic line-through select-none">
        {String(value ?? "")}
      </span>
    );
  }

  if (type === "boolean") {
    const isChecked = !!value;
    return (
      <div className="flex justify-center w-full">
        <button
          onClick={() => {
            const nextVal = !isChecked;
            setValue(nextVal);
            onCellChange(index, id, nextVal);
          }}
          className={cn(
            "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/30",
            isChecked ? "bg-emerald-500" : "bg-white/10"
          )}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
              isChecked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    );
  }

  if (type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          onCellChange(index, id, e.target.value);
        }}
        className="w-full bg-[#0f172a] border border-white/10 rounded-md px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-brand-gold/50 cursor-pointer"
      >
        <option value="">Select...</option>
        {options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      value={value ?? ""}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      type={type === "number" ? "number" : "text"}
      className="w-full bg-transparent border border-transparent hover:border-white/10 focus:border-brand-gold/50 focus:bg-white/5 focus:outline-none px-2 py-1 text-xs font-bold text-white rounded-md transition-all"
    />
  );
};

/**
 * ITEM GROUPING WORKBENCH
 * -----------------------
 * Primary Table: Class12combo
 * Purpose: Manages the DNA of Class1 (Product) and Class2 (Brand) combinations.
 */
export default function ItemGrouping({ onBack }: { onBack?: () => void }) {
  const { getParam } = useSysParams();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [classifications, setClassifications] = useState<any[]>([]);
  const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());
  const [deletedRows, setDeletedRows] = useState<Set<number>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Dynamic Captions from SysParams
  const class1Cap = getParam("ItemClass1Cap", "Product") as string;
  const class2Cap = getParam("ItemClass2Cap", "Brand") as string;

  const handleCellChange = (rowIndex: number, field: string, val: any) => {
    const newData = [...classifications];
    newData[rowIndex] = { ...newData[rowIndex], [field]: val };
    setClassifications(newData);
    
    const nextModified = new Set(modifiedRows);
    nextModified.add(rowIndex);
    setModifiedRows(nextModified);
  };

  const handleRowDelete = (rowIndex: number) => {
    const nextDeleted = new Set(deletedRows);
    nextDeleted.add(rowIndex);
    setDeletedRows(nextDeleted);
  };

  const handleRowRestore = (rowIndex: number) => {
    const nextDeleted = new Set(deletedRows);
    nextDeleted.delete(rowIndex);
    setDeletedRows(nextDeleted);
  };

  // Define Columns for TanStack Table
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-white/20 bg-white/5 text-brand-gold focus:ring-brand-gold/30 w-3.5 h-3.5 cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-white/20 bg-white/5 text-brand-gold focus:ring-brand-gold/30 w-3.5 h-3.5 cursor-pointer"
          />
        </div>
      ),
      size: 40,
    },
    {
      accessorKey: "class1cd",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 hover:text-white transition-colors uppercase tracking-wider"
        >
          <span>{class1Cap}</span>
          <ArrowUpDown size={12} className="opacity-40" />
        </button>
      ),
      cell: ({ getValue, row: { index }, column: { id } }) => (
        <EditableCell
          value={getValue()}
          index={index}
          id={id}
          onCellChange={handleCellChange}
          disabled={deletedRows.has(index)}
        />
      ),
    },
    {
      accessorKey: "class2cd",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 hover:text-white transition-colors uppercase tracking-wider"
        >
          <span>{class2Cap}</span>
          <ArrowUpDown size={12} className="opacity-40" />
        </button>
      ),
      cell: ({ getValue, row: { index }, column: { id } }) => (
        <EditableCell
          value={getValue()}
          index={index}
          id={id}
          onCellChange={handleCellChange}
          disabled={deletedRows.has(index)}
        />
      ),
    },
    {
      accessorKey: "billable",
      header: "Billable",
      cell: ({ getValue, row: { index }, column: { id } }) => (
        <EditableCell
          value={getValue()}
          index={index}
          id={id}
          onCellChange={handleCellChange}
          disabled={deletedRows.has(index)}
          type="boolean"
        />
      ),
    },
    {
      accessorKey: "sizegroup",
      header: "Size Group",
      cell: ({ getValue, row: { index }, column: { id } }) => (
        <EditableCell
          value={getValue()}
          index={index}
          id={id}
          onCellChange={handleCellChange}
          disabled={deletedRows.has(index)}
          type="select"
          options={["FW", "APPAREL", "STD", "MEN", "WOMEN", "KIDS"]}
        />
      ),
    },
    {
      accessorKey: "prodtaxtype",
      header: "Tax Type",
      cell: ({ getValue, row: { index }, column: { id } }) => (
        <EditableCell
          value={getValue()}
          index={index}
          id={id}
          onCellChange={handleCellChange}
          disabled={deletedRows.has(index)}
          type="select"
          options={["18%GST", "12%GST", "5%GST", "28%GST", "EXEMPT"]}
        />
      ),
    },
    {
      accessorKey: "retailmarkup",
      header: "Markup %",
      cell: ({ getValue, row: { index }, column: { id } }) => (
        <EditableCell
          value={getValue()}
          index={index}
          id={id}
          onCellChange={handleCellChange}
          disabled={deletedRows.has(index)}
          type="number"
        />
      ),
    },
    {
      accessorKey: "batchapplicable",
      header: "Batch Ctrl",
      cell: ({ getValue, row: { index }, column: { id } }) => (
        <EditableCell
          value={getValue()}
          index={index}
          id={id}
          onCellChange={handleCellChange}
          disabled={deletedRows.has(index)}
          type="boolean"
        />
      ),
    },
    {
      accessorKey: "stopsalesbefexpdays",
      header: "Exp Block (Days)",
      cell: ({ getValue, row: { index }, column: { id } }) => (
        <EditableCell
          value={getValue()}
          index={index}
          id={id}
          onCellChange={handleCellChange}
          disabled={deletedRows.has(index)}
          type="number"
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row: { index } }) => (
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          {deletedRows.has(index) ? (
            <button
              onClick={() => handleRowRestore(index)}
              className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-md transition-colors"
              title="Restore Rule"
            >
              <RotateCcw size={14} />
            </button>
          ) : (
            <button
              onClick={() => handleRowDelete(index)}
              className="p-1.5 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
              title="Delete Rule"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
      size: 50,
    },
  ], [class1Cap, class2Cap, deletedRows]);

  // Hook Up TanStack Table
  const table = useReactTable({
    data: classifications,
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
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const fetchData = async () => {
    setIsPulling(true);
    try {
      const response = await apiClient.get('/catalog/classifications/');
      setClassifications(response.data.data || []);
      setModifiedRows(new Set());
      setDeletedRows(new Set());
      setSelectedRows(new Set());
    } catch (e) {
      console.error("Failed to fetch Class12Combo data", e);
      setToast({ message: "Network error: Using offline cache", type: "error" });
    } finally {
      setIsPulling(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save modified/new rows that aren't deleted
      const modifiedArray = Array.from(modifiedRows)
        .map(i => classifications[i as number])
        .filter(row => row && !deletedRows.has(classifications.indexOf(row)));
        
      for (const row of modifiedArray) {
        if (row.class1cd && row.class2cd) {
            try {
                await apiClient.post('/catalog/classifications/', row);
            } catch (err: any) {
                await apiClient.put(`/catalog/classifications/${row.class1cd}/${row.class2cd}`, row);
            }
        }
      }
      
      // 2. Delete rows marked for deletion
      const deletedArray = Array.from(deletedRows)
        .map(i => classifications[i as number])
        .filter(Boolean);

      for (const row of deletedArray) {
        if (row.class1cd && row.class2cd) {
          try {
            await apiClient.delete(`/catalog/classifications/${row.class1cd}/${row.class2cd}`);
          } catch (err) {
            console.error("Failed to delete legacy row mapping:", row, err);
          }
        }
      }
      
      setToast({ message: "Class12Combo Rules Synchronized", type: 'success' });
      setModifiedRows(new Set());
      setDeletedRows(new Set());
      setTimeout(() => setToast(null), 3000);
      fetchData();
    } catch (e) {
      setToast({ message: "Sovereign Commit Failed", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const addRow = () => {
      setClassifications([{ class1cd: "", class2cd: "", billable: true, retailmarkup: 0 }, ...classifications]);
      const shift = (s: Set<number>) => new Set(Array.from(s).map(i => i + 1));
      setModifiedRows(shift(modifiedRows).add(0));
      setDeletedRows(shift(deletedRows));
      
      // Select the newly added row
      const nextSelected = new Set<number>();
      nextSelected.add(0);
      setSelectedRows(nextSelected);
  };

  // Sync TanStack row selection state to setSelectedRows
  const selectedRowModel = table.getSelectedRowModel().rows;
  useEffect(() => {
    const nextSelected = new Set<number>();
    selectedRowModel.forEach((row) => {
      nextSelected.add(row.index);
    });
    if (nextSelected.size > 0) {
      setSelectedRows(nextSelected);
    }
  }, [selectedRowModel]);

  const activeRow = selectedRows.size > 0 ? classifications[Array.from(selectedRows)[0]] : null;

  return (
    <SovereignShell 
      title="Item Grouping (Class12Combo)"
      isFullscreen={isFullscreen}
      icon={<Layers className="text-brand-gold" size={24} />}
      headerActions={(
        <div className="flex items-center gap-3">
          <button 
            onClick={addRow} 
            className="bg-white/5 hover:bg-white/10 text-white px-4 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 rounded-lg border border-white/5 transition-all"
          >
            <Plus size={14} /> Add Combination
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-brand-gold hover:bg-brand-gold/80 text-navy px-8 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 rounded-lg shadow-xl transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            <span>Commit Rules</span>
          </button>
          
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-10 h-10 rounded-lg border border-white/5 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-all">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 rounded-lg border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all">
              <X size={18} />
            </button>
          )}
        </div>
      )}
    >
      <div className="flex flex-1 min-h-0 bg-[#020617]">
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 relative">
          
          {/* Table Sub-Header Toolbar */}
          <div className="p-4 bg-navy/20 border-b border-white/5 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">Table: Class12Combo</span>
                <span className="text-sm font-black text-white uppercase tracking-tight">Institutional Combination Registry</span>
             </div>
             
             <div className="flex items-center gap-4">
                {/* Search Filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                  <input
                    type="text"
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Filter Combinations..."
                    className="w-64 bg-[#020617] border border-white/10 hover:border-white/20 focus:border-brand-gold/50 rounded-lg pl-9 pr-4 py-2 text-xs font-bold text-white placeholder-white/20 focus:outline-none transition-all"
                  />
                </div>
                
                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                   <Database size={14} className="text-white/40" />
                   <span className="text-[10px] font-bold text-white/60">Live Sovereign Link</span>
                </div>
             </div>
          </div>
          
          {/* TanStack Table Element */}
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/5 z-20">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id}
                        style={{ width: header.column.columnDef.size }}
                        className="px-4 py-3 text-[10px] font-black text-white/40 uppercase tracking-widest border-r border-white/5 select-none"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-white/5">
                {table.getRowModel().rows.map(row => {
                  const idx = row.index;
                  const isDeleted = deletedRows.has(idx);
                  const isModified = modifiedRows.has(idx);
                  const isSelected = selectedRows.has(idx);
                  
                  return (
                    <tr 
                      key={row.id}
                      onClick={() => {
                        const nextSelected = new Set<number>();
                        nextSelected.add(idx);
                        setSelectedRows(nextSelected);
                      }}
                      className={cn(
                        "hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-transparent cursor-pointer transition-all border-r border-white/5",
                        isSelected && "bg-gradient-to-r from-brand-gold/10 to-transparent border-l-2 border-brand-gold",
                        isDeleted && "opacity-40 bg-rose-500/5",
                        isModified && !isDeleted && "bg-amber-500/5 border-l-2 border-amber-500"
                      )}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id}
                          className="px-4 py-2 border-r border-white/5 font-bold text-white text-xs"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination & Status Footer */}
          <div className="p-4 border-t border-white/5 bg-[#0f172a]/40 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white/40 uppercase">Rows per page:</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="bg-[#020617] border border-white/10 rounded-md text-[10px] font-bold text-white px-2 py-1 focus:outline-none focus:border-brand-gold/50 cursor-pointer"
                >
                  {[10, 20, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] font-black text-white/40 uppercase">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Intelligence Side Preview */}
        <div className="w-[380px] bg-[#0f172a] border-l border-white/5 flex flex-col shrink-0">
          <div className="p-8 flex flex-col gap-6 h-full overflow-hidden">
             <div className="flex flex-col gap-2 shrink-0">
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-gold">Combination DNA</h3>
                <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">
                   Manage inheritance rules for {class1Cap} and {class2Cap} pairings.
                </p>
             </div>

             {activeRow ? (
               (() => {
                 const activeRowIndex = classifications.indexOf(activeRow);
                 return (
                   <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-4 pb-12 animate-in fade-in slide-in-from-right-4 duration-500">
                      {/* Pair Header Card */}
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 shadow-2xl shrink-0">
                         <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{class1Cap} / {class2Cap}</div>
                         <div className="text-2xl font-black text-white tracking-tight uppercase leading-none break-all">
                            {activeRow.class1cd || "EMPTY"} <span className="text-brand-gold/30">/</span> {activeRow.class2cd || "EMPTY"}
                         </div>
                         
                         <div className="mt-6 flex flex-wrap gap-2">
                            {activeRow.billable ? (
                               <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-full border border-emerald-500/30 uppercase tracking-widest">
                                  Billable
                               </span>
                            ) : (
                               <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[9px] font-black rounded-full border border-rose-500/30 uppercase tracking-widest">
                                  Service/Non-Bill
                               </span>
                            )}
                            {activeRow.batchapplicable ? (
                               <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black rounded-full border border-blue-500/30 uppercase tracking-widest">
                                  Batch Active
                               </span>
                            ) : null}
                         </div>
                      </div>

                      {/* Financial Properties */}
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] border-b border-white/5 pb-2">Financial Markups</h4>
                         
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1">
                               <span className="text-[9px] font-black text-white/30 uppercase">Retail Markup</span>
                               <div className="flex items-center gap-1 mt-1">
                                  <input
                                     type="number"
                                     value={activeRow.retailmarkup ?? 0}
                                     onChange={(e) => handleCellChange(activeRowIndex, "retailmarkup", Number(e.target.value))}
                                     disabled={deletedRows.has(activeRowIndex)}
                                     className="w-16 bg-transparent border-b border-white/10 focus:border-brand-gold/50 focus:outline-none text-md font-black text-white"
                                  />
                                  <span className="text-xs font-bold text-white/40">%</span>
                               </div>
                            </div>
                            
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1">
                               <span className="text-[9px] font-black text-white/30 uppercase">Dealer Markup</span>
                               <div className="flex items-center gap-1 mt-1">
                                  <input
                                     type="number"
                                     value={activeRow.dealermarkup ?? 0}
                                     onChange={(e) => handleCellChange(activeRowIndex, "dealermarkup", Number(e.target.value))}
                                     disabled={deletedRows.has(activeRowIndex)}
                                     className="w-16 bg-transparent border-b border-white/10 focus:border-brand-gold/50 focus:outline-none text-md font-black text-white"
                                  />
                                  <span className="text-xs font-bold text-white/40">%</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Logistics & Inventory Attributes */}
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] border-b border-white/5 pb-2">Logistics & Supply</h4>
                         
                         <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-white uppercase">Is Consignment Item</span>
                                  <span className="text-[8px] font-bold text-white/30 uppercase mt-0.5">Pay-when-sold model</span>
                               </div>
                               <button
                                  onClick={() => handleCellChange(activeRowIndex, "isconsignmentitem", !activeRow.isconsignmentitem)}
                                  disabled={deletedRows.has(activeRowIndex)}
                                  className={cn(
                                     "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none",
                                     activeRow.isconsignmentitem ? "bg-emerald-500" : "bg-white/10"
                                  )}
                               >
                                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform duration-200", activeRow.isconsignmentitem ? "translate-x-5" : "translate-x-0")} />
                               </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-white uppercase">Is Service Combo</span>
                                  <span className="text-[8px] font-bold text-white/30 uppercase mt-0.5">Non-stockable services</span>
                               </div>
                               <button
                                  onClick={() => handleCellChange(activeRowIndex, "isservicecombo", !activeRow.isservicecombo)}
                                  disabled={deletedRows.has(activeRowIndex)}
                                  className={cn(
                                     "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none",
                                     activeRow.isservicecombo ? "bg-emerald-500" : "bg-white/10"
                                  )}
                               >
                                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform duration-200", activeRow.isservicecombo ? "translate-x-5" : "translate-x-0")} />
                               </button>
                            </div>
                            
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1.5">
                               <span className="text-[9px] font-black text-white/30 uppercase">Preferred Vendor ID</span>
                               <input
                                  type="text"
                                  value={activeRow.prefvendorid ?? ""}
                                  onChange={(e) => handleCellChange(activeRowIndex, "prefvendorid", e.target.value)}
                                  disabled={deletedRows.has(activeRowIndex)}
                                  placeholder="E.g., VEND001"
                                  className="w-full bg-[#020617] border border-white/10 focus:border-brand-gold/50 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none transition-all uppercase"
                               />
                            </div>
                         </div>
                      </div>

                      {/* Superclasses Hierarchy */}
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] border-b border-white/5 pb-2">Superclass Inheritances</h4>
                         
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1.5">
                               <span className="text-[9px] font-black text-white/30 uppercase">Superclass 1 (Dept)</span>
                               <input
                                  type="text"
                                  value={activeRow.superclass1 ?? ""}
                                  onChange={(e) => handleCellChange(activeRowIndex, "superclass1", e.target.value)}
                                  disabled={deletedRows.has(activeRowIndex)}
                                  placeholder="E.g., APPAREL"
                                  className="w-full bg-[#020617] border border-white/10 focus:border-brand-gold/50 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none transition-all uppercase"
                               />
                            </div>

                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1.5">
                               <span className="text-[9px] font-black text-white/30 uppercase">Superclass 2 (Season)</span>
                               <input
                                  type="text"
                                  value={activeRow.superclass2 ?? ""}
                                  onChange={(e) => handleCellChange(activeRowIndex, "superclass2", e.target.value)}
                                  disabled={deletedRows.has(activeRowIndex)}
                                  placeholder="E.g., SS26"
                                  className="w-full bg-[#020617] border border-white/10 focus:border-brand-gold/50 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none transition-all uppercase"
                               />
                            </div>
                         </div>
                      </div>

                      {/* Expiry block warning logic */}
                      {activeRow.batchapplicable && (
                        <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0">
                           <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle className="text-amber-500" size={14} />
                              <span className="text-[10px] font-black text-amber-500 uppercase">Expiry Lock Enabled</span>
                           </div>
                           <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase">
                              System will restrict billing {activeRow.stopsalesbefexpdays || 0} days prior to SKU expiration to prevent compliance violations.
                           </p>
                        </div>
                      )}
                   </div>
                 );
               })()
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-20">
                  <Layers size={64} className="mb-6 text-brand-gold" strokeWidth={1} />
                  <span className="text-[14px] font-black uppercase tracking-[0.3em] text-white">Selection Pending</span>
                  <span className="text-[10px] font-bold mt-4 max-w-[200px] text-white/60 uppercase">Select a Class12Combo pairing to analyze its inherited properties.</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {toast && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "fixed bottom-20 right-12 px-8 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000] border-l-4 font-black text-[10px] uppercase tracking-[0.3em] backdrop-blur-xl",
            toast.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-rose-500/90 text-white border-rose-400"
          )}
        >
          {toast.message}
        </motion.div>
      )}
    </SovereignShell>
  );
}

