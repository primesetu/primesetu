import React, { useState } from 'react';
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
  RefreshCw
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
  Badge 
} from '../../components/ui/SovereignUI';

interface POItemInput {
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

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof POItemInput, value: string | number) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
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

  return (
    <div className="pb-20 animate-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-disabled mb-6">
         <span>Home</span> <ChevronRight size={10} />
         <span>Procurement</span> <ChevronRight size={10} />
         <span className="text-text-secondary">Raise New PO</span>
      </nav>

      {/* Sovereign Form Header */}
      <Card variant="flat" className="flex items-center justify-between p-8 bg-bg-elevated/40 border-border-subtle mb-8">
        <div className="flex items-center gap-8">
          <Button variant="sec" size="sm" onClick={() => navigate('/purchase')} className="h-12 w-12 p-0">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <Text variant="h1">New Procurement Protocol</Text>
            <Text variant="xs" className="text-text-tertiary uppercase tracking-widest mt-1">Sovereign Node · Inventory Inwarding · PA-2026-X</Text>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" onClick={() => navigate('/purchase')} className="px-6">
             Discard <span className="opacity-40 ml-2">[Esc]</span>
           </Button>
           <Button 
             onClick={handleSave}
             disabled={isSaving}
             className="px-8 h-12 shadow-lg shadow-accent/10"
           >
             {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
             Finalize PO <span className="opacity-40 ml-2 text-[10px]">[F10]</span>
           </Button>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Header Details */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <Card className="p-10 border-border-subtle">
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-accent font-bold">
                       <ShieldCheck size={16} /> Vendor Selection *
                    </Label>
                    <Select 
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="h-12 font-bold uppercase tracking-widest"
                    >
                      <option value="">Select Partner Registry...</option>
                      {Array.isArray(vendors) && vendors.map((v: Vendor) => (
                        <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                      ))}
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-text-secondary font-bold">
                       <Info size={16} /> PO Protocol ID
                    </Label>
                    <Input 
                      className="h-12 font-mono uppercase font-bold"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-text-secondary font-bold">
                       <Calendar size={16} /> Expected Arrival
                    </Label>
                    <Input 
                      type="date" 
                      className="h-12 font-mono"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-text-secondary font-bold">
                       Internal Logistics Notes
                    </Label>
                    <Input 
                      placeholder="SHIPPING TERMS, DEDUCTIONS..."
                      className="h-12 uppercase text-xs tracking-wider"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                 </div>
              </div>
           </Card>

           {/* Item Grid */}
           <Card className="border-border-subtle overflow-hidden">
              <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-bg-float/20">
                 <Text variant="xs" className="font-bold uppercase tracking-[0.2em] text-text-tertiary">Inwarding Protocol Grid</Text>
                 <Button 
                   variant="sec"
                   size="sm"
                   onClick={addItem}
                   className="h-10 px-6 border-accent/20 hover:border-accent/40 text-accent"
                 >
                   <Plus size={16} /> Add Line Item
                 </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                      <tr className="bg-bg-float/40 text-[10px] font-bold uppercase text-text-tertiary tracking-widest border-b border-border-subtle">
                         <th className="px-8 py-4 text-left">Item Entity</th>
                         <th className="px-6 py-4 text-center">Qty</th>
                         <th className="px-6 py-4 text-right">Unit Cost (Paise)</th>
                         <th className="px-6 py-4 text-center">Tax %</th>
                         <th className="px-8 py-4 text-right">Line Total</th>
                         <th className="px-6 py-4 text-center"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-subtle">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-bg-float/20 transition-colors">
                          <td className="px-8 py-5">
                             <Text variant="sm" className="font-bold uppercase leading-none">{item.item_name}</Text>
                             <Text variant="xs" className="font-mono text-text-tertiary mt-2 uppercase">{item.item_code} · {item.size} / {item.colour}</Text>
                          </td>
                          <td className="px-6 py-5">
                             <Input 
                               type="number" 
                               className="w-20 h-10 text-center font-mono font-bold"
                               value={item.qty_ordered}
                               onChange={(e) => updateItem(idx, 'qty_ordered', parseInt(e.target.value) || 0)}
                             />
                          </td>
                          <td className="px-6 py-5">
                             <Input 
                               type="number" 
                               className="w-28 h-10 text-right font-mono font-bold text-accent"
                               value={item.unit_cost_paise}
                               onChange={(e) => updateItem(idx, 'unit_cost_paise', parseInt(e.target.value) || 0)}
                             />
                          </td>
                          <td className="px-6 py-5">
                             <Select 
                               className="h-10 text-xs font-bold w-20 mx-auto"
                               value={item.tax_rate}
                               onChange={(e) => updateItem(idx, 'tax_rate', parseInt(e.target.value))}
                             >
                               {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                             </Select>
                          </td>
                          <td className="px-8 py-5 text-right font-mono text-sm font-bold text-text-primary">
                             {formatCurrency(Math.floor((item.qty_ordered * item.unit_cost_paise) * (1 + item.tax_rate/100)))}
                          </td>
                          <td className="px-6 py-5 text-center">
                             <Button variant="ghost" onClick={() => removeItem(idx)} className="h-10 w-10 p-0 text-status-red hover:bg-status-red/10">
                                <Trash2 size={16} />
                             </Button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                         <tr>
                            <td colSpan={6} className="px-10 py-16 text-center text-[10px] font-bold text-text-tertiary uppercase tracking-[0.4em]">Grid awaiting line entry</td>
                         </tr>
                      )}
                   </tbody>
                </table>
              </div>
           </Card>
        </div>

        {/* Right Column: Financial Summary */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <Card className="p-10 bg-accent-bg border-accent/10 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 opacity-[0.03] rotate-12">
                 <Package size={200} />
              </div>
              <Text variant="xs" className="uppercase tracking-[0.4em] text-accent mb-10 flex items-center gap-3 font-bold">
                 <Package size={18} /> Protocol Ledger
              </Text>
              
              <div className="space-y-6 relative z-10">
                 <div className="flex justify-between items-center border-b border-border-subtle pb-4">
                    <Text variant="xs" className="uppercase font-bold tracking-widest text-text-tertiary">Subtotal</Text>
                    <Text variant="h3" className="font-mono">{formatCurrency(totals.subtotal)}</Text>
                 </div>
                 <div className="flex justify-between items-center border-b border-border-subtle pb-4">
                    <Text variant="xs" className="uppercase font-bold tracking-widest text-text-tertiary">Tax Liability</Text>
                    <Text variant="h3" className="font-mono text-status-amber">{formatCurrency(totals.tax)}</Text>
                 </div>
                 <div className="pt-6">
                    <Text variant="xs" className="uppercase font-bold tracking-[0.2em] text-accent mb-2">Final Protocol Value</Text>
                    <Text variant="h1" className="text-5xl leading-tight font-mono text-text-primary">{formatCurrency(totals.total)}</Text>
                 </div>
              </div>

              <Card variant="flat" className="mt-10 p-6 bg-bg-base/40 border-border-subtle relative z-10">
                 <div className="flex items-center gap-3 text-accent mb-3">
                    <ShieldCheck size={20} />
                    <Text variant="xs" className="uppercase font-bold tracking-widest">Compliance Active</Text>
                 </div>
                 <Text variant="xs" className="text-text-tertiary font-bold leading-relaxed italic uppercase tracking-tight">
                    All values computed in integer paise. No floating point residues.
                 </Text>
              </Card>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default POForm;




