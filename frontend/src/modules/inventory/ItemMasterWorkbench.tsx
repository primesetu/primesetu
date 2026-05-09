import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { 
  FileSpreadsheet,
  Save,
  Search,
  Maximize2,
  Minimize2,
  Plus,
  Loader2,
  X
} from "lucide-react";
import { api } from "../../api/client";
import { cn } from "@/lib/utils";

// Sovereign Architecture Imports
import { SovereignShell } from "@/components/sovereign/SovereignShell";
import { SovereignGrid, GridColumn } from "@/components/sovereign/SovereignGrid";
import { useSovereignStore } from "@/store/useSovereignStore";

// ── S9 Master Field Registry — exact Shoper9 column names
const ALL_FIELDS: GridColumn[] = [
  { key: "stockno", label: "Stock No", width: "140px", required: true },
  { key: "itemdesc", label: "Description", width: "280px", required: true },
  { key: "sfield1", label: "Barcode/EAN", width: "160px" },
  { key: "class1cd", label: "Product", width: "120px", f2Type: "lookups", f2Category: "PRODUCT" },
  { key: "class2cd", label: "Brand", width: "120px", f2Type: "lookups", f2Category: "BRAND" },
  { key: "subclass1cd", label: "Style", width: "140px", f2Type: "lookups", f2Category: "STYLE" },
  { key: "subclass2cd", label: "Shade", width: "100px", f2Type: "lookups", f2Category: "SHADE" },
  { key: "size", label: "Size", width: "80px", f2Type: "lookups", f2Category: "SIZE" },
  { key: "analcode32", label: "HSN Code", width: "100px" },
  { key: "retail_price", label: "MRP", width: "100px", type: "number" },
  { key: "dealer_price", label: "Dealer Price", width: "120px", type: "number" },
  { key: "prodtaxtype", label: "GST Slab", width: "80px", type: "number" },
  { key: "total_stock", label: "Stock Qty", width: "100px", readonly: true, type: "number" },
  
  // Unselected / Advanced Fields
  { key: "batch_sr_no", label: "Batch Sr No", width: "120px" },
  { key: "currentcost", label: "Cost Price", width: "100px", type: "number" },
  { key: "final_mrp", label: "Final MRP", width: "100px", type: "number" },
  { key: "retail_markup", label: "Retail Markup %", width: "100px", type: "number" },
  { key: "dealer_markup", label: "Dealer Markup %", width: "100px", type: "number" },
  { key: "source_tax", label: "Source Tax", width: "100px" },
  { key: "tax_incl", label: "Tax Incl (Y/N)", width: "100px" },
  { key: "analcode1", label: "Fabric", width: "120px" },
  { key: "analcode2", label: "Finish", width: "120px" },
  { key: "analcode3", label: "Colour Base", width: "120px" },
  { key: "analcode4", label: "Styling", width: "120px" },
  { key: "analcode5", label: "Usage", width: "120px" },
  { key: "analcode6", label: "AC6", width: "100px" },
  { key: "analcode7", label: "AC7", width: "100px" },
  { key: "analcode8", label: "AC8", width: "100px" },
  { key: "analcode9", label: "AC9", width: "100px" },
  { key: "analcode10", label: "AC10", width: "100px" },
  { key: "vendor_code", label: "Pref. Vendor", width: "120px" },
  { key: "inventory_yn", label: "Inventory (Y/N)", width: "100px" },
  { key: "billable_yn", label: "Billable (Y/N)", width: "100px" },
  { key: "service_yn", label: "Service (Y/N)", width: "100px" },
  { key: "regular_item", label: "Regular Item", width: "100px" },
  { key: "isq", label: "I.S.Q", width: "100px" },
  { key: "reorder_level", label: "Reorder Level", width: "100px", type: "number" },
  { key: "eoq", label: "EOQ", width: "100px", type: "number" },
  { key: "min_order_qty", label: "Min. Order Qty", width: "100px", type: "number" },
  { key: "grade", label: "Grade", width: "100px" },
  { key: "image_id", label: "Image ID", width: "120px" },
  { key: "mfg_date", label: "Mfg Date", width: "120px" },
  { key: "exp_date", label: "Exp Date", width: "120px" },
];

