/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FilePlus2, RotateCcw, Banknote, CreditCard, Smartphone,
  Pause, Printer, CheckCircle2, ScanBarcode, Trash2,
  Calculator, User, Clock, ChevronRight, Zap, Search,
  Tag, UserCheck, Plus, Minus, X, AlertTriangle,
  FileText, Wifi, WifiOff, LayoutDashboard, Settings, Package,
  ArrowRightLeft,
  Receipt,
  Info,
  RefreshCw
} from 'lucide-react'
import { api } from '@/api/client'
import DayEndModule from './DayEndModule'
import SuspendedBillsBrowser from './SuspendedBillsBrowser'
import ThermalReceipt from './ThermalReceipt'
import TaxInvoiceA4 from './TaxInvoiceA4'
import TaxInvoiceB2B from './TaxInvoiceB2B'
import CreditNoteA4 from './CreditNoteA4'
import ReturnsDrawer from './ReturnsDrawer'
import SalesSlipsBrowser from './SalesSlipsBrowser'
import BillHistoryBrowser from './BillHistoryBrowser'
import { useHotkeys } from 'react-hotkeys-hook'
import { offlineService } from '@/api/offline'
import { useLanguage } from '@/hooks/useLanguage'
import { toPaise, formatCurrency, formatDecimal, toRupees } from '@/utils/currency'
import StyleMatrix from '../catalogue/StyleMatrix'
import { cn } from '@/lib/utils'
import { 
  Button, 
  Input, 
  Select, 
  Card, 
  Text, 
  Badge, 
  Modal,
  Label 
} from '../../components/ui/SovereignUI';

// ── TYPES ──
export interface TillInfo {
  id: string;
  status: string;
  [key: string]: unknown;
}

export interface BillReceipt {
  bill_number?: string;
  total?: number;
  status?: string;
  type?: string;
  [key: string]: unknown;
}

export interface CustomerData {
  id: string;
  current_balance: number;
  name?: string;
  phone?: string;
}

interface CartItem {
  id: string; 
  code: string; 
  name: string; 
  brand: string; 
  category: string;
  mrp_paise: number; 
  cost_paise: number; 
  qty: number; 
  discount_per: number; 
  tax_rate: number;
  is_tax_inclusive?: boolean; 
  stocks?: { store_id: string; quantity: number }[];
}

type PayMode = 'CASH' | 'UPI' | 'CARD' | 'GV' | 'COUPON'
interface PayLine { mode: PayMode; amount: number; ref?: string }

