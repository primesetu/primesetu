/* ============================================================
 * SMRITI-OS — Institutional GRN Processor (v3.0)
 * Architecture: Transactional Integrity (PO -> GRN -> AP)
 * ============================================================ */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ValueFormatterParams, ModuleRegistry, ClientSideRowModelModule, NumberEditorModule, themeQuartz } from 'ag-grid-community';
import { api } from '@/api/client';
import { Truck, Search, Trash2, Save, Barcode, Box, Loader2, Plus, FileText, Link as LinkIcon, DollarSign } from 'lucide-react';
import { Button, Badge, cn } from '@/components/ui/SovereignUI';

ModuleRegistry.registerModules([ClientSideRowModelModule, NumberEditorModule]);

interface GRNLine {
  id: string;
  item_id: string;
  item_code: string;
  item_name: string;
  po_qty: number;
  qty_received: number;
  unit_cost_paise: number;
  total_paise: number;
}

export default function GRNProcessor() {
  const entryRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridReact>(null);

  const [mode, setMode] = useState<'DIRECT' | 'AGAINST_PO'>('DIRECT');
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [grnNumber, setGrnNumber] = useState('');
  
  // Transport & Compliance
  const [lrNumber, setLrNumber] = useState('');
  const [ewayBill, setEwayBill] = useState('');
  const [freightCharges, setFreightCharges] = useState(0);

  const [lines, setLines] = useState<GRNLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [activeEntry, setActiveEntry] = useState({ item_code: '', qty: 1, cost: 0 });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.vendors.list();
        setVendors(Array.isArray(res) ? res : (res.data || []));
      } catch (e) { console.error(e); }
    };
    fetchVendors();
    setGrnNumber(`GRN-${Math.random().toString(36).substring(7).toUpperCase()}`);
    entryRef.current?.focus();
  }, []);

  const commitLine = async () => {
    const searchVal = activeEntry.item_code.trim();
    if (!searchVal) return entryRef.current?.focus();

    const currentQty = Number(activeEntry.qty) || 1;
    const currentCost = Number(activeEntry.cost) || 0;
    setIsSearching(true);

    try {
      const results = await api.inventory.search(searchVal);
      const items = Array.isArray(results) ? results : (results.data || []);

      if (items.length > 0) {
        const item = items[0];
        const unit_cost = currentCost > 0 ? (currentCost * 100) : (item.cost_paise ?? 0);

        const newLine: GRNLine = {
          id: crypto.randomUUID(),
          item_id: item.id,
          item_code: item.item_code || item.sku || 'N/A',
          item_name: item.name,
          po_qty: mode === 'AGAINST_PO' ? currentQty + 5 : 0, // Mock PO mapping
          qty_received: currentQty,
          unit_cost_paise: unit_cost,
          total_paise: unit_cost * currentQty
        };
        setLines(prev => [newLine, ...prev]);
        setActiveEntry({ item_code: '', qty: 1, cost: 0 });
        entryRef.current?.focus();
      } else {
        alert("SKU Not Found in Master Database");
      }
    } catch (err) { console.error(err); } 
    finally { setIsSearching(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'sku' | 'qty' | 'cost') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'sku') commitLine();
      else if (field === 'qty') document.getElementById('grn-cost-input')?.focus();
      else if (field === 'cost') commitLine();
    }
  };

  const handleSave = async () => {
    if (!selectedVendor || lines.length === 0) return alert("Missing Vendor or Items");
    try {
      setLoading(true);
      await api.procurement.processGRN({
        vendor_id: selectedVendor,
        grn_number: grnNumber,
        lr_number: lrNumber,
        eway_bill: ewayBill,
        freight_charges: freightCharges * 100,
        items: lines.map(l => ({
          item_id: l.item_id,
          qty_received: l.qty_received,
          unit_cost_paise: l.unit_cost_paise
        }))
      });
      alert("GRN Committed. Accounts Payable Ledger Updated.");
      setLines([]);
      setGrnNumber(`GRN-${Math.random().toString(36).substring(7).toUpperCase()}`);
    } catch (e) { alert("GRN Failed."); } 
    finally { setLoading(false); }
  };

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'item_code', headerName: 'SKU CODE', width: 140, cellClass: 'font-mono font-bold' },
    { field: 'item_name', headerName: 'DESCRIPTION', flex: 1, minWidth: 200, cellClass: 'font-bold uppercase' },
    ...(mode === 'AGAINST_PO' ? [{ field: 'po_qty', headerName: 'PO QTY', width: 100, cellClass: 'text-right font-mono text-blue-600 font-bold' }] : []),
    { field: 'qty_received', headerName: 'RCVD QTY', width: 100, type: 'numericColumn', editable: true, cellClass: 'text-right font-mono bg-yellow-50 font-bold' },
    { 
      field: 'unit_cost_paise', headerName: 'UNIT COST (₹)', width: 120, type: 'numericColumn', editable: true,
      valueFormatter: (p) => ((Number(p.value) || 0) / 100).toFixed(2), cellClass: 'text-right font-mono'
    },
    { 
      headerName: 'TOTAL VALUE (₹)', width: 150, type: 'numericColumn',
      valueGetter: p => ((Number(p.data.qty_received) || 0) * (Number(p.data.unit_cost_paise) || 0)) / 100,
      valueFormatter: (p) => (Number(p.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      cellClass: 'text-right font-mono font-black text-emerald-700'
    },
    {
      headerName: '', width: 50,
      cellRenderer: (p: any) => (
        <button onClick={() => setLines(prev => prev.filter(i => i.id !== p.data.id))} className="text-red-500 w-full h-full flex items-center justify-center hover:bg-red-50">
          <Trash2 size={14} />
        </button>
      )
    }
  ], [mode]);

  const totals = useMemo(() => lines.reduce((acc, curr) => ({
    qty: acc.qty + (Number(curr.qty_received) || 0),
    value: acc.value + (Number(curr.total_paise) || 0)
  }), { qty: 0, value: 0 }), [lines]);

  const grandTotal = (totals.value / 100) + freightCharges;

  // Institutional Design Tokens — theme-aware
  const inputCls = "h-9 bg-[var(--color-surface)] border-2 border-slate-900 rounded-none px-2 text-[12px] font-bold uppercase outline-none focus:border-blue-600 focus:bg-blue-50 transition-colors w-full";
  const labelCls = "block text-[10px] font-black uppercase text-slate-700 mb-1 tracking-widest";
  const blockCls = "bg-[var(--color-surface)] border-2 border-slate-900 p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-bg-body)] font-sans">
      
      {/* ── HEADER ── */}
      <header className="h-12 bg-slate-900 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs">
              <div className="w-7 h-7 bg-blue-600 rounded-none flex items-center justify-center shadow-inner">
                 <Truck size={14} />
              </div>
              SMRITI-OS | GRN Processor
           </div>
           <nav className="flex h-12 gap-1 ml-4">
              <button onClick={() => setMode('DIRECT')} className={cn("px-4 text-[10px] font-black uppercase border-b-4 transition-all", mode === 'DIRECT' ? "text-blue-400 border-blue-500" : "text-slate-400 border-transparent hover:text-white")}>Direct GRN</button>
              <button onClick={() => setMode('AGAINST_PO')} className={cn("px-4 text-[10px] font-black uppercase border-b-4 transition-all", mode === 'AGAINST_PO' ? "text-blue-400 border-blue-500" : "text-slate-400 border-transparent hover:text-white")}>Against PO</button>
           </nav>
        </div>
        <div className="flex items-center gap-4">
           <Badge variant="warning" className="font-mono font-black px-4 py-1 text-[11px] rounded-none">BATCH: {grnNumber}</Badge>
        </div>
      </header>

      {/* ── TRANSACTION META ── */}
      <section className="p-4 grid grid-cols-12 gap-4 shrink-0">
         <div className={cn(blockCls, "col-span-8 grid grid-cols-3 gap-4")}>
            <div className="col-span-3 pb-2 border-b-2 border-slate-900 mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
              <FileText size={14} className="text-blue-600"/> Supplier Details
            </div>
            {mode === 'AGAINST_PO' && (
              <div className="col-span-3">
                <label className={labelCls}>Link Purchase Order [F3]</label>
                <div className="flex gap-2">
                  <input className={inputCls + " font-mono border-blue-600 bg-blue-50"} placeholder="ENTER PO NUMBER..." />
                  <button className="bg-blue-600 text-white px-4 font-black uppercase text-[10px] border-2 border-slate-900 flex items-center gap-1"><LinkIcon size={12}/> Fetch</button>
                </div>
              </div>
            )}
            <div className="col-span-2">
              <label className={labelCls}>Vendor / Supplier Account</label>
              <select className={inputCls} value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}>
                <option value="">SELECT VENDOR</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name || v.descr}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Supplier Invoice No</label>
              <input className={inputCls + " font-mono"} placeholder="INV-REF..." />
            </div>
         </div>

         <div className={cn(blockCls, "col-span-4 grid grid-cols-2 gap-4")}>
            <div className="col-span-2 pb-2 border-b-2 border-slate-900 mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
              <Truck size={14} className="text-emerald-600"/> Transport & Compliance
            </div>
            <div>
              <label className={labelCls}>LR Number</label>
              <input className={inputCls} value={lrNumber} onChange={e => setLrNumber(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>E-Way Bill</label>
              <input className={inputCls} value={ewayBill} onChange={e => setEwayBill(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Freight Charges (₹)</label>
              <input type="number" className={inputCls + " font-mono text-right"} value={freightCharges} onChange={e => setFreightCharges(Number(e.target.value))} />
            </div>
         </div>
      </section>

      {/* ── AG GRID WORKSPACE ── */}
      <main className="flex-1 flex flex-col px-4 pb-4 overflow-hidden">
         <div className="flex-1 w-full border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] bg-[var(--color-surface)]">
            <AgGridReact
              theme={themeQuartz}
              ref={gridRef}
              rowData={lines}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, sortable: true }}
              animateRows={true}
              onGridReady={(params) => params.api.sizeColumnsToFit()}
              overlayNoRowsTemplate='<div class="text-[12px] font-black uppercase text-slate-400 tracking-widest mt-10">Scan items to begin inwarding</div>'
            />
         </div>

         {/* ── DIRECT ENTRY BAR ── */}
         <div className="bg-slate-900 border-2 border-slate-900 mt-4 p-3 rounded-none flex items-end gap-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex-1 relative">
               <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Scan Station [SKU]</label>
               <Barcode size={16} className="absolute left-3 bottom-2.5 text-blue-500 z-10" />
               <input ref={entryRef} className="w-full bg-slate-800 border-2 border-slate-700 h-10 pl-10 pr-3 text-[14px] font-mono font-black text-white uppercase outline-none focus:border-blue-500"
                placeholder="SCAN..." value={activeEntry.item_code} onChange={e => setActiveEntry({...activeEntry, item_code: e.target.value.toUpperCase()})} onKeyDown={e => handleKeyDown(e, 'sku')} />
            </div>
            <div className="w-32">
               <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Inward Qty</label>
               <input ref={qtyRef} type="number" className="w-full bg-slate-800 border-2 border-slate-700 h-10 px-3 text-right text-[14px] font-mono font-black text-white outline-none focus:border-blue-500"
                value={activeEntry.qty} onChange={e => setActiveEntry({...activeEntry, qty: Number(e.target.value)})} onKeyDown={e => handleKeyDown(e, 'qty')} />
            </div>
            <div className="w-40">
               <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Unit Cost (₹)</label>
               <input id="grn-cost-input" type="number" className="w-full bg-slate-800 border-2 border-slate-700 h-10 px-3 text-right text-[14px] font-mono font-black text-white outline-none focus:border-blue-500"
                placeholder="0.00" value={activeEntry.cost || ''} onChange={e => setActiveEntry({...activeEntry, cost: Number(e.target.value)})} onKeyDown={e => handleKeyDown(e, 'cost')} />
            </div>
            <Button onClick={commitLine} className="h-10 bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-400 text-[11px] font-black uppercase rounded-none px-6">
              ADD [↵]
            </Button>
         </div>
      </main>

      {/* ── FOOTER SUMMARY ── */}
      <footer className="bg-[var(--color-surface)] border-t-4 border-slate-900 flex justify-between px-8 py-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
         <div className="flex items-center gap-12">
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">SKU Lines</span>
               <span className="text-3xl font-mono font-black text-slate-900 leading-none">{lines.length}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Total Qty</span>
               <span className="text-3xl font-mono font-black text-slate-900 leading-none">{totals.qty}</span>
            </div>
         </div>

         <div className="flex items-center gap-8">
            <div className="text-right flex flex-col justify-center">
               <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Item Value</div>
               <div className="text-[14px] font-mono font-bold text-slate-600">₹{(totals.value / 100).toFixed(2)}</div>
            </div>
            <div className="text-right flex flex-col justify-center">
               <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Freight</div>
               <div className="text-[14px] font-mono font-bold text-slate-600">+ ₹{(freightCharges).toFixed(2)}</div>
            </div>
            <div className="h-10 w-px bg-slate-300" />
            <div className="text-right flex flex-col justify-center min-w-[200px]">
               <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Net Accounts Payable</div>
               <div className="text-4xl font-mono font-black text-slate-900 tracking-tighter">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <Button onClick={handleSave} disabled={loading} className="h-16 ml-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 border-2 border-emerald-700 text-[14px] font-black uppercase rounded-none px-8 shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all">
               <Save size={18} className="mr-2"/> POST GRN [F9]
            </Button>
         </div>
      </footer>
    </div>
  );
}