const SCHEMAS: Record<string, GridColumn[]> = {
  ITEM_MASTER: ALL_FIELDS,
  COMMON_FIELDS: [
    { key: "class1cd", label: "Product", width: "120px" },
    { key: "class2cd", label: "Brand", width: "120px" },
    { key: "prodtaxtype", label: "GST Slab", width: "100px", type: "number" },
    { key: "analcode32", label: "HSN Code", width: "100px" },
  ],
  CLASS12COMBO: [
    { key: "class1", label: "Class 1", width: "150px" },
    { key: "class2", label: "Class 2", width: "150px" },
  ],
  SUBCLASS1CAT: [{ key: "name", label: "SubClass 1 Name", width: "250px" }],
  SUBCLASS2CAT: [{ key: "name", label: "SubClass 2 Name", width: "250px" }],
  SIZECAT: [{ key: "name", label: "Size Category", width: "200px" }],
  ATTRIBUTES: [
    { key: "category", label: "Category", width: "150px" },
    { key: "value", label: "Value", width: "200px" },
  ]
};

export default function ItemMasterWorkbench({ initialData = [], onBack }: { initialData: any[], onBack: () => void }) {
  const STORAGE_KEY = "smriti_workbench_draft";
  
  const { 
    sheets, 
    activeSheet, 
    setActiveSheet, 
    zoomLevel, 
    setZoomLevel, 
    updateSheet, 
    addSheet, 
    deleteSheet 
  } = useSovereignStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [serverSearch, setServerSearch] = useState("");
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<number, any>>({});
  const [s9Tab, setS9Tab] = useState<'VIEW'|'COMMON'|'DETAILS'>('DETAILS');
  
  // Custom Selection State
  const [visibleFieldKeys, setVisibleFieldKeys] = useState<string[]>([
    "stockno", "itemdesc", "sfield1", "class1cd", "class2cd", "subclass1cd", "analcode32", "subclass2cd", "size", "retail_price", "dealer_price", "prodtaxtype", "total_stock"
  ]);
  const [commonFieldKeys, setCommonFieldKeys] = useState<string[]>([
    "sfield1", "class1cd", "class2cd", "subclass1cd", "analcode32", "subclass2cd", "size", "retail_price", "dealer_price", "prodtaxtype", "total_stock"
  ]);

  useEffect(() => {
    if (Object.keys(sheets).length === 0) {
      const defaultSheets = {
        "COMMON":  { schema: "COMMON_FIELDS",  gridData: {}, rowsCount: 1,  modifiedRows: new Set(), deletedRows: new Set() },
        "ITEM":    { schema: "ITEM_MASTER",    gridData: {}, rowsCount: 100, modifiedRows: new Set(), deletedRows: new Set() },
        "CL12":    { schema: "CLASS12COMBO",   gridData: {}, rowsCount: 20, modifiedRows: new Set(), deletedRows: new Set() },
        "SC1":     { schema: "SUBCLASS1CAT",   gridData: {}, rowsCount: 20, modifiedRows: new Set(), deletedRows: new Set() },
        "SC2":     { schema: "SUBCLASS2CAT",   gridData: {}, rowsCount: 20, modifiedRows: new Set(), deletedRows: new Set() },
        "SIZE":    { schema: "SIZECAT",        gridData: {}, rowsCount: 20, modifiedRows: new Set(), deletedRows: new Set() },
        "ATTRS":   { schema: "ATTRIBUTES",     gridData: {}, rowsCount: 30, modifiedRows: new Set(), deletedRows: new Set() },
      };
      
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const migrationMap: Record<string, string> = {
            "Common Fields": "COMMON",
            "Item Master": "ITEM",
            "CLASS12COMBO": "CL12",
            "SUBCLASS1CAT": "SC1",
            "SUBCLASS2CAT": "SC2",
            "SIZECAT": "SIZE",
            "Master Attributes": "ATTRS"
          };

          Object.keys(parsed).forEach(oldName => {
            const name = migrationMap[oldName] || oldName;
            addSheet(name, {
              ...parsed[oldName],
              modifiedRows: new Set(parsed[oldName].modifiedRows || []),
              deletedRows: new Set(parsed[oldName].deletedRows || [])
            });
          });
        } catch (e) {
          Object.keys(defaultSheets).forEach(name => addSheet(name, defaultSheets[name]));
        }
      } else {
        Object.keys(defaultSheets).forEach(name => addSheet(name, defaultSheets[name]));
        
        const initial: any = {};
        initialData.forEach((item, ri) => {
          SCHEMAS.ITEM_MASTER.forEach((col, ci) => {
            initial[`${ri + 1}-${ci}`] = item[col.key] ?? "";
          });
        });
        updateSheet("ITEM", { gridData: initial, rowsCount: Math.max(initialData.length + 50, 100) });
      }
    }
  }, []);

  const currentSheet = sheets[activeSheet] || { gridData: {}, modifiedRows: new Set(), deletedRows: new Set(), rowsCount: 50, schema: "ITEM_MASTER" };
  
  // Dynamic Schema Logic
  const currentSchema = useMemo(() => {
    if (activeSheet === "ITEM") {
      return ALL_FIELDS.filter(f => visibleFieldKeys.includes(f.key));
    }
    if (activeSheet === "COMMON") {
      return ALL_FIELDS.filter(f => commonFieldKeys.includes(f.key));
    }
    return SCHEMAS[currentSheet.schema as keyof typeof SCHEMAS] || SCHEMAS.ITEM_MASTER;
  }, [activeSheet, currentSheet.schema, visibleFieldKeys, commonFieldKeys]);

  const gridData = currentSheet.gridData || {};
  const rowsCount = currentSheet.rowsCount || 0;

  const handleCellChange = (r: number, c: number, val: any) => {
    const nextGridData = { ...gridData, [`${r}-${c}`]: val };
    const nextModified = new Set(currentSheet.modifiedRows);
    nextModified.add(r);
    updateSheet(activeSheet, { gridData: nextGridData, modifiedRows: nextModified });
  };

  const handleRowDelete = (r: number) => {
    const nextDeleted = new Set(currentSheet.deletedRows);
    if (nextDeleted.has(r)) nextDeleted.delete(r);
    else nextDeleted.add(r);
    updateSheet(activeSheet, { deletedRows: nextDeleted });
  };

  // ── S9 Hotkeys (Alt+1, Alt+2, Alt+3) ──
  useEffect(() => {
    const handleS9Hotkeys = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') { e.preventDefault(); setS9Tab('VIEW'); }
      if (e.altKey && e.key === '2') { e.preventDefault(); setS9Tab('COMMON'); setActiveSheet('COMMON'); }
      if (e.altKey && e.key === '3') { e.preventDefault(); setS9Tab('DETAILS'); setActiveSheet('ITEM'); }
    };
    window.addEventListener('keydown', handleS9Hotkeys);
    return () => window.removeEventListener('keydown', handleS9Hotkeys);
  }, [setActiveSheet]);

  const handleAddSheet = () => {
    const name = prompt("Enter new sheet name:", `New Sheet ${Object.keys(sheets).length + 1}`);
    if (name) addSheet(name);
  };

  const handlePaste = (r: number, c: number, text: string) => {
    const rows = text.split(/\r\n|\n|\r/);
    const nextGridData = { ...gridData };
    const nextModified = new Set(currentSheet.modifiedRows);

    rows.forEach((rowText, ri) => {
      if (!rowText) return;
      const cols = rowText.split('\t');
      cols.forEach((cellText, ci) => {
        const targetR = r + ri;
        const targetC = c + ci;
        if (targetR <= rowsCount && targetC < currentSchema.length) {
          const col = currentSchema[targetC];
          if (!col.readonly) {
            nextGridData[`${targetR}-${targetC}`] = col.type === 'number' ? Number(cellText) : cellText.toUpperCase();
            nextModified.add(targetR);
          }
        }
      });
    });

    updateSheet(activeSheet, { gridData: nextGridData, modifiedRows: nextModified });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePullData = async () => {
    setIsPulling(true);
    try {
      const searchQuery = serverSearch.trim() || "*";
      const SHEET_TABLE: Record<string, string> = {
        "ITEM": "itemmaster",
        "COMMON": "itemmaster",
        "CL12": "class12combo",
        "SC1": "subclass1cat",
        "SC2": "subclass2cat",
        "SIZE": "sizecat",
        "ATTRS": "genlookup",
      };
      const tableName = SHEET_TABLE[activeSheet] || "itemmaster";
      const response = await api.legacy.getData(tableName, { search: searchQuery, limit: 100 });
      const rows = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      if (rows.length === 0) {
        showToast(`No records found in ${tableName}.`, 'error');
        return;
      }

      const newData: any = {};
      rows.forEach((item: any, ri: number) => {
        currentSchema.forEach((col: any, ci: number) => {
          let val = item[col.key] ?? item[col.key.toLowerCase()] ?? "";
          if (typeof val === 'boolean') val = val ? 'Y' : 'N';
          newData[`${ri + 1}-${ci}`] = val;
        });
      });

      updateSheet(activeSheet, { gridData: newData, rowsCount: Math.max(rows.length + 20, 50) });
      showToast(`Pulled ${rows.length} records.`, 'success');
    } catch (err) {
      showToast("Pull failed.", 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const handleSave = async () => {
    setValidationErrors({});
    setIsSaving(true);
    try {
      const itemsToSave: any[] = [];
      const errors: Record<number, string> = {};

      for (let r = 1; r <= rowsCount; r++) {
        if (currentSheet.deletedRows.has(r)) continue;
        const item: any = {};
        let hasData = false;

        currentSchema.forEach((col: any, ci: number) => {
          const val = gridData[`${r}-${ci}`];
          if (val !== undefined && val !== "") {
            item[col.key] = col.type === "number" ? Number(val) : val;
            hasData = true;
          }
        });

        if (!hasData) continue;
        currentSchema.forEach((col: any) => {
          if (col.required && !item[col.key]) errors[r] = `${col.label} is required.`;
        });
        itemsToSave.push(item);
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        showToast("Validation failed.", 'error');
        setIsSaving(false);
        return;
      }

      if (itemsToSave.length === 0) {
        showToast("No data to save.", 'error');
        setIsSaving(false);
        return;
      }

      if (activeSheet === "ITEM" || activeSheet === "COMMON") {
        await api.items.batchCreate({ 
          items: itemsToSave, 
          cascade_class12: true, 
          cascade_subclasses: true, 
          cascade_sizecat: true, 
          sync_genlookup: true 
        });
      } else if (activeSheet === "CL12") {
        await api.legacy.bulkUpsert("class12combo", itemsToSave);
      } else if (activeSheet === "SC1") {
        await api.legacy.bulkUpsert("subclass1cat", itemsToSave);
      } else if (activeSheet === "SC2") {
        await api.legacy.bulkUpsert("subclass2cat", itemsToSave);
      } else if (activeSheet === "SIZE") {
        await api.legacy.bulkUpsert("sizecat", itemsToSave);
      } else if (activeSheet === "ATTRS") {
        await api.legacy.bulkUpsert("genlookup", itemsToSave);
      }

      showToast("Sync Successful.", 'success');
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(onBack, 1500);
    } catch (err: any) {
      showToast("Sync failed: " + (err?.response?.data?.detail || err.message), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyCommon = () => {
    const commonSheet = sheets["COMMON"];
    if (!commonSheet) return;
    
    const commonData = commonSheet.gridData;
    const itemSheet = sheets["ITEM"];
    if (!itemSheet) return;

    const nextGridData = { ...itemSheet.gridData };
    const nextModified = new Set(itemSheet.modifiedRows);
    let fillCount = 0;

    // Get current common schema indices
    const commonSchema = ALL_FIELDS.filter(f => commonFieldKeys.includes(f.key));
    const itemSchema = ALL_FIELDS.filter(f => visibleFieldKeys.includes(f.key));

    for (let r = 1; r <= itemSheet.rowsCount; r++) {
      if (itemSheet.deletedRows.has(r)) continue;
      
      let rowChanged = false;
      commonSchema.forEach((cCol, cIdx) => {
        const commonVal = commonData[`1-${cIdx}`];
        if (commonVal === undefined || commonVal === "") return;

        // Find corresponding column index in Item sheet
        const itemColIdx = itemSchema.findIndex(f => f.key === cCol.key);
        if (itemColIdx === -1) return;

        const currentVal = nextGridData[`${r}-${itemColIdx}`];
        if (currentVal === undefined || currentVal === "") {
          nextGridData[`${r}-${itemColIdx}`] = commonVal;
          rowChanged = true;
          fillCount++;
        }
      });

      if (rowChanged) nextModified.add(r);
    }

    if (fillCount > 0) {
      updateSheet("ITEM", { gridData: nextGridData, modifiedRows: nextModified });
      showToast(`Auto-filled ${fillCount} empty cells from Common data.`, 'success');
    } else {
      showToast("No empty cells to fill.", 'error');
    }
  };

  return (
    <SovereignShell 
      title="Item Master Workbench"
      isFullscreen={isFullscreen}
      icon={<FileSpreadsheet className="text-[var(--accent)]" size={24} />}
      headerActions={(
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-[var(--border-subtle)] p-1 bg-[var(--background)] h-10">
            <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="w-8 h-full hover:bg-[var(--surface-elevated)] flex items-center justify-center font-black">-</button>
            <span className="text-[10px] font-black w-10 text-center">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="w-8 h-full hover:bg-[var(--surface-elevated)] flex items-center justify-center font-black">+</button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={14} />
            <input 
              type="text"
              placeholder="Pull NIKE..."
              className="bg-[var(--background)] border border-[var(--border-subtle)] py-2 pl-10 pr-4 text-[10px] font-black uppercase w-40 outline-none focus:border-amber-500"
              value={serverSearch}
              onChange={(e) => setServerSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePullData()}
            />
          </div>

          <button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 text-white px-6 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 shadow-lg transition-all">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} COMMIT LEDGER
          </button>
          
          {activeSheet === "ITEM" && (
            <button 
              onClick={handleApplyCommon}
              className="bg-amber-500 text-white px-6 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-600 shadow-lg transition-all"
            >
              <FileSpreadsheet size={16} /> SMART-FILL (COMMON)
            </button>
          )}
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-10 h-10 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--surface-elevated)]">
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button onClick={onBack} className="w-10 h-10 border border-[var(--border-subtle)] flex items-center justify-center text-rose-500 hover:bg-rose-50">
            <X size={20} />
          </button>
        </div>
      )}
      footer={(
        <div className="bg-[var(--aside-bg)] text-white px-8 h-10 flex items-center gap-2 overflow-x-auto shrink-0 border-t border-white/10 select-none">
          {Object.keys(sheets).map(name => (
            <div
              key={name}
              onClick={() => setActiveSheet(name)}
              className={cn(
                "px-6 h-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all border-r border-white/5",
                activeSheet === name ? "bg-white text-slate-900" : "hover:bg-white/10 text-white/90"
              )}
            >
              {name}
              {!["COMMON", "ITEM", "CL12", "SC1", "SC2", "SIZE", "ATTRS"].includes(name) && (
                <button onClick={(e) => { e.stopPropagation(); deleteSheet(name); }} className="hover:text-rose-500 ml-2">×</button>
              )}
            </div>
          ))}
          <button onClick={handleAddSheet} className="px-4 h-full flex items-center hover:bg-white/10 text-emerald-400"><Plus size={14} /></button>
        </div>
      )}
    >
      <div className="flex bg-[var(--surface-container-low)] border-b border-[var(--border-subtle)] shrink-0">
        <button onClick={() => setS9Tab('VIEW')} className={cn("px-8 py-3 text-[10px] font-black uppercase tracking-widest", s9Tab==='VIEW' ? "bg-primary text-white" : "text-slate-400")}>1. Setup (Alt+1)</button>
        <button onClick={() => setS9Tab('COMMON')} className={cn("px-8 py-3 text-[10px] font-black uppercase tracking-widest", s9Tab==='COMMON' ? "bg-primary text-white" : "text-slate-400")}>2. Common (Alt+2)</button>
        <button onClick={() => setS9Tab('DETAILS')} className={cn("px-8 py-3 text-[10px] font-black uppercase tracking-widest", s9Tab==='DETAILS' ? "bg-primary text-white" : "text-slate-400")}>3. Details (Alt+3)</button>
      </div>

      <div className="flex-1 min-h-0 relative flex flex-col">
        {s9Tab === 'VIEW' && (
          <div className="absolute inset-0 bg-[var(--surface)] z-50 flex flex-col p-8 overflow-auto">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 text-[var(--text-tertiary)]">
              Select the fields to be displayed for capturing item details in the Item Details Grid.
            </h2>
            <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
              {/* Unselected Fields */}
              <div className="flex flex-col border border-[var(--border-subtle)] bg-[var(--surface-container-low)]">
                <div className="h-10 px-4 bg-[var(--aside-bg)] flex items-center justify-between border-b border-white/10">
                  <span className="text-[9px] font-black text-white/50 uppercase">Unselected Fields</span>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-1">
                  {ALL_FIELDS.filter(f => !visibleFieldKeys.includes(f.key)).map(f => (
                    <div key={f.key} className="flex items-center justify-between p-2 bg-white/5 border border-white/5 hover:border-white/20 group cursor-pointer" onClick={() => setVisibleFieldKeys([...visibleFieldKeys, f.key])}>
                      <span className="text-[10px] font-bold text-white/70">{f.label}</span>
                      <Plus size={14} className="text-emerald-400 opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Selected Fields */}
              <div className="flex flex-col border border-[var(--border-subtle)] bg-[var(--surface-container-low)]">
                <div className="h-10 px-4 bg-[var(--aside-bg)] flex items-center justify-between border-b border-white/10">
                  <span className="text-[9px] font-black text-white/50 uppercase">Selected Fields</span>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-1">
                  {visibleFieldKeys.map((key, i) => {
                    const f = ALL_FIELDS.find(field => field.key === key);
                    if (!f) return null;
                    return (
                      <div key={key} className="flex items-center justify-between p-2 bg-white/5 border border-white/5 hover:border-rose-500/20 group cursor-pointer" onClick={() => !f.required && setVisibleFieldKeys(visibleFieldKeys.filter(k => k !== key))}>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-white/30">{i + 1}.</span>
                          <span className={cn("text-[10px] font-bold", f.required ? "text-rose-400" : "text-white/70")}>{f.label}</span>
                        </div>
                        {!f.required && <X size={14} className="text-rose-400 opacity-0 group-hover:opacity-100" />}
                        {f.required && <span className="text-[8px] font-black uppercase text-rose-500/50">Mandatory</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setS9Tab('COMMON')} className="bg-primary text-white px-8 py-3 font-black text-[10px] uppercase tracking-widest shadow-xl">Save Field Selection</button>
              <button onClick={() => setS9Tab('DETAILS')} className="bg-[var(--surface-elevated)] text-[var(--text-tertiary)] px-8 py-3 font-black text-[10px] uppercase tracking-widest border border-[var(--border-subtle)]">Next → Common Fields (Alt+2)</button>
            </div>
          </div>
        )}

        {s9Tab === 'COMMON' && (
          <div className="absolute inset-0 bg-[var(--surface)] z-50 flex flex-col p-8 overflow-auto">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] mb-4 text-[var(--text-tertiary)]">
              Select fields to treat as common. Enter common data once per session - it will auto-fill blank cells on the grid.
            </h2>
            <div className="flex-1 flex gap-8 min-h-0">
              {/* Field Picker */}
              <div className="w-80 flex flex-col border border-[var(--border-subtle)] bg-[var(--surface-container-low)]">
                <div className="h-10 px-4 bg-[var(--aside-bg)] flex items-center border-b border-white/10">
                  <span className="text-[9px] font-black text-white/50 uppercase">Common Fields</span>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-1">
                  {ALL_FIELDS.filter(f => visibleFieldKeys.includes(f.key) && f.key !== 'stockno').map(f => (
                    <div 
                      key={f.key} 
                      className={cn(
                        "flex items-center gap-3 p-2 border cursor-pointer transition-all",
                        commonFieldKeys.includes(f.key) ? "bg-primary/20 border-primary/50 text-white" : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"
                      )}
                      onClick={() => {
                        if (commonFieldKeys.includes(f.key)) setCommonFieldKeys(commonFieldKeys.filter(k => k !== f.key));
                        else setCommonFieldKeys([...commonFieldKeys, f.key]);
                      }}
                    >
                      <div className={cn("w-3 h-3 border flex items-center justify-center", commonFieldKeys.includes(f.key) ? "bg-primary border-primary" : "border-white/20")}>
                        {commonFieldKeys.includes(f.key) && <div className="w-1.5 h-1.5 bg-white" />}
                      </div>
                      <span className="text-[10px] font-bold">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Entry Grid for Common Fields */}
              <div className="flex-1 flex flex-col border border-[var(--border-subtle)]">
                <SovereignGrid 
                  title="Common Field Data"
                  schema={currentSchema}
                  data={gridData}
                  rowsCount={1}
                  zoomLevel={zoomLevel}
                  modifiedRows={currentSheet.modifiedRows}
                  deletedRows={currentSheet.deletedRows}
                  selectedRows={new Set()}
                  setSelectedRows={() => {}}
                  onCellChange={handleCellChange}
                  onRowDelete={() => {}}
                  onPaste={handlePaste}
                />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => { setS9Tab('DETAILS'); setActiveSheet('ITEM'); }} className="bg-primary text-white px-8 py-3 font-black text-[10px] uppercase tracking-widest shadow-xl">Save Common Field Data</button>
              <button onClick={() => { setS9Tab('DETAILS'); setActiveSheet('ITEM'); }} className="bg-[var(--surface-elevated)] text-[var(--text-tertiary)] px-8 py-3 font-black text-[10px] uppercase tracking-widest border border-[var(--border-subtle)]">Next → Item Details (Alt+3)</button>
            </div>
          </div>
        )}

        <SovereignGrid 
          title={activeSheet}
          schema={currentSchema}
          data={gridData}
          rowsCount={rowsCount}
          zoomLevel={zoomLevel}
          modifiedRows={currentSheet.modifiedRows}
          deletedRows={currentSheet.deletedRows}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          validationErrors={validationErrors}
          onCellChange={handleCellChange}
          onRowDelete={handleRowDelete}
          onPaste={handlePaste}
        />
      </div>

      {toast && (
        <div className={cn(
          "fixed bottom-20 right-12 px-8 py-4 shadow-2xl z-[1000000] border font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4",
          toast.type === 'success' ? "bg-emerald-500 text-white border-emerald-400" : "bg-rose-500 text-white border-rose-400"
        )}>
          {toast.message}
        </div>
      )}
    </SovereignShell>
  );
}