// ── HELPERS ──
const getNow = () => {
  const d = new Date()
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}  ${d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`
}

export default function BillingModule() {
  const { t } = useLanguage()
  
  // ── STATE ──
  const [q, setQ] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [payLines, setPayLines] = useState<PayLine[]>([{ mode: 'CASH', amount: 0 }])
  const [processing, setProcessing] = useState(false)
  const [showDayEnd, setShowDayEnd] = useState(false)
  const [customerMobile, setCustomerMobile] = useState('')
  const [salesperson, setSalesperson] = useState('')
  const [lastBill, setLastBill] = useState<BillReceipt | null>(null)
  const [showTotals, setShowTotals] = useState(false)
  const [showSettle, setShowSettle] = useState(false)
  const [showSuspended, setShowSuspended] = useState(false)
  const [showSalesSlips, setShowSalesSlips] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showReturns, setShowReturns] = useState(false)
  const [billToPrint, setBillToPrint] = useState<BillReceipt | null>(null)
  const [currentTime, setCurrentTime] = useState(getNow())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineCount, setOfflineCount] = useState(0)
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4' | 'b2b'>('thermal')
  const [sendSms, setSendSms] = useState(true)
  const [activeTill, setActiveTill] = useState<TillInfo | null>(null)
  const [showStyleMatrix, setShowStyleMatrix] = useState(false)
  const [selectedStyleCode, setSelectedStyleCode] = useState('')
  const [toasts, setToasts] = useState<{id: number, msg: string, type: 'error' | 'success' | 'info'}[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerData | null>(null)
  
  const searchRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  // ── EFFECTS ──
  useEffect(() => { 
    const interval = setInterval(() => setCurrentTime(getNow()), 30000)
    return () => clearInterval(interval) 
  }, [])
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    offlineService.getQueueCount().then(setOfflineCount)

    api.tills.list().then(tills => {
      const openTill = tills.find((t: TillInfo) => t.status === 'Open')
      if (openTill) setActiveTill(openTill)
    }).catch(console.error)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Offline Sync
  useEffect(() => {
    if (isOnline && offlineCount > 0) {
      const sync = async () => {
        const queue = await offlineService.getQueue()
        for (const item of queue) {
          try {
            await api.billing.finalize(item.data)
            await offlineService.clearItem(item.id)
            setOfflineCount(prev => prev - 1)
          } catch (err) {
            console.error('[SMRITI-OS] Sync Fail:', err)
            break
          }
        }
      }
      sync()
    }
  }, [isOnline, offlineCount])

  // Barcode / Style Lookup
  useEffect(() => {
    if (q.length < 3) return
    const timer = setTimeout(async () => {
      try {
        const results = await api.inventory.search(q)
        type SearchItem = CartItem & { style_code?: string };
        const exactItem = results.find((p: SearchItem) => p.code.toLowerCase() === q.toLowerCase())
        if (exactItem) { 
          handleAddToCart(exactItem)
          setQ('')
          return
        }

        const isStyle = results.some((p: SearchItem) => p.style_code?.toLowerCase() === q.toLowerCase())
        if (isStyle) {
          setSelectedStyleCode(q.toUpperCase())
          setShowStyleMatrix(true)
          setQ('')
        }
      } catch {}
    }, 400)
    return () => clearTimeout(timer)
  }, [q])

  // Fetch Customer Info for Outstanding Warning
  useEffect(() => {
    if (customerMobile.length >= 10) {
      api.catalogue.getPartners('CUSTOMER', customerMobile).then(res => {
        if (res && res.length > 0) {
          setCustomerInfo(res[0])
        } else {
          setCustomerInfo(null)
        }
      }).catch(() => setCustomerInfo(null))
    } else {
      setCustomerInfo(null)
    }
  }, [customerMobile])

  // ── LOGIC ──
  const handleAddToCart = (p: Partial<CartItem> & { mrp?: number }) => {
    const normalizedItem: CartItem = {
      id: p.id!,
      code: p.code!,
      name: p.name!,
      brand: p.brand || 'Unknown',
      category: p.category || 'General',
      mrp_paise: p.mrp_paise || toPaise(p.mrp || 0),
      cost_paise: p.cost_paise || 0,
      qty: 1,
      discount_per: 0,
      tax_rate: p.tax_rate ?? 18,
      is_tax_inclusive: p.is_tax_inclusive ?? true,
      stocks: p.stocks
    }

    const storeStock = normalizedItem.stocks?.find(s => s.store_id === 'X01')?.quantity

    setCart(prev => {
      const existing = prev.find(i => i.id === normalizedItem.id)
      const currentQty = existing ? existing.qty : 0
      
      if (storeStock !== undefined && currentQty + 1 > storeStock) {
        showToast(`STOCK ALERT: Only ${storeStock} units available in X01 store.`, 'error')
        return prev
      }

      if (existing) return prev.map(i => i.id === normalizedItem.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, normalizedItem]
    })
  }

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        if (updates.qty !== undefined) {
          const storeStock = i.stocks?.find(s => s.store_id === 'X01')?.quantity
          if (storeStock !== undefined && updates.qty > storeStock) {
            showToast(`STOCK ALERT: Only ${storeStock} units available.`, 'error')
            return i
          }
        }
        return { ...i, ...updates }
      }
      return i
    }))
  }

  const removeCartItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id))

  // ── CALCULATIONS (PAISE ONLY) ──
  const totals = useMemo(() => {
    return cart.reduce((acc, i) => {
      const lineGrossPaise = i.mrp_paise * i.qty
      const lineDiscPaise = Math.round(lineGrossPaise * (i.discount_per / 100))
      const lineNetPaise = lineGrossPaise - lineDiscPaise
      
      const taxRate = i.tax_rate / 100
      const isInclusive = i.is_tax_inclusive ?? true
      
      let taxPaise = 0
      let taxablePaise = 0
      
      if (isInclusive) {
        taxPaise = Math.round(lineNetPaise - (lineNetPaise / (1 + taxRate)))
        taxablePaise = lineNetPaise - taxPaise
      } else {
        taxablePaise = lineNetPaise
        taxPaise = Math.round(lineNetPaise * taxRate)
      }
      
      return {
        subtotal: acc.subtotal + lineGrossPaise,
        discount: acc.discount + lineDiscPaise,
        taxable: acc.taxable + taxablePaise,
        tax: acc.tax + taxPaise,
        net: acc.net + (taxablePaise + taxPaise)
      }
    }, { subtotal: 0, discount: 0, taxable: 0, tax: 0, net: 0 })
  }, [cart])

  const netPayablePaise = totals.net

  // ── SHORTCUTS ──
  useHotkeys('f2', (e) => { e.preventDefault(); searchRef.current?.focus() }, { enableOnFormTags: true })
  useHotkeys('alt+1', (e) => { e.preventDefault(); setCart([]); setCustomerMobile(''); setQ(''); searchRef.current?.focus() }, { enableOnFormTags: true })
  useHotkeys('alt+2', (e) => { e.preventDefault(); setShowReturns(true) }, { enableOnFormTags: true })
  useHotkeys('f4', () => setShowHistory(true), { enableOnFormTags: true })
  useHotkeys('f5', () => setShowSuspended(true), { enableOnFormTags: true })
  useHotkeys('f6', () => setShowSalesSlips(true), { enableOnFormTags: true })
  useHotkeys('f7', (e) => { e.preventDefault(); setPayLines([{ mode: 'CASH', amount: toRupees(netPayablePaise) }]); setShowSettle(true) }, { enableOnFormTags: true })
  useHotkeys('f8', () => setShowSettle(true), { enableOnFormTags: true })
  useHotkeys('f9', () => setShowTotals(v => !v), { enableOnFormTags: true })
  useHotkeys('f10', () => setShowSettle(true), { enableOnFormTags: true })
  useHotkeys('f12', (e) => { e.preventDefault(); handleSuspend() }, { enableOnFormTags: true })
  useHotkeys('escape', (e) => { e.preventDefault(); setQ(''); setShowTotals(false); setShowSettle(false) }, { enableOnFormTags: true })

  // ── HANDLERS ──
  const handleFinalize = async () => {
    if (!cart.length || processing) return
    setProcessing(true)
    
    const billData = {
      customer_mobile: sendSms ? customerMobile : '',
      type: 'Sales',
      till_id: activeTill?.id,
      items: cart.map(i => ({ 
        product_id: i.id, 
        qty: i.qty, 
        unit_price: i.mrp_paise, 
        discount_per: i.discount_per, 
        tax_per: i.tax_rate 
      })),
      payments: payLines.filter(p => p.amount > 0).map(p => ({ ...p, amount: toPaise(p.amount) }))
    }

    try {
      if (!isOnline) throw new Error('OFFLINE_MODE')
      
      const result = await api.billing.finalize(billData)
      setLastBill(result)
      setBillToPrint(result)
      resetSession()
      setTimeout(() => setLastBill(null), 6000)
    } catch (err) { 
      console.warn('[SMRITI-OS] Isolation Protocol Engaged. Saving to Local Ledger.')
      await offlineService.queueTransaction(billData)
      setOfflineCount(prev => prev + 1)
      
      const mockResult = { status: 'queued', bill_number: 'OFFLINE-'+Date.now(), total: netPayablePaise }
      setLastBill(mockResult)
      setBillToPrint(mockResult)
      resetSession()
    } finally { 
      setProcessing(false) 
    }
  }

  const resetSession = () => {
    setCart([])
    setCustomerMobile('')
    setSalesperson('')
    setPayLines([{ mode: 'CASH', amount: 0 }])
    setShowSettle(false)
    searchRef.current?.focus()
  }

  const handleSuspend = async () => {
    if (!cart.length) return
    setProcessing(true)
    try {
      await api.billing.suspend({ 
        customer_mobile: customerMobile, 
        type: 'Sales', 
        items: cart.map(i => ({ product_id: i.id, qty: i.qty, unit_price: i.mrp_paise })), 
        suspended_reason: 'Counter Queue' 
      })
      resetSession()
    } catch {} finally { setProcessing(false) }
  }

  const paidTotalRupees = payLines.reduce((s, p) => s + p.amount, 0)
  const balanceRupees = toRupees(netPayablePaise) - paidTotalRupees

  return (
    <div className="flex flex-col h-screen overflow-hidden relative bg-bg-base">
      {/* ── PRINTING LAYERS ── */}
      {printFormat === 'thermal' && <ThermalReceipt bill={billToPrint} onPrinted={() => setBillToPrint(null)} />}
      {printFormat === 'a4' && <TaxInvoiceA4 bill={billToPrint} onPrinted={() => setBillToPrint(null)} />}
      {printFormat === 'b2b' && <TaxInvoiceB2B bill={billToPrint} onPrinted={() => setBillToPrint(null)} />}
      <CreditNoteA4 bill={billToPrint?.type === 'Return' ? billToPrint : null} onPrinted={() => setBillToPrint(null)} />

      {/* ── OVERLAYS ── */}
      <AnimatePresence>
        {showSuspended && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-[450px] z-[250] shadow-2xl bg-bg-elevated border-l border-border-subtle">
             <SuspendedBillsBrowser 
                onRecall={(items, mobile: string) => { 
                  setCart(items.map((i) => ({ ...i, mrp_paise: i.mrp } as unknown as CartItem))); 
                  setCustomerMobile(mobile); 
                  setShowSuspended(false); 
                }} 
                onClose={() => setShowSuspended(false)} 
             />
           </motion.div>
        )}
        {showReturns && (
           <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-[450px] z-[250] shadow-2xl bg-bg-elevated border-l border-status-red/20">
             <ReturnsDrawer 
                onReturn={(bill) => { setBillToPrint(bill); setShowReturns(false); }}
                onClose={() => setShowReturns(false)} 
              />
           </motion.div>
        )}
        {showSalesSlips && <SalesSlipsBrowser onRecall={(items, mobile) => { setCart(items as unknown as CartItem[]); setCustomerMobile(mobile); setShowSalesSlips(false); }} onClose={() => setShowSalesSlips(false)} />}
        {showHistory && <BillHistoryBrowser onReprint={(b) => setBillToPrint(b)} onClose={() => setShowHistory(false)} />}
        {showDayEnd && <DayEndModule onClose={() => setShowDayEnd(false)} />}
        
        {lastBill && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-[300] bg-status-green text-bg-base px-10 py-5 rounded-3xl shadow-2xl flex items-center gap-6 border-2 border-status-green/30">
            <CheckCircle2 size={32} />
            <div>
              <Text variant="xs" className="font-bold opacity-70">Sovereign Protocol Finalized</Text>
              <Text variant="h2" className="text-bg-base">{lastBill.bill_number} &nbsp;·&nbsp; {formatCurrency(lastBill.total)}</Text>
            </div>
          </motion.div>
        )}

        <Modal
          isOpen={showTotals}
          onClose={() => setShowTotals(false)}
          title="Consolidated Bill Summary"
          subtitle="Real-time Revenue Intelligence"
          maxWidth="max-w-md"
          icon={<Calculator size={24} />}
        >
          <div className="space-y-4">
              {[
                ['Gross Subtotal', formatCurrency(totals.subtotal)],
                ['Disc. Allowance', `-${formatCurrency(totals.discount)}`],
                ['Taxable Base', formatCurrency(totals.taxable)],
                ['GST Total', formatCurrency(totals.tax)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-3 border-b border-border-subtle">
                  <Text variant="p" className="opacity-60">{l}</Text>
                  <Text variant="sm" className="font-mono font-bold">{v}</Text>
                </div>
              ))}
              <div className="flex justify-between pt-6">
                <Text variant="h3">Net Payable</Text>
                <Text variant="h2" className="text-status-green">{formatCurrency(totals.net)}</Text>
              </div>
              <Button onClick={() => setShowTotals(false)} variant="sec" className="w-full mt-8">
                 Return to Terminal [ESC]
              </Button>
          </div>
        </Modal>

        {showStyleMatrix && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 bg-bg-base/60 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-6xl h-full bg-bg-elevated rounded-[3rem] overflow-hidden shadow-2xl relative border border-border-subtle">
              <StyleMatrix styleCode={selectedStyleCode} onBack={() => setShowStyleMatrix(false)} />
              <Button variant="ghost" onClick={() => setShowStyleMatrix(false)} className="absolute top-8 right-8 w-12 h-12 p-0 rounded-full bg-bg-float">
                <X size={24} />
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOASTS ── */}
      <div className="fixed top-8 right-8 z-[400] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} 
              className={cn(
                "px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-4 border border-border-subtle",
                t.type === 'error' ? 'bg-status-red/10 text-status-red border-status-red/20' : 
                t.type === 'success' ? 'bg-status-green/10 text-status-green border-status-green/20' : 
                'bg-bg-elevated text-text-primary'
              )}>
              {t.type === 'error' ? <AlertTriangle size={20}/> : t.type === 'success' ? <CheckCircle2 size={20}/> : <Info size={20}/>}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── TOOLBAR ── */}
      <Card variant="flat" className="flex items-center gap-1 px-4 py-3 shrink-0 rounded-none border-t-0 border-x-0 bg-bg-elevated/40">
        <div className="flex items-center gap-4 pr-6 mr-4 border-r border-border-subtle">
          <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            <Zap size={20} />
          </div>
          <div>
            <Text variant="h3" className="leading-none text-sm">Sovereign POS</Text>
            <Text variant="xs" className="mt-1 block">Institutional Node</Text>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { icon: <FilePlus2 size={16}/>, label: 'New', sub: 'Alt+1', action: () => resetSession() },
            { icon: <Search size={16}/>, label: 'Find', sub: 'F2', action: () => searchRef.current?.focus() },
            { icon: <RotateCcw size={16}/>, label: 'Return', sub: '', action: () => setShowReturns(true) },
            { icon: <Calculator size={16}/>, label: 'Totals', sub: 'F9', action: () => setShowTotals(v => !v) },
            { icon: <Banknote size={16}/>, label: 'Exact', sub: 'F7', action: () => { setPayLines([{ mode: 'CASH', amount: toRupees(netPayablePaise) }]); setShowSettle(true) } },
            { icon: <CreditCard size={16}/>, label: 'Settle', sub: 'F8', action: () => setShowSettle(true) },
            { icon: <Clock size={16}/>, label: 'Recall', sub: 'F5', action: () => setShowSuspended(v => !v) },
          ].map(btn => (
            <Button key={btn.label} variant="ghost" size="sm" onClick={btn.action} className="flex-col h-auto py-2 px-3 gap-1 hover:bg-bg-float">
               {btn.icon}
               <span className="text-[8px] font-black uppercase tracking-widest">{btn.label}</span>
            </Button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-6">
          <div className="flex items-center gap-3">
             <Badge variant={isOnline ? 'success' : 'error'}>
               {isOnline ? <Wifi size={10} className="inline mr-1" /> : <WifiOff size={10} className="inline mr-1" />}
               {isOnline ? 'SYNCED' : 'OFFLINE'}
             </Badge>
             <Text variant="xs" className="font-mono">{currentTime}</Text>
          </div>
          <div className="flex gap-2">
            <Button variant="sec" size="sm" onClick={() => setShowHistory(true)} className="h-10">
               History
            </Button>
            <Button size="sm" onClick={() => setShowDayEnd(true)} className="h-10 bg-status-amber text-bg-base hover:bg-status-amber/90">
               Day End
            </Button>
          </div>
        </div>
      </Card>

      {/* ── INPUTS ── */}
      <div className="flex gap-4 px-6 py-4 shrink-0 bg-bg-base/40 border-b border-border-subtle">
        <div className="flex-[3] relative">
          <ScanBarcode size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-disabled" />
          <Input ref={searchRef} autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="SCAN BARCODE OR STYLE PROTOCOL... [F2]" className="h-14 pl-14 font-mono text-lg tracking-wider" />
        </div>
        <div className="flex-[1.5] relative flex items-center gap-3">
          <div className="relative flex-1">
             <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled" />
             <Input value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} placeholder="Customer Identity (Mobile)" className="h-14 pl-12 font-mono" />
          </div>
          {customerInfo && customerInfo.current_balance > 0 && (
             <Badge variant="warn" className="h-14 px-4 flex flex-col items-center justify-center gap-0.5">
                <Text variant="xs" className="text-status-amber opacity-60">Balance Due</Text>
                <Text variant="sm" className="font-mono font-bold">₹{formatDecimal(customerInfo.current_balance)}</Text>
             </Badge>
          )}
        </div>
        <div className="flex-1 relative">
          <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled" />
          <Input value={salesperson} onChange={e => setSalesperson(e.target.value)} placeholder="Salesperson" className="h-14 pl-12" />
        </div>
      </div>

      {/* ── CART ── */}
      <div className="flex gap-6 px-6 py-6 flex-1 overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden border-border-subtle shadow-2xl bg-bg-elevated/20">
          <div className="grid text-[9px] font-black uppercase tracking-[0.2em] bg-bg-float/40 border-b border-border-subtle text-text-tertiary" style={{ gridTemplateColumns: '60px 140px 1fr 120px 120px 100px 130px 60px' }}>
            {['#','Code','Product','Price','Volume','Disc%','Net Value',''].map(h => <div key={h} className="px-6 py-4">{h}</div>)}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {cart.map((item, idx) => {
                const lineNet = Math.round(item.mrp_paise * item.qty * (1 - item.discount_per / 100))
                return (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                    className="grid items-center hover:bg-bg-float/20 transition-all border-b border-border-subtle/50" 
                    style={{ gridTemplateColumns: '60px 140px 1fr 120px 120px 100px 130px 60px' }}>
                    <div className="px-6 py-4 font-mono text-xs opacity-40">{idx + 1}</div>
                    <div className="px-6 py-4 font-mono text-xs font-bold text-accent">{item.code}</div>
                    <div className="px-6 py-4 flex flex-col gap-1.5">
                      <Text variant="sm" className="font-bold uppercase">{item.name}</Text>
                      <div className="flex items-center gap-2">
                        <Badge variant="muted" className="scale-90 origin-left">{item.brand}</Badge>
                        {item.discount_per > 0 && (
                          <Badge variant="success" className="scale-90 origin-left">
                            <Tag size={10} className="mr-1 inline" /> PROMO
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="px-6 py-4 font-mono font-bold text-text-secondary">{formatDecimal(item.mrp_paise)}</div>
                    <div className="px-6 py-4 flex items-center gap-3">
                       <Button variant="sec" size="sm" onClick={() => updateCartItem(item.id, { qty: Math.max(1, item.qty - 1) })} className="w-8 h-8 p-0 rounded-lg">-</Button>
                       <Text variant="sm" className="font-mono font-bold w-6 text-center">{item.qty}</Text>
                       <Button variant="sec" size="sm" onClick={() => updateCartItem(item.id, { qty: item.qty + 1 })} className="w-8 h-8 p-0 rounded-lg">+</Button>
                    </div>
                    <div className="px-6 py-4">
                       <Input type="number" value={item.discount_per} onChange={e => updateCartItem(item.id, { discount_per: Number(e.target.value) })} className="w-16 h-10 text-center font-bold" />
                    </div>
                    <div className="px-6 py-4 font-mono font-black text-sm text-text-primary">{formatCurrency(lineNet)}</div>
                    <div className="px-6 py-4">
                       <Button variant="ghost" size="sm" onClick={() => removeCartItem(item.id)} className="text-status-red hover:bg-status-red/10 h-10 w-10 p-0">
                          <Trash2 size={16}/>
                       </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-5 select-none grayscale">
                 <Package size={160} strokeWidth={0.5} />
                 <Text variant="h1" className="tracking-[0.8em] mt-12 opacity-20">Awaiting Terminal Input</Text>
              </div>
            )}
          </div>

          {/* Cart Footer Stats */}
          <div className="p-8 flex justify-between items-end bg-bg-elevated/40 border-t border-border-subtle">
             <div className="flex gap-12">
                <div>
                   <Text variant="xs" className="mb-2 block">Gross Subtotal</Text>
                   <Text variant="h3" className="font-mono opacity-60">{formatCurrency(totals.subtotal)}</Text>
                </div>
                <div>
                   <Text variant="xs" className="mb-2 block text-status-red">Discount Value</Text>
                   <Text variant="h3" className="font-mono text-status-red">-{formatCurrency(totals.discount)}</Text>
                </div>
                <div>
                   <Text variant="xs" className="mb-2 block">GST Collected</Text>
                   <Text variant="h3" className="font-mono opacity-60">{formatCurrency(totals.tax)}</Text>
                </div>
             </div>
             <div className="text-right">
                <Text variant="xs" className="mb-2 block font-black text-accent tracking-[0.3em]">NET PAYABLE AMOUNT</Text>
                <Text variant="h1" className="text-5xl tracking-tighter text-text-primary">{formatCurrency(netPayablePaise)}</Text>
             </div>
          </div>
        </Card>

        {/* ── SETTLEMENT PANEL ── */}
        <div className="w-80 flex flex-col gap-4 shrink-0">
           <Card className="p-6 flex-1 flex flex-col border-border-subtle shadow-2xl bg-bg-elevated/40">
              <div className="flex items-center justify-between mb-6">
                 <Text variant="h3" className="text-sm">Payment Protocol</Text>
                 <Button variant="sec" size="sm" onClick={() => setPayLines(p => [...p, { mode: 'CASH', amount: 0 }])} className="w-8 h-8 p-0">
                    <Plus size={16}/>
                 </Button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                 {payLines.map((pl, idx) => (
                   <Card key={idx} variant="flat" className="p-4 space-y-3 relative group rounded-2xl bg-bg-base/40">
                      <Select value={pl.mode} onChange={e => setPayLines(prev => prev.map((p,i) => i===idx ? {...p, mode: e.target.value as PayMode} : p))} className="h-10">
                         {['CASH','UPI','CARD','GV','COUPON'].map(m => <option key={m}>{m}</option>)}
                      </Select>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-30">₹</span>
                         <Input type="number" value={pl.amount || ''} onChange={e => setPayLines(prev => prev.map((p,i) => i===idx ? {...p, amount: Number(e.target.value)} : p))} placeholder="0.00" className="h-12 pl-8 font-mono text-lg font-bold" />
                      </div>
                      {payLines.length > 1 && (
                         <Button variant="ghost" onClick={() => setPayLines(p => p.filter((_,i) => i !== idx))} className="absolute -right-2 -top-2 w-7 h-7 p-0 rounded-full bg-status-red text-bg-base scale-0 group-hover:scale-100 transition-all shadow-lg">
                            <X size={14}/>
                         </Button>
                      )}
                   </Card>
                 ))}
              </div>

              <Card variant="flat" className={cn(
                "mt-6 p-6 text-center border-none",
                balanceRupees > 0.01 ? "bg-status-red/10 text-status-red" : "bg-status-green/10 text-status-green"
              )}>
                 <Text variant="xs" className="font-black mb-2 block">{balanceRupees > 0.01 ? 'PROTOCOL REMAINING' : 'EXCESS / CHANGE'}</Text>
                 <Text variant="h1" className="text-3xl font-mono">₹{Math.abs(balanceRupees).toFixed(2)}</Text>
              </Card>
           </Card>

           <Button
             onClick={handleFinalize}
             disabled={processing || !cart.length || balanceRupees > 0.05}
             className="h-24 rounded-3xl flex flex-col shadow-2xl shadow-accent/20"
           >
              {processing ? <RefreshCw className="animate-spin" /> : (
                <>
                  <div className="text-lg font-black flex items-center gap-3">
                    <Receipt size={24}/> FINALIZE BILL
                  </div>
                  <Text variant="xs" className="text-bg-base/60 mt-1">[F10] Execute Protocol</Text>
                </>
              )}
           </Button>
        </div>
      </div>
      
      {/* ── HOTKEY FOOTER ── */}
      <Card variant="flat" className="shrink-0 flex items-center justify-between px-6 py-3 bg-bg-elevated rounded-none border-x-0 border-b-0">
        <div className="flex items-center gap-8 overflow-x-auto">
           {[
             { key: 'F2', label: 'Find' },
             { key: 'Alt+1', label: 'New' },
             { key: 'Alt+2', label: 'Return' },
             { key: 'F4', label: 'History' },
             { key: 'F5', label: 'Recall' },
             { key: 'F6', label: 'Slips' },
             { key: 'F7', label: 'Exact' },
             { key: 'F8', label: 'Settle' },
             { key: 'F9', label: 'Totals' },
             { key: 'F10', label: 'Finalize' },
             { key: 'F12', label: 'Hold' },
             { key: 'Esc', label: 'Cancel' },
           ].map(hk => (
             <div key={hk.key} className="flex items-center gap-2">
                <Badge variant="muted" className="font-mono text-[10px] h-6 px-2">{hk.key}</Badge>
                <Text variant="xs" className="font-bold opacity-60">{hk.label}</Text>
             </div>
           ))}
        </div>
      </Card>
    </div>
  )
}
