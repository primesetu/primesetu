/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation : AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useRef, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  CreditCard, 
  Receipt, 
  Zap,
  Scan,
  UserPlus,
  Tag,
  Percent,
  X,
  History,
  Settings,
  ChevronDown,
  Printer,
  ChevronRight
} from 'lucide-react';

import { useLanguage } from '@/hooks/useLanguage';
import { useSovereignShortcuts } from '@/hooks/useSovereignShortcuts';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useHotkeys } from 'react-hotkeys-hook';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';

// Sovereign UI Components
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge, 
  Modal, 
  DataTable,
  Portal
} from '@/components/ui/SovereignUI';

// Sub-modules
import MultiModePayment from './MultiModePayment';
import SuspendedBillsBrowser from './SuspendedBillsBrowser';
import BillHistoryBrowser from './BillHistoryBrowser';

// Print Templates
import TaxInvoiceA4 from './TaxInvoiceA4';
import ThermalReceipt from './ThermalReceipt';
import { AnimatePresence } from 'framer-motion';

interface CartItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  qty: number;
  mrp: number; // stored in paise
  cost_price?: number;
  discount_per: number;
  tax_rate: number;
  is_tax_inclusive: boolean;
}

export default function BillingModule() {
  const { t } = useLanguage();
  
  // --- Local State Management ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('WALK-IN CUSTOMER');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // UI State
  const [showPayment, setShowPayment] = useState(false);
  const [showSuspended, setShowSuspended] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  
  const [billToPrint, setBillToPrint] = useState<any>(null);
  const [activePrintTemplate, setActivePrintTemplate] = useState<'A4' | 'THERMAL' | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  // --- Cart Calculations (Integer Arithmetic) ---
  const totals = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const lineTotal = item.qty * item.mrp;
      const discount = Math.round(lineTotal * (item.discount_per / 100));
      const net = lineTotal - discount;
      
      // Calculate tax components (assuming inclusive for now if specified)
      let tax = 0;
      if (item.is_tax_inclusive) {
        tax = Math.round(net - (net / (1 + item.tax_rate / 100)));
      } else {
        tax = Math.round(net * (item.tax_rate / 100));
      }

      return {
        qty: acc.qty + item.qty,
        gross: acc.gross + lineTotal,
        discount: acc.discount + discount,
        tax: acc.tax + tax,
        net: acc.net + (item.is_tax_inclusive ? net : net + tax)
      };
    }, { qty: 0, gross: 0, discount: 0, tax: 0, net: 0 });
  }, [cartItems]);

  // --- Cart Actions ---
  const addItem = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, {
        id: product.id,
        code: product.code,
        name: product.name,
        brand: product.brand || 'N/A',
        category: product.category || 'N/A',
        qty: 1,
        mrp: product.mrp_paise || product.mrp || 0,
        cost_price: product.cost_price || 0,
        discount_per: 0,
        tax_rate: product.tax_rate || 18,
        is_tax_inclusive: product.is_tax_inclusive ?? true
      }];
    });
    setSearchQuery('');
    searchRef.current?.focus();
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(i => 
      i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerMobile('');
    setCustomerName('WALK-IN CUSTOMER');
  };

  // --- Barcode & Search Logic ---
  const handleBarcode = async (code: string) => {
    try {
      const product = await api.inventory.search(code); // Using search as a fallback if getByBarcode is missing
      if (product && product.length > 0) addItem(product[0]);
    } catch (err) {
      console.error('[SMRITI-OS] Scan failed:', err);
    }
  };

  useBarcodeScanner(handleBarcode);
  useSovereignShortcuts(); // Global guards

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const results = await api.inventory.search(searchQuery);
      if (results && results.length > 0) addItem(results[0]);
      else {
        console.warn('Product not found');
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // --- Shortcuts ---
  useHotkeys('f1', (e) => { e.preventDefault(); searchRef.current?.focus(); });
  useHotkeys('f4', (e) => { e.preventDefault(); setShowSuspended(true); });
  useHotkeys('f8', (e) => { e.preventDefault(); if (cartItems.length > 0) setShowPayment(true); });
  useHotkeys('f12', (e) => { e.preventDefault(); handleSuspend(); });

  const handleSuspend = async () => {
    if (cartItems.length === 0) return;
    try {
      await api.billing.suspend({
        customer_mobile: customerMobile,
        items: cartItems,
        net_payable: totals.net,
        suspended_reason: 'User Initiated'
      });
      clearCart();
    } catch (err) {
      console.error('Suspend failed:', err);
    }
  };

  const handleRecall = (items: CartItem[], mobile: string) => {
    setCartItems(items);
    setCustomerMobile(mobile);
    setShowSuspended(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-bg-base text-text-primary">
      {/* 1. Terminal Header (Control Strip) */}
      <header className="h-16 border-b border-border-subtle bg-bg-float flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <ShoppingCart size={18} />
            </div>
            <div>
              <Text variant="h3" className="leading-none">BILLING TERMINAL</Text>
              <Text variant="xs" className="opacity-50">NODE: X01-POS-01</Text>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-border-subtle mx-2" />
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <Text variant="xs" className="opacity-40 uppercase font-black tracking-tighter">HO Pulse</Text>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
                <Text variant="xs" className="font-bold">CONNECTED</Text>
              </div>
            </div>
            <div className="flex flex-col">
              <Text variant="xs" className="opacity-40 uppercase font-black tracking-tighter">Latency</Text>
              <Text variant="xs" className="font-bold text-status-amber">12ms</Text>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="sec" size="sm" onClick={() => setShowHistory(true)} className="gap-2">
            <History size={14} /> HISTORY
          </Button>
          <Button variant="sec" size="sm" onClick={() => setShowSuspended(true)} className="gap-2">
            <Clock size={14} /> RECALL [F4]
          </Button>
          <Button variant="sec" size="sm" className="w-10 h-10 p-0">
            <Settings size={16} />
          </Button>
        </div>
      </header>

      {/* 2. Main Operational Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Section: Operational Grid */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border-subtle">
          
          {/* Search/Scan Strip */}
          <div className="p-4 bg-bg-elevated/40 border-b border-border-subtle flex gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent transition-colors" size={18} />
              <Input 
                ref={searchRef}
                placeholder="SCAN BARCODE OR SEARCH SKU (F1)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg font-mono font-bold tracking-widest bg-bg-base/50 border-border-subtle focus:border-accent/50 focus:ring-accent/5 rounded-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-30">
                <Scan size={14} />
                <span className="text-[10px] font-black">READY</span>
              </div>
            </form>
            
            <div className="flex items-center gap-2 px-6 py-2 bg-bg-float rounded-none border border-border-subtle h-14">
              <User size={18} className="text-accent" />
              <div className="flex flex-col">
                <Text variant="xs" className="opacity-40 uppercase font-bold tracking-widest leading-none mb-1">Customer</Text>
                <div className="flex items-center gap-2">
                  <Text variant="sm" className="font-black uppercase">{customerName}</Text>
                  <Text variant="xs" className="opacity-50 font-mono">{customerMobile || 'NA'}</Text>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="ml-4 p-2">
                <UserPlus size={16} />
              </Button>
            </div>
          </div>

          {/* Cart Data Grid */}
          <div className="flex-1 overflow-auto bg-bg-base/20">
            <DataTable 
              data={cartItems}
              loading={false}
              columns={[
                {
                  header: 'SR',
                  accessor: (_, index) => <span className="opacity-30 font-mono text-xs">{(index || 0) + 1}</span>,
                  className: 'w-12 text-center'
                },
                {
                  header: 'ARTICLE / SKU',
                  accessor: (item: CartItem) => (
                    <div className="flex flex-col py-1">
                      <span className="font-bold text-sm tracking-tight text-text-primary uppercase">{item.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-text-tertiary px-1.5 py-0.5 bg-bg-elevated rounded-sm">{item.code}</span>
                        <span className="text-[10px] text-accent font-bold">{item.brand}</span>
                      </div>
                    </div>
                  ),
                  className: 'min-w-[240px]'
                },
                {
                  header: 'PRICE',
                  accessor: (item: CartItem) => (
                    <div className="flex flex-col items-end">
                      <span className="font-mono font-bold text-sm">{formatCurrency(item.mrp)}</span>
                      <span className="text-[9px] text-text-tertiary uppercase font-black">{item.is_tax_inclusive ? 'Tax Incl' : 'Tax Excl'}</span>
                    </div>
                  ),
                  className: 'w-32 text-right'
                },
                {
                  header: 'QUANTITY',
                  accessor: (item: CartItem) => (
                    <div className="flex items-center justify-center gap-3 bg-bg-float/50 rounded-none p-1 border border-border-subtle group-hover:border-accent/20 transition-all">
                      <button 
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-mono font-black text-lg">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-status-green/10 hover:text-status-green transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ),
                  className: 'w-40'
                },
                {
                  header: 'DISC %',
                  accessor: (item: CartItem) => (
                    <div className="flex items-center justify-end gap-2 px-2">
                      <Input 
                        type="number"
                        value={item.discount_per}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, discount_per: val } : i));
                        }}
                        className="w-16 h-8 text-right font-mono text-sm bg-transparent border-transparent hover:border-border-subtle focus:border-accent text-accent"
                      />
                      <Percent size={12} className="text-text-tertiary" />
                    </div>
                  ),
                  className: 'w-24 text-right'
                },
                {
                  header: 'TAX %',
                  accessor: (item: CartItem) => (
                    <span className="font-mono text-xs text-text-tertiary">{item.tax_rate}%</span>
                  ),
                  className: 'w-20 text-center'
                },
                {
                  header: 'TOTAL',
                  accessor: (item: CartItem) => {
                    const lineNet = Math.round(item.qty * item.mrp * (1 - item.discount_per/100));
                    return <span className="font-mono font-black text-sm text-text-primary">{formatCurrency(lineNet)}</span>;
                  },
                  className: 'w-32 text-right px-6'
                },
                {
                  header: '',
                  accessor: (item: CartItem) => (
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-text-tertiary hover:text-status-red transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  ),
                  className: 'w-12 text-center'
                }
              ]}
            />
          </div>

          {/* Quick Item Entry Bar */}
          <div className="h-14 border-t border-border-subtle bg-bg-float flex items-center px-4 gap-4">
             <div className="flex items-center gap-2 text-text-tertiary">
                <Tag size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Quick Recall:</span>
             </div>
             <div className="flex gap-2">
                {['T-SHIRT', 'DENIM', 'SHOES'].map(label => (
                  <Button key={label} variant="ghost" size="sm" className="text-[9px] h-8 border border-border-subtle px-4 uppercase font-bold hover:border-accent hover:text-accent">
                    {label}
                  </Button>
                ))}
             </div>
             <div className="flex-1" />
             <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-green"></span>
                  <span>GST READY</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  <span>STOCK SYNC ACTIVE</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Section: Bill Summary & Settlement */}
        <aside className="w-96 flex flex-col bg-bg-elevated/20">
          {/* Header Summary */}
          <div className="p-8 border-b border-border-subtle bg-bg-elevated/40">
             <div className="flex items-center justify-between mb-2">
                <Text variant="xs" className="opacity-40 uppercase font-black tracking-widest">Payable Amount</Text>
                <Badge variant="success" className="animate-pulse">ACTIVE SESSION</Badge>
             </div>
             <div className="text-5xl font-serif font-black tracking-tighter text-text-primary">
                {formatCurrency(totals.net)}
             </div>
             <div className="flex justify-between mt-4 text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
                <span>Items: {totals.qty}</span>
                <span>Subtotal: {formatCurrency(totals.gross)}</span>
             </div>
          </div>

          {/* Tax Breakup Card */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
             <Card variant="flat" className="p-4 bg-bg-float/40 border-border-subtle space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                   <span>Tax Breakup</span>
                   <ChevronDown size={14} />
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary">CGST (9%)</span>
                      <span className="text-xs font-mono">{formatCurrency(totals.tax / 2)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary">SGST (9%)</span>
                      <span className="text-xs font-mono">{formatCurrency(totals.tax / 2)}</span>
                   </div>
                   <div className="h-[1px] bg-border-subtle my-1" />
                   <div className="flex justify-between items-center font-bold">
                      <span className="text-xs">TOTAL TAX</span>
                      <span className="text-xs font-mono text-accent">{formatCurrency(totals.tax)}</span>
                   </div>
                </div>
             </Card>

             <Card variant="flat" className="p-4 bg-bg-float/40 border-border-subtle space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                   <span>Discounts & Offers</span>
                   <Zap size={14} className="text-status-amber" />
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-text-secondary">Total Savings</span>
                   <span className="text-xs font-mono text-status-green">-{formatCurrency(totals.discount)}</span>
                </div>
             </Card>

             <div className="flex flex-col gap-3 pt-4">
                <Button variant="sec" className="w-full h-12 justify-between px-6 border-border-subtle group">
                   <span className="flex items-center gap-3">
                      <Tag size={16} className="text-status-amber" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Apply Promo Code</span>
                   </span>
                   <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button variant="sec" className="w-full h-12 justify-between px-6 border-border-subtle group">
                   <span className="flex items-center gap-3">
                      <User size={16} className="text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Link Loyalty Card</span>
                   </span>
                   <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-bg-elevated/60 border-t border-border-subtle space-y-3">
             <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="sec" 
                  onClick={clearCart}
                  className="h-14 border-status-red/10 text-status-red hover:bg-status-red hover:text-white"
                >
                   <Trash2 size={18} /> CLEAR
                </Button>
                <Button 
                  variant="sec" 
                  onClick={handleSuspend}
                  className="h-14 border-status-amber/10 text-status-amber hover:bg-status-amber hover:text-white"
                >
                   <Clock size={18} /> HOLD [F12]
                </Button>
             </div>
             <Button 
               onClick={() => setShowPayment(true)}
               disabled={cartItems.length === 0}
               className="w-full h-20 bg-accent text-white shadow-2xl shadow-accent/20 group relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <div className="flex flex-col items-center">
                   <div className="flex items-center gap-3 mb-1">
                      <CreditCard size={24} />
                      <span className="text-xl font-black uppercase tracking-[0.2em]">SETTLE BILL</span>
                   </div>
                   <span className="text-[10px] font-bold opacity-70 tracking-widest">ENTER SETTLEMENT PROTOCOL [F8]</span>
                </div>
             </Button>
          </div>
        </aside>
      </main>

      {/* 3. Global Shortcuts Footer */}
      <footer className="h-8 bg-navy text-white/50 flex items-center px-4 justify-between text-[9px] font-black uppercase tracking-[0.15em] shrink-0">
        <div className="flex gap-6">
          <span className="flex gap-2"><b className="text-saffron">F1</b> SEARCH</span>
          <span className="flex gap-2"><b className="text-saffron">F2</b> CUSTOMER</span>
          <span className="flex gap-2"><b className="text-saffron">F4</b> SUSPENDED</span>
          <span className="flex gap-2"><b className="text-saffron">F8</b> PAYMENT</span>
          <span className="flex gap-2"><b className="text-saffron">F10</b> PRINT</span>
          <span className="flex gap-2"><b className="text-saffron">F12</b> HOLD</span>
          <span className="flex gap-2"><b className="text-saffron">ESC</b> CANCEL</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-status-green" />
            <span>CLOUD SYNC ACTIVE</span>
          </div>
          <div className="w-[1px] h-3 bg-white/10" />
          <span>v3.0.0-SOVEREIGN</span>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showPayment && (
          <Portal>
            <MultiModePayment 
              totalAmount={totals.net}
              onComplete={async (paymentData) => {
                setIsProcessing(true);
                try {
                  const bill = await api.billing.finalize({
                    customer_mobile: customerMobile,
                    items: cartItems,
                    payments: paymentData,
                    totals: totals
                  });
                  setBillToPrint(bill);
                  setShowPayment(false);
                  setShowPrintOptions(true);
                  clearCart();
                } catch (err) {
                  console.error('Settlement failed:', err);
                } finally {
                  setIsProcessing(false);
                }
              }}
              onClose={() => setShowPayment(false)}
            />
          </Portal>
        )}


        {showSuspended && (
          <Modal
            isOpen={showSuspended}
            onClose={() => setShowSuspended(false)}
            title="Sovereign Hold Queue"
            subtitle="Recall Suspended Transactions"
            maxWidth="max-w-2xl"
          >
            <div className="h-[500px]">
              <SuspendedBillsBrowser 
                onRecall={handleRecall}
                onClose={() => setShowSuspended(false)}
              />
            </div>
          </Modal>
        )}

        {showHistory && (
          <Modal
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            title="Transaction Archive"
            subtitle="View and Reprint Past Invoices"
            maxWidth="max-w-5xl"
          >
            <div className="h-[600px]">
              <BillHistoryBrowser 
                onReprint={(bill) => {
                  setBillToPrint(bill);
                  setShowHistory(false);
                  setShowPrintOptions(true);
                }}
                onClose={() => setShowHistory(false)}
              />
            </div>
          </Modal>
        )}

        {showPrintOptions && (
          <Modal
            isOpen={showPrintOptions}
            onClose={() => setShowPrintOptions(false)}
            title="Document Protocol"
            subtitle="Select Invoice Template for Generation"
            maxWidth="max-w-md"
          >
            <div className="grid grid-cols-1 gap-3">
               <Button variant="sec" className="h-16 justify-start px-6 gap-4 border-border-subtle" onClick={() => setActivePrintTemplate('A4')}>
                  <Printer size={20} className="text-accent" />
                  <div className="text-left">
                     <div className="text-xs font-black uppercase tracking-widest">Tax Invoice (A4)</div>
                     <div className="text-[10px] opacity-40">Standard Corporate Layout</div>
                  </div>
               </Button>
               <Button variant="sec" className="h-16 justify-start px-6 gap-4 border-border-subtle" onClick={() => setActivePrintTemplate('THERMAL')}>
                  <Receipt size={20} className="text-status-green" />
                  <div className="text-left">
                     <div className="text-xs font-black uppercase tracking-widest">Thermal Receipt (3 Inch)</div>
                     <div className="text-[10px] opacity-40">Quick Retail Slip</div>
                  </div>
               </Button>
               <div className="pt-4 flex gap-3">
                  <Button variant="ghost" className="flex-1 h-12" onClick={() => setShowPrintOptions(false)}>Skip Printing</Button>
                  <Button className="flex-1 h-12" onClick={() => setShowPrintOptions(false)}>Complete Protocol</Button>
               </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Hidden Print Trigger */}
      <div className="hidden">
        {activePrintTemplate === 'A4' && billToPrint && (
          <TaxInvoiceA4 bill={billToPrint} onPrinted={() => setActivePrintTemplate(null)} />
        )}
        {activePrintTemplate === 'THERMAL' && billToPrint && (
          <ThermalReceipt bill={billToPrint} onPrinted={() => setActivePrintTemplate(null)} />
        )}
      </div>
    </div>
  );
}
