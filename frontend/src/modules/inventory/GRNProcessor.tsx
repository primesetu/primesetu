import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Package, 
  ArrowRight,
  Truck,
  ScanBarcode,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';

import { formatCurrency } from '../../utils/currency';
import { useOfflineFallback } from '../../hooks/useOfflineFallback';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { apiClient } from '../../api/client';
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge, 
  Label 
} from '../../components/ui/SovereignUI';

interface POItem {
  id: string;
  item_id: string;
  item_name: string;
  size: string;
  colour: string;
  qty_ordered: number;
  qty_received: number;
  unit_cost_paise: number;
  code?: string;
  barcode?: string;
  batch_no: string;
  mfg_date: string;
  exp_date: string;
  received_now: number;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  status: string;
  vendor_id: string;
  total_paise: number;
  items: POItem[];
}

const GRNProcessor: React.FC = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [grnNumber] = useState(`GRN/${new Date().getFullYear()}/${Math.floor(Math.random()*9000)+1000}`);
  const [receivedItems, setReceivedItems] = useState<POItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 1. Fetch Open POs
  const { data: pos = [], loading: isLoadingPOs } = useOfflineFallback<PurchaseOrder[]>('open_pos', async () => {
    const res = await apiClient.get<PurchaseOrder[]>('/purchase/');
    const allPOs = res.data;
    if (!Array.isArray(allPOs)) return [];
    return allPOs.filter(po => po.status !== 'CLOSED' && po.status !== 'CANCELLED');
  }, []);

  // 2. Hotkeys
  useHotkeys('f3', (e) => { e.preventDefault(); searchInputRef.current?.focus(); }, { enableOnFormTags: true });
  useHotkeys('f10', (e) => { e.preventDefault(); if (selectedPO) handleProcess(); }, { enableOnFormTags: true });
  useHotkeys('esc', (e) => { e.preventDefault(); if (selectedPO) setSelectedPO(null); }, { enableOnFormTags: true });

  // 3. Scanner Hook
  useBarcodeScanner((barcode) => {
    if (!selectedPO) return;
    const itemIndex = receivedItems.findIndex(it => 
      it.code?.toLowerCase() === barcode.toLowerCase() || 
      it.barcode?.toLowerCase() === barcode.toLowerCase() ||
      it.item_id?.toLowerCase() === barcode.toLowerCase()
    );

    if (itemIndex > -1) {
      const item = receivedItems[itemIndex];
      const maxQty = item.qty_ordered - (item.qty_received || 0);
      if (item.received_now < maxQty) {
        updateItemField(itemIndex, 'received_now', item.received_now + 1);
      }
    }
  });

  const selectPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    const items = Array.isArray(po.items) ? po.items : [];
    setReceivedItems(items.map(it => ({
      ...it,
      received_now: it.qty_ordered - (it.qty_received || 0),
      batch_no: '',
      mfg_date: '',
      exp_date: ''
    })));
  };

  const updateItemField = (index: number, field: keyof POItem, val: string | number) => {
    setReceivedItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: val } : it));
  };

  const handleProcess = async () => {
    if (!selectedPO) return;
    setIsProcessing(true);
    try {
      const payload = {
        po_id: selectedPO.id,
        vendor_id: selectedPO.vendor_id,
        grn_number: grnNumber,
        items: receivedItems.filter(it => it.received_now > 0).map(it => ({
          po_item_id: it.id,
          item_id: it.item_id,
          size: it.size,
          colour: it.colour,
          qty_received: it.received_now,
          unit_cost_paise: it.unit_cost_paise,
          batch_no: it.batch_no || null,
          mfg_date: it.mfg_date || null,
          exp_date: it.exp_date || null
        }))
      };
      await apiClient.post('/purchase/grn', payload);
      setShowSuccess(true);
    } catch (err) {
      console.error('[SMRITI-OS] GRN processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-bg-base/80 backdrop-blur-xl animate-in fade-in duration-500">
         <Card className="w-full max-w-2xl p-16 text-center border-accent/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-status-green"></div>
            
            <div className="w-20 h-20 bg-status-green/10 text-status-green rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-status-green/10 animate-in zoom-in duration-500">
               <CheckCircle2 size={40} />
            </div>

            <Text variant="h1" className="mb-2">Inwarding Finalized</Text>
            <Text variant="xs" className="mb-12 uppercase tracking-widest text-text-tertiary">Registry Synced · Stock Ledger Updated · {grnNumber}</Text>

            <div className="grid grid-cols-2 gap-4 mb-10">
               <Card variant="flat" className="p-6 text-left bg-bg-float/50 border-border-subtle">
                   <Text variant="xs" className="uppercase font-bold text-text-tertiary mb-1">Total Articles</Text>
                   <Text variant="h2" className="font-mono">{receivedItems.reduce((acc, it) => acc + (it.received_now || 0), 0)}</Text>
                </Card>
                <Card variant="flat" className="p-6 text-left bg-bg-float/50 border-border-subtle">
                   <Text variant="xs" className="uppercase font-bold text-text-tertiary mb-1">Valuation</Text>
                   <Text variant="h2" className="font-mono text-accent">
                    {formatCurrency(receivedItems.reduce((acc, it) => acc + (it.received_now * it.unit_cost_paise), 0))}
                  </Text>
               </Card>
            </div>

            <div className="flex flex-col gap-3">
               <Button 
                 size="lg"
                 onClick={() => navigate('/barcode', { state: { items: receivedItems.filter(it => it.received_now > 0) } })}
                 className="w-full h-14"
               >
                 <ScanBarcode size={18} /> Generate Barcodes Now
               </Button>
               <Button 
                 variant="sec"
                 onClick={() => { setSelectedPO(null); setShowSuccess(false); navigate('/purchase'); }}
                 className="w-full"
               >
                 Return to Purchase Registry
               </Button>
            </div>
         </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-disabled">
         <span>Home</span> <ChevronRight size={10} />
         <span>Operations</span> <ChevronRight size={10} />
         <span className="text-text-secondary">Goods Receipt (GRN)</span>
      </nav>

      {/* Header Section */}
      <Card variant="flat" className="flex items-center justify-between p-8 bg-bg-elevated/40 border-border-subtle">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            <ArrowDownLeft size={28} />
          </div>
          <div>
            <Text variant="h1">Goods Receipt</Text>
            <Text variant="xs" className="text-text-tertiary uppercase tracking-widest mt-1">Inwarding Protocol · Physical Verification · Barcode Auto-Sync</Text>
          </div>
        </div>
      </Card>

      {!selectedPO ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingPOs && Array(3).fill(0).map((_, i) => <Card key={i} className="h-48 animate-pulse bg-bg-elevated/50" />)}
          {Array.isArray(pos) ? pos.map((po: any) => (
            <Card 
              key={po.id} 
              onClick={() => selectPO(po)}
              className="p-8 hover:border-accent/40 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                 <Truck size={120} />
              </div>
              <div className="flex justify-between items-start mb-8">
                 <Badge variant="muted" className="font-mono">{po.po_number}</Badge>
                 <Badge variant={po.status === 'DRAFT' ? 'warn' : 'info'}>
                    {po.status}
                 </Badge>
              </div>
              <Text variant="h3" className="mb-1 group-hover:text-accent transition-colors">Pending Arrival</Text>
              <Text variant="xs" className="text-text-tertiary mb-10">Vendor ID: {po.vendor_id.slice(0,8).toUpperCase()}</Text>
              
              <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
                 <Text variant="h2" className="font-mono">{formatCurrency(po.total_paise)}</Text>
                 <div className="w-10 h-10 bg-bg-float text-text-secondary rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-bg-base transition-all">
                    <ArrowRight size={20} />
                 </div>
              </div>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border-subtle rounded-2xl text-text-tertiary uppercase text-xs tracking-widest">
               No active purchase orders found
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
           {/* PO Details & Item List */}
           <div className="col-span-12 lg:col-span-8 space-y-6">
              <Card variant="flat" className="p-8 bg-bg-elevated/60 border-border-subtle flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <Button variant="sec" size="sm" onClick={() => setSelectedPO(null)} className="h-10 w-10 p-0">
                       <ArrowLeft size={18} />
                    </Button>
                    <div>
                       <Text variant="xs" className="text-text-tertiary uppercase tracking-widest mb-1">Inwarding Protocol</Text>
                       <Text variant="h2" className="leading-none">{selectedPO.po_number}</Text>
                    </div>
                 </div>
                 <div className="text-right">
                    <Text variant="xs" className="text-accent uppercase tracking-widest mb-1">Current Registry</Text>
                    <Text variant="h3" className="font-mono text-text-primary">{grnNumber}</Text>
                 </div>
              </Card>

              <Card className="overflow-hidden border-border-subtle">
                 <table className="w-full">
                    <thead>
                       <tr className="bg-bg-float text-[10px] font-bold uppercase tracking-widest text-text-tertiary border-b border-border-subtle">
                          <th className="px-6 py-5 text-left">Item Entity</th>
                          <th className="px-4 py-5 text-center">Batch No</th>
                          <th className="px-4 py-5 text-center">Expiry</th>
                          <th className="px-4 py-5 text-center">Ordered</th>
                          <th className="px-4 py-5 text-center">Inwarding</th>
                          <th className="px-6 py-5 text-center">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                       {receivedItems.map((item, idx) => (
                         <tr key={idx} className="hover:bg-bg-float/30 transition-colors">
                           <td className="px-6 py-5">
                              <Text variant="sm" className="font-bold uppercase">{item.item_name || 'Inwarding Item'}</Text>
                              <Text variant="xs" className="font-mono text-text-tertiary mt-1">{item.size} / {item.colour}</Text>
                           </td>
                           <td className="px-4 py-5">
                               <Input 
                                 placeholder="BATCH..."
                                 className="h-9 text-center uppercase"
                                 value={item.batch_no}
                                 onChange={(e) => updateItemField(idx, 'batch_no', e.target.value)}
                               />
                           </td>
                           <td className="px-4 py-5">
                               <Input 
                                 type="date" 
                                 className="h-9 text-center"
                                 value={item.exp_date}
                                 onChange={(e) => updateItemField(idx, 'exp_date', e.target.value)}
                               />
                           </td>
                           <td className="px-4 py-5 text-center font-mono text-sm text-text-secondary">{item.qty_ordered}</td>
                           <td className="px-4 py-5 text-center">
                               <Input 
                                 type="number" 
                                 className="w-20 h-10 text-center font-mono text-accent"
                                 value={item.received_now}
                                 max={item.qty_ordered - item.qty_received}
                                 min={0}
                                 onChange={(e) => updateItemField(idx, 'received_now', parseInt(e.target.value) || 0)}
                               />
                           </td>
                           <td className="px-6 py-5 text-center">
                              {item.received_now + item.qty_received >= item.qty_ordered ? (
                                <div className="text-status-green flex justify-center"><CheckCircle2 size={18} /></div>
                              ) : (
                                <div className="text-status-amber animate-pulse flex justify-center"><Zap size={18} /></div>
                              )}
                           </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </Card>
           </div>

           {/* Inwarding Control Panel */}
           <div className="col-span-12 lg:col-span-4 space-y-6">
              <Card className="p-8 bg-accent-bg border-accent/10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full"></div>
                 <Text variant="xs" className="uppercase tracking-[0.3em] text-accent mb-8 flex items-center gap-3 font-bold">
                    <ShieldCheck size={18} /> Gatekeeper Logic
                 </Text>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-text-tertiary ml-1">Logistic Variance Notes</Label>
                       <textarea 
                         className="w-full bg-bg-input border border-border-subtle rounded-xl p-4 text-sm font-medium text-text-primary outline-none focus:border-accent transition-all resize-none h-32 placeholder:text-text-disabled"
                         placeholder="Enter short shipment details, damage notes, or carrier discrepancies..."
                       />
                    </div>

                    <div className="space-y-3 pt-2">
                       <div className="flex items-center gap-3 text-text-secondary">
                          <ScanBarcode size={16} className="text-accent" />
                          <Text variant="xs" className="uppercase font-bold tracking-widest">Auto-Barcode Enforced</Text>
                       </div>
                       <div className="flex items-center gap-3 text-text-secondary">
                          <Zap size={16} className="text-status-amber" />
                          <Text variant="xs" className="uppercase font-bold tracking-widest">Real-time Stock Update</Text>
                       </div>
                    </div>

                    <Button 
                      onClick={handleProcess}
                      disabled={isProcessing}
                      size="lg"
                      className="w-full mt-4 h-14"
                    >
                      {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={20} />}
                      {isProcessing ? 'PROCESSING...' : 'COMPLETE INWARDING [F10]'}
                    </Button>
                 </div>
              </Card>

              <Card className="p-6 border-border-subtle">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-bg-float text-status-amber rounded-lg flex items-center justify-center">
                       <Package size={20} />
                    </div>
                    <Text variant="xs" className="uppercase font-bold tracking-widest">Stock Allocation</Text>
                 </div>
                 <Card variant="flat" className="p-4 bg-bg-float/50 border-border-subtle flex items-center justify-between">
                    <Text variant="xs" className="text-text-tertiary uppercase font-bold">Assigned Zone</Text>
                    <Text variant="sm" className="font-bold uppercase">Whse-A / Row-12</Text>
                 </Card>
              </Card>
           </div>
        </div>
      )}
    </div>
  );
};

export default GRNProcessor;




