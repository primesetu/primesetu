import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  PackagePlus, 
  Save, 
  Trash2, 
  Search, 
  Barcode, 
  Plus, 
  X, 
  Loader2, 
  FileSpreadsheet,
  DownloadCloud,
  CheckCircle2,
  ChevronLeft,
  Settings,
  History,
  ShoppingCart,
  ExternalLink,
  Printer
} from 'lucide-react';
import { 
  WorkbenchRibbon, 
  RibbonGroup, 
  RibbonButton 
} from '@/components/ui/WorkbenchUI';
import { api, apiClient } from '@/api/client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import BarcodePrintPreview from '../tools/BarcodePrintPreview';
import { useSysParams } from '@/hooks/useSysParams';
import { useCaptions, usePayFields, TrnTypes } from '@/hooks/useScreenSchema';

// ── TYPES ──────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  stockNo: string;
  description: string;
  qty: number;
  rate: number;
  mrp: number;
  taxRate: number;
  hsn: string;
  total: number;
}

interface PurchaseWorkbenchProps {
  onBack: () => void;
}

// ── COMPONENT ──────────────────────────────────────────────────────────────

export default function PurchaseWorkbench({ onBack }: PurchaseWorkbenchProps) {
  // ── State ──
  const [vendor, setVendor] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  // Quick Entry State
  const [quickEntry, setQuickEntry] = useState({ sku: '', qty: 1 });
  const [isSearching, setIsSearching] = useState(false);
  const [searchMatches, setSearchMatches] = useState<any[]>([]);

  // System Parameters
  const { getParam } = useSysParams();
  const enableBarcodePrinting = getParam('ENABLE_BARCODE_PRINTING', true);
  const autoPrintOnGRN = getParam('AUTO_PRINT_ON_GRN', false);
  const defaultTemplateName = getParam('DEF_BARCODE_TEMPLATE', null);

  // ── SmritiScreen Engine — Sovereign S9 field config ──────────────────────
  // Captions from AcceptDisplayDtls (trntype=2200 = Purchase)
  const { resolve: resolveCaption } = useCaptions(TrnTypes.PURCHASE);
  // Payment extra fields — active paymode (null = no payment panel open)
  const [activePaymode, setActivePaymode] = useState<number | null>(null);
  const { fields: payExtraFields } = usePayFields(activePaymode);

  // Refs
  const skuInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const gridEndRef = useRef<HTMLDivElement>(null);

  // Print state
  const [printTemplates, setPrintTemplates] = useState<any[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPrintTemplate, setSelectedPrintTemplate] = useState<any | null>(null);

  useEffect(() => {
    // Fetch Barcode Templates
    apiClient.get('/barcode/templates').then(res => {
      const templates = res.data || [];
      setPrintTemplates(templates);
      if (templates.length > 0) {
        if (defaultTemplateName) {
          const matched = templates.find((t: any) => t.name === defaultTemplateName);
          setSelectedPrintTemplate(matched || templates[0]);
        } else {
          setSelectedPrintTemplate(templates[0]);
        }
      }
    }).catch(console.error);
  }, [defaultTemplateName]);

  // ── Business Logic ──

  const totals = useMemo(() => {
    return lines.reduce((acc, l) => ({
      qty: acc.qty + l.qty,
      tax: acc.tax + (l.rate * l.qty * (l.taxRate / 100)),
      basic: acc.basic + (l.rate * l.qty),
      net: acc.net + l.total
    }), { qty: 0, tax: 0, basic: 0, net: 0 });
  }, [lines]);

  const handleScan = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickEntry.sku.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.inventory.search(quickEntry.sku.trim());
      const items = Array.isArray(res) ? res : (res?.data || []);
      
      if (items.length === 1) {
        // Auto-add single match (S9 Fast Entry)
        addLine(items[0]);
      } else if (items.length > 1) {
        setSearchMatches(items);
      } else {
        // Not found
        alert(`SKU [${quickEntry.sku}] not found in registry.`);
        setQuickEntry(p => ({ ...p, sku: '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, [quickEntry.sku]);

  const addLine = (item: any) => {
    const rate = item.cost_price || 0;
    const taxRate = item.tax_rate || 18;
    const qty = quickEntry.qty || 1;
    const basic = rate * qty;
    const total = basic + (basic * (taxRate / 100));

    const newLine: LineItem = {
      id: crypto.randomUUID(),
      stockNo: item.stockno || item.sku || '—',
      description: item.itemdesc || item.name || 'Unknown Item',
      qty,
      rate,
      mrp: item.retail_price || 0,
      taxRate,
      hsn: item.hsn_code || '—',
      total
    };

    setLines(prev => [...prev, newLine]);
    setQuickEntry({ sku: '', qty: 1 });
    setSearchMatches([]);
    skuInputRef.current?.focus();
    
    // Auto-scroll to bottom
    setTimeout(() => gridEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handlePost = async () => {
    if (!vendor || !invoiceNo || lines.length === 0) {
      alert("Missing Vendor, Invoice No, or Items.");
      return;
    }
    setIsPosting(true);
    try {
      // Simulate post logic
      const payload = {
        vendor_code: vendor,
        bill_no: invoiceNo,
        bill_date: invoiceDate,
        items: lines.map(l => ({ stockno: l.stockNo, qty: l.qty, rate: l.rate }))
      };
      await api.purchase.finalizeGRN(payload);
      alert("Purchase Posted to Ledger successfully.");
      
      if (autoPrintOnGRN && printTemplates.length > 0) {
        setShowPrintModal(true);
      } else {
        setLines([]);
      }
      setInvoiceNo('');
    } catch {
      alert("Posting failed.");
    } finally {
      setIsPosting(false);
    }
  };

  // ── UI RENDER ─────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* ── TOP RIBBON (S9 Standard) ── */}
      <WorkbenchRibbon>
        <div className="flex items-center">
          <button
            onClick={() => onBack()}
            className="p-3 mr-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <RibbonGroup label="Home">
            <RibbonButton 
              icon={CheckCircle2} 
              label="Post" 
              variant="primary" 
              onClick={handlePost}
              disabled={isPosting || lines.length === 0}
              shortcut="F9" 
            />
            <RibbonButton 
              icon={ExternalLink} 
              label="Popout" 
              onClick={() => window.open('/popout/purchase_entry', '_blank', 'width=1400,height=900')} 
            />
            <RibbonButton 
              icon={X} 
              label="Clear" 
              onClick={() => { if(confirm('Clear current document?')) setLines([]); }}
              shortcut="Esc" 
            />
          </RibbonGroup>

          <RibbonGroup label="Document">
            <RibbonButton icon={Search} label="S9 History" onClick={() => {}} />
            <RibbonButton icon={FileSpreadsheet} label="Import" onClick={() => {}} shortcut="Alt+I" />
            {enableBarcodePrinting && (
              <RibbonButton 
                icon={Printer} 
                label="Print Labels" 
                onClick={() => {
                  if(lines.length === 0) {
                    alert('No items to print.');
                    return;
                  }
                  if(printTemplates.length === 0) {
                    alert('No barcode templates found. Create one in Barcode Designer first.');
                    return;
                  }
                  setShowPrintModal(true);
                }} 
              />
            )}
          </RibbonGroup>

          <RibbonGroup label="View">
             <div className="flex flex-col items-center justify-center h-full px-4 border-l border-slate-200 dark:border-slate-800">
                <span className="text-[18px] font-black text-emerald-600 leading-none">₹{totals.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Net Document Value</span>
             </div>
          </RibbonGroup>
        </div>

        <div className="flex items-center gap-2 pr-4">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700">
             PURCHASE PROTOCOL v2.0
           </div>
        </div>
      </WorkbenchRibbon>

      {/* ── DOCUMENT HEADER ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 grid grid-cols-4 gap-6 shadow-sm z-20">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supplier Code [F2]</label>
          <input 
            type="text" 
            value={vendor}
            onChange={e => setVendor(e.target.value.toUpperCase())}
            placeholder="VENDOR-XXXX"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Number</label>
          <input 
            type="text" 
            value={invoiceNo}
            onChange={e => setInvoiceNo(e.target.value.toUpperCase())}
            placeholder="GRN/INV/001"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Date</label>
          <input 
            type="date" 
            value={invoiceDate}
            onChange={e => setInvoiceDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-4 text-xs font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-end justify-end pb-1 gap-4">
           <div className="text-right">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-60">Total Qty</div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{totals.qty} <span className="text-xs opacity-30">PCS</span></div>
           </div>
        </div>
      </div>

      {/* ── QUICK ENTRY BAR (S9 FAST SCAN) ── */}
      <div className="bg-emerald-600 dark:bg-emerald-700 p-3 flex items-center gap-4 shadow-xl z-10">
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 flex-1 border border-white/20">
           <Barcode className="text-white/60" size={18} />
           <form onSubmit={handleScan} className="flex-1 flex items-center gap-4">
              <input 
                ref={skuInputRef}
                autoFocus
                type="text"
                value={quickEntry.sku}
                onChange={e => setQuickEntry(p => ({ ...p, sku: e.target.value.toUpperCase() }))}
                placeholder="SCAN BARCODE OR TYPE SKU [F3]"
                className="bg-transparent text-white placeholder:text-white/30 text-sm font-black outline-none flex-1 uppercase tracking-wider"
              />
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-white/50 uppercase">Qty:</span>
                 <input 
                   ref={qtyInputRef}
                   type="number"
                   value={quickEntry.qty}
                   onChange={e => setQuickEntry(p => ({ ...p, qty: Number(e.target.value) }))}
                   className="bg-white/10 text-white w-16 text-center text-sm font-black outline-none rounded border border-white/10"
                 />
              </div>
              <button 
                type="submit"
                className="bg-white text-emerald-700 px-6 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg"
              >
                Enter
              </button>
           </form>
        </div>
      </div>

      {/* ── TRANSACTION GRID (Sovereign Ledger Style) ── */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 m-2 rounded-xl shadow-inner relative">
         <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
               <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-12 text-center">#</th>
                  <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-40">{resolveCaption('stockno', 'Stock No')}</th>
                  <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter flex-1">{resolveCaption('itemdesc', 'Description')}</th>
                  <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-24 text-right">{resolveCaption('docqty', 'Qty')}</th>
                  <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-32 text-right">{resolveCaption('docentrate', 'Rate')}</th>
                  <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-32 text-right">Tax Value</th>
                  <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-40 text-right">{resolveCaption('docentnetvalue', 'Line Total')}</th>
                  <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter w-12"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
               <AnimatePresence initial={false}>
                 {lines.map((l, idx) => (
                   <motion.tr 
                     key={l.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                   >
                      <td className="p-3 text-[11px] font-bold text-slate-400 text-center">{idx + 1}</td>
                      <td className="p-3 text-[11px] font-black text-emerald-600 font-mono tracking-wider uppercase">{l.stockNo}</td>
                      <td className="p-3 text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase">{l.description}</td>
                      <td className="p-3 text-[11px] font-black text-slate-800 dark:text-slate-100 text-right">{l.qty}</td>
                      <td className="p-3 text-[11px] font-black text-slate-800 dark:text-slate-100 text-right">₹{l.rate.toFixed(2)}</td>
                      <td className="p-3 text-[11px] font-black text-amber-600 text-right">₹{(l.rate * l.qty * (l.taxRate / 100)).toFixed(2)}</td>
                      <td className="p-3 text-[12px] font-black text-emerald-700 text-right">₹{l.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right">
                         <button 
                           onClick={() => setLines(prev => prev.filter(x => x.id !== l.id))}
                           className="text-slate-300 hover:text-rose-500 transition-colors"
                         >
                           <Trash2 size={14} />
                         </button>
                      </td>
                   </motion.tr>
                 ))}
               </AnimatePresence>
               {lines.length === 0 && (
                 <tr>
                    <td colSpan={8} className="p-20 text-center opacity-20">
                       <div className="flex flex-col items-center gap-4">
                          <PackagePlus size={48} />
                          <div className="text-xs font-black uppercase tracking-[0.2em]">Ready for Sovereign Inwarding</div>
                       </div>
                    </td>
                 </tr>
               )}
               <div ref={gridEndRef} />
            </tbody>
         </table>
      </div>

      {/* ── FOOTER BAR ── */}
      <div className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between shadow-2xl shrink-0">
         <div className="flex items-center gap-12 divide-x divide-white/10">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Items</span>
               <span className="text-2xl font-black">{lines.length} <span className="text-xs font-bold text-white/30 tracking-tight">LINES</span></span>
            </div>
            <div className="pl-12 flex flex-col">
               <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Statutory Tax</span>
               <span className="text-2xl font-black text-amber-500">₹{totals.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pl-12 flex flex-col">
               <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Basic Value</span>
               <span className="text-2xl font-black">₹{totals.basic.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="text-right">
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] leading-none block mb-1">Payable Net</span>
               <span className="text-5xl font-black tracking-tighter">₹{totals.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <button 
              onClick={handlePost}
              disabled={isPosting || lines.length === 0}
              className="bg-emerald-500 text-white px-8 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg group disabled:opacity-50"
            >
               {isPosting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
               <span className="text-[9px] font-black uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">Post Ledger</span>
            </button>
         </div>
      </div>

      {/* ── STATUS BAR (S9 STYLE) ── */}
      <div className="bg-slate-200 dark:bg-slate-800 px-6 py-1 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
         <div className="flex items-center gap-8 divide-x divide-slate-300 dark:divide-slate-700">
            <span>F2: Find Vendor</span>
            <span className="pl-8">F3: Find Item</span>
            <span className="pl-8">F9: Finalize Document</span>
            <span className="pl-8">Alt+I: Excel Import</span>
         </div>
         <div>SMRITI-OS SOVEREIGN ARCHIVE v2.1</div>
      </div>

      {showPrintModal && selectedPrintTemplate && (
        <div className="z-[200] relative">
          <BarcodePrintPreview 
            template={selectedPrintTemplate}
            items={lines.flatMap(l => 
              Array(l.qty).fill({
                sku: l.stockNo,
                name: l.description,
                mrp: l.mrp,
                barcode: l.stockNo, // default to stockNo if barcode absent
                class1: '', // Cannot resolve from LineItem directly without full fetch
                class2: '',
                cost_price: l.rate
              })
            )}
            copiesPerItem={1}
            onClose={() => setShowPrintModal(false)}
          />
        </div>
      )}

    </div>
  );
}
