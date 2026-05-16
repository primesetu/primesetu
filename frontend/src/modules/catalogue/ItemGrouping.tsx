import React, { useState, useEffect, useMemo } from "react";
import { 
  Layers, Database, Loader2, Maximize2, Minimize2, X, Plus, 
  ShieldCheck, AlertTriangle, Box, ChevronRight, Settings2, Package, Search, Trash2, Save, Percent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, apiClient } from "@/api/client";
import { cn } from "@/lib/utils";

// Sovereign Architecture Imports
import { SovereignShell } from "@/components/sovereign/SovereignShell";
import { SovereignGrid, GridColumn } from "@/components/sovereign/SovereignGrid";
import { useSysParams } from "@/hooks/useSysParams";

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
  
  const [classifications, setClassifications] = useState<any[]>([
    { class1cd: "JEANS", class2cd: "LEVIS", billable: true, retailmarkup: 45, batchapplicable: false, stopsalesbefexpdays: 0 },
    { class1cd: "SHIRT", class2cd: "RAYMOND", billable: true, retailmarkup: 35, batchapplicable: false, stopsalesbefexpdays: 0 },
    { class1cd: "JACKET", class2cd: "ZARA", billable: true, retailmarkup: 55, batchapplicable: true, stopsalesbefexpdays: 30 },
    { class1cd: "SHOES", class2cd: "NIKE", billable: true, retailmarkup: 40, batchapplicable: true, stopsalesbefexpdays: 15 },
  ]);
  const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());
  const [deletedRows, setDeletedRows] = useState<Set<number>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  
  // Dynamic Captions from SysParams
  const class1Cap = getParam("ItemClass1Cap", "Product") as string;
  const class2Cap = getParam("ItemClass2Cap", "Brand") as string;

  const COLUMNS: GridColumn[] = useMemo(() => [
    { key: "class1cd", label: class1Cap, width: "160px", required: true, f2Type: "lookups", f2Category: "PRODUCT" },
    { key: "class2cd", label: class2Cap, width: "160px", required: true, f2Type: "lookups", f2Category: "BRAND" },
    { key: "billable", label: "Billable", width: "100px", type: "boolean" },
    { key: "sizegroup", label: "Size Group", width: "120px", f2Type: "lookups", f2Category: "SIZE_GROUP" },
    { key: "prodtaxtype", label: "Tax Type", width: "120px", f2Type: "lookups", f2Category: "TAX_TYPE" },
    { key: "retailmarkup", label: "Markup %", width: "100px", type: "number" },
    { key: "batchapplicable", label: "Batch Ctrl", width: "100px", type: "boolean" },
    { key: "stopsalesbefexpdays", label: "Exp Block (Days)", width: "150px", type: "number" },
  ], [class1Cap, class2Cap]);

  const fetchData = async () => {
    setIsPulling(true);
    try {
      const response = await apiClient.get('/catalog/classifications/');
      setClassifications(response.data.data || []);
      setModifiedRows(new Set());
      setDeletedRows(new Set());
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
        if (row.class1cd && row.class2cd) {
            try {
                await apiClient.post('/catalog/classifications/', row);
            } catch (err: any) {
                await apiClient.put(`/catalog/classifications/${row.class1cd}/${row.class2cd}`, row);
            }
        }
      }
      
      setToast({ message: "Class12Combo Rules Synchronized", type: 'success' });
      setModifiedRows(new Set());
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
      setSelectedRows(shift(selectedRows));
  };

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
          <div className="p-4 bg-navy/20 border-b border-white/5 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">Table: Class12Combo</span>
                <span className="text-sm font-black text-white uppercase tracking-tight">Institutional Combination Registry</span>
             </div>
             <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                   <Database size={14} className="text-white/40" />
                   <span className="text-[10px] font-bold text-white/60">Live Sovereign Link</span>
                </div>
             </div>
          </div>
          
          <SovereignGrid 
            title="Class12Combo Registry"
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
        <div className="w-[380px] bg-[#0f172a] border-l border-white/5 flex flex-col shrink-0">
          <div className="p-8 flex flex-col gap-8">
             <div className="flex flex-col gap-2">
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-gold">Combination DNA</h3>
                <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase">
                   Manage inheritance rules for {class1Cap} and {class2Cap} pairings.
                </p>
             </div>

             {activeRow ? (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                     <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{class1Cap} / {class2Cap}</div>
                     <div className="text-2xl font-black text-white tracking-tight uppercase leading-none">
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

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-1">
                        <Percent size={14} className="text-brand-gold mb-1" />
                        <span className="text-[9px] font-black text-white/30 uppercase">Retail Markup</span>
                        <span className="text-xl font-black text-white">{activeRow.retailmarkup || 0}%</span>
                     </div>
                     <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-1">
                        <Package size={14} className="text-brand-gold mb-1" />
                        <span className="text-[9px] font-black text-white/30 uppercase">Size Group</span>
                        <span className="text-lg font-black text-white truncate">{activeRow.sizegroup || "STD"}</span>
                     </div>
                  </div>

                  {activeRow.batchapplicable && (
                    <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                       <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="text-amber-500" size={14} />
                          <span className="text-[10px] font-black text-amber-500 uppercase">Expiry Lock Enabled</span>
                       </div>
                       <p className="text-[10px] font-bold text-white/50 leading-relaxed">
                          System will restrict billing {activeRow.stopsalesbefexpdays || 0} days prior to SKU expiration to prevent compliance violations.
                       </p>
                    </div>
                  )}
               </div>
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
