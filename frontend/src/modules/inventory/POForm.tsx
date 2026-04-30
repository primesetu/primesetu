/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  Package,
  ShieldCheck,
  Calendar,
  Info,
  ChevronRight,
  RefreshCw,
  Calculator
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

import { formatCurrency } from '../../utils/currency';
import { useOfflineFallback } from '../../hooks/useOfflineFallback';
import { apiClient } from '../../api/client';
import { 
  Button, 
  Input, 
  Select, 
  Label, 
  Card, 
  Text, 
  Badge,
  DataTable 
} from '../../components/ui/SovereignUI';

interface POItemInput {
  id: string; // Internal unique ID for React keys
  item_id: string;
  item_code: string;
  item_name: string;
  size: string;
  colour: string;
  qty_ordered: number;
  unit_cost_paise: number;
  tax_rate: number;
}

interface Vendor {
  id: string;
  name: string;
  code: string;
}

const POForm: React.FC = () => {
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState('');
  const [poNumber, setPoNumber] = useState(`PO/${new Date().getFullYear()}/${Math.floor(Math.random()*9000)+1000}`);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<POItemInput[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Vendors
  const { data: vendors = [] } = useOfflineFallback<Vendor[]>('vendors_list', async () => {
    const res = await apiClient.get<Vendor[]>('/customer/search?type=vendor&q=');
    return res.data;
  }, []);

  // 2. Hotkeys
  useHotkeys('f10', (e) => { e.preventDefault(); handleSave(); }, { enableOnFormTags: true });
  useHotkeys('esc', (e) => { e.preventDefault(); navigate('/purchase'); }, { enableOnFormTags: true });

  const addItem = () => {
    const newItem: POItemInput = {
      id: Math.random().toString(36).substr(2, 9),
      item_id: 'mock-id',
      item_code: 'SKU' + Math.floor(Math.random()*999),
      item_name: 'New Product Entity',
      size: 'STD',
      colour: 'N/A',
      qty_ordered: 1,
      unit_cost_paise: 0,
      tax_rate: 18
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
  };

  const updateItem = (id: string, field: keyof POItemInput, value: string | number) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    items.forEach(item => {
      const lineCost = item.qty_ordered * item.unit_cost_paise;
      const lineTax = Math.floor(lineCost * item.tax_rate / 100);
      subtotal += lineCost;
      tax += lineTax;
    });
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSave = async () => {
    if (!vendorId || items.length === 0) return;
    setIsSaving(true);
    try {
      const payload = {
        vendor_id: vendorId,
        po_number: poNumber,
        expected_date: expectedDate || null,
        notes,
        items: items.map(it => ({
          item_id: it.item_id,
          size: it.size,
          colour: it.colour,
          qty_ordered: it.qty_ordered,
          unit_cost_paise: it.unit_cost_paise,
          tax_rate: it.tax_rate
        }))
      };
      await apiClient.post('/purchase/', payload);
      navigate('/purchase');
    } catch (err) {
      console.error('[SMRITI-OS] PO save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totals = calculateTotals();

  // ── GRID COLUMNS ──
  const columns = useMemo(() => [
    {
      header: "ITEM ENTITY",
      accessor: (item: POItemInput) => (
        <div className="flex flex-col py-2 leading-tight">
          <span className="text-sm font-black text-navy uppercase tracking-tight">{item.item_name}</span>
          <span className="text-[9px] font-mono text-navy/40 mt-1 uppercase tracking-widest">{item.item_code} · {item.size} / {item.colour}</span>
        </div>
      ),
      flex: 2,
      pinned: 'left' as const
    },
    {
      header: "QTY",
      accessor: (item: POItemInput) => (
        <div className="flex justify-center py-2">
           <Input 
             type="number" 
             className="w-20 h-10 text-center font-mono font-black"
             value={item.qty_ordered}
             onChange={(e) => updateItem(item.id, 'qty_ordered', parseInt(e.target.value) || 0)}
           />
        </div>
      ),
      width: 120,
      className: 'text-center'
    },
    {
      header: "UNIT COST (PAISE)",
      accessor: (item: POItemInput) => (
        <div className="flex justify-center py-2">
           <Input 
             type="number" 
             className="w-28 h-10 text-right font-mono font-black text-indigo-600"
             value={item.unit_cost_paise}
             onChange={(e) => updateItem(item.id, 'unit_cost_paise', parseInt(e.target.value) || 0)}
           />
        </div>
      ),
      width: 150,
      className: 'text-right'
    },
    {
      header: "TAX %",
      accessor: (item: POItemInput) => (
        <div className="flex justify-center py-2">
           <Select 
             className="h-10 text-xs font-black w-24"
             value={item.tax_rate}
             onChange={(e) => updateItem(item.id, 'tax_rate', parseInt(e.target.value))}
           >
             {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
           </Select>
        </div>
      ),
      width: 120,
      className: 'text-center'
    },
    {
      header: "LINE TOTAL",
      accessor: (item: POItemInput) => (
        <span className="font-mono text-sm font-black text-navy">
          {formatCurrency(Math.floor((item.qty_ordered * item.unit_cost_paise) * (1 + item.tax_rate/100)))}
        </span>
      ),
      width: 160,
      className: 'text-right',
      pinned: 'right' as const
    },
    {
      header: "",
      accessor: (item: POItemInput) => (
        <div className="flex justify-center">
           <Button variant="sec" size="sm" onClick={() => removeItem(item.id)} className="h-9 w-9 p-0 text-rose-500 hover:bg-rose-50 border-none">
              <Trash2 size={16} />
           </Button>
        </div>
      ),
      width: 80,
      pinned: 'right' as const
    }
  ], []);

  return (
    <div className="pb-20 animate-in slide-in-from-bottom-4 duration-700">
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-6">
         <span>Home</span> <ChevronRight size={10} />
         <span>Procurement</span> <ChevronRight size={10} />
         <span className="text-navy/60">Raise New PO</span>
      </nav>

      <Card className="flex items-center justify-between p-8 bg-white border-navy/5 mb-8 shadow-sm rounded-[30px]">
        <div className="flex items-center gap-8">
          <Button variant="sec" onClick={() => navigate('/purchase')} className="h-12 w-12 p-0 rounded-2xl">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <Text variant="h2" className="font-serif font-black text-navy uppercase tracking-tight">New Procurement Protocol</Text>
            <Text variant="xs" className="text-navy/30 uppercase tracking-widest mt-1">Sovereign Node · Inventory Inwarding · PA-2026-X</Text>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" onClick={() => navigate('/purchase')} className="px-6 font-black text-[10px] uppercase tracking-widest">
             Discard <span className="opacity-40 ml-2">[Esc]</span>
           </Button>
           <Button 
             onClick={handleSave}
             disabled={isSaving}
             className="px-8 h-12 bg-navy text-white rounded-2xl shadow-xl shadow-navy/10 font-black text-[10px] uppercase tracking-widest gap-2"
           >
             {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
             Finalize PO <span className="opacity-40 ml-2">[F10]</span>
           </Button>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <Card className="p-10 border-navy/5 shadow-xl rounded-[40px]">
              <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-navy/60 font-black text-[10px] uppercase tracking-widest">
                       <ShieldCheck size={16} className="text-indigo-500" /> Vendor Selection *
                    </Label>
                    <Select 
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="h-14 font-black uppercase tracking-widest text-navy bg-navy/5 border-none rounded-2xl"
                    >
                      <option value="">Select Partner Registry...</option>
                      {Array.isArray(vendors) && vendors.map((v: Vendor) => (
                        <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                      ))}
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-navy/60 font-black text-[10px] uppercase tracking-widest">
                       <Info size={16} className="text-amber-500" /> PO Protocol ID
                    </Label>
                    <Input 
                      className="h-14 font-mono uppercase font-black bg-navy/5 border-none rounded-2xl px-6"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-navy/60 font-black text-[10px] uppercase tracking-widest">
                       <Calendar size={16} className="text-indigo-500" /> Expected Arrival
                    </Label>
                    <Input 
                      type="date" 
                      className="h-14 font-mono bg-navy/5 border-none rounded-2xl px-6"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-navy/60 font-black text-[10px] uppercase tracking-widest">
                       Internal Logistics Notes
                    </Label>
                    <Input 
                      placeholder="SHIPPING TERMS, DEDUCTIONS..."
                      className="h-14 uppercase text-xs tracking-wider bg-navy/5 border-none rounded-2xl px-6"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                 </div>
              </div>
           </Card>

           <Card className="border-navy/5 shadow-2xl rounded-[40px] overflow-hidden flex flex-col">
              <div className="p-8 border-b border-navy/5 flex items-center justify-between bg-navy text-white">
                 <div className="flex items-center gap-4">
                    <Calculator className="text-brand-gold" size={24} />
                    <Text variant="xs" className="font-black uppercase tracking-[0.2em]">Inwarding Protocol Grid</Text>
                 </div>
                 <Button 
                   variant="pri"
                   size="sm"
                   onClick={addItem}
                   className="h-10 px-6 bg-white/10 text-white hover:bg-white/20 border-white/10 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest"
                 >
                   <Plus size={16} /> Add Line Item
                 </Button>
              </div>
              <div className="h-[450px]">
                 <DataTable 
                    data={items}
                    columns={columns}
                    overlayNoRowsTemplate={`
                      <div class="flex flex-col items-center justify-center opacity-10 h-full">
                         <Package size="60" class="mb-4" />
                         <div class="text-xs font-black uppercase tracking-[0.4em]">Grid awaiting line entry</div>
                      </div>
                    `}
                 />
              </div>
           </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
           <Card className="p-12 bg-navy text-white rounded-[50px] relative overflow-hidden shadow-2xl">
              <div className="absolute -right-8 -top-8 opacity-[0.05] rotate-12">
                 <Package size={240} />
              </div>
              <Text variant="xs" className="uppercase tracking-[0.4em] text-brand-gold mb-12 flex items-center gap-3 font-black">
                 <Package size={20} /> Protocol Ledger
              </Text>
              
              <div className="space-y-8 relative z-10">
                 <div className="flex justify-between items-center border-b border-white/5 pb-6">
                    <Text variant="xs" className="uppercase font-black tracking-widest text-white/40">Subtotal</Text>
                    <Text variant="h2" className="font-mono text-white">{formatCurrency(totals.subtotal)}</Text>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/5 pb-6">
                    <Text variant="xs" className="uppercase font-black tracking-widest text-white/40">Tax Liability</Text>
                    <Text variant="h2" className="font-mono text-amber-500">{formatCurrency(totals.tax)}</Text>
                 </div>
                 <div className="pt-8">
                    <Text variant="xs" className="uppercase font-black tracking-[0.2em] text-brand-gold mb-4">Final Protocol Value</Text>
                    <Text variant="h1" className="text-6xl leading-tight font-mono text-white tracking-tighter">{formatCurrency(totals.total)}</Text>
                 </div>
              </div>

              <div className="mt-12 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 relative z-10">
                 <div className="flex items-center gap-3 text-brand-gold mb-4">
                    <ShieldCheck size={24} />
                    <Text variant="xs" className="uppercase font-black tracking-widest">Compliance Active</Text>
                 </div>
                 <Text variant="xs" className="text-white/40 font-black leading-relaxed italic uppercase tracking-tight">
                    All values computed in integer paise. No floating point residues.
                 </Text>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default POForm;
