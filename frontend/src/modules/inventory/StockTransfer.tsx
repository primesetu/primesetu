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

import React, { useState, useMemo } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useStoreList,
  useStockTransfer,
  type TransferManifestItem,
  type StockTransferPayload,
} from '@/hooks/useWarehouse';
import { 
  DataTable, 
  Badge, 
  Button, 
  Card, 
  Input, 
  Text 
} from '@/components/ui/SovereignUI';

type Priority = 'Standard' | 'Urgent' | 'Overnight';
type TransferStatus = 'idle' | 'success' | 'error';

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

  const destinations = stores.filter(s => s.id !== sourceStore);

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

  const canSubmit =
    !isPending &&
    sourceStore !== '' &&
    destStore !== '' &&
    sourceStore !== destStore &&
    items.length > 0 &&
    items.every(i => i.qty > 0 && i.item_id !== '');

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

  // ── GRID COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "SKU / ITEM DESCRIPTION",
      accessor: (item: any) => (
        <div className="relative py-2">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy/20" />
           <input
             type="text"
             value={item.sku}
             onChange={e => updateSku(item.id, e.target.value)}
             placeholder="Scan or enter SKU..."
             className="w-full bg-navy/5 border-none rounded-xl pl-10 pr-4 h-10 text-xs font-mono font-bold outline-none focus:bg-navy/10 transition-all uppercase"
           />
        </div>
      ),
      flex: 2,
      pinned: 'left' as const
    },
    {
      header: "TRANSFER QTY",
      accessor: (item: any) => (
        <div className="flex justify-center py-2">
          <input
            type="number"
            min={1}
            value={item.qty}
            onChange={e => updateQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 bg-white border-2 border-navy/5 rounded-xl h-10 text-center text-sm font-black font-mono outline-none focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      ),
      width: 150,
      className: 'text-center'
    },
    {
      header: "ACTIONS",
      accessor: (item: any) => (
        <div className="flex justify-end pr-4">
           <Button variant="sec" size="sm" onClick={() => removeRow(item.id)} className="h-9 w-9 p-0 text-rose-500 hover:bg-rose-50 border-none">
              <Trash2 size={16} />
           </Button>
        </div>
      ),
      width: 100,
      pinned: 'right' as const
    }
  ], []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Notifications */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 font-black text-sm uppercase tracking-widest">
            <CheckCircle2 size={20} /> Transfer Executed · <span className="font-mono">{transferId}</span>
            <button onClick={() => setStatus('idle')} className="ml-4 opacity-60">×</button>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-rose-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 font-black text-sm uppercase tracking-widest">
            <XCircle size={20} /> {errorMsg}
            <button onClick={() => setStatus('idle')} className="ml-4 opacity-60">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-center bg-white/50 p-10 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-4xl font-serif font-black text-navy flex items-center gap-4">
            <Truck className="w-10 h-10 text-indigo-600" />
            Stock Transfer Protocol
          </h1>
          <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Multi-Node Inventory Redistribution Engine · Atomic Debit/Credit
          </p>
        </div>

        <Button
          onClick={handleProcess}
          disabled={!canSubmit}
          size="lg"
          className="h-14 px-10 rounded-[2rem] bg-indigo-600 text-white font-black text-xs tracking-widest shadow-2xl"
        >
          {isPending ? 'PROCESSING...' : 'EXECUTE TRANSFER'}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Route Config */}
        <Card className="lg:col-span-1 p-8 rounded-[2.5rem] border-navy/5 shadow-xl">
          <h3 className="text-sm font-black text-navy uppercase tracking-widest mb-6 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" /> Route Config
          </h3>

          <div className="space-y-6">
            <div>
              <Text variant="xs" className="text-muted uppercase tracking-widest mb-2">Source Location</Text>
              <select
                value={sourceStore}
                onChange={e => { setSourceStore(e.target.value); setDestStore(''); }}
                className="w-full bg-navy/5 border-2 border-transparent rounded-xl h-12 px-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">Select Source...</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex justify-center">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600 rotate-90" />
              </div>
            </div>

            <div>
              <Text variant="xs" className="text-muted uppercase tracking-widest mb-2">Destination Location</Text>
              <select
                value={destStore}
                onChange={e => setDestStore(e.target.value)}
                disabled={!sourceStore}
                className="w-full bg-navy/5 border-2 border-transparent rounded-xl h-12 px-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all disabled:opacity-40"
              >
                <option value="">Select Destination...</option>
                {destinations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <Text variant="xs" className="text-muted uppercase tracking-widest mb-2">Transfer Notes</Text>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Reason or reference..."
                className="w-full bg-navy/5 border-2 border-transparent rounded-xl p-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="mt-8 p-6 bg-indigo-50 rounded-3xl flex items-start gap-3">
            <AlertCircle size={18} className="text-indigo-600 mt-0.5" />
            <p className="text-[10px] text-indigo-900 leading-relaxed font-black uppercase tracking-tight">
              Stock is debited from source and credited to destination atomically.
            </p>
          </div>
        </Card>

        {/* Transfer Manifesto */}
        <Card className="lg:col-span-3 rounded-[2.5rem] border-navy/5 shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-navy px-10 py-6 flex justify-between items-center text-white">
            <h3 className="font-serif font-black uppercase tracking-tight text-lg">Transfer Manifesto</h3>
            <Button variant="pri" size="sm" onClick={addRow} className="bg-indigo-500 hover:bg-indigo-400 h-10 px-6 rounded-xl gap-2">
              <Plus size={16} /> Add Item
            </Button>
          </div>

          <div className="flex-1 min-h-[400px]">
            <DataTable 
              data={items}
              columns={columns}
              overlayNoRowsTemplate={`
                <div class="flex flex-col items-center justify-center opacity-10 h-full">
                   <PackageCheck size="60" class="mb-4" />
                   <div class="text-xs font-black uppercase tracking-[0.4em]">Manifesto Empty</div>
                </div>
              `}
            />
          </div>

          <div className="bg-cream/20 p-10 flex justify-between items-center border-t border-navy/5">
            <div className="flex gap-10">
              <div>
                <Text variant="xs" className="text-muted uppercase tracking-widest mb-1">Total Lines</Text>
                <div className="text-3xl font-serif font-black text-navy">{items.length}</div>
              </div>
              <div>
                <Text variant="xs" className="text-muted uppercase tracking-widest mb-1">Total Quantity</Text>
                <div className="text-3xl font-serif font-black text-navy">{totalQty}</div>
              </div>
            </div>

            <div className="text-right">
              <Text variant="xs" className="text-muted uppercase tracking-widest mb-2">Priority Protocol</Text>
              <div className="flex gap-2">
                {(['Standard', 'Urgent', 'Overnight'] as Priority[]).map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      priority === p ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-navy/40 border border-navy/5 hover:border-indigo-200'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
