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
  RefreshCw,
  ShieldCheck,
  History,
  Maximize2,
  Minimize2
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
  Badge, 
  Button, 
  Card, 
  Text, 
  Input, 
  Select, 
  Label, 
  Flex, 
  Grid, 
  Portal 
} from '@/components/ui/SovereignUI';

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

type PayMode = 'CASH' | 'UPI' | 'CARD' | 'CHQ' | 'GV' | 'COUPON' | 'CREDIT'
interface PayLine { mode: PayMode; amount: number; ref?: string; metadata?: Record<string, string> }

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
  const [billType, setBillType] = useState<'Product' | 'Service'>('Product')
  const [transType, setTransType] = useState<'Cash' | 'Credit'>('Cash')
  const [remarks, setRemarks] = useState('')
  const [isSuspended, setIsSuspended] = useState(false)
  const [toasts, setToasts] = useState<{id: number, msg: string, type: 'error' | 'success' | 'info'}[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerData | null>(null)
  const [suspendedBills, setSuspendedBills] = useState<any[]>([])
  const [showRecallModal, setShowRecallModal] = useState(false)
  
  const searchRef = useRef<HTMLInputElement>(null)

  // ── SHOPER 9 SYSTEM PARAMETERS (Sovereign Context) ──
  const SHOPER9_PARAMS = {
    AllowServiceBilling: true,
    CreditBillingAllowed: true,
    CustomerSelectionMandatory: transType === 'Credit',
    AllowRateAlteration: false,
    CheckStockOnSelection: true,
    StockOutAction: 2, // 1: Warning, 2: Disallow, 3: Stop Update
    ClubDuplicatedItems: true,
    SalesManSelectionMandatory: true,
    DefaultSalesManMode: 2, // 2: Both Item and Bill level
    AutoGenerateSuspensionNo: true,
  }

  // ── HANDLERS ──
  const handleSuspend = () => {
    if (!cart.length) return
    const suspNo = `SUSP-${Date.now().toString().slice(-6)}`
    const newSuspension = {
      id: suspNo,
      timestamp: new Date().toISOString(),
      cart,
      customerMobile,
      salesperson,
      payLines,
      remarks,
      billType,
      transType
    }
    setSuspendedBills(prev => [...prev, newSuspension])
    showToast(`BILL SUSPENDED: ${suspNo}`, 'success')
    resetSession()
  }

  const handleRecall = (suspBill: any) => {
    setCart(suspBill.cart)
    setCustomerMobile(suspBill.customerMobile)
    setSalesperson(suspBill.salesperson)
    setPayLines(suspBill.payLines)
    setRemarks(suspBill.remarks)
    setBillType(suspBill.billType)
    setTransType(suspBill.transType)
    setSuspendedBills(prev => prev.filter(b => b.id !== suspBill.id))
    setShowRecallModal(false)
    showToast(`BILL RECALLED: ${suspBill.id}`, 'info')
  }

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

  const [isExpanded, setIsExpanded] = useState(false)
  
  // ── CART LOGIC ──
  const playChime = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
      audio.volume = 0.2
      audio.play()
    } catch {}
  }

  const handleAddToCart = (p: Partial<CartItem> & { mrp?: number }, multiplier: number = 1) => {
    const normalizedItem: CartItem = {
      id: p.id!,
      code: p.code!,
      name: p.name!,
      brand: p.brand || 'Unknown',
      category: p.category || 'General',
      mrp_paise: p.mrp_paise || toPaise(p.mrp || 0),
      cost_paise: p.cost_paise || 0,
      qty: multiplier,
      discount_per: 0,
      tax_rate: p.tax_rate ?? 18,
      is_tax_inclusive: p.is_tax_inclusive ?? true,
      stocks: p.stocks
    }

    const storeStock = normalizedItem.stocks?.find(s => s.store_id === 'X01')?.quantity

    setCart(prev => {
      const existingIdx = SHOPER9_PARAMS.ClubDuplicatedItems 
        ? prev.findIndex(i => i.id === normalizedItem.id && i.discount_per === normalizedItem.discount_per)
        : -1
      
      const currentQty = existingIdx > -1 ? prev[existingIdx].qty : 0
      
      // Stock Validation
      if (SHOPER9_PARAMS.CheckStockOnSelection) {
        if (storeStock !== undefined && currentQty + multiplier > storeStock) {
           if (SHOPER9_PARAMS.StockOutAction === 2) {
              showToast(`STOCK OUT: Only ${storeStock} available. Billing Disallowed.`, 'error')
              return prev
           }
           if (SHOPER9_PARAMS.StockOutAction === 1) {
              showToast(`STOCK WARNING: Only ${storeStock} available. Proceeding...`, 'info')
           }
        }
      }

      playChime()
      if (existingIdx > -1) {
        const newCart = [...prev]
        newCart[existingIdx] = { ...newCart[existingIdx], qty: newCart[existingIdx].qty + multiplier }
        return newCart
      }
      return [...prev, normalizedItem]
    })
  }

  const handleBarcodeSearch = async (val: string) => {
    let multiplier = 1
    let barcode = val

    // Vedic Speed: 5*barcode logic
    if (val.includes('*')) {
      const parts = val.split('*')
      if (parts[0] && !isNaN(Number(parts[0]))) {
        multiplier = Number(parts[0])
        barcode = parts[1] || ''
      }
    }

    if (!barcode) return

    try {
      const results = await api.inventory.search(barcode)
      type SearchItem = CartItem & { style_code?: string };
      const exactItem = results.find((p: SearchItem) => p.code.toLowerCase() === barcode.toLowerCase())
      
      if (exactItem) { 
        handleAddToCart(exactItem, multiplier)
        setQ('')
        return
      }

      const isStyle = results.some((p: SearchItem) => p.style_code?.toLowerCase() === barcode.toLowerCase())
      if (isStyle) {
        setSelectedStyleCode(barcode.toUpperCase())
        setShowStyleMatrix(true)
        setQ('')
      }
    } catch {}
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
    const raw = cart.reduce((acc, i) => {
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

    const roundedNetPaise = Math.round(raw.net / 100) * 100
    const roundingPaise = roundedNetPaise - raw.net

    return { ...raw, roundedNet: roundedNetPaise, rounding: roundingPaise }
  }, [cart])

  const netPayablePaise = totals.roundedNet

  // ── SHORTCUTS ──
  useHotkeys('f1', (e) => { e.preventDefault(); searchRef.current?.focus() }, { enableOnFormTags: true })
  useHotkeys('f2', (e) => { e.preventDefault(); searchRef.current?.focus() }, { enableOnFormTags: true })
  useHotkeys('f7', (e) => { e.preventDefault(); handleExactCash() }, { enableOnFormTags: true })
  useHotkeys('f8', (e) => { e.preventDefault(); setShowSettle(true) }, { enableOnFormTags: true })
  useHotkeys('f9', (e) => { e.preventDefault(); handleFinalize() }, { enableOnFormTags: true })
  useHotkeys('f12', (e) => { e.preventDefault(); handleSuspend() }, { enableOnFormTags: true })
  useHotkeys('delete', (e) => { 
    if (cart.length > 0) {
      removeCartItem(cart[cart.length - 1].id)
    }
  }, { enableOnFormTags: true })
  
  useHotkeys('alt+1', (e) => { e.preventDefault(); setCart([]); setCustomerMobile(''); setQ(''); searchRef.current?.focus() }, { enableOnFormTags: true })
  useHotkeys('escape', (e) => { e.preventDefault(); setQ(''); setShowTotals(false); setShowSettle(false) }, { enableOnFormTags: true })

  // ── HANDLERS ──
  const handleExactCash = () => {
     if (!cart.length) return
     setPayLines([{ mode: 'CASH', amount: toRupees(netPayablePaise) }])
     handleFinalize()
  }

  const handleFinalize = async () => {
    if (!cart.length || processing) return

    // Compliance Checks
    if (SHOPER9_PARAMS.SalesManSelectionMandatory && !salesperson) {
       showToast("VALIDATION ERROR: Sales Staff ID is mandatory for this transaction.", "error")
       return
    }

    if (SHOPER9_PARAMS.CustomerSelectionMandatory && !customerMobile) {
       showToast("VALIDATION ERROR: Customer selection is mandatory for Credit billing.", "error")
       return
    }

    setProcessing(true)
    
    const billData = {
      customer_mobile: sendSms ? customerMobile : '',
      type: transType === 'Credit' ? 'Credit Sales' : 'Sales',
      bill_type: billType,
      remarks: remarks,
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

  const paidTotalRupees = payLines.reduce((s, p) => s + p.amount, 0)
  const balanceRupees = toRupees(netPayablePaise) - paidTotalRupees

  return (
    <div id="page-billing" className={cn("c-billing-layout", isExpanded && "c-billing-layout--expanded")}>
      {/* ── PRINTING LAYERS ── */}
      {printFormat === 'thermal' && <ThermalReceipt bill={billToPrint} onPrinted={() => setBillToPrint(null)} />}
      {printFormat === 'a4' && <TaxInvoiceA4 bill={billToPrint} onPrinted={() => setBillToPrint(null)} />}
      {printFormat === 'b2b' && <TaxInvoiceB2B bill={billToPrint} onPrinted={() => setBillToPrint(null)} />}
      
      <AnimatePresence>
        {lastBill && (
          <Portal>
            <motion.div initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-[var(--z-modal)] bg-[var(--secondary)] text-[var(--background)] px-10 py-5 rounded-[var(--radius-xl)] shadow-2xl flex items-center gap-[var(--space-6)] border-2 border-[var(--secondary)]/30">
               <CheckCircle2 size={32} />
              <div>
                <Text variant="xs" className="font-bold opacity-70">Protocol Finalized</Text>
                <Text variant="h2" className="text-[var(--background)]">{lastBill.bill_number} &nbsp;·&nbsp; {formatCurrency(lastBill.total)}</Text>
              </div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      <div className="c-billing-main-container">
        <main className="c-ledger-area">
          {/* ── TRANSACTION HEADER (SHOPER 9 PARITY) ── */}
          <div className="grid grid-cols-12 gap-3 p-3 bg-[var(--surface)] border-b border-[var(--accent)]/30 border-t-2 border-[var(--accent)] shadow-sm">
             <div className="col-span-1.5 flex flex-col gap-1">
                <Label className="text-[9px] font-bold uppercase text-[var(--accent-dark)] tracking-widest">View Mode</Label>
                <Button 
                   onClick={() => setIsExpanded(!isExpanded)}
                   className={cn(
                     "h-8 px-2 flex items-center justify-center gap-2 text-[9px] font-bold transition-all",
                     isExpanded ? "bg-[var(--accent)] text-white" : "bg-[var(--background)]"
                   )}
                >
                   {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                   {isExpanded ? "FIXED" : "EXPAND"}
                </Button>
             </div>

             <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-[9px] font-bold uppercase text-[var(--accent-dark)] tracking-widest">Bill Type</Label>
                <Select value={billType} onChange={e => setBillType(e.target.value as any)} className="h-8 bg-[var(--background)] text-xs border-[var(--border-default)]">
                   <option>Product</option>
                   <option>Service</option>
                </Select>
             </div>

             <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-[9px] font-bold uppercase text-[var(--accent-dark)] tracking-widest">Trans Type</Label>
                <Select value={transType} onChange={e => setTransType(e.target.value as any)} className="h-8 bg-[var(--background)] text-xs border-[var(--border-default)]">
                   <option>Cash</option>
                   <option>Credit</option>
                </Select>
             </div>

             <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-[9px] font-bold uppercase text-[var(--accent-dark)] tracking-widest">Bill Number</Label>
                <div className="h-8 px-3 bg-[var(--background)] flex items-center border border-[var(--border-default)] rounded text-xs font-bold text-[var(--accent)]">
                   {isSuspended ? "RECALLED" : "NEW BILL"}
                </div>
             </div>
             
             <div className="col-span-4 flex flex-col gap-1">
                <Label className="text-[9px] font-bold uppercase text-[var(--accent-dark)] tracking-widest">Customer (Code / Mobile)</Label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={customerMobile}
                    onChange={e => setCustomerMobile(e.target.value)}
                    placeholder="Scan/Type..."
                    className="h-8 px-3 bg-[var(--background)] border border-[var(--border-default)] rounded text-xs font-black w-[120px] outline-none focus:border-[var(--accent)]"
                  />
                  <div className="h-8 px-3 bg-[var(--background)]/50 flex items-center border border-[var(--border-default)] rounded text-[10px] font-bold text-[var(--text-primary)] flex-1 truncate">
                     {customerInfo?.name || 'WALK-IN CUSTOMER'}
                  </div>
                </div>
             </div>

             <div className="col-span-2 flex flex-col gap-1">
                <Label className="text-[9px] font-bold uppercase text-[var(--accent-dark)] tracking-widest">Global Sales Staff</Label>
                <Select 
                   value={salesperson} 
                   onChange={e => setSalesperson(e.target.value)}
                   className="h-8 bg-[var(--background)] text-xs border-[var(--border-default)]"
                >
                  <option value="">Select...</option>
                  <option value="S01">Jawahar M (S01)</option>
                  <option value="S02">Anshul K (S02)</option>
                </Select>
             </div>

             {/* Actions Row */}
             <div className="col-span-12 flex items-center gap-3 mt-1">
                <div className="flex gap-1.5">
                   <Button 
                     variant="secondary" 
                     className="h-7 px-3 text-[9px] font-bold bg-[var(--background)] relative group" 
                     onClick={() => setShowRecallModal(true)}
                   >
                      RECALL [F12]
                      {suspendedBills.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent)] text-[var(--background)] rounded-full flex items-center justify-center text-[7px] animate-pulse">
                          {suspendedBills.length}
                        </span>
                      )}
                   </Button>
                   <Button variant="secondary" className="h-7 px-3 text-[9px] font-bold bg-[var(--background)]">
                      PDT IMPORT
                   </Button>
                </div>
                <div className="h-px flex-1 bg-[var(--border-subtle)] opacity-50"></div>
                <div className="text-[9px] font-black uppercase text-[var(--accent)] tracking-widest opacity-60">
                    SMRITI-OS POS PROTOCOL v2.4
                </div>
             </div>
          </div>

          <div className="c-ledger-header text-[var(--accent-dark)] font-bold uppercase tracking-widest text-[10px]">
             <span className="w-12 text-center">S.No</span>
             <span className="flex-[2]">Product Protocol / Description</span>
             <span className="flex-1 text-center">Qty</span>
             <span className="flex-1 text-right">Unit Price</span>
             <span className="flex-1 text-right">Disc %</span>
             <span className="flex-1 text-right">Net Value</span>
          </div>

          <div className="c-ledger-list">
            <AnimatePresence initial={false}>
              {cart.map((item, idx) => {
                const lineNet = Math.round(item.mrp_paise * item.qty * (1 - item.discount_per / 100))
                return (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 60 }} 
                    exit={{ opacity: 0, height: 0 }}
                    className={cn("c-ledger-row", idx === cart.length - 1 && "c-ledger-row--active")}
                  >
                    <div className="w-12 text-center text-[10px] font-bold text-[var(--text-tertiary)]">{idx + 1}</div>
                    <div className="flex-[2] flex flex-col justify-center">
                      <span className="text-sm font-bold uppercase text-[var(--text-primary)]">{item.name}</span>
                      <span className="text-[10px] font-bold text-[var(--accent)] tracking-widest">{item.code}</span>
                    </div>
                    <div className="flex-1 text-center font-bold text-lg">{item.qty}</div>
                    <div className="flex-1 text-right text-[var(--text-secondary)] font-mono text-sm">₹{formatDecimal(item.mrp_paise)}</div>
                    <div className="flex-1 text-right text-[var(--danger)] font-bold text-sm">{item.discount_per}%</div>
                    <div className="flex-1 text-right font-bold text-lg font-mono">₹{formatDecimal(lineNet)}</div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale pointer-events-none">
                 <ScanBarcode size={120} strokeWidth={0.5} className="text-[var(--accent-dark)]" />
                 <Text variant="h1" className="tracking-[1em] mt-8 text-[var(--accent-dark)]">Awaiting Scan</Text>
              </div>
            )}
          </div>

          {/* Barcode Input Bar */}
          <div className="p-3 bg-[var(--surface-elevated)] border-t-2 border-[var(--accent)]/40 shadow-inner">
             <div className="relative">
                <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]" size={20} />
                <input 
                  ref={searchRef}
                  autoFocus
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBarcodeSearch(q)}
                  placeholder="[F1] SCAN BARCODE OR PROTOCOL (e.g. 5*890123)..."
                  className="c-input--barcode w-full pl-12 pr-6 h-10 bg-[var(--background)] text-[var(--text-primary)] border-2 border-[var(--accent)] rounded-lg outline-none text-xs"
                />
             </div>
          </div>
        </main>

        <aside className="c-summary-area">
          <div className="c-summary-card">
             <div className="flex items-center gap-[var(--space-4)] mb-[var(--space-2)]">
                <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-[var(--radius-lg)] flex items-center justify-center text-[var(--accent)]">
                   <Receipt size={20} />
                </div>
                <Text variant="h3" className="uppercase tracking-widest">Transaction Summary</Text>
             </div>

             {/* Document Remarks */}
             <div className="mt-4 mb-2">
                <Label className="text-[9px] font-bold uppercase text-[var(--text-tertiary)] mb-1 block">Document Remarks</Label>
                <textarea 
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Enter comments..."
                  className="w-full h-12 p-2 bg-[var(--background)]/30 border border-[var(--border-default)] rounded text-[10px] outline-none focus:border-[var(--accent)] resize-none"
                />
             </div>
             
             <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-[10px] font-bold">
                   <span className="text-[var(--text-tertiary)] uppercase">Total No. of Items</span>
                   <span className="bg-[var(--surface-elevated)] px-2 py-0.5 rounded">{cart.length}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                   <span className="text-[var(--text-tertiary)] uppercase">Total Quantity</span>
                   <span className="bg-[var(--surface-elevated)] px-2 py-0.5 rounded">{cart.reduce((s,i)=>s+i.qty, 0)}</span>
                </div>

                <hr className="border-[var(--border-subtle)] opacity-50" />

                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Sales Value</span>
                   <span className="font-mono text-xs">₹{formatDecimal(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--danger)]">
                   <span className="text-[10px] font-bold uppercase">Item Level Disc.</span>
                   <span className="font-mono text-xs">-₹{formatDecimal(totals.discount)}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--danger)] opacity-50">
                   <span className="text-[10px] font-bold uppercase">Bill Discount</span>
                   <span className="font-mono text-xs">₹0.00</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase">Total Tax (GST)</span>
                   <span className="font-mono text-xs">₹{formatDecimal(totals.tax)}</span>
                </div>
                {totals.rounding !== 0 && (
                  <div className="flex justify-between items-center text-[var(--text-tertiary)] italic">
                     <span className="text-[10px] font-bold uppercase">Bill Round Off</span>
                     <span className="font-mono text-xs">{totals.rounding > 0 ? '+' : ''}₹{formatDecimal(totals.rounding)}</span>
                  </div>
                )}
             </div>

             <hr className="border-[var(--border-subtle)] my-[var(--space-4)]" />

             <div className="text-right">
                <Text variant="xs" className="font-bold text-[var(--accent)] uppercase tracking-[0.3em] mb-1">Net Amount</Text>
                <h1 className="c-summary__total text-3xl font-bold text-[var(--accent-dark)]">₹{formatDecimal(netPayablePaise)}</h1>
             </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 mt-auto">
              <Card className="p-4 bg-[var(--background)]/40 border-[var(--border-default)]">
                 <div className="flex justify-between items-center mb-3">
                    <Text variant="h3" className="text-[10px] font-bold uppercase tracking-[0.2em]">Settlement Protocol</Text>
                    <div className="flex gap-2">
                       <Badge variant="muted" className="h-5 text-[9px]">F7 CASH</Badge>
                       <Badge variant="muted" className="h-5 text-[9px]">F8 MODAL</Badge>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {payLines.map((pl, idx) => (
                       <div key={idx} className="space-y-2 p-2 bg-[var(--surface)] rounded border border-[var(--border-default)]">
                          <div className="flex gap-2">
                             <Select 
                                value={pl.mode} 
                                className="w-[100px] h-9 bg-[var(--background)] text-xs font-bold" 
                                onChange={e => setPayLines(prev => prev.map((p,i) => i===idx ? {...p, mode: e.target.value as PayMode} : p))}
                             >
                                {['CASH','UPI','CARD','CHQ','GV','CREDIT'].map(m => <option key={m}>{m}</option>)}
                             </Select>
                             <Input 
                                type="number" 
                                value={pl.amount || ''} 
                                placeholder="Amount..."
                                onChange={e => setPayLines(prev => prev.map((p,i) => i===idx ? {...p, amount: Number(e.target.value)} : p))} 
                                className="flex-1 h-9 text-right font-mono text-sm font-bold bg-[var(--background)]" 
                             />
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="mt-4 flex justify-between items-center bg-[var(--accent)]/5 p-2 rounded border border-[var(--accent)]/20">
                    <span className="text-[9px] font-bold uppercase text-[var(--text-tertiary)]">Balance Receivable</span>
                    <span className={cn("font-mono text-sm font-bold", balanceRupees < 0 ? "text-[var(--success)]" : "text-[var(--accent)]")}>
                       {balanceRupees < 0 ? `CHANGE: ₹${Math.abs(balanceRupees).toFixed(2)}` : `₹${balanceRupees.toFixed(2)}`}
                    </span>
                 </div>
              </Card>

              <div className="flex gap-3 mt-auto">
                 <Button 
                    onClick={handleExactCash}
                    disabled={processing || !cart.length}
                    className="flex-1 h-12 bg-[var(--surface-elevated)] border-[var(--border-default)] hover:border-[var(--accent)] text-[var(--text-primary)] rounded-md flex flex-col items-center justify-center gap-0.5 transition-all"
                 >
                    <span className="text-[10px] font-bold uppercase">Exact Cash</span>
                    <span className="text-[7px] font-bold opacity-60 uppercase tracking-widest">[F7]</span>
                 </Button>
                 <Button 
                    onClick={handleFinalize}
                    disabled={processing || !cart.length}
                    className="flex-[2] h-12 bg-[var(--accent-dark)] text-[var(--background)] rounded-md flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-[var(--accent)]/10 transition-all border-none"
                 >
                    {processing ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                    <>
                       <span className="text-xs font-bold uppercase">Update Bill [F9]</span>
                       <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Execute Protocol</span>
                    </>
                    )}
                 </Button>
              </div>
          </div>
        </aside>
      </div>

      {/* Hotkey Footer (Now part of the flex layout, not fixed) */}
      <div className="flex-shrink-0 h-10 bg-[var(--surface-elevated)] border-t border-[var(--border-subtle)] px-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
         <div className="flex gap-8">
            <span className="flex items-center gap-1.5"><kbd className="bg-[var(--background)] px-1 rounded border border-[var(--border-subtle)]">F1</kbd> Barcode</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-[var(--background)] px-1 rounded border border-[var(--border-subtle)]">F2</kbd> Search</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-[var(--background)] px-1 rounded border border-[var(--border-subtle)]">F7</kbd> Exact Cash</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-[var(--background)] px-1 rounded border border-[var(--border-subtle)]">F8</kbd> Multi-Mode</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-[var(--background)] px-1 rounded border border-[var(--border-subtle)]">F9</kbd> Finalize</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-[var(--background)] px-1 rounded border border-[var(--border-subtle)]">DEL</kbd> Remove</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-[var(--background)] px-1 rounded border border-[var(--border-subtle)]">Esc</kbd> Reset</span>
         </div>
         <div className="flex items-center gap-4 text-[var(--accent)] font-bold">
            <ShieldCheck size={14} className="animate-pulse" />
            <span className="opacity-70">MUM-X01 · TERMINAL ACTIVE · SMRITI NODE</span>
         </div>
      </div>

      {/* ── SUSPENDED BILLS RECALL MODAL ── */}
      {showRecallModal && (
        <Portal>
          <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-6 bg-[var(--background)]/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-2xl bg-[var(--surface)] border-2 border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-[var(--accent)] text-[var(--background)] flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <History size={24} />
                    <Text variant="h2" className="text-[var(--background)] uppercase tracking-tighter">Recall Suspended Protocol</Text>
                 </div>
                 <Button variant="ghost" onClick={() => setShowRecallModal(false)} className="text-[var(--background)] hover:bg-white/10">
                    <X size={24} />
                 </Button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                 {suspendedBills.length === 0 ? (
                   <div className="text-center py-12 opacity-30">
                      <Clock size={48} className="mx-auto mb-4" />
                      <Text variant="h3">No Suspended Transactions Found</Text>
                   </div>
                 ) : (
                   <div className="grid gap-4">
                      {suspendedBills.map(bill => (
                        <div key={bill.id} className="p-4 bg-[var(--background)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] flex justify-between items-center group hover:border-[var(--accent)] transition-all">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="text-sm font-black text-[var(--accent)]">{bill.id}</span>
                                 <span className="text-[10px] font-bold text-[var(--text-tertiary)] opacity-60">· {new Date(bill.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <div className="flex gap-4 text-[10px] font-black uppercase text-[var(--text-secondary)]">
                                 <span>Items: {bill.cart.length}</span>
                                 <span>Customer: {bill.customerMobile || 'WALK-IN'}</span>
                              </div>
                           </div>
                           <Button onClick={() => handleRecall(bill)} className="bg-[var(--surface-elevated)] hover:bg-[var(--accent)] hover:text-[var(--background)] transition-all">
                              RECALL PROTOCOL
                           </Button>
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              <div className="p-4 bg-[var(--surface-elevated)] text-[10px] font-black uppercase text-center opacity-40">
                 [Esc] Close Recall Window
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </div>
  )
}




