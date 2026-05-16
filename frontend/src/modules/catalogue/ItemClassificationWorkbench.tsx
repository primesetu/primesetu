import React, { useState, useEffect, useMemo } from "react";
import { 
  Layers, Database, Loader2, Maximize2, Minimize2, X, Plus, 
  ShieldCheck, AlertTriangle, Box, ChevronRight, Settings2, Package, Percent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, apiClient } from "@/api/client";
import { cn } from "@/lib/utils";

// Sovereign Architecture Imports
import { SovereignShell } from "@/components/sovereign/SovereignShell";
import { SovereignGrid, GridColumn } from "@/components/sovereign/SovereignGrid";
import { useSovereignStore } from "@/core/stores/useSovereignStore";
import { useSysParams } from "@/hooks/useSysParams";

export default function ItemClassificationWorkbench({ onBack }: { onBack?: () => void }) {
  const { getParam } = useSysParams();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [serverSearch, setServerSearch] = useState("");
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [classifications, setClassifications] = useState<any[]>([]);
  const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());
  const [deletedRows, setDeletedRows] = useState<Set<number>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  // ── DYNAMIC SCHEMA BASED ON SYSPARAMS ──
  const class1Cap = getParam("ItemClass1Cap", "Product") as string;
  const class2Cap = getParam("ItemClass2Cap", "Brand") as string;
  
  const COLUMNS: GridColumn[] = useMemo(() => [
    { key: "class1cd", label: class1Cap, width: "140px", required: true, f2Type: "lookups", f2Category: "PRODUCT" },
    { key: "class2cd", label: class2Cap, width: "140px", required: true, f2Type: "lookups", f2Category: "BRAND" },
    { key: "billable", label: "Billable", width: "100px", type: "boolean" },
    { key: "sizegroup", label: "Size Group", width: "120px" },
    { key: "prodtaxtype", label: "Product Tax", width: "120px" },
    { key: "retailmarkup", label: "Mark-up %", width: "100px", type: "number" },
    { key: "dealermarkup", label: "Dealer Mark-up %", width: "130px", type: "number" },
    { key: "prefvendorid", label: "Pref Vendor", width: "120px" },
    { key: "batchapplicable", label: "Batch Applicable", width: "140px", type: "boolean" },
    { key: "stopsalesbefexpdays", label: "Stop Sales Before (Days)", width: "180px", type: "number" }
  ], [class1Cap, class2Cap]);

  const fetchData = async () => {
    setIsPulling(true);
    try {
      const response = await apiClient.get('/catalog/classifications/');
      setClassifications(response.data.data || []);
      setModifiedRows(new Set());
      setDeletedRows(new Set());
    } catch (e) {
      console.error("Failed to fetch classifications", e);
      setToast({ message: "Failed to fetch classifications", type: "error" });
    } finally {
      setIsPulling(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const modifiedArray = Array.from(modifiedRows)
        .map(i => classifications[i as number])
        .filter(Boolean);
        
      for (const row of modifiedArray) {
        // We use PUT /catalog/classifications/{class1}/{class2} or POST if new
        if (row.class1cd && row.class2cd) {
            // Very naive check for "is new" vs "update" -> we just try POST then PUT if needed
            // Ideally we'd know if it's a new row. For now, let's try POST.
            try {
                await apiClient.post('/catalog/classifications/', row);
            } catch (err: any) {
                if (err.response && err.response.status === 400) {
                     // Might already exist, try update
                }
                await apiClient.put(`/catalog/classifications/${row.class1cd}/${row.class2cd}`, row);
            }
        }
      }
      
      setToast({ message: "Classifications Synced Successfully", type: 'success' });
      setModifiedRows(new Set());
      setTimeout(() => setToast(null), 3000);
      fetchData();
    } catch (e) {
      setToast({ message: "Failed to sync classifications", type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  const addRow = () => {
      setClassifications([{ class1cd: "", class2cd: "", billable: true, retailmarkup: 0 }, ...classifications]);
      const shift = (s: Set<number>) => new Set(Array.from(s).map(i => i + 1));
      setModifiedRows(shift(modifiedRows).add(0));
      setDeletedRows(shift(deletedRows));
      setSelectedRows(shift(selectedRows));
  };

  // Preview Logic
  const activeRow = selectedRows.size > 0 ? classifications[Array.from(selectedRows)[0]] : null;

  return (
    <SovereignShell 
      title="Item Classification Config"
      isFullscreen={isFullscreen}
      icon={<Settings2 className="text-emerald-400" size={24} />}
      headerActions={(
        <div className="flex items-center gap-3">
          <button 
            onClick={addRow} 
            className="group relative bg-white/5 hover:bg-white/10 text-white px-4 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 overflow-hidden rounded-lg border border-white/5 transition-all"
          >
            <Plus size={14} /> Add Row
          </button>
          <button 
            onClick={fetchData} 
            disabled={isPulling} 
            className="group relative bg-white/5 hover:bg-white/10 text-emerald-400 px-6 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 overflow-hidden rounded-lg border border-white/5 transition-all"
          >
            {isPulling ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
            <span>Refresh</span>
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="group relative bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-10 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 overflow-hidden rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
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
        {/* Main Grid Area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 relative">
          <SovereignGrid 
            title="Class12Combo"
            schema={COLUMNS}
            data={classifications}
            zoomLevel={1}
            modifiedRows={modifiedRows}
            deletedRows={deletedRows}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            onCellChange={handleCellChange}
            onRowDelete={handleRowDelete}
          />
        </div>

        {/* Intelligence Side Preview */}
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#0f172a] border-l border-white/5 flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-6 flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[12px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
                    <Layers size={16} className="text-emerald-400" />
                    Classification DNA
                  </h3>
                  <button onClick={() => setIsPreviewOpen(false)} className="text-white/20 hover:text-white"><X size={16}/></button>
                </div>

                {activeRow ? (
                  <>
                    <div className="p-5 bg-slate-900 rounded-xl border border-white/5 shadow-inner">
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">{class1Cap} / {class2Cap}</div>
                      <div className="text-[18px] font-black text-white">
                        {activeRow.class1cd || "UNSPECIFIED"} <span className="text-white/20 px-2">/</span> {activeRow.class2cd || "UNSPECIFIED"}
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        {activeRow.billable ? (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold uppercase tracking-widest border border-emerald-500/30">
                            Billable
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-[9px] font-bold uppercase tracking-widest border border-rose-500/30">
                            Non-Billable
                          </span>
                        )}
                        {activeRow.batchapplicable && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase tracking-widest border border-blue-500/30">
                            Batch Tracked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-center">
                          <Percent size={14} className="text-emerald-500 mb-2" />
                          <div className="text-[9px] font-black text-white/30 uppercase mb-1">Retail Markup</div>
                          <div className="text-[16px] font-black text-white">{activeRow.retailmarkup || 0}%</div>
                       </div>
                       <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-center">
                          <Package size={14} className="text-blue-500 mb-2" />
                          <div className="text-[9px] font-black text-white/30 uppercase mb-1">Tax Code</div>
                          <div className="text-[14px] font-black text-white">{activeRow.prodtaxtype || "None"}</div>
                       </div>
                    </div>

                    {activeRow.batchapplicable && (
                      <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="text-amber-500" size={14} />
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Expiry Rules Active</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/60">
                          Sales will automatically block {activeRow.stopsalesbefexpdays || 0} days before the defined expiry date.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                    <Box size={48} className="mb-4" />
                    <span className="text-[12px] font-black uppercase tracking-widest">No Selection</span>
                    <span className="text-[10px] font-bold mt-2 max-w-[200px]">Select a classification rule to view inheritance DNA</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Side Preview */}
        {!isPreviewOpen && (
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-20 bg-emerald-600 text-white flex items-center justify-center rounded-l-xl z-50 shadow-2xl"
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
