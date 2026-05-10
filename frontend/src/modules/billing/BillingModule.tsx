import React, { useState, useEffect, useMemo, useRef } from 'react'
import { api } from '@/api/client'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/SovereignUI'
import { motion, AnimatePresence } from 'framer-motion'
import DesktopBilling from './DesktopBilling'
import MobileBilling from './MobileBilling'
import MultiModePayment from './MultiModePayment'
import { useSysParams } from '@/hooks/useSysParams'

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
  disc_cd: string
  disc_per: number
  disc_amt: number
  tax_amt: number
  total: number
  salesman?: string
}

interface Personnel {
  id: string
  name: string
  code: string
}

interface PayMode {
  id: string
  name: string
  type: string
}

/**
 * SMRITI-OS Transactional Engine
 * Orchestrates the 1:1 Shoper9-mapped retail workflow.
 */
function BillingModule() {
  const { theme } = useTheme()
  const [items, setItems] = useState<BillItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeEntry, setActiveEntry] = useState({ stock_no: '', qty: 1, rate: 0, disc_cd: '', disc_per: 0, descr: '' })
  const [showSettle, setShowSettle] = useState(false)
  const [showPrint, setShowPrint] = useState(false)
  const [lastBill, setLastBill] = useState<any>(null)
  const [isFinalizing, setIsFinalizing] = useState(false)
  
  // ── TRANSACTION STATE ──
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [salesman, setSalesman] = useState('')
  const [billNo, setBillNo] = useState(() => `${Date.now().toString().slice(-8)}`)
  const [billDiscount, setBillDiscount] = useState(0)
  const [dateTime, setDateTime] = useState(new Date().toLocaleString())
  const [isMobile, setIsMobile] = useState(false)
  const [fieldMask, setFieldMask] = useState<any[]>([])
  const [txnMode, setTxnMode] = useState('CASH')
  const [billType, setBillType] = useState('PRODUCT')
  
  // ── METADATA STATE ──
  const [personnelList, setPersonnelList] = useState<Personnel[]>([])
  const [payModesList, setPayModesList] = useState<PayMode[]>([])
  const [customerResults, setCustomerResults] = useState<any[]>([])
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)

  // ── INSTITUTIONAL PARITY CONTROLS ──
  const { getParam } = useSysParams()
  const isCustomerMandatory = getParam('InBillingCustSelectionCompulsary', 0) === 1
  const isSalesmanMandatory = getParam('SMSelectionCompulsary', 0) === 1
  const isRoundingActive = getParam('PONetValueRndOff', 0) === 1

  const totals = useMemo(() => {
    const itemTotal = items.reduce((acc, curr) => ({
      items: acc.items + 1,
      qty: acc.qty + (Number(curr.qty) || 0),
      gross: acc.gross + ((Number(curr.qty) || 0) * (Number(curr.rate) || 0)),
      disc: acc.disc + (Number(curr.disc_amt) || 0),
      net: acc.net + (Number(curr.total) || 0)
    }), { items: 0, qty: 0, gross: 0, disc: 0, net: 0 })

    const finalNetRaw = Math.max(0, itemTotal.net - billDiscount)
    const finalNet = isRoundingActive ? Math.round(finalNetRaw) : finalNetRaw
    return { ...itemTotal, billDisc: billDiscount, finalNet }
  }, [items, billDiscount, isRoundingActive])

  // ── SHOPER9 KEYBOARD ENGINE ──
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Priority Hotkeys
      if (e.key === 'F1') { e.preventDefault(); focusField('stock') }
      if (e.key === 'F2') { e.preventDefault(); focusField('customer') }
      if (e.key === 'F7') { e.preventDefault(); handleExactCash() }
      if (e.key === 'F8') { e.preventDefault(); setShowSettle(true) }
      if (e.key === 'F12') { e.preventDefault(); handleSuspend() }
      
      if (e.key === 'Escape') { 
        if (showSettle) setShowSettle(false)
        else if (showPrint) setShowPrint(false)
        else setActiveEntry({ stock_no: '', qty: 1, rate: 0, disc_cd: '', disc_per: 0, descr: '' })
      }
    }
    window.addEventListener('keydown', handleGlobalKeys)
    return () => window.removeEventListener('keydown', handleGlobalKeys)
  }, [showSettle, showPrint, totals.finalNet, items])

  const focusField = (id: string) => {
    const el = document.getElementById(`input-${id}`)
    if (el) el.focus()
  }

  // ── EXACT CASH (F7) LOGIC ──
  const handleExactCash = () => {
    if (items.length === 0) return
    const cashMode = payModesList.find(m => m.type.toUpperCase() === 'CASH') || payModesList[0]
    if (!cashMode) return
    handleFinalize([{ id: cashMode.id, amount: totals.finalNet * 100 }])
  }

  const handleSuspend = async () => {
    if (items.length === 0) return
    alert("TRANSACTION SUSPENDED: Draft preserved in sovereign registry.")
  }

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

  const isSearchingRef = useRef(false)

  // ── DRAFT RECOVERY ──
  useEffect(() => {
    async function loadResources() {
      try {
        const [mask, draft, personnel, paymodes] = await Promise.all([
          api.config.getLegacyMask(2100),
          api.billing.getDraft(),
          api.billing.getPersonnel(),
          api.billing.getPayModes()
        ])
        
        if (mask?.length > 0) setFieldMask(mask)
        if (personnel) setPersonnelList(personnel)
        if (paymodes) setPayModesList(paymodes)
        
        if (draft?.length > 0) {
          setItems(draft.map((i: any) => ({
            id: i.id,
            stock_no: i.StockNo,
            descr: i.ItemDesc,
            rate: i.Retail_Price,
            qty: i.Qty,
            disc_per: i.disc_per,
            disc_amt: (i.Retail_Price * i.Qty * i.disc_per) / 100,
            total: (i.Retail_Price * i.Qty) * (1 - i.disc_per / 100),
            salesman: i.salesman
          })))
        }
      } catch (err) { console.error("Resource load failed:", err) }
      finally { setIsLoadingMetadata(false) }
    }
    loadResources()
  }, [])

  const handleCustomerSearch = async (q: string) => {
    try {
      const results = await api.billing.searchCustomers(q)
      setCustomerResults(results)
    } catch (err) { console.error(err) }
  }

  // ── RAPID ENTRY TRANSITION ENGINE ──
  const handleKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const fields = ['stock', 'qty', 'rate', 'disc_per', 'salesman'];
      const currentIdx = fields.indexOf(currentField);
      
      if (currentField === 'stock') {
        if (!activeEntry.stock_no) return;
        commitLine(true); // Search only
      } else if (currentIdx < fields.length - 1) {
        const nextField = fields[currentIdx + 1];
        focusField(nextField);
      } else {
        commitLine(false); // Full commit
      }
    }
  };

  const commitLine = async (searchOnly: boolean = false) => {
    const searchVal = activeEntry.stock_no.trim();
    if (!searchVal || isSearchingRef.current) return;
    
    if (searchOnly) {
      setIsSearching(true);
      try {
        const results = await api.inventory.search(searchVal);
        const inventoryItems = Array.isArray(results) ? results : (results.data || []);
        if (inventoryItems.length > 0) {
          const item = inventoryItems[0];
          setActiveEntry(prev => ({
            ...prev,
            descr: item.name,
            rate: (item.mrp_paise || 0) / 100,
          }));
          setTimeout(() => focusField('qty'), 50);
        } else {
          alert("SKU NOT FOUND: Check Master Catalogue");
        }
      } catch (err) { console.error(err) }
      finally { setIsSearching(false) }
      return;
    }

    isSearchingRef.current = true;
    const activeDisc = activeEntry.disc_per || 0;
    const existingIndex = items.findIndex(i => i.stock_no === searchVal && i.disc_per === activeDisc);
    
    if (existingIndex > -1) {
      setItems(prev => {
        const newItems = [...prev];
        const item = newItems[existingIndex];
        item.qty += activeEntry.qty || 1;
        item.disc_amt = (item.rate * item.qty * item.disc_per) / 100;
        item.total = (item.rate * item.qty) - item.disc_amt;
        return newItems;
      });
      resetEntry();
      return;
    }

    const rate = activeEntry.rate;
    const qty = activeEntry.qty || 1;
    const disc_per = activeDisc;
    const disc_amt = (rate * qty * disc_per) / 100;
    const total = (rate * qty) - disc_amt;

    const newItem = {
      id: crypto.randomUUID(),
      real_id: searchVal,
      stock_no: searchVal,
      descr: activeEntry.descr,
      dept: '', brand: '', subclass1: '', subclass2: '', colour: '', size: '',
      rate, qty, disc_cd: activeEntry.disc_cd || '', disc_per, disc_amt, tax_amt: 0, total, salesman: salesman || ''
    };

    try {
      const draftRes = await api.billing.addToDraft({
        StockNo: newItem.stock_no,
        ItemDesc: newItem.descr,
        Qty: newItem.qty,
        Retail_Price: newItem.rate,
        disc_per: newItem.disc_per,
        salesman: newItem.salesman
      });
      if (draftRes.id) newItem.id = draftRes.id;
    } catch (e) { console.error("Draft sync failed", e) }

    setItems(prev => [newItem, ...prev]);
    resetEntry();
  };

  const resetEntry = () => {
    setActiveEntry({ stock_no: '', qty: 1, rate: 0, disc_cd: '', disc_per: 0, descr: '' });
    setTimeout(() => { 
      isSearchingRef.current = false;
      focusField('stock');
    }, 100);
  }

  const handleFinalize = async (payments: any[]) => {
    if (items.length === 0 || isFinalizing) return

    if (isCustomerMandatory && !customer.phone.trim()) {
      alert("ERROR: Customer Selection Mandatory (SysParam: InBillingCustSelectionCompulsary)");
      return
    }
    if (isSalesmanMandatory && !salesman.trim()) {
      alert("ERROR: Sales Staff Selection Mandatory (SysParam: SMSelectionCompulsary)");
      return
    }
    
    setIsFinalizing(true)
    const billData = {
      type: "Sales",
      bill_no: billNo,
      customer_id: customer.phone,
      salesman_id: salesman,
      items: items.map(i => ({ 
        product_id: i.real_id, 
        stock_no: i.stock_no,
        descr: i.descr,
        qty: i.qty, 
        unit_price: Math.round(i.rate * 100), 
        discount_per: i.disc_per, 
        total: i.total
      })),
      payments: payments.map(p => ({ mode: p.id, amount: p.amount })),
      bill_discount: Math.round(billDiscount * 100),
      totals
    }

    try {
      await api.billing.finalize(billData)
      setLastBill(billData)
      setShowPrint(true)
      
      // Institutional Cleanup
      setItems([])
      setBillDiscount(0)
      setCustomer({ name: '', phone: '' })
      setSalesman('')
      setBillNo(`${Date.now().toString().slice(-8)}`)
      setShowSettle(false)
    } catch (err) { alert("FINALIZATION FAILED: Check Connectivity") } finally { setIsFinalizing(false) }
  }

  return (
    <>
      {isMobile ? (
        <MobileBilling 
          items={items} setItems={setItems} activeEntry={activeEntry} setActiveEntry={setActiveEntry}
          commitLine={() => commitLine()} handleKeyDown={handleKeyDown} totals={totals}
          showSettle={showSettle} setShowSettle={setShowSettle} isFinalizing={isFinalizing}
          handleFinalize={handleFinalize} customer={customer} setCustomer={setCustomer}
          salesman={salesman} setSalesman={setSalesman} billNo={billNo} dateTime={dateTime}
          billDiscount={billDiscount} setBillDiscount={setBillDiscount}
          isCustomerMandatory={isCustomerMandatory} isSalesmanMandatory={isSalesmanMandatory}
          fieldMask={fieldMask}
        />
      ) : (
        <DesktopBilling 
          items={items} setItems={setItems} activeEntry={activeEntry} setActiveEntry={setActiveEntry}
          commitLine={() => commitLine()} handleKeyDown={handleKeyDown} totals={totals}
          setShowSettle={setShowSettle} customer={customer} setCustomer={setCustomer}
          salesman={salesman} setSalesman={setSalesman} billNo={billNo} dateTime={dateTime}
          billDiscount={billDiscount} setBillDiscount={setBillDiscount}
          personnelList={personnelList}
          customerResults={customerResults}
          onCustomerSearch={handleCustomerSearch}
        />
      )}

      <AnimatePresence>
        {showSettle && (
          <MultiModePayment 
            totalAmount={totals.finalNet * 100} 
            onClose={() => setShowSettle(false)}
            onComplete={(payments) => handleFinalize(payments)}
            payModes={payModesList}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrint && lastBill && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white text-black p-8 w-full max-w-sm rounded shadow-2xl overflow-y-auto max-h-[90vh] font-mono">
               <div className="text-center mb-4 border-b-2 border-dashed border-gray-300 pb-4">
                  <h2 className="font-black text-xl uppercase tracking-tighter">SMRITI-OS RETAIL</h2>
                  <p className="text-[10px] font-bold">SOVEREIGN STORE NODE #002</p>
                  <p className="text-[10px]">{dateTime}</p>
               </div>
               <div className="flex justify-between text-[10px] font-bold mb-2 uppercase">
                  <span>BILL: {lastBill.bill_no}</span>
                  <span>STAFF: {lastBill.salesman_id || 'N/A'}</span>
               </div>
               <div className="border-b border-dashed border-gray-300 mb-2" />
               <table className="w-full text-[10px] mb-2 uppercase">
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
               <div className="space-y-1 text-[11px] font-black uppercase">
                  <div className="flex justify-between"><span>GROSS</span><span>₹{lastBill.totals.gross.toFixed(2)}</span></div>
                  <div className="flex justify-between text-red-600"><span>DISC</span><span>-₹{lastBill.totals.disc.toFixed(2)}</span></div>
                  {lastBill.bill_discount > 0 && <div className="flex justify-between text-blue-600"><span>BILL DISC</span><span>-₹{(lastBill.bill_discount/100).toFixed(2)}</span></div>}
                  <div className="flex justify-between text-lg pt-2 border-t-2 border-gray-800">
                     <span>NET</span>
                     <span>₹{lastBill.totals.finalNet.toLocaleString()}</span>
                  </div>
               </div>
               <div className="mt-8 text-center text-[9px] font-bold uppercase tracking-[0.3em] opacity-60">
                  *** NO EXCHANGE WITHOUT BILL ***
               </div>
               <div className="mt-6 flex gap-2 no-print">
                  <Button onClick={() => window.print()} className="flex-1 bg-black text-white h-10 text-[10px] font-black uppercase">Print</Button>
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
