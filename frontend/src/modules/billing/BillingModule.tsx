/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FilePlus2, RotateCcw, Banknote, CreditCard, Smartphone,
  Pause, Printer, CheckCircle2, ScanBarcode, Trash2,
  Calculator, User, Clock, ChevronRight, Zap, Search,
  Gift, Tag, UserCheck, Plus, Minus, X, AlertTriangle,
  FileText, Wifi, WifiOff, LayoutDashboard, Settings, Package
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

// ── TYPES ──
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
  const [lastBill, setLastBill] = useState<any>(null)
  const [showTotals, setShowTotals] = useState(false)
  const [showSettle, setShowSettle] = useState(false)
  const [showSuspended, setShowSuspended] = useState(false)
  const [showSalesSlips, setShowSalesSlips] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showReturns, setShowReturns] = useState(false)
  const [billToPrint, setBillToPrint] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(getNow())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineCount, setOfflineCount] = useState(0)
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4' | 'b2b'>('thermal')
  const [sendSms, setSendSms] = useState(true)
  const [activeTill, setActiveTill] = useState<any>(null)
  const [showStyleMatrix, setShowStyleMatrix] = useState(false)
  const [selectedStyleCode, setSelectedStyleCode] = useState('')
  
  const searchRef = useRef<HTMLInputElement>(null)

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
      const openTill = tills.find((t: any) => t.status === 'Open')
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
            console.error('[PrimeSetu] Sync Fail:', err)
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
        const exactItem = results.find((p: any) => p.code.toLowerCase() === q.toLowerCase())
        if (exactItem) { 
          handleAddToCart(exactItem)
          setQ('')
          return
        }

        const isStyle = results.some((p: any) => p.style_code?.toLowerCase() === q.toLowerCase())
        if (isStyle) {
          setSelectedStyleCode(q.toUpperCase())
          setShowStyleMatrix(true)
          setQ('')
        }
      } catch {}
    }, 400)
    return () => clearTimeout(timer)
  }, [q])

  // ── LOGIC ──
  const handleAddToCart = (p: any) => {
    // Standardize mapping from backend to local cart item
    const normalizedItem: CartItem = {
      id: p.id,
      code: p.code,
      name: p.name,
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

    const storeStock = normalizedItem.stocks?.find((s: any) => s.store_id === 'X01')?.quantity

    setCart(prev => {
      const existing = prev.find(i => i.id === normalizedItem.id)
      const currentQty = existing ? existing.qty : 0
      
      if (storeStock !== undefined && currentQty + 1 > storeStock) {
        alert(`STOCK ALERT: Only ${storeStock} units available in X01 store.`)
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
          const storeStock = i.stocks?.find((s: any) => s.store_id === 'X01')?.quantity
          if (storeStock !== undefined && updates.qty > storeStock) {
            alert(`STOCK ALERT: Only ${storeStock} units available.`)
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
  const roundoffPaise = 0 // Shoper 9 usually rounds at payment stage or maintains paise

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
      console.warn('[PrimeSetu] Isolation Protocol Engaged. Saving to Local Ledger.')
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

  const handleCreateSlip = async () => {
    if (!cart.length) return
    setProcessing(true)
    try {
      await api.billing.createSlip({ 
        customer_mobile: customerMobile, 
        items: cart.map(i => ({ 
          product_id: i.id, 
          qty: i.qty, 
          unit_price: i.mrp_paise,
          discount_per: i.discount_per 
        })) 
      })
      resetSession()
    } catch (err) {
      console.error('Slip creation failed:', err)
    } finally { setProcessing(false) }
  }

  const paidTotalRupees = payLines.reduce((s, p) => s + p.amount, 0)
  const balanceRupees = toRupees(netPayablePaise) - paidTotalRupees

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden relative" style={{ background: 'var(--bg-base)' }}>
      {/* ── PRINTING LAYERS ── */}
      {printFormat === 'thermal' && <ThermalReceipt bill={billToPrint} onPrinted={() => setBillToPrint(null)} />}
      {printFormat === 'a4' && <TaxInvoiceA4 bill={billToPrint} onPrinted={() => setBillToPrint(null)} />}
      {printFormat === 'b2b' && <TaxInvoiceB2B bill={billToPrint} onPrinted={() => setBillToPrint(null)} />}
      <CreditNoteA4 bill={billToPrint?.type === 'Return' ? billToPrint : null} onPrinted={() => setBillToPrint(null)} />

      {/* ── OVERLAYS ── */}
      <AnimatePresence>
        {showSuspended && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute right-0 top-0 bottom-0 w-[400px] z-[250] shadow-2xl" style={{ background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border-default)' }}>
             <SuspendedBillsBrowser 
                onRecall={(items: any, mobile: string) => { 
                  setCart(items.map((i: any) => ({ ...i, mrp_paise: i.unit_price }))); 
                  setCustomerMobile(mobile); 
                  setShowSuspended(false); 
                }} 
                onClose={() => setShowSuspended(false)} 
             />
           </motion.div>
        )}
        {showReturns && (
           <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute right-0 top-0 bottom-0 w-[400px] z-[250] shadow-2xl" style={{ background: 'var(--bg-elevated)', borderLeft: '1px solid var(--red)' }}>
             <ReturnsDrawer 
                onReturn={(bill) => { setBillToPrint(bill); setShowReturns(false); }}
                onClose={() => setShowReturns(false)} 
              />
           </motion.div>
        )}
        {showSalesSlips && <SalesSlipsBrowser onRecall={(items, mobile) => { setCart(items as any); setCustomerMobile(mobile); setShowSalesSlips(false); }} onClose={() => setShowSalesSlips(false)} />}
        {showHistory && <BillHistoryBrowser onReprint={(b) => setBillToPrint(b)} onClose={() => setShowHistory(false)} />}
        {showDayEnd && <DayEndModule onClose={() => setShowDayEnd(false)} />}
        
        {lastBill && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Bill Settled</div>
              <div className="text-xl font-black">{lastBill.bill_number} &nbsp;·&nbsp; {formatCurrency(lastBill.total)}</div>
            </div>
          </motion.div>
        )}

        {showTotals && (
          <div className="absolute inset-0 z-[150] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowTotals(false)}>
            <motion.div initial={{ scale: 0.97 }} animate={{ scale: 1 }} className="rounded-xl p-6 shadow-2xl w-80" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)' }} onClick={e => e.stopPropagation()}>
              <div className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)' }}>Bill Totals [F9]</div>
              {[
                ['Gross Subtotal', formatCurrency(totals.subtotal)],
                ['Disc. Allowance', `-${formatCurrency(totals.discount)}`],
                ['Taxable Base', formatCurrency(totals.taxable)],
                ['GST', formatCurrency(totals.tax)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2.5 text-sm" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
                  <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-4 text-lg font-semibold">
                <span style={{ color: 'var(--text-secondary)' }}>Net Payable</span>
                <span className="font-mono" style={{ color: 'var(--green)' }}>{formatCurrency(totals.net)}</span>
              </div>
              <button onClick={() => setShowTotals(false)} className="mt-5 w-full py-2.5 rounded-lg text-sm font-medium transition-colors" style={{ background: 'var(--bg-float)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>Return to POS</button>
            </motion.div>
          </div>
        )}

        {showStyleMatrix && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 bg-navy/60 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-6xl h-full bg-white rounded-[3rem] overflow-hidden shadow-2xl relative">
              <StyleMatrix styleCode={selectedStyleCode} onBack={() => setShowStyleMatrix(false)} />
              <button onClick={() => setShowStyleMatrix(false)} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center hover:scale-110 transition-transform z-[210]">
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOOLBAR ── */}
      <div className="flex items-center gap-1 px-3 py-2 shrink-0 select-none" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 pr-4 mr-2" style={{ borderRight: '1px solid var(--border-subtle)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
            <Zap className="w-4 h-4" style={{ color: 'var(--accent-light)' }} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xs leading-none" style={{ color: 'var(--text-primary)' }}>PrimeSetu POS</span>
            <span className="text-[9px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Institutional</span>
          </div>
        </div>

        {[
          { icon: <FilePlus2 size={14}/>, label: 'New', sub: 'Alt+1', action: () => resetSession() },
          { icon: <Search size={14}/>, label: 'Find', sub: 'F2', action: () => searchRef.current?.focus() },
          { icon: <RotateCcw size={14}/>, label: 'Return', sub: '', action: () => setShowReturns(true) },
          { icon: <Calculator size={14}/>, label: 'Totals', sub: 'F9', action: () => setShowTotals(v => !v) },
          { icon: <Banknote size={14}/>, label: 'Exact', sub: 'F7', action: () => { setPayLines([{ mode: 'CASH', amount: toRupees(netPayablePaise) }]); setShowSettle(true) } },
          { icon: <CreditCard size={14}/>, label: 'Settle', sub: 'F8', action: () => setShowSettle(true) },
          { icon: <FileText size={14}/>, label: 'Slips', sub: 'F6', action: () => setShowSalesSlips(true) },
          { icon: <Pause size={14}/>, label: 'Hold', sub: 'F12', action: handleSuspend },
          { icon: <Clock size={14}/>, label: 'Recall', sub: 'F5', action: () => setShowSuspended(v => !v) },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            className="flex flex-col items-center px-3 py-1.5 rounded-md transition-colors group"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-float)', e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <div className="mb-0.5">{btn.icon}</div>
            <span className="text-[8px] font-medium uppercase tracking-tight">{btn.label}</span>
            {btn.sub && <span className="text-[7px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{btn.sub}</span>}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-4 text-[10px] font-medium">
          <div className="flex items-center gap-2">
            {!isOnline
              ? <span className="flex items-center gap-1" style={{ color: 'var(--red)' }}><WifiOff size={11}/> Isolated</span>
              : <span className="flex items-center gap-1" style={{ color: 'var(--green)' }}><Wifi size={11}/> Online</span>}
            <span style={{ color: 'var(--text-tertiary)' }}>{currentTime}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowHistory(true)} className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ background: 'var(--bg-float)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              History
            </button>
            <button onClick={() => setShowDayEnd(true)} className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ background: 'var(--amber-bg)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.2)' }}>
              Day End
            </button>
          </div>
        </div>
      </div>

      {/* ── INPUTS ── */}
      <div className="flex gap-2 px-3 pt-2 pb-2 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex-[3] relative">
          <ScanBarcode size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input ref={searchRef} autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Scan barcode or style code... [F2]" className="finput-lg pl-9 font-mono text-sm" />
        </div>
        <div className="flex-1 relative">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input id="cust-mobile" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} placeholder="Customer mobile" className="finput-lg pl-9 font-mono text-sm" />
        </div>
        <div className="flex-1 relative">
          <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input value={salesperson} onChange={e => setSalesperson(e.target.value)} placeholder="Salesperson" className="finput-lg pl-9 text-sm" />
        </div>
      </div>

      {/* ── CART ── */}
      <div className="flex gap-4 px-4 py-4 flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
          <div className="grid text-[10px] font-medium uppercase tracking-wider" style={{ gridTemplateColumns: '44px 110px 1fr 100px 100px 90px 110px 36px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
            {['#','Code','Product','Price','Qty','Disc%','Net',''].map(h => <div key={h} className="px-4 py-3 text-left">{h}</div>)}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {cart.map((item, idx) => {
                const lineNet = Math.round(item.mrp_paise * item.qty * (1 - item.discount_per / 100))
                return (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid items-center group transition-colors" style={{ gridTemplateColumns: '44px 110px 1fr 100px 100px 90px 110px 36px', borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-float)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{idx + 1}</div>
                    <div className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.code}</div>
                    <div className="px-4 py-3">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.brand} · {item.category}</div>
                    </div>
                    <div className="px-4 py-3 font-mono text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{formatDecimal(item.mrp_paise)}</div>
                    <div className="px-4 py-3 flex items-center gap-1.5">
                       <button onClick={() => updateCartItem(item.id, { qty: Math.max(1, item.qty - 1) })} className="w-5 h-5 rounded flex items-center justify-center transition-colors" style={{ background: 'var(--bg-float)', color: 'var(--text-secondary)' }}><Minus size={10}/></button>
                       <span className="w-6 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{item.qty}</span>
                       <button onClick={() => updateCartItem(item.id, { qty: item.qty + 1 })} className="w-5 h-5 rounded flex items-center justify-center transition-colors" style={{ background: 'var(--bg-float)', color: 'var(--text-secondary)' }}><Plus size={10}/></button>
                    </div>
                    <div className="px-4 py-3">
                       <input type="number" value={item.discount_per} onChange={e => updateCartItem(item.id, { discount_per: Number(e.target.value) })} className="w-14 text-xs text-center rounded p-1.5 outline-none" style={{ background: 'var(--bg-float)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} />
                    </div>
                    <div className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(lineNet)}</div>
                    <div className="px-4 py-3">
                       <button onClick={() => removeCartItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--red)' }}><Trash2 size={14}/></button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-5 select-none">
                 <ScanBarcode size={120} strokeWidth={1} />
                 <span className="text-3xl font-black uppercase tracking-[0.5em] mt-8">Awaiting Input</span>
              </div>
            )}
          </div>

          <div className="p-4 flex justify-between items-end shrink-0" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
             <div className="flex gap-8">
                <div>
                   <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Cart Value</div>
                   <div className="text-lg font-semibold font-mono" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(totals.subtotal)}</div>
                </div>
                <div>
                   <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Discount</div>
                   <div className="text-lg font-semibold font-mono" style={{ color: 'var(--red)' }}>-{formatCurrency(totals.discount)}</div>
                </div>
                <div>
                   <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>GST</div>
                   <div className="text-lg font-semibold font-mono" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(totals.tax)}</div>
                </div>
             </div>
             <div className="text-right">
                <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Amount Due</div>
                <div className="text-4xl font-semibold font-mono tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{formatCurrency(netPayablePaise)}</div>
             </div>
          </div>
        </div>

        {/* ── SETTLEMENT PANEL ── */}
        <div className="w-72 flex flex-col gap-3 shrink-0">
           <div className="rounded-xl p-4 flex-1 flex flex-col" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Payment</h3>
                 <button onClick={() => setPayLines(p => [...p, { mode: 'CASH', amount: 0 }])} className="w-6 h-6 rounded flex items-center justify-center transition-colors" style={{ background: 'var(--bg-float)', color: 'var(--text-secondary)' }}><Plus size={12}/></button>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                 {payLines.map((pl, idx) => (
                   <div key={idx} className="p-3 rounded-lg space-y-2 relative group" style={{ background: 'var(--bg-float)' }}>
                      <select value={pl.mode} onChange={e => setPayLines(prev => prev.map((p,i) => i===idx ? {...p, mode: e.target.value as PayMode} : p))} className="fselect" style={{ height: '32px', fontSize: '12px' }}>
                         {['CASH','UPI','CARD','GV','COUPON'].map(m => <option key={m}>{m}</option>)}
                      </select>
                      <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>₹</span>
                         <input type="number" value={pl.amount || ''} onChange={e => setPayLines(prev => prev.map((p,i) => i===idx ? {...p, amount: Number(e.target.value)} : p))} placeholder="0.00" className="finput pl-7" style={{ height: '32px' }} />
                      </div>
                      {payLines.length > 1 && (
                         <button onClick={() => setPayLines(p => p.filter((_,i) => i !== idx))} className="absolute -right-1.5 -top-1.5 w-5 h-5 rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform" style={{ background: 'var(--red)', color: '#fff' }}><X size={10}/></button>
                      )}
                   </div>
                 ))}
              </div>

              <div className="mt-4 p-4 rounded-lg text-center transition-all" style={{ background: balanceRupees > 0.01 ? 'var(--red-bg)' : 'var(--green-bg)', color: balanceRupees > 0.01 ? 'var(--red)' : 'var(--green)' }}>
                 <div className="text-[10px] font-medium uppercase tracking-wider mb-1">{balanceRupees > 0.01 ? 'Balance Due' : 'Change Back'}</div>
                 <div className="text-xl font-semibold font-mono">₹{Math.abs(balanceRupees).toFixed(2)}</div>
              </div>
           </div>

           <button
             onClick={handleFinalize}
             disabled={processing || !cart.length || balanceRupees > 0.05}
             className="w-full rounded-xl flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
             style={{ height: '72px', background: 'var(--pos-cta)', color: '#fff' }}
           >
              {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <>
                  <div className="text-base font-semibold flex items-center gap-2"><CheckCircle2 size={16}/> Finalize Bill</div>
                  <div className="text-[10px] font-medium opacity-60 uppercase tracking-wider">F10</div>
                </>
              )}
           </button>
        </div>
      </div>
    </div>
  )
}
