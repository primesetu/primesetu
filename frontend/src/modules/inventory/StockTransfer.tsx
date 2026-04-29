/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Module           : Stock Transfer Protocol
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Search,
  Trash2,
  Plus,
  Truck,
  Building2,
  PackageCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useStoreList,
  useStockTransfer,
  type TransferManifestItem,
  type StockTransferPayload,
} from '@/hooks/useWarehouse';

/* ─── Local state type ─────────────────────────────────────── */
type Priority = 'Standard' | 'Urgent' | 'Overnight';
type TransferStatus = 'idle' | 'success' | 'error';

/* ─── Component ────────────────────────────────────────────── */
export default function StockTransfer() {
  const { data: stores = [], isLoading: storesLoading } = useStoreList();
  const { mutateAsync: executeTransfer, isPending } = useStockTransfer();

  const [sourceStore, setSourceStore] = useState('');
  const [destStore, setDestStore]     = useState('');
  const [items, setItems]             = useState<TransferManifestItem[]>([]);
  const [priority, setPriority]       = useState<Priority>('Standard');
  const [notes, setNotes]             = useState('');
  const [status, setStatus]           = useState<TransferStatus>('idle');
  const [transferId, setTransferId]   = useState('');
  const [errorMsg, setErrorMsg]       = useState('');

  /* ── Derive valid destinations ──────────────────────────── */
  const destinations = stores.filter(s => s.id !== sourceStore);

  /* ── Manifest helpers ───────────────────────────────────── */
  const addRow = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now(), item_id: '', sku: '', name: '', qty: 1, maxQty: 0 },
    ]);
  };

  const removeRow = (id: number) =>
    setItems(prev => prev.filter(i => i.id !== id));

  const updateQty = (id: number, qty: number) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, qty } : i)));

  const updateSku = (id: number, sku: string) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, sku } : i)));

  const totalQty = items.reduce((acc, i) => acc + i.qty, 0);

  /* ── Validation ─────────────────────────────────────────── */
  const canSubmit =
    !isPending &&
    sourceStore !== '' &&
    destStore !== '' &&
    sourceStore !== destStore &&
    items.length > 0 &&
    items.every(i => i.qty > 0 && i.item_id !== '');

  /* ── Submit handler ─────────────────────────────────────── */
  const handleProcess = async () => {
    if (!canSubmit) return;

    const payload: StockTransferPayload = {
      source_store_id: sourceStore,
      destination_store_id: destStore,
      notes: notes || undefined,
      items: items.map(i => ({
        item_id: i.item_id,
        qty: i.qty,
        size: i.size,
        colour: i.colour,
        batch_no: i.batch_no,
      })),
    };

    try {
      const result = await executeTransfer(payload);
      setTransferId(result.transfer_id);
      setStatus('success');
      setItems([]);
      setDestStore('');
      setNotes('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '[SMRITI-OS] Transfer failed';
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  /* ─── Render ────────────────────────────────────────────── */
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Toast Notifications ─────────────────────────── */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            key="success-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 font-black text-sm uppercase tracking-widest"
          >
            <CheckCircle2 className="w-5 h-5" />
            Transfer Executed · <span className="font-mono">{transferId}</span>
            <button
              onClick={() => setStatus('idle')}
              className="ml-4 text-white/60 hover:text-white transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            key="error-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-rose-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 font-black text-sm uppercase tracking-widest"
          >
            <XCircle className="w-5 h-5" />
            {errorMsg}
            <button
              onClick={() => setStatus('idle')}
              className="ml-4 text-white/60 hover:text-white transition-colors"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ──────────────────────────────────────── */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy flex items-center gap-4">
            <Truck className="w-10 h-10 text-indigo-600" />
            Stock Transfer Protocol
          </h1>
          <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-2">
            Multi-Node Inventory Redistribution Engine · Atomic Debit/Credit
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleProcess}
            disabled={!canSubmit}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>Execute Transfer</>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Route Config ────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] shadow-xl border border-white/50">
            <h3 className="text-sm font-black text-navy uppercase tracking-widest mb-6 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" /> Route Config
            </h3>

            <div className="space-y-6">
              {/* Source */}
              <div>
                <label className="text-[9px] font-black text-muted uppercase tracking-widest block mb-2">
                  Source Location
                </label>
                <select
                  value={sourceStore}
                  onChange={e => { setSourceStore(e.target.value); setDestStore(''); }}
                  disabled={storesLoading}
                  className="w-full bg-cream/30 border-2 border-border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                >
                  <option value="">Select Source...</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center py-2">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600 rotate-90" />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="text-[9px] font-black text-muted uppercase tracking-widest block mb-2">
                  Destination Location
                </label>
                <select
                  value={destStore}
                  onChange={e => setDestStore(e.target.value)}
                  disabled={!sourceStore || storesLoading}
                  className="w-full bg-cream/30 border-2 border-border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 transition-all disabled:opacity-40"
                >
                  <option value="">Select Destination...</option>
                  {destinations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[9px] font-black text-muted uppercase tracking-widest block mb-2">
                  Transfer Notes
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Reason or reference..."
                  className="w-full bg-cream/30 border-2 border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <p className="text-[9px] text-indigo-900 leading-relaxed font-bold uppercase">
                Stock is debited from source and credited to destination atomically. This cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* ── Transfer Manifesto Table ─────────────────── */}
        <div className="lg:col-span-3">
          <div className="glass rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col">

            {/* Table Header */}
            <div className="bg-[#1a2340] px-10 py-6 flex justify-between items-center text-white">
              <h3 className="font-serif font-black uppercase tracking-tight">Transfer Manifesto</h3>
              <button
                onClick={addRow}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="bg-cream/30 text-[9px] font-black uppercase tracking-widest text-muted border-b border-border">
                  <tr>
                    <th className="px-10 py-5">SKU / Item Description</th>
                    <th className="px-6 py-5 text-center">Transfer Qty</th>
                    <th className="px-10 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <AnimatePresence>
                    {items.map((item, idx) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="hover:bg-cream/5 group"
                      >
                        {/* SKU Search */}
                        <td className="px-10 py-6">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                            <input
                              type="text"
                              value={item.sku}
                              onChange={e => updateSku(item.id, e.target.value)}
                              placeholder="Scan or enter SKU..."
                              className="w-full bg-cream/30 border-2 border-transparent focus:border-indigo-500/30 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold outline-none transition-all"
                            />
                          </div>
                        </td>

                        {/* Qty */}
                        <td className="px-6 py-6">
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={e => updateQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20 bg-white border-2 border-border rounded-xl px-3 py-2 text-center text-sm font-black font-mono outline-none focus:border-indigo-500 transition-all"
                            />
                          </div>
                        </td>

                        {/* Remove */}
                        <td className="px-10 py-6 text-right">
                          <button
                            onClick={() => removeRow(item.id)}
                            className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {/* Empty state */}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-muted opacity-40">
                          <PackageCheck className="w-16 h-16" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Items in Transfer List</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-cream/30 p-10 flex justify-between items-center border-t border-border">
              <div className="flex gap-10">
                <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Total Lines</p>
                  <p className="text-2xl font-black text-navy">{items.length}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Total Quantity</p>
                  <p className="text-2xl font-black font-mono text-navy">{totalQty}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-2">Transfer Priority</p>
                <div className="flex gap-2">
                  {(['Standard', 'Urgent', 'Overnight'] as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all ${
                        priority === p
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white border-border hover:border-indigo-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
