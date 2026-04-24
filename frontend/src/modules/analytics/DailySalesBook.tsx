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
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Filter, Download, Receipt, TrendingUp, CreditCard, Banknote, IndianRupee } from 'lucide-react'

export default function DailySalesBook() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  
  const dummySales = [
    { billNo: 'B-1001', time: '10:15 AM', cashier: 'C01', items: 3, amount: 2450, mode: 'Cash' },
    { billNo: 'B-1002', time: '11:30 AM', cashier: 'C01', items: 1, amount: 899, mode: 'UPI' },
    { billNo: 'B-1003', time: '12:45 PM', cashier: 'C02', items: 5, amount: 5600, mode: 'Card' },
    { billNo: 'B-1004', time: '02:10 PM', cashier: 'C01', items: 2, amount: 1200, mode: 'Cash' },
    { billNo: 'B-1005', time: '04:20 PM', cashier: 'C02', items: 4, amount: 3400, mode: 'UPI' },
  ]

  const totalSales = dummySales.reduce((acc, curr) => acc + curr.amount, 0)
  const totalBills = dummySales.length
  
  const byMode = dummySales.reduce((acc, curr) => {
    acc[curr.mode] = (acc[curr.mode] || 0) + curr.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col h-full bg-[#f0ede8] font-sans">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 bg-[#1a2340] rounded-lg flex items-center justify-center">
            <Receipt className="w-4 h-4 text-purple-400"/>
          </div>
          <div>
            <div className="text-xs font-black text-[#1a2340] uppercase tracking-widest leading-none">Daily Sales Book</div>
            <div className="text-[9px] text-gray-400 font-bold">Reports › Sales</div>
          </div>
        </div>

        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 gap-2">
          <Calendar className="w-4 h-4 text-gray-400"/>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} 
            className="text-xs font-black text-navy outline-none bg-transparent"/>
        </div>

        <button className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-navy hover:border-purple-400 transition-all">
          <Filter className="w-3.5 h-3.5"/> Filter
        </button>

        <div className="flex-1"/>

        <button className="flex items-center gap-2 bg-[#1a2340] text-white hover:bg-navy font-black text-xs uppercase px-4 py-2 rounded-xl shadow-md transition-all">
          <Download className="w-4 h-4"/> Export PDF
        </button>
      </div>

      <div className="flex-1 px-4 pb-3 overflow-hidden flex flex-col gap-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center"><IndianRupee className="w-6 h-6 text-purple-500"/></div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Net Sales</div>
              <div className="text-2xl font-black text-navy">₹{totalSales.toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center"><Receipt className="w-6 h-6 text-amber-500"/></div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bills</div>
              <div className="text-2xl font-black text-navy">{totalBills}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center"><Banknote className="w-6 h-6 text-emerald-500"/></div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cash Collection</div>
              <div className="text-2xl font-black text-navy">₹{(byMode['Cash'] || 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><CreditCard className="w-6 h-6 text-blue-500"/></div>
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital (UPI/Card)</div>
              <div className="text-2xl font-black text-navy">₹{((byMode['UPI'] || 0) + (byMode['Card'] || 0)).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest p-3">
            <div>Bill No</div>
            <div>Time</div>
            <div>Cashier</div>
            <div className="text-center">Items</div>
            <div>Pay Mode</div>
            <div className="text-right">Amount</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {dummySales.map(s => (
              <div key={s.billNo} className="grid grid-cols-6 p-3 border-b border-gray-50 text-xs items-center hover:bg-purple-50 cursor-pointer transition-colors">
                <div className="font-bold text-navy">{s.billNo}</div>
                <div className="text-gray-500">{s.time}</div>
                <div className="font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-max">{s.cashier}</div>
                <div className="text-center font-bold text-gray-600">{s.items}</div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                    ${s.mode === 'Cash' ? 'bg-emerald-100 text-emerald-700' : 
                      s.mode === 'UPI' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {s.mode}
                  </span>
                </div>
                <div className="text-right font-black text-navy text-sm">₹{s.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
