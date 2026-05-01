import React, { useState, useEffect, useMemo, useRef } from 'react'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/SovereignUI'
import { motion, AnimatePresence } from 'framer-motion'
import DesktopBilling from './DesktopBilling'
import MobileBilling from './MobileBilling'

interface BillItem {
  id: string
  real_id: string
  stock_no: string
  descr: string
  dept: string
  brand: string
  subclass1: string
  subclass2: string
  colour: string
  size: string
  rate: number
  qty: number
  disc_per: number
  disc_amt: number
  tax_amt: number
  total: number
}

function BillingModule() {
  const { theme } = useTheme()
  const [items, setItems] = useState<BillItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeEntry, setActiveEntry] = useState({ stock_no: '', qty: 1, rate: 0, disc_per: 0 })
  const [showSettle, setShowSettle] = useState(false)
  const [showPrint, setShowPrint] = useState(false)
  const [lastBill, setLastBill] = useState<any>(null)
  const [isFinalizing, setIsFinalizing] = useState(false)
  
  // ── ENTITY STATE ──
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [salesman, setSalesman] = useState('')
  const [billNo, setBillNo] = useState(() => `S-${Date.now().toString().slice(-6)}`)
  const [billDiscount, setBillDiscount] = useState(0)
  const [dateTime, setDateTime] = useState(new Date().toLocaleString())
  const [isMobile, setIsMobile] = useState(false)

  const totals = useMemo(() => {
    const itemTotal = items.reduce((acc, curr) => ({
      items: acc.items + 1,
      qty: acc.qty + (Number(curr.qty) || 0),
      gross: acc.gross + ((Number(curr.qty) || 0) * (Number(curr.rate) || 0)),
      disc: acc.disc + (Number(curr.disc_amt) || 0),
      net: acc.net + (Number(curr.total) || 0)
    }), { items: 0, qty: 0, gross: 0, disc: 0, net: 0 })

    const finalNet = Math.max(0, itemTotal.net - billDiscount)
    return { ...itemTotal, billDisc: billDiscount, finalNet }
  }, [items, billDiscount])

  // ── GLOBAL SHORTCUTS ──
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'F8') { e.preventDefault(); setShowSettle(true) }
      if (e.key === 'Escape') { 
        if (showSettle) setShowSettle(false)
        else if (showPrint) setShowPrint(false)
        else setActiveEntry({ stock_no: '', qty: 1, rate: 0, disc_per: 0 })
      }
    }
    window.addEventListener('keydown', handleGlobalKeys)
    return () => window.removeEventListener('keydown', handleGlobalKeys)
  }, [showSettle, showPrint])

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date().toLocaleString()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const commitLine = async () => {
    const searchVal = activeEntry.stock_no.trim()
    if (!searchVal || isSearching) return
    
    // Check for Duplicate Scan (Auto-Increment Qty)
    const existingIndex = items.findIndex(i => i.stock_no === searchVal)
    if (existingIndex > -1) {
      setItems(prev => {
        const newItems = [...prev]
        const item = newItems[existingIndex]
        item.qty += activeEntry.qty || 1
        item.disc_amt = (item.rate * item.qty * item.disc_per) / 100
        item.total = (item.rate * item.qty) - item.disc_amt
        return newItems
      })
      setActiveEntry({ stock_no: '', qty: 1, rate: 0, disc_per: 0 })
      return
    }

    setIsSearching(true)
    try {
      const results = await api.inventory.search(searchVal)
      const inventoryItems = Array.isArray(results) ? results : (results.data || [])
      if (inventoryItems.length > 0) {
        const item = inventoryItems[0]
        const rate = (item.mrp_paise || 0) / 100
        const qty = activeEntry.qty || 1
        const disc_per = activeEntry.disc_per || 0
        const disc_amt = (rate * qty * disc_per) / 100
        const total = (rate * qty) - disc_amt

        setItems(prev => [{
          id: crypto.randomUUID(),
          real_id: item.id,
          stock_no: item.code,
          descr: item.name,
          dept: item.department || '',
          brand: item.brand || '',
          subclass1: item.subclass1 || '',
          subclass2: item.subclass2 || '',
          colour: item.colour || '',
          size: item.size || '',
          rate, qty, disc_per, disc_amt, tax_amt: 0, total
        }, ...prev])
        setActiveEntry({ stock_no: '', qty: 1, rate: 0, disc_per: 0 })
      } else { alert("SKU Not Found") }
    } catch (err) { console.error(err) } finally { setIsSearching(false) }
  }

  const handleFinalize = async (paymentMode: 'CASH' | 'CARD', amount: number) => {
    if (items.length === 0 || isFinalizing) return
    setIsFinalizing(true)
    const billData = {
      type: "Sales",
      bill_no: billNo,
      customer_phone: customer.phone,
      salesman_id: salesman,
      items: items.map(i => ({ 
        product_id: i.real_id, 
        stock_no: i.stock_no,
        descr: i.descr,
        qty: i.qty, 
        unit_price: Math.round(i.rate * 100), 
        discount_per: i.disc_per, 
        tax_per: 18,
        total: i.total
      })),
      payments: [{ mode: paymentMode, amount: Math.round(amount * 100) }],
      bill_discount: Math.round(billDiscount * 100),
      totals
    }

    try {
      await api.billing.finalize(billData)
      setLastBill(billData)
      setShowPrint(true)
      
      // Reset State
      setItems([])
      setBillDiscount(0)
      setCustomer({ name: '', phone: '' })
      setSalesman('')
      setBillNo(`S-${Date.now().toString().slice(-6)}`)
      setShowSettle(false)
    } catch (err) { alert("Save Failed") } finally { setIsFinalizing(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') { e.preventDefault(); commitLine() }
  }

  return (
    <>
      {isMobile ? (
        <MobileBilling 
          items={items} setItems={setItems} activeEntry={activeEntry} setActiveEntry={setActiveEntry}
          commitLine={commitLine} handleKeyDown={handleKeyDown} totals={totals}
          showSettle={showSettle} setShowSettle={setShowSettle} isFinalizing={isFinalizing}
          handleFinalize={handleFinalize} customer={customer} setCustomer={setCustomer}
          salesman={salesman} setSalesman={setSalesman} billNo={billNo} dateTime={dateTime}
          billDiscount={billDiscount} setBillDiscount={setBillDiscount}
        />
      ) : (
        <DesktopBilling 
          items={items} setItems={setItems} activeEntry={activeEntry} setActiveEntry={setActiveEntry}
          commitLine={commitLine} handleKeyDown={handleKeyDown} totals={totals}
          setShowSettle={setShowSettle} customer={customer} setCustomer={setCustomer}
          salesman={salesman} setSalesman={setSalesman} billNo={billNo} dateTime={dateTime}
          billDiscount={billDiscount} setBillDiscount={setBillDiscount}
        />
      )}

      {/* ── THERMAL PRINT PREVIEW MODAL ── */}
      <AnimatePresence>
        {showPrint && lastBill && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white text-black p-8 w-full max-w-sm rounded-lg shadow-2xl overflow-y-auto max-h-[90vh]">
               <div className="text-center mb-4 border-b-2 border-dashed border-gray-300 pb-4">
                  <h2 className="font-black text-xl uppercase tracking-tighter">SMRITI-OS RETAIL</h2>
                  <p className="text-[10px] font-bold">SOVEREIGN STORE #77</p>
                  <p className="text-[10px]">{dateTime}</p>
               </div>
               <div className="flex justify-between text-[10px] font-bold mb-2">
                  <span>BILL: {lastBill.bill_no}</span>
                  <span>MODE: {lastBill.payments[0].mode}</span>
               </div>
               <div className="border-b border-dashed border-gray-300 mb-2" />
               <table className="w-full text-[10px] mb-2">
                  <thead>
                     <tr className="border-b border-gray-100">
                        <th className="text-left py-1">ITEM</th>
                        <th className="text-center">QTY</th>
                        <th className="text-right">AMT</th>
                     </tr>
                  </thead>
                  <tbody>
                     {lastBill.items.map((it: any, idx: number) => (
                        <tr key={idx}>
                           <td className="py-1">{it.descr}</td>
                           <td className="text-center">{it.qty}</td>
                           <td className="text-right">{it.total.toFixed(2)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               <div className="border-b border-dashed border-gray-300 mb-2" />
               <div className="space-y-1 text-[11px] font-black">
                  <div className="flex justify-between"><span>GROSS</span><span>₹{lastBill.totals.gross.toFixed(2)}</span></div>
                  <div className="flex justify-between text-red-600"><span>DISC</span><span>-₹{lastBill.totals.disc.toFixed(2)}</span></div>
                  {lastBill.bill_discount > 0 && <div className="flex justify-between text-blue-600"><span>BILL DISC</span><span>-₹{(lastBill.bill_discount/100).toFixed(2)}</span></div>}
                  <div className="flex justify-between text-lg pt-2 border-t-2 border-gray-800">
                     <span>NET</span>
                     <span>₹{lastBill.totals.finalNet.toLocaleString()}</span>
                  </div>
               </div>
               <div className="mt-8 text-center text-[9px] font-bold uppercase tracking-widest opacity-40">
                  *** Thank You — Visit Again ***
               </div>
               <div className="mt-6 flex gap-2 no-print">
                  <Button onClick={() => window.print()} className="flex-1 bg-black text-white h-10 text-[10px] font-black uppercase">Print Bill</Button>
                  <Button onClick={() => setShowPrint(false)} className="flex-1 border-2 border-black h-10 text-[10px] font-black uppercase">Close</Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default BillingModule
