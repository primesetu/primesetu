/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FilePlus2, RotateCcw, Banknote, CreditCard, Smartphone,
  Pause, Printer, CheckCircle2, ScanBarcode, Trash2,
  Calculator, User, Clock, ChevronRight, Zap, Search,
  Gift, Tag, UserCheck, Plus, Minus, X, AlertTriangle
} from 'lucide-react'
import { api } from '@/api/client'
import DayEndModule from './DayEndModule'
import SuspendedBillsBrowser from './SuspendedBillsBrowser'
import ThermalReceipt from './ThermalReceipt'
import ReturnsDrawer from './ReturnsDrawer'
import { useHotkeys } from 'react-hotkeys-hook'
import { offlineService } from '@/api/offline'
import { useLanguage } from '@/hooks/useLanguage'

interface CartItem {
  id: string; code: string; name: string; brand: string; category: string
  mrp: number; cost_price: number; qty: number; discount_per: number; tax_rate: number
}

type PayMode = 'CASH' | 'UPI' | 'CARD' | 'GV' | 'COUPON'
interface PayLine { mode: PayMode; amount: number; ref?: string }

const now = () => {
  const d = new Date()
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}  ${d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`
}

export default function BillingModule() {
  const { t } = useLanguage()
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
  const [showReturns, setShowReturns] = useState(false)
  const [billToPrint, setBillToPrint] = useState<any>(null)
  const [billPrefix] = useState('B')
  const [currentTime, setCurrentTime] = useState(now())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineCount, setOfflineCount] = useState(0)
  const [sendSms, setSendSms] = useState(true)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { const t = setInterval(() => setCurrentTime(now()), 30000); return () => clearInterval(t) }, [])
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check for existing offline data
    offlineService.getQueueCount().then(setOfflineCount)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Background Sync Logic
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
            break; // Stop if still failing
          }
        }
      }
      sync()
    }
  }, [isOnline, offlineCount])

  useEffect(() => {
    if (q.length < 3) return
    const t = setTimeout(async () => {
      try {
        const results = await api.inventory.search(q)
        const exact = results.find((p: any) => p.code.toLowerCase() === q.toLowerCase())
        if (exact) { addToCart(exact); setQ('') }
      } catch {}
    }, 200)
    return () => clearTimeout(t)
  }, [q])

  const addToCart = (p: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id)
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...p, qty: 1, discount_per: 0, tax_rate: p.tax_rate ?? 18 }]
    })
  }

  const updateItem = (id: string, updates: Partial<CartItem>) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id))

  // Totals (Shoper9 style: GST inclusive)
  const subtotal = cart.reduce((a, i) => a + i.mrp * i.qty, 0)
  const disc_total = cart.reduce((a, i) => a + i.mrp * i.qty * (i.discount_per / 100), 0)
  const taxable = subtotal - disc_total
  const tax_total = cart.reduce((a, i) => {
    const net = i.mrp * i.qty * (1 - i.discount_per / 100)
    const rate = i.tax_rate / 100
    return a + net - net / (1 + rate)
  }, 0)
  const net_payable = Math.round(taxable)
  const roundoff = net_payable - taxable

  const handleFinalize = async () => {
    if (!cart.length || processing) return
    setProcessing(true)
    const billData = {
      customer_mobile: sendSms ? customerMobile : '',
      type: 'Sales',
      items: cart.map(i => ({ product_id: i.id, qty: i.qty, unit_price: i.mrp, discount_per: i.discount_per, tax_per: i.tax_rate })),
      payments: payLines.filter(p => p.amount > 0)
    }

    try {
      if (!isOnline) throw new Error('OFFLINE')
      
      const result = await api.billing.finalize(billData)
      setLastBill(result); setBillToPrint(result)
      setCart([]); setCustomerMobile(''); setSalesperson('')
      setPayLines([{ mode: 'CASH', amount: 0 }]); setShowSettle(false)
      setTimeout(() => setLastBill(null), 6000)
    } catch (err) { 
      console.warn('[PrimeSetu] Network Failure. Entering Isolation Protocol.')
      // Queue transaction offline
      await offlineService.queueTransaction(billData)
      setOfflineCount(prev => prev + 1)
      
      // Still allow "Success" UI for cashier flow continuity
      const mockResult = { status: 'queued', bill_number: 'OFFLINE-'+Date.now(), total: net_payable }
      setLastBill(mockResult); setBillToPrint(mockResult)
      setCart([]); setCustomerMobile(''); setSalesperson('')
      setPayLines([{ mode: 'CASH', amount: 0 }]); setShowSettle(false)
    }
    finally { setProcessing(false) }
  }

  const handleSuspend = async () => {
    if (!cart.length) return
    setProcessing(true)
    try {
      await api.billing.suspend({ customer_mobile: customerMobile, type: 'Sales', items: cart.map(i => ({ product_id: i.id, qty: i.qty, unit_price: i.mrp })), suspended_reason: 'Counter Queue' })
      setCart([]); setCustomerMobile('')
    } catch {}
    finally { setProcessing(false) }
  }

  // Sovereign Shortcuts via react-hotkeys-hook
  useHotkeys('f5', (e) => { e.preventDefault(); setShowSuspended(v => !v) }, { enableOnFormTags: true })
  useHotkeys('f6, f9', (e) => { e.preventDefault(); setShowTotals(v => !v) }, { enableOnFormTags: true })
  useHotkeys('f7', (e) => { e.preventDefault(); setPayLines([{ mode: 'CASH', amount: net_payable }]); setShowSettle(true) }, { enableOnFormTags: true })
  useHotkeys('f8', (e) => { e.preventDefault(); setShowSettle(v => !v) }, { enableOnFormTags: true })
  useHotkeys('f10', (e) => { e.preventDefault(); setShowSettle(true) }, { enableOnFormTags: true })
  useHotkeys('f12', (e) => { e.preventDefault(); handleSuspend() }, { enableOnFormTags: true })
  useHotkeys('alt+1', (e) => { e.preventDefault(); setCart([]); setCustomerMobile(''); setSalesperson(''); setQ(''); setPayLines([{ mode: 'CASH', amount: 0 }]); setShowSettle(false); searchRef.current?.focus() }, { enableOnFormTags: true })
  useHotkeys('alt+2', (e) => { e.preventDefault(); setShowReturns(v => !v) }, { enableOnFormTags: true })
  useHotkeys('alt+m', (e) => { e.preventDefault(); document.getElementById('cust-mobile')?.focus() }, { enableOnFormTags: true })
  useHotkeys('ctrl+d', (e) => { e.preventDefault(); setCart(p => p.slice(0,-1)) }, { enableOnFormTags: true })
  useHotkeys('escape', (e) => { setQ(''); setShowTotals(false); setShowSettle(false) }, { enableOnFormTags: true })

  const PAY_ICONS: Record<PayMode, JSX.Element> = {
    CASH:   <Banknote className="w-4 h-4" />,
    UPI:    <Smartphone className="w-4 h-4" />,
    CARD:   <CreditCard className="w-4 h-4" />,
    GV:     <Gift className="w-4 h-4" />,
    COUPON: <Tag className="w-4 h-4" />,
  }
  const PAY_COLORS: Record<PayMode, string> = {
    CASH: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    UPI: 'bg-purple-50 border-purple-300 text-purple-700',
    CARD: 'bg-blue-50 border-blue-300 text-blue-700',
    GV: 'bg-rose-50 border-rose-300 text-rose-700',
    COUPON: 'bg-amber-50 border-amber-300 text-amber-700',
  }
  const paidTotal = payLines.reduce((s, p) => s + p.amount, 0)
  const balance = net_payable - paidTotal

  return (
    <div className="flex flex-col h-screen bg-[#f0ede8] font-sans overflow-hidden relative">
      <ThermalReceipt bill={billToPrint} onPrinted={() => setBillToPrint(null)} />

      {/* ─── Overlays ─── */}
      <AnimatePresence>
        {showSuspended && (
           <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute right-0 top-0 bottom-0 w-[400px] z-[250] bg-navy shadow-2xl border-l-4 border-saffron">
             <SuspendedBillsBrowser 
                onRecall={(items, mobile) => { setCart(items); setCustomerMobile(mobile); setShowSuspended(false) }} 
                onClose={() => setShowSuspended(false)} 
             />
           </motion.div>
        )}
        {showReturns && (
           <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute right-0 top-0 bottom-0 w-[400px] z-[250] bg-navy shadow-2xl border-l-4 border-rose-500">
             <ReturnsDrawer onClose={() => setShowReturns(false)} />
           </motion.div>
        )}
        {showDayEnd && <DayEndModule onClose={() => setShowDayEnd(false)} />}
        {lastBill && (
          <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Bill Settled</div>
              <div className="text-xl font-black">{lastBill.bill_number} &nbsp;·&nbsp; ₹{Math.round(lastBill.total).toLocaleString()}</div>
            </div>
          </motion.div>
        )}

        {/* F9 Totals Panel */}
        {showTotals && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowTotals(false)}>
            <div className="bg-white rounded-3xl p-8 shadow-2xl w-96 border-2 border-navy/10" onClick={e => e.stopPropagation()}>
              <div className="text-center text-xs font-black text-navy uppercase tracking-[0.3em] mb-6">Bill Totals [F9]</div>
              {[
                ['Gross MRP', `₹${subtotal.toLocaleString()}`],
                ['Discount', `-₹${Math.round(disc_total).toLocaleString()}`],
                ['Taxable Value', `₹${Math.round(taxable - tax_total).toLocaleString()}`],
                ['GST / Tax', `₹${Math.round(tax_total).toLocaleString()}`],
                ['Round Off', `₹${roundoff.toFixed(2)}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">{l}</span>
                  <span className="font-black text-navy">{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-4 text-2xl font-black">
                <span className="text-navy">Net Payable</span>
                <span className="text-emerald-600">₹{net_payable.toLocaleString()}</span>
              </div>
              <button onClick={() => setShowTotals(false)} className="mt-6 w-full bg-navy text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest">Close [Esc]</button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>


      {/* ─── Shoper9 Toolbar ─── */}
      <div className="flex items-center gap-1 bg-[#1a2340] px-3 py-2 shrink-0">
        {/* Logo */}
          <div className="flex items-center gap-4">
            {!isOnline && (
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-500 text-white rounded-full text-[10px] font-black animate-pulse">
                <AlertTriangle className="w-3 h-3" /> {t('isolated')}
              </div>
            )}
            {offlineCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-black">
                <Clock className="w-3 h-3" /> {offlineCount} {t('syncing')}
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-bold">
              <Zap className="w-3 h-3 text-amber-400" /> V2.0.4-SOVEREIGN
            </div>
          </div>
          <div className="flex items-center gap-2 pr-4 mr-2 border-r border-white/10">
          <div className="w-7 h-7 bg-amber-400 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-navy fill-navy" />
          </div>
          <span className="text-white font-black text-sm tracking-tight">PrimeSetu POS</span>
        </div>

        {/* Action buttons */}
        {[
          { icon: <FilePlus2 className="w-4 h-4" />, label: 'New Bill', key: 'Alt+1', action: () => { setCart([]); setCustomerMobile(''); setQ(''); searchRef.current?.focus() } },
          { icon: <Search className="w-4 h-4" />, label: 'Item Search', key: 'F2', action: () => searchRef.current?.focus() },
          { icon: <RotateCcw className="w-4 h-4" />, label: 'Return', key: 'Alt+2', action: () => setShowReturns(true) },
          { icon: <Calculator className="w-4 h-4" />, label: 'Totals', key: 'F9', action: () => setShowTotals(v => !v) },
          { icon: <Banknote className="w-4 h-4" />, label: 'Exact Cash', key: 'F7', action: () => { setPayLines([{ mode: 'CASH', amount: net_payable }]); handleFinalize() } },
          { icon: <CreditCard className="w-4 h-4" />, label: 'Settlement', key: 'F8', action: () => setShowSettle(true) },
          { icon: <Pause className="w-4 h-4" />, label: 'Suspend', key: 'F12', action: handleSuspend },
          { icon: <Printer className="w-4 h-4" />, label: 'Reprint', key: 'Alt+6', action: () => {} },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            className="flex flex-col items-center px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all gap-0.5 min-w-[60px]">
            {btn.icon}
            <span className="text-[9px] font-bold leading-tight">{btn.label}</span>
            <span className="text-[8px] text-amber-400/70 font-mono">{btn.key}</span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-4 text-white/40 text-[10px] font-mono">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{currentTime}</span>
          <span className="text-amber-400 font-bold">X01-RET-01</span>
          <button onClick={() => setShowDayEnd(true)} className="text-[9px] bg-white/10 hover:bg-amber-400 hover:text-navy px-3 py-1.5 rounded-lg font-black transition-all">Day End</button>
        </div>
      </div>

      {/* ─── Bill Header ─── */}
      <div className="flex gap-2 px-3 pt-2 shrink-0">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm flex-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Bill Prefix</span>
          <span className="font-black text-navy text-sm">{billPrefix}-</span>
          <span className="text-[10px] font-bold text-gray-300 ml-1">(Cash Transaction)</span>
        </div>
        <div className="relative flex-[3]">
          <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input ref={searchRef} autoFocus value={q} onChange={e => setQ(e.target.value)}
            data-f2="items"
            placeholder="Scan barcode / search item code or name [F2]..."
            className="w-full bg-white border-2 border-gray-200 focus:border-amber-400 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono outline-none transition-all shadow-sm"
          />
        </div>
        <div className="relative flex-1">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input id="cust-mobile" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)}
            data-f2="customers" placeholder="Customer Mobile [Alt+M / F2]"
            className="w-full bg-white border-2 border-gray-200 focus:border-amber-400 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono outline-none transition-all shadow-sm" />
        </div>
        <div className="relative flex-1">
          <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input value={salesperson} onChange={e => setSalesperson(e.target.value)}
            placeholder="Salesperson"
            className="w-full bg-white border-2 border-gray-200 focus:border-amber-400 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono outline-none transition-all shadow-sm" />
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex gap-2 px-3 pb-2 pt-2 flex-1 overflow-hidden">

        {/* ─── Bill Details Grid ─── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Grid Header */}
          <div className="grid bg-[#1a2340] text-white text-[10px] font-black uppercase tracking-widest"
            style={{ gridTemplateColumns: '40px 90px 1fr 80px 90px 70px 80px 100px 36px' }}>
            {['#','Code','Item Name','Qty','MRP','Disc%','GST%','Net Amt',''].map(h => (
              <div key={h} className={`px-2 py-3 ${h === 'Item Name' ? 'text-left' : 'text-center'}`}>{h}</div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="flex-1 overflow-x-auto bg-gray-50/50">
            <div className="min-w-[800px] h-full flex flex-col">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 opacity-10 gap-4">
                  <ScanBarcode className="w-24 h-24" strokeWidth={0.8} />
                  <span className="text-2xl font-black uppercase tracking-widest">Scan Item to Begin</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {cart.map((item, idx) => {
              const lineNet = item.mrp * item.qty * (1 - item.discount_per / 100)
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className={`grid items-center border-b border-gray-50 hover:bg-amber-50 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}
                  style={{ gridTemplateColumns: '40px 90px 1fr 80px 90px 70px 80px 100px 36px' }}>
                  <div className="px-2 py-3 text-center text-[11px] font-bold text-gray-400">{idx + 1}</div>
                  <div className="px-2 py-3 text-center font-mono text-[11px] text-gray-500">{item.code}</div>
                  <div className="px-2 py-3">
                    <div className="font-bold text-navy text-sm leading-tight">{item.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{item.brand} · {item.category}</div>
                  </div>
                  <div className="px-2 py-3 flex items-center justify-center gap-1">
                    <button onClick={() => updateItem(item.id, { qty: Math.max(1, item.qty - 1) })}
                      className="w-5 h-5 bg-gray-100 hover:bg-amber-200 rounded text-xs font-black transition-colors flex items-center justify-center">-</button>
                    <span className="w-8 text-center font-black text-navy text-sm">{item.qty}</span>
                    <button onClick={() => updateItem(item.id, { qty: item.qty + 1 })}
                      className="w-5 h-5 bg-gray-100 hover:bg-amber-200 rounded text-xs font-black transition-colors flex items-center justify-center">+</button>
                  </div>
                  <div className="px-2 py-3 text-center font-mono text-sm text-gray-600">₹{item.mrp.toLocaleString()}</div>
                  <div className="px-2 py-3 flex items-center justify-center">
                    <input type="number" value={item.discount_per} min={0} max={100}
                      onChange={e => updateItem(item.id, { discount_per: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      className="w-12 text-center border border-gray-200 rounded-lg py-1 text-sm font-bold outline-none focus:border-amber-400 bg-transparent"
                    />
                  </div>
                  <div className="px-2 py-3 text-center text-[11px] text-gray-400 font-bold">{item.tax_rate}%</div>
                  <div className="px-2 py-3 text-center font-black text-navy text-sm">₹{Math.round(lineNet).toLocaleString()}</div>
                  <div className="px-2 py-3 flex items-center justify-center">
                    <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
                </div>
              )}
            </div>
          </div>

          {/* Bill Footer Summary */}
          <div className="border-t-2 border-gray-100 bg-gray-50 px-4 py-3 grid grid-cols-4 gap-4 shrink-0">
            {[
              { label: 'Items', value: cart.reduce((a, i) => a + i.qty, 0) },
              { label: 'Gross MRP', value: `₹${subtotal.toLocaleString()}` },
              { label: 'Discount', value: `-₹${Math.round(disc_total).toLocaleString()}` },
              { label: 'GST', value: `₹${Math.round(tax_total).toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
                <div className="text-base font-black text-navy">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Settlement Panel ─── */}
        <div className="w-72 flex flex-col gap-2 shrink-0">

          {/* Net Payable */}
          <div className="bg-[#1a2340] rounded-2xl p-4 text-white text-center shadow-lg border-b-4 border-amber-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent" />
            <div className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">{t('payable')}</div>
            <div className="text-4xl font-black font-mono">₹{net_payable.toLocaleString()}</div>
            {disc_total > 0 && <div className="text-[10px] text-emerald-400 font-bold mt-1">Saves ₹{Math.round(disc_total).toLocaleString()}</div>}
            {salesperson && <div className="text-[9px] text-white/40 mt-1 font-mono">SP: {salesperson}</div>}
          </div>

          {/* Breakup */}
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm text-xs space-y-1.5">
            {[
              ['Subtotal', `₹${Math.round(taxable - tax_total).toLocaleString()}`],
              ['GST', `₹${Math.round(tax_total).toLocaleString()}`],
              ['Round Off', `${roundoff >= 0 ? '+' : ''}₹${roundoff.toFixed(2)}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-gray-400">{l}</span>
                <span className="font-bold text-gray-700">{v}</span>
              </div>
            ))}
          </div>

          {/* Split Payment Lines */}
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Split Payment [F8]</span>
              <button onClick={() => setPayLines(p => [...p, { mode: 'CASH', amount: 0 }])}
                className="text-[9px] font-black text-amber-500 hover:text-amber-700 flex items-center gap-0.5">
                <Plus className="w-3 h-3" />Add
              </button>
            </div>
            {payLines.map((pl, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <select value={pl.mode}
                  onChange={e => setPayLines(prev => prev.map((p,i) => i===idx ? {...p, mode: e.target.value as PayMode} : p))}
                  className="flex-1 border border-gray-200 rounded-lg py-1.5 px-2 text-[11px] font-black bg-gray-50 outline-none focus:border-amber-400">
                  {(['CASH','UPI','CARD','GV','COUPON'] as PayMode[]).map(m => <option key={m}>{m}</option>)}
                </select>
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-bold">₹</span>
                  <input type="number" value={pl.amount || ''} min={0}
                    onChange={e => setPayLines(prev => prev.map((p,i) => i===idx ? {...p, amount: Number(e.target.value)} : p))}
                    className="w-full border border-gray-200 rounded-lg py-1.5 pl-6 pr-2 text-[11px] font-black outline-none focus:border-amber-400 bg-white" />
                </div>
                {pl.mode !== 'CASH' && (
                  <input value={pl.ref || ''} onChange={e => setPayLines(prev => prev.map((p,i) => i===idx ? {...p, ref: e.target.value} : p))}
                    placeholder="Ref" className="w-14 border border-gray-200 rounded-lg py-1.5 px-2 text-[10px] outline-none focus:border-amber-400" />
                )}
                {payLines.length > 1 && (
                  <button onClick={() => setPayLines(p => p.filter((_,i) => i !== idx))} className="text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {/* Balance Indicator */}
            <div className={`flex justify-between text-xs font-black pt-1 border-t border-dashed ${balance > 0 ? 'text-red-500 border-red-200' : balance < 0 ? 'text-emerald-500 border-emerald-200' : 'text-gray-400 border-gray-200'}`}>
              <span>{balance > 0 ? 'Balance Due' : balance < 0 ? 'Change Back' : 'Exact'}</span>
              <span>₹{Math.abs(balance).toLocaleString()}</span>
            </div>
          </div>

          {/* Quick-fill all modes */}
          <div className="grid grid-cols-5 gap-1">
            {(['CASH','UPI','CARD','GV','COUPON'] as PayMode[]).map(m => (
              <button key={m} title={m}
                onClick={() => setPayLines([{ mode: m, amount: net_payable }])}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-[9px] font-black border-2 transition-all ${
                  payLines.length === 1 && payLines[0].mode === m && payLines[0].amount === net_payable
                    ? 'bg-amber-400 text-navy border-amber-400'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-amber-300'
                }`}>
                {PAY_ICONS[m]}
                {m}
              </button>
            ))}
          </div>

          {/* Customer & Digital Receipt */}
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Customer Mobile [Alt+M]</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                <input id="cust-mobile" type="tel" value={customerMobile} 
                  onChange={e => setCustomerMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-amber-400"
                />
              </div>
            </div>
            
            <button onClick={() => setSendSms(!sendSms)}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                sendSms ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
              <div className="flex items-center gap-2">
                <Zap className={`w-3.5 h-3.5 ${sendSms ? 'text-emerald-500 fill-emerald-500' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-tight">Digital Receipt</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${sendSms ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${sendSms ? (4.5 * 4) + 'px' : (0.5 * 4) + 'px'}`} />
              </div>
            </button>
          </div>

          <button onClick={handleSuspend} disabled={!cart.length}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-500 hover:text-orange-600 rounded-xl py-2.5 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-30">
            <Pause className="w-4 h-4" />
            Suspend [F12]
          </button>

          {/* Settle */}
          <button onClick={handleFinalize} disabled={processing || !cart.length || balance > 0.5}
            className="bg-amber-400 hover:bg-amber-500 disabled:opacity-30 text-navy font-black rounded-2xl shadow-xl text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] border-b-4 border-amber-600 py-4">
            {processing
              ? <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              : <><CheckCircle2 className="w-5 h-5" />{t('settle')} [F10]<ChevronRight className="w-4 h-4" /></>}
          </button>

          {/* Legend */}
          <div className="bg-white/60 rounded-xl p-2.5 text-[9px] text-gray-400 font-mono border border-gray-100 leading-relaxed">
            {[['F2','Item Search'],['F5','Suspended Queue'],['F7','Exact Cash'],['F8','Settlement'],['F9','Totals'],['F10','Settle'],['F12','Suspend'],['Ctrl+D','Del Last'],['Alt+1','New'],['Alt+2','Return']].map(([k,v]) => (
              <div key={k} className="flex justify-between"><span className="text-amber-500">{k}</span><span>{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
