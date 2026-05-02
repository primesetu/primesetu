/* ============================================================
 * SMRITI-OS — Purchase Entry (AG Grid Edition)
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ValueFormatterParams, ModuleRegistry, GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberEditorModule, TextEditorModule, themeQuartz } from 'ag-grid-community';

// Register AG Grid Modules — matches project standard
ModuleRegistry.registerModules([ClientSideRowModelModule, NumberEditorModule, TextEditorModule]);

import { api } from '@/api/client';
import { useTheme } from '@/hooks/useTheme';
import {
  PackagePlus,
  Save,
  Trash2,
  Plus,
  X,
  Calculator,
  FileText,
  Barcode,
  Loader2,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui/SovereignUI';
import { motion, AnimatePresence } from 'framer-motion';

interface PurchaseItem {
  id: string;
  stockNo: string;
  description: string;
  grade: string;
  batch: string;
  location: string;
  qty: number;
  rate: number;
  mrp: number;
  taxRate: number;
}

const PurchaseEntry: React.FC = () => {
  const { theme } = useTheme();
  const gridRef = useRef<AgGridReact>(null);
  const skuRef  = useRef<HTMLInputElement>(null);
  const qtyRef  = useRef<HTMLInputElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [billNo, setBillNo]   = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // ── Entry Bar State ──
  const [entry, setEntry] = useState({ sku: '', qty: 1, rate: 0 });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.purchase.getVendors();
        setVendors(data || []);
      } catch { /* silent */ }
    };
    load();
    skuRef.current?.focus();
  }, []);

  // Live SKU search while typing
  useEffect(() => {
    if (entry.sku.length < 3) { setSearchResults([]); setShowDropdown(false); return; }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.inventory.search(entry.sku);
        const list = Array.isArray(res) ? res : (res?.data || []);
        setSearchResults(list);
        setShowDropdown(list.length > 0);
      } catch { /* silent */ } finally { setIsSearching(false); }
    }, 220);
    return () => clearTimeout(t);
  }, [entry.sku]);

  const commitLine = useCallback(async (prod?: any) => {
    const target = prod || searchResults[0];
    if (!target && !entry.sku.trim()) return;

    if (!target) {
      // Direct lookup by code
      setIsSearching(true);
      try {
        const res = await api.inventory.search(entry.sku.trim());
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (list.length === 0) { alert('SKU Not Found'); skuRef.current?.select(); return; }
        doAddItem(list[0]);
      } catch { alert('Search failed'); } finally { setIsSearching(false); }
      return;
    }
    doAddItem(target);
  }, [entry, searchResults]);

  const doAddItem = (prod: any) => {
    const r = entry.rate > 0 ? entry.rate : (prod.cost_price || 0);
    const newItem: PurchaseItem = {
      id: crypto.randomUUID(),
      stockNo:     prod.stockno || prod.item_code || prod.sku || '—',
      description: prod.itemdesc || prod.name || 'Unknown',
      grade:       prod.grade   || 'G1',
      batch:       '',
      location:    'MAIN',
      qty:         Number(entry.qty) || 1,
      rate:        r,
      mrp:         prod.retail_price || prod.mrp || 0,
      taxRate:     18,
    };
    setItems(prev => [newItem, ...prev]);
    setEntry({ sku: '', qty: 1, rate: 0 });
    setSearchResults([]);
    setShowDropdown(false);
    skuRef.current?.focus();
  };

  const handleEntryKey = (e: React.KeyboardEvent, field: 'sku' | 'qty' | 'rate') => {
    if (e.key === 'Escape') { setShowDropdown(false); return; }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (field === 'sku')  { if (showDropdown) commitLine(searchResults[0]); else commitLine(); }
    if (field === 'qty')  { rateRef.current?.focus(); rateRef.current?.select(); }
    if (field === 'rate') { commitLine(); }
  };

  // F9 shortcut
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'F9') { e.preventDefault(); handlePost(); } };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [items, selectedVendor, billNo]);

  const handlePost = async () => {
    if (!selectedVendor || !billNo || items.length === 0) {
      alert('Fill Vendor, Invoice No, and add at least 1 item.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        vendor_code: selectedVendor,
        bill_no: billNo,
        bill_date: billDate,
        items: items.map(i => ({ stockno: i.stockNo, qty: i.qty, rate: i.rate, mrp: i.mrp, batchno: i.batch })),
      };
      const res = await api.purchase.finalizeGRN(payload);
      alert(`GRN ${res?.grn_no || '—'} Posted Successfully!`);
      setItems([]);
      setBillNo('');
    } catch { alert('Failed to post GRN'); } finally { setLoading(false); }
  };

  // ── AG Grid Column Definitions ──
  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'stockNo',
      headerName: 'STOCK NO',
      width: 140,
      pinned: 'left',
      cellStyle: { fontWeight: '900', fontFamily: 'monospace', color: 'var(--primary)', letterSpacing: '0.05em' },
    },
    {
      field: 'description',
      headerName: 'DESCRIPTION',
      flex: 1,
      minWidth: 200,
      cellStyle: { textTransform: 'uppercase', fontWeight: '700' },
    },
    { field: 'grade',    headerName: 'GRADE',    width: 80, editable: true },
    { field: 'batch',    headerName: 'BATCH',    width: 100, editable: true },
    { field: 'location', headerName: 'GODOWN',   width: 100, editable: true },
    {
      field: 'qty',
      headerName: 'QTY',
      width: 90,
      editable: true,
      type: 'numericColumn',
      cellStyle: { fontWeight: '900' },
    },
    {
      field: 'rate',
      headerName: 'RATE (₹)',
      width: 120,
      editable: true,
      type: 'numericColumn',
      valueFormatter: (p: ValueFormatterParams) => Number(p.value || 0).toFixed(2),
    },
    {
      headerName: 'VALUE (₹)',
      width: 130,
      type: 'numericColumn',
      cellStyle: { fontWeight: '700' },
      valueGetter: p => (Number(p.data?.qty || 0) * Number(p.data?.rate || 0)),
      valueFormatter: (p: ValueFormatterParams) => Number(p.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
    },
    {
      field: 'taxRate',
      headerName: 'TAX %',
      width: 85,
      editable: true,
      type: 'numericColumn',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'TAX AMT (₹)',
      width: 120,
      type: 'numericColumn',
      cellStyle: { color: '#e67e22', fontWeight: '700' },
      valueGetter: p => (Number(p.data?.qty || 0) * Number(p.data?.rate || 0)) * (Number(p.data?.taxRate || 0) / 100),
      valueFormatter: (p: ValueFormatterParams) => Number(p.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
    },
    {
      headerName: 'TOTAL (₹)',
      width: 140,
      type: 'numericColumn',
      pinned: 'right',
      cellStyle: { fontWeight: '900', color: 'var(--primary)', fontSize: '13px' },
      valueGetter: p => {
        const val = Number(p.data?.qty || 0) * Number(p.data?.rate || 0);
        return val + (val * Number(p.data?.taxRate || 0) / 100);
      },
      valueFormatter: (p: ValueFormatterParams) => `₹ ${Number(p.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      field: 'mrp',
      headerName: 'MRP (₹)',
      width: 110,
      editable: true,
      type: 'numericColumn',
      cellStyle: { color: '#27ae60', fontWeight: '700' },
      valueFormatter: (p: ValueFormatterParams) => `₹ ${Number(p.value || 0).toFixed(2)}`,
    },
    {
      headerName: '',
      width: 44,
      pinned: 'right',
      sortable: false,
      resizable: false,
      cellRenderer: (p: any) => (
        <button
          onClick={() => setItems(prev => prev.filter(i => i.id !== p.data.id))}
          className="w-full h-full flex items-center justify-center text-rose-400 hover:text-rose-600 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    suppressMovable: false,
    headerClass: 'text-[10px] font-black uppercase tracking-widest',
  }), []);

  // ── Totals ──
  const totals = useMemo(() => items.reduce((acc, i) => {
    const val = i.qty * i.rate;
    const tax = val * (i.taxRate / 100);
    return { skus: acc.skus + 1, qty: acc.qty + i.qty, value: acc.value + val, tax: acc.tax + tax, total: acc.total + val + tax };
  }, { skus: 0, qty: 0, value: 0, tax: 0, total: 0 }), [items]);

  const onGridReady = (e: GridReadyEvent) => e.api.sizeColumnsToFit();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">

      {/* ── HEADER ── */}
      <header className="h-[var(--topbar-h,52px)] bg-[var(--surface)] flex items-center px-6 justify-between shrink-0 border-b border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
            <PackagePlus size={16} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Purchase Inwarding</span>
          <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-2">Sovereign GRN Protocol v2.0</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setItems([])}
            className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border border-[var(--border-default)] rounded text-[var(--text-secondary)] hover:bg-[var(--surface-container)] transition-colors flex items-center gap-2"
          >
            <X size={12} /> Clear
          </button>
          <Button
            onClick={handlePost}
            className="h-8 px-6 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            POST ENTRY [F9]
          </Button>
        </div>
      </header>

      {/* ── DOCUMENT META ── */}
      <section className="bg-[var(--surface)] border-b border-[var(--border-subtle)] px-6 py-3 grid grid-cols-[280px_180px_160px_1fr] gap-4 items-end shrink-0">
        <div>
          <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Supplier / Vendor</label>
          <select
            className="w-full bg-[var(--surface-container)] border border-[var(--border-default)] rounded h-9 px-3 text-[11px] font-bold uppercase outline-none focus:border-[var(--primary)] transition-colors"
            value={selectedVendor}
            onChange={e => setSelectedVendor(e.target.value)}
          >
            <option value="">SELECT VENDOR...</option>
            {vendors.map(v => <option key={v.code || v.id} value={v.code || v.id}>{v.name || v.descr}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Invoice Number</label>
          <input
            placeholder="INV/24/001"
            value={billNo}
            onChange={e => setBillNo(e.target.value)}
            className="w-full bg-[var(--surface-container)] border border-[var(--border-default)] rounded h-9 px-3 text-[11px] font-mono font-bold uppercase outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Document Date</label>
          <input
            type="date"
            value={billDate}
            onChange={e => setBillDate(e.target.value)}
            className="w-full bg-[var(--surface-container)] border border-[var(--border-default)] rounded h-9 px-3 text-[11px] font-bold outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
        <div className="flex items-end justify-end gap-6">
          <div className="text-right">
            <div className="text-[9px] font-black uppercase text-[var(--text-tertiary)] tracking-widest">Document Value</div>
            <div className="text-2xl font-black text-[var(--primary)]">₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <Badge variant="warning" className="font-black px-4 h-9 text-[10px]">{items.length} LINES</Badge>
        </div>
      </section>

      {/* ── AG GRID ── */}
      <main className="flex-1 flex flex-col overflow-hidden p-2 gap-2">
        <div className="flex-1 w-full h-full">
          <AgGridReact
            ref={gridRef}
            theme={themeQuartz}
            rowData={items}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            stopEditingWhenCellsLoseFocus={true}
            onGridReady={onGridReady}
            onCellValueChanged={params => {
              // Keep local state in sync after inline edit
              const id = params.data.id;
              setItems(prev => prev.map(item => item.id === id ? { ...item, [params.colDef.field!]: params.newValue } : item));
            }}
            getRowId={p => p.data.id}
          />
        </div>

        {/* ── SKU ENTRY BAR ── */}
        <div className="bg-[var(--surface-container)] border border-[var(--border-subtle)] rounded p-3 shrink-0 relative">
          <div className="grid grid-cols-[260px_110px_140px_1fr_160px] gap-3 items-end">

            {/* SKU / Barcode */}
            <div className="relative">
              <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">
                Scan / Search Item [SKU · Barcode]
              </label>
              <div className="relative">
                {isSearching
                  ? <Loader2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)] animate-spin z-10" />
                  : <Barcode size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)] z-10" />
                }
                <input
                  ref={skuRef}
                  className="w-full bg-[var(--surface)] border border-[var(--border-default)] rounded h-10 pl-9 pr-3 text-[11px] font-black uppercase outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                  placeholder="READY TO SCAN..."
                  autoComplete="off"
                  value={entry.sku}
                  onChange={e => setEntry(p => ({ ...p, sku: e.target.value.toUpperCase() }))}
                  onKeyDown={e => handleEntryKey(e, 'sku')}
                />
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-full left-0 right-0 mb-1 bg-[var(--surface)] border border-[var(--border-default)] rounded shadow-2xl z-50 max-h-[260px] overflow-y-auto"
                  >
                    {searchResults.map(p => (
                      <div
                        key={p.id || p.stockno}
                        onClick={() => commitLine(p)}
                        className="px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-container)] cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="text-[11px] font-black text-[var(--primary)] font-mono">{p.stockno || p.item_code || p.sku}</div>
                          <div className="text-[10px] font-bold text-[var(--text-secondary)] truncate max-w-[180px]">{p.itemdesc || p.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-black">₹{(p.cost_price || 0).toFixed(2)}</div>
                          <div className="text-[9px] text-[var(--text-tertiary)] uppercase">MRP ₹{(p.retail_price || 0).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Qty */}
            <div>
              <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest text-right">Qty</label>
              <input
                ref={qtyRef}
                type="number"
                min="0.001"
                step="1"
                className="w-full bg-[var(--surface)] border border-[var(--border-default)] rounded h-10 px-3 text-right text-[11px] font-black outline-none focus:border-[var(--primary)] transition-colors"
                value={entry.qty}
                onChange={e => setEntry(p => ({ ...p, qty: Number(e.target.value) }))}
                onKeyDown={e => handleEntryKey(e, 'qty')}
                onFocus={e => e.target.select()}
              />
            </div>

            {/* Rate */}
            <div>
              <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest text-right">Cost Rate (₹)</label>
              <input
                ref={rateRef}
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-[var(--surface)] border border-[var(--border-default)] rounded h-10 px-3 text-right text-[11px] font-black outline-none focus:border-[var(--primary)] transition-colors"
                placeholder="0.00"
                value={entry.rate || ''}
                onChange={e => setEntry(p => ({ ...p, rate: Number(e.target.value) }))}
                onKeyDown={e => handleEntryKey(e, 'rate')}
                onFocus={e => e.target.select()}
              />
            </div>

            {/* Live Preview */}
            <div className="flex flex-col justify-end h-10 px-3 bg-[var(--surface)] rounded border border-[var(--border-subtle)]">
              <span className="text-[9px] font-black uppercase text-[var(--text-tertiary)] leading-none">Line Value</span>
              <span className="text-lg font-black text-[var(--text-primary)] leading-tight">
                ₹{((entry.qty || 1) * (entry.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Add Button */}
            <button
              onClick={() => commitLine()}
              className="h-10 bg-[var(--accent,#f59e0b)] text-black text-[10px] font-black uppercase tracking-widest rounded shadow-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus size={14} /> ADD LINE [↵]
            </button>
          </div>
        </div>
      </main>

      {/* ── FOOTER SUMMARY ── */}
      <footer className="bg-[var(--surface)] border-t border-[var(--border-subtle)] flex items-center justify-between px-8 py-3 shrink-0">
        <div className="flex items-center gap-10 divide-x divide-[var(--border-subtle)]">
          {[
            { l: 'SKUs',     v: totals.skus,  suffix: '' },
            { l: 'Qty',      v: totals.qty,   suffix: 'PCS' },
            { l: 'Tax Value', v: `₹${totals.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, suffix: '' },
          ].map(s => (
            <div key={s.l} className="pl-10 first:pl-0 flex flex-col">
              <span className="text-[9px] font-black uppercase text-[var(--text-tertiary)] tracking-widest">{s.l}</span>
              <span className="text-3xl font-black text-[var(--text-primary)] leading-none">{s.v} <span className="text-xs font-normal opacity-40">{s.suffix}</span></span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-[0.3em]">Net Document Value</span>
          <span className="text-5xl font-black text-[var(--primary)] tracking-tighter leading-none">
            ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <div className="flex items-center gap-1 mt-1 text-[var(--text-tertiary)]">
            <FileText size={10} />
            <span className="text-[9px] italic">Posts to stktrnhdr / stktrndetails on F9</span>
          </div>
        </div>
      </footer>

      {/* ── STATUS BAR ── */}
      <div className="h-[var(--status-bar-h,24px)] bg-[var(--surface-container-high)] flex items-center px-6 justify-between shrink-0 text-[var(--text-tertiary)] text-[9px] font-black">
        <div className="flex items-center gap-8 divide-x divide-[var(--border-subtle)]">
          <span className="px-3 first:pl-0 uppercase">F2: Vendor List</span>
          <span className="px-3 uppercase">F9: Post GRN</span>
          <span className="px-3 uppercase">Esc: Cancel Search</span>
        </div>
        <span className="uppercase opacity-60 tracking-widest">SMRITI-OS · PURCHASE PROTOCOL v2.0</span>
      </div>
    </div>
  );
};

export default PurchaseEntry;
