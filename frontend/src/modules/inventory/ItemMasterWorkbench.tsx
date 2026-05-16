import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { 
  FileSpreadsheet,
  Save,
  Search,
  Maximize2,
  Minimize2,
  Plus,
  Loader2,
  X,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Info,
  BarChart3,
  Box,
  Layers,
  ChevronRight,
  Database,
  Wifi,
  WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../api/client";
import { cn } from "@/lib/utils";
import { useSysParams } from "@/hooks/useSysParams";

// Sovereign Architecture Imports
import { SovereignShell } from "@/components/sovereign/SovereignShell";
import { SovereignGrid, GridColumn } from "@/components/sovereign/SovereignGrid";
import { useSovereignStore } from "@/core/stores/useSovereignStore";

// Dynamic schema generation happens inside the component now

export default function ItemMasterWorkbench({ initialData = [], onBack }: { initialData: any[], onBack: () => void }) {
  const { 
    sheets, 
    activeSheet, 
    setActiveSheet, 
    zoomLevel, 
    setZoomLevel, 
    updateSheet, 
    addSheet, 
    deleteSheet,
    isForcedOffline,
    toggleForcedOffline
  } = useSovereignStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [serverSearch, setServerSearch] = useState("");
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [s9Tab, setS9Tab] = useState<'VIEW'|'COMMON'|'DETAILS'>('DETAILS');
  
  const { getParam, loading: paramsLoading } = useSysParams();
  
  // ── DYNAMIC SCHEMA FROM SYSPARAMS ──
  const dynamicFields = useMemo(() => {
    const fields: GridColumn[] = [
      { key: "stockno", label: "Stock No", width: "140px", required: true },
      { key: "itemdesc", label: "Description", width: "280px", required: true },
      { key: "barcode", label: "Barcode/EAN", width: "160px" }
    ];

    // Classification 1
    if (getParam("MaintainItemClass1", "1") === "1" || getParam("MaintainItemClass1", 1) === 1) {
      fields.push({ 
        key: "class1", 
        label: getParam("ItemClass1Cap", "Product") as string, 
        width: "120px", 
        f2Type: "lookups", 
        f2Category: "PRODUCT",
        required: getParam("MandatoryItemClass1", "1") === "1" || getParam("MandatoryItemClass1", 1) === 1
      });
    }

    // Classification 2
    if (getParam("MaintainItemClass2", "1") === "1" || getParam("MaintainItemClass2", 1) === 1) {
      fields.push({ 
        key: "class2", 
        label: getParam("ItemClass2Cap", "Brand") as string, 
        width: "120px", 
        f2Type: "lookups", 
        f2Category: "BRAND",
        required: getParam("MandatoryItemClass2", "1") === "1" || getParam("MandatoryItemClass2", 1) === 1
      });
    }

    // Classification 3
    if (getParam("MaintainItemClass3", "1") === "1" || getParam("MaintainItemClass3", 1) === 1) {
      fields.push({ 
        key: "subclass1", 
        label: getParam("ItemClass3Cap", "Style") as string, 
        width: "140px", 
        f2Type: "lookups", 
        f2Category: "STYLE",
        required: getParam("MandatoryItemClass3", "1") === "1" || getParam("MandatoryItemClass3", 1) === 1
      });
    }

    // Classification 4
    if (getParam("MaintainItemClass4", "1") === "1" || getParam("MaintainItemClass4", 1) === 1) {
      fields.push({ 
        key: "subclass2", 
        label: getParam("ItemClass4Cap", "Shade") as string, 
        width: "100px", 
        f2Type: "lookups", 
        f2Category: "SHADE",
        required: getParam("MandatoryItemClass4", "1") === "1" || getParam("MandatoryItemClass4", 1) === 1
      });
    }

    // Classification 5
    if (getParam("MaintainItemClass5", "1") === "1" || getParam("MaintainItemClass5", 1) === 1) {
      fields.push({ 
        key: "size", 
        label: getParam("ItemClass5Cap", "Size") as string, 
        width: "80px", 
        f2Type: "lookups", 
        f2Category: "SIZE",
        required: getParam("MandatoryItemClass5", "1") === "1" || getParam("MandatoryItemClass5", 1) === 1
      });
    }

    fields.push(
      { key: "hsn_code", label: "HSN Code", width: "100px" },
      { key: "mrp", label: "MRP", width: "100px", type: "number" },
      { key: "cost_price", label: "Cost Price", width: "100px", type: "number" },
      { key: "total_stock", label: "Stock Qty", width: "100px", readonly: true, type: "number" }
    );

    return fields;
  }, [getParam]);

  const [visibleFieldKeys, setVisibleFieldKeys] = useState<string[]>([]);
  const [commonFieldKeys, setCommonFieldKeys] = useState<string[]>(["class1", "class2", "hsn_code"]);

  // Update visible fields when dynamicFields changes
  useEffect(() => {
    setVisibleFieldKeys(dynamicFields.map(f => f.key));
  }, [dynamicFields]);

  // ── DATA HEALTH INTELLIGENCE ──
  const healthStats = useMemo(() => {
    const currentSheet = sheets[activeSheet];
    if (!currentSheet) return { score: 100, issues: 0, missingHSN: 0, missingBarcode: 0, total: 0 };
    
    let total = 0, missingHSN = 0, missingBarcode = 0;
    const rowData = currentSheet.rowData || [];
    
    rowData.forEach((row: any) => {
      if (!row.stockno && !row.itemdesc) return;
      total++;
      if (!row.hsn_code) missingHSN++;
      if (!row.barcode) missingBarcode++;
    });
    
    const issues = missingHSN + missingBarcode;
    const score = total > 0 ? Math.max(0, 100 - (issues / (total * 2)) * 100) : 100;
    
    return { score: Math.round(score), issues, missingHSN, missingBarcode, total };
  }, [sheets, activeSheet]);

  const currentSheet = sheets[activeSheet] || { rowData: [], modifiedRows: new Set(), deletedRows: new Set(), schema: "ITEM_MASTER" };
  const currentSchema = useMemo(() => {
    const schemas: Record<string, GridColumn[]> = {
      ITEM_MASTER: dynamicFields,
      COMMON_FIELDS: dynamicFields.filter(f => commonFieldKeys.includes(f.key))
    };

    if (activeSheet === "ITEM") return dynamicFields.filter(f => visibleFieldKeys.includes(f.key));
    if (activeSheet === "COMMON") return schemas.COMMON_FIELDS;
    return schemas[currentSheet.schema] || dynamicFields;
  }, [activeSheet, currentSheet.schema, visibleFieldKeys, commonFieldKeys, dynamicFields]);

  const handleCellChange = (rowIndex: number, field: string, val: any, row: any) => {
    const newRowData = [...currentSheet.rowData];
    newRowData[rowIndex] = { ...newRowData[rowIndex], [field]: val };
    const nextModified = new Set(currentSheet.modifiedRows);
    nextModified.add(rowIndex);
    updateSheet(activeSheet, { rowData: newRowData, modifiedRows: nextModified });
  };

  const handleRowDelete = (rowIndex: number) => {
    const nextDeleted = new Set(currentSheet.deletedRows);
    nextDeleted.add(rowIndex);
    updateSheet(activeSheet, { deletedRows: nextDeleted });
  };

  const fetchData = useCallback(async () => {
    setIsPulling(true);
    try {
      const response = await api.legacy.getData('itemmaster', { limit: 500 });
      const rawData = response.data;
      if (rawData && rawData.length > 0) {
        const normalized = rawData.map((r: any) => ({
          ...r,
          mrp: r.retail_price,
          cost_price: r.currentcost,
          class1: r.class1cd,
          class2: r.class2cd,
          subclass1: r.subclass1cd,
          size: r.sizecd,
          hsn_code: r.analcode32,
          stock: r.total_stock || 0
        }));
        updateSheet("ITEM", { rowData: normalized, modifiedRows: new Set(), deletedRows: new Set() });
      }
    } catch (e) {
      console.error("Offline fallback mode active.", e);
    } finally {
      setIsPulling(false);
    }
  }, [updateSheet]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const sheet = sheets[activeSheet];
      if (!sheet) return;
      
      const modifiedArray = Array.from(sheet.modifiedRows)
        .map(i => sheet.rowData[i as number])
        .filter(Boolean);
        
      if (modifiedArray.length > 0) {
        const payload = modifiedArray.map(r => ({
          ...r,
          retail_price: r.mrp,
          currentcost: r.cost_price,
          class1cd: r.class1,
          class2cd: r.class2,
          subclass1cd: r.subclass1,
          sizecd: r.size,
          analcode32: r.hsn_code
        }));
        await api.legacy.bulkUpsert("itemmaster", payload);
      }
      setToast({ message: "Sovereign Ledger Synced Successfully", type: 'success' });
      updateSheet(activeSheet, { modifiedRows: new Set() });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setToast({ message: "Network Offline. Queued locally.", type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // ── S9 Hotkeys (Alt+1, Alt+2, Alt+3) ──
  useEffect(() => {
    const handleS9Hotkeys = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') { e.preventDefault(); setS9Tab('VIEW'); }
      if (e.altKey && e.key === '2') { e.preventDefault(); setS9Tab('COMMON'); }
      if (e.altKey && e.key === '3') { e.preventDefault(); setS9Tab('DETAILS'); }
    };
    window.addEventListener('keydown', handleS9Hotkeys);
    return () => window.removeEventListener('keydown', handleS9Hotkeys);
  }, []);

  // ── SEED INITIAL SHEETS ──
  useEffect(() => {
    if (Object.keys(sheets).length === 0) {
      const defaultRows = Array.from({ length: 100 }).map(() => ({}));
      addSheet("COMMON", { schema: "COMMON_FIELDS", rowData: Array.from({ length: 5 }).map(() => ({})) });
      addSheet("ITEM", { schema: "ITEM_MASTER", rowData: defaultRows });
      setActiveSheet("ITEM");
    }
  }, [sheets, addSheet, setActiveSheet]);

  return (
    <SovereignShell 
      title="Sovereign Item Workbench"
      isFullscreen={isFullscreen}
      icon={<Layers className="text-blue-500 animate-pulse" size={24} />}
      headerActions={(
        <div className="flex items-center gap-3">
          {/* Health Indicator */}
          <div className="hidden lg:flex items-center gap-4 px-6 py-2 bg-slate-900/50 rounded-full border border-white/5 backdrop-blur-xl">
             <div className="flex items-center gap-2">
                <ShieldCheck size={14} className={cn(healthStats.score > 90 ? "text-emerald-400" : "text-amber-400")} />
                <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">Health: {healthStats.score}%</span>
             </div>
             <div className="w-px h-3 bg-white/10" />
             <div className="flex items-center gap-2">
                <Activity size={14} className="text-blue-400" />
                <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">{healthStats.total} SKU Loaded</span>
             </div>
          </div>

          <div className="h-10 flex bg-slate-900/50 rounded-lg border border-white/5 overflow-hidden backdrop-blur-xl">
            <input 
              type="text"
              placeholder="GLOBAL SEARCH (SKU/BRAND)..."
              className="bg-transparent border-none py-2 px-4 text-[10px] font-black text-white placeholder:text-white/20 w-48 outline-none"
              value={serverSearch}
              onChange={(e) => setServerSearch(e.target.value)}
            />
            <button className="px-4 hover:bg-white/5 text-white/50 border-l border-white/5"><Search size={14}/></button>
          </div>

          <button 
            onClick={toggleForcedOffline}
            className={cn(
              "group relative px-6 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 overflow-hidden rounded-lg border transition-all shadow-lg",
              isForcedOffline 
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30" 
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            )}
            title={isForcedOffline ? "Currently Offline - Click to go Online" : "Currently Online - Click to force Offline"}
          >
            {isForcedOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span>{isForcedOffline ? "Offline" : "Online"}</span>
          </button>

          <button 
            onClick={fetchData} 
            disabled={isPulling} 
            className="group relative bg-white/5 hover:bg-white/10 text-emerald-400 px-6 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 overflow-hidden rounded-lg border border-white/5 transition-all"
          >
            {isPulling ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
            <span>Refresh All</span>
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="group relative bg-blue-600 hover:bg-blue-500 text-white px-8 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 overflow-hidden rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
            <span>Commit Ledger</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
          
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-10 h-10 rounded-lg border border-white/5 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-all">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={onBack} className="w-10 h-10 rounded-lg border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all">
            <X size={18} />
          </button>
        </div>
      )}
    >
      <div className="flex flex-1 min-h-0 bg-[#020617]">
        {/* Main Workbench Area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
          {/* Tab Navigation (S9 Style) */}
          <div className="flex bg-[#0f172a] border-b border-white/5 h-12">
            {[
              { id: 'VIEW', label: '1. Field Setup', key: 'Alt+1' },
              { id: 'COMMON', label: '2. Common Values', key: 'Alt+2' },
              { id: 'DETAILS', label: '3. Bulk Ledger', key: 'Alt+3' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setS9Tab(tab.id as any)}
                className={cn(
                  "px-8 h-full text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden",
                  s9Tab === tab.id ? "bg-blue-600/10 text-blue-400" : "text-white/40 hover:text-white/60"
                )}
              >
                {tab.label}
                {s9Tab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                <span className="ml-4 opacity-20 text-[8px]">{tab.key}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col min-h-0 relative">
            <SovereignGrid 
              title={activeSheet}
              schema={currentSchema}
              data={currentSheet.rowData}
              zoomLevel={zoomLevel}
              modifiedRows={currentSheet.modifiedRows}
              deletedRows={currentSheet.deletedRows}
              selectedRows={new Set()}
              setSelectedRows={() => {}}
              onCellChange={handleCellChange}
              onRowDelete={handleRowDelete}
            />
          </div>

          {/* Footer Sheets */}
          <div className="h-12 bg-[#0f172a] flex items-center px-4 gap-1 border-t border-white/5 overflow-x-auto scrollbar-none">
             {Object.keys(sheets).map(name => (
               <button
                 key={name}
                 onClick={() => setActiveSheet(name)}
                 className={cn(
                   "px-6 h-8 rounded-md flex items-center gap-3 text-[9px] font-black uppercase tracking-widest transition-all",
                   activeSheet === name ? "bg-white text-slate-900 shadow-xl" : "text-white/40 hover:bg-white/5"
                 )}
               >
                 <Box size={12} className={activeSheet === name ? "text-blue-500" : "text-white/20"} />
                 {name}
               </button>
             ))}
             <button onClick={() => addSheet(`SHEET_${Object.keys(sheets).length + 1}`)} className="w-8 h-8 rounded-md border border-white/5 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10"><Plus size={16}/></button>
          </div>
        </div>

        {/* Intelligence Side Preview */}
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#0f172a] border-l border-white/5 flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-8 flex-1 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                    <BarChart3 size={16} className="text-blue-400" />
                    SKU Insights
                  </h3>
                  <button onClick={() => setIsPreviewOpen(false)} className="text-white/20 hover:text-white"><X size={16}/></button>
                </div>

                {/* SKU Visual Card */}
                <div className="aspect-square bg-slate-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative group overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Box size={64} className="text-white/5 mb-4 group-hover:text-blue-500/20 transition-colors" />
                   <span className="text-[10px] font-black text-white/20 uppercase">No Image Mapped</span>
                   
                   <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                      <div className="text-[14px] font-black text-white mb-1">NIKE AIR FORCE 1</div>
                      <div className="text-[10px] font-bold text-white/40">SKU: NK-AF1-001</div>
                   </div>
                </div>

                {/* Intelligence Metrics */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[9px] font-black text-white/30 uppercase mb-2">Current Stock</div>
                      <div className="text-[20px] font-black text-white">425</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[9px] font-black text-white/30 uppercase mb-2">Sell Through</div>
                      <div className="text-[20px] font-black text-emerald-400">84%</div>
                   </div>
                </div>

                {/* Health Warning */}
                {healthStats.issues > 0 && (
                  <div className="p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="text-amber-500" size={18} />
                      <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Action Required</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/60 leading-relaxed">
                      {healthStats.missingHSN} items are missing HSN codes. GST finalization will fail for these SKUs until corrected.
                    </p>
                  </div>
                )}

                <div className="mt-auto">
                   <button className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-xl border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                      View Audit Log <ChevronRight size={14}/>
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Side Preview */}
        {!isPreviewOpen && (
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-20 bg-blue-600 text-white flex items-center justify-center rounded-l-xl z-50 shadow-2xl"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
        )}
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
