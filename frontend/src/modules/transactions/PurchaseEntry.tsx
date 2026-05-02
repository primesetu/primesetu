/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PackagePlus, 
  Save, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  Calculator,
  FileText
} from 'lucide-react';
import { api } from '@/api/client';
import { 
  DataTable, 
  Button, 
  Card, 
  Text,
  Input,
  Select,
  Label,
  cn
} from '@/components/ui/SovereignUI';
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
  value: number;
  mrp: number;
  taxRate: number;
  taxAmt: number;
  total: number;
}

const PurchaseEntry: React.FC = () => {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const data = await api.purchase.getVendors();
        setVendors(data);
      } catch (err) {
        console.error("Failed to load vendors", err);
      }
    };
    loadVendors();
  }, []);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    try {
      const results = await api.inventory.search(val);
      setSearchResults(results || []);
      setShowResults(true);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const addItem = (prod: any) => {
    const newItem: PurchaseItem = {
      id: Math.random().toString(36).substr(2, 9),
      stockNo: prod.stockno || prod.sku || prod.code,
      description: prod.itemdesc || prod.name || 'Unknown',
      grade: 'G1',
      batch: '',
      location: 'MAIN',
      qty: 1,
      rate: prod.cost_price || 0,
      value: prod.cost_price || 0,
      mrp: prod.retail_price || 0,
      taxRate: 18,
      taxAmt: (prod.cost_price || 0) * 0.18,
      total: (prod.cost_price || 0) * 1.18
    };
    setItems([...items, newItem]);
    setSearchQuery('');
    setShowResults(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof PurchaseItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updated.value = updated.qty * updated.rate;
          updated.taxAmt = updated.value * (updated.taxRate / 100);
          updated.total = updated.value + updated.taxAmt;
        }
        return updated;
      }
      return item;
    }));
  };

  const totals = useMemo(() => {
    return items.reduce((acc, i) => ({
      qty: acc.qty + i.qty,
      value: acc.value + i.value,
      tax: acc.tax + i.taxAmt,
      total: acc.total + i.total
    }), { qty: 0, value: 0, tax: 0, total: 0 });
  }, [items]);

  const columns = [
    { header: 'STOCK NO', accessor: 'stockNo', width: 150, className: 'font-mono font-bold text-primary' },
    { header: 'DESCRIPTION', accessor: 'description', width: 250 },
    { 
      header: 'QTY', 
      accessor: (r: PurchaseItem) => (
        <input type="number" value={r.qty} onChange={(e) => updateItem(r.id, 'qty', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none text-right font-black outline-none focus:text-accent" />
      ),
      width: 100, align: 'right' as const
    },
    { 
      header: 'RATE (₹)', 
      accessor: (r: PurchaseItem) => (
        <input type="number" value={r.rate} onChange={(e) => updateItem(r.id, 'rate', parseFloat(e.target.value) || 0)} className="w-full bg-transparent border-none text-right font-bold outline-none focus:text-accent" />
      ),
      width: 120, align: 'right' as const
    },
    { header: 'VALUE', accessor: (r: PurchaseItem) => `₹${r.value.toLocaleString()}`, width: 120, align: 'right' as const, className: 'font-bold' },
    { header: 'TAX %', accessor: 'taxRate', width: 80, align: 'center' as const },
    { header: 'TOTAL', accessor: (r: PurchaseItem) => `₹${r.total.toLocaleString()}`, width: 150, align: 'right' as const, className: 'font-black text-primary' },
    {
      header: '',
      accessor: (r: PurchaseItem) => (
        <button onClick={() => removeItem(r.id)} className="text-rose-500 hover:scale-110 transition-transform">
          <Trash2 size={16} />
        </button>
      ),
      width: 50, align: 'center' as const
    }
  ];

  const handlePost = async () => {
    if (!selectedVendor || !billNo || items.length === 0) {
      alert("Missing required fields!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        vendor_code: selectedVendor,
        bill_no: billNo,
        bill_date: billDate,
        items: items.map(i => ({ stockno: i.stockNo, qty: i.qty, rate: i.rate, mrp: i.mrp }))
      };
      const res = await api.purchase.finalizeGRN(payload);
      alert(`GRN ${res.grn_no} Posted Successfully!`);
      setItems([]);
      setBillNo('');
    } catch (err) {
      console.error("Post failed", err);
      alert("Failed to post GRN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-hidden">
      {/* ── TRANSACTIONAL HEADER ── */}
      <header className="h-20 bg-black text-white flex items-center px-8 justify-between border-b border-white/10 relative z-50">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-accent/20 rounded-xl">
            <PackagePlus size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Purchase Inwarding</h1>
            <p className="text-[10px] font-black text-accent uppercase tracking-widest opacity-60">Sovereign GRN Protocol v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-white hover:bg-white/10 h-12 px-6" onClick={() => setItems([])}>
             <X size={18} className="mr-2" /> CLEAR ALL
          </Button>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <Button onClick={handlePost} disabled={loading || items.length === 0} className="h-12 px-8 bg-accent text-black font-black hover:bg-accent/90">
             <Save size={18} className="mr-2" /> POST ENTRY
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Entry & Grid */}
        <div className="flex-1 flex flex-col p-8 gap-6 overflow-hidden">
          {/* Document Meta & Item Search */}
          <Card className="p-6 bg-[var(--surface)] border-[var(--border-subtle)] flex gap-6 items-end shadow-2xl relative">
            <div className="w-[300px] space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Supplier / Vendor</Label>
              <Select 
                value={selectedVendor} 
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="h-12 font-bold bg-[var(--surface-container-low)] border-[var(--border-subtle)]"
              >
                <option value="">SELECT VENDOR...</option>
                {vendors.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
              </Select>
            </div>
            <div className="w-[180px] space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Invoice Number</Label>
              <Input 
                placeholder="INV/24/001" 
                value={billNo} 
                onChange={(e) => setBillNo(e.target.value)}
                className="h-12 font-mono font-bold bg-[var(--surface-container-low)] border-[var(--border-subtle)]"
              />
            </div>
            <div className="w-[180px] space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Document Date</Label>
              <Input 
                type="date" 
                value={billDate} 
                onChange={(e) => setBillDate(e.target.value)}
                className="h-12 font-bold bg-[var(--surface-container-low)] border-[var(--border-subtle)]"
              />
            </div>
            <div className="flex-1 min-w-[250px] space-y-2 relative">
              <Label className="text-[10px] font-black uppercase tracking-widest text-accent">Scan / Search Item</Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <Input 
                  placeholder="ENTER STOCK NO / BARCODE..." 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value.toUpperCase())}
                  className="h-12 pl-12 border-accent/40 focus:border-accent font-black uppercase tracking-tighter bg-[var(--surface-container-low)]"
                />
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border border-accent/20 rounded-xl shadow-3xl z-[100] max-h-[400px] overflow-y-auto custom-scrollbar"
                  >
                    {searchResults.map((prod) => (
                      <div 
                        key={prod.id} 
                        onClick={() => addItem(prod)}
                        className="p-4 border-b border-[var(--border-subtle)] last:border-0 hover:bg-accent/5 cursor-pointer flex justify-between items-center group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-black text-accent">{prod.stockno || prod.sku}</div>
                          <div className="text-[10px] font-bold opacity-60">{prod.itemdesc || prod.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black">₹{(prod.cost_price || 0).toLocaleString()}</div>
                          <div className="text-[9px] font-bold opacity-40 uppercase">MRP: ₹{(prod.retail_price || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <div className="flex-1 overflow-hidden bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xl">
             <DataTable 
                data={items}
                columns={columns}
                rowHeight={60}
                headerHeight={50}
                className="h-full"
             />
          </div>
        </div>

        {/* Right Side: Registry Summary */}
        <div className="w-[400px] bg-black text-white p-8 flex flex-col justify-between border-l border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12">
               <Calculator size={160} />
            </div>
            
            <div className="relative z-10">
               <Text variant="xs" className="font-black text-white/40 uppercase tracking-[0.3em] mb-8">Registry Summary</Text>
               <div className="space-y-6">
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                   <Text variant="xs" className="font-black opacity-60 uppercase tracking-widest">Total Articles</Text>
                   <Text className="text-3xl font-black">{items.length} <span className="text-xs font-normal opacity-50">SKUS</span></Text>
                 </div>
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                   <Text variant="xs" className="font-black opacity-60 uppercase tracking-widest">Total Quantity</Text>
                   <Text className="text-3xl font-black">{totals.qty} <span className="text-xs font-normal opacity-50">PCS</span></Text>
                 </div>
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                   <Text variant="xs" className="font-black opacity-60 uppercase tracking-widest">Taxable Value</Text>
                   <Text className="text-2xl font-bold">₹{totals.value.toLocaleString()}</Text>
                 </div>
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                   <Text variant="xs" className="font-black opacity-60 uppercase tracking-widest">Tax Total</Text>
                   <Text className="text-2xl font-bold">₹{totals.tax.toLocaleString()}</Text>
                 </div>
               </div>
            </div>

            <div className="mt-12 relative z-10">
               <div className="text-[11px] font-black text-accent uppercase tracking-[0.4em] mb-2">Net Document Value</div>
               <div className="text-6xl font-black tracking-tighter">₹{totals.total.toLocaleString()}</div>
               
               <div className="mt-12 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 text-accent">
                    <FileText size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">System Memo</span>
                  </div>
                  <p className="text-[10px] mt-2 opacity-50 leading-relaxed italic">
                    This document will be posted to the Shoper 9 legacy schema (stktrnhdr/dtls) upon finalization. 
                    Zero cloud sovereignty enforced.
                  </p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseEntry;
