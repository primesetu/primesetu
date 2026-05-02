/* ============================================================
 * SMRITI-OS — Desktop Terminal (Industrial Mode)
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useRef, useEffect, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, themeQuartz } from 'ag-grid-community'
import { Barcode, Trash2, FileText, User, UserCheck, Calendar, Clock, Tag } from 'lucide-react'
import { Button, Badge } from '@/components/ui/SovereignUI'

interface DesktopBillingProps {
  items: any[]
  setItems: React.Dispatch<React.SetStateAction<any[]>>
  activeEntry: any
  setActiveEntry: React.Dispatch<React.SetStateAction<any>>
  commitLine: () => Promise<void>
  handleKeyDown: (e: React.KeyboardEvent, field: string) => void
  totals: any
  setShowSettle: (val: boolean) => void
  customer: { name: string, phone: string }
  setCustomer: (val: { name: string, phone: string }) => void
  salesman: string
  setSalesman: (val: string) => void
  billNo: string
  dateTime: string
  billDiscount: number
  setBillDiscount: (val: number) => void
  isCustomerMandatory?: boolean
  isSalesmanMandatory?: boolean
  fieldMask?: any[]
}

export default function DesktopBilling({
  items,
  setItems,
  activeEntry,
  setActiveEntry,
  commitLine,
  handleKeyDown,
  totals,
  setShowSettle,
  customer,
  setCustomer,
  salesman,
  setSalesman,
  billNo,
  dateTime,
  billDiscount,
  setBillDiscount,
  isCustomerMandatory,
  isSalesmanMandatory,
  fieldMask = []
}: DesktopBillingProps) {
  const entryRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<AgGridReact>(null)

  useEffect(() => {
    entryRef.current?.focus()
  }, [])

  const columnDefs = useMemo(() => {
    // If mask is available, we follow it, but we FORCE requested fields if they are missing
    let activeMask = [...fieldMask]
    
    const requestedFields = [
      { field: 'StockNo', headerName: 'STOCK NO', width: 140, visible: true },
      { field: 'ItemDescription', headerName: 'DESCRIPTION', width: 250, visible: true },
      { field: 'Qty', headerName: 'QTY', width: 80, visible: true },
      { field: 'Rate', headerName: 'RATE', width: 100, visible: true },
      { field: 'Total', headerName: 'TOTAL', width: 120, visible: true },
      { field: 'Sizecd', headerName: 'SIZE', width: 60 },
      { field: 'AC1', headerName: 'SUB-1', width: 100 },
      { field: 'AC2', headerName: 'SUB-2', width: 100 },
      { field: 'SalesStaff', headerName: 'SALESMAN', width: 100 }
    ]

    requestedFields.forEach(rf => {
      if (!activeMask.find(m => m.field.toLowerCase() === rf.field.toLowerCase())) {
        activeMask.push(rf)
      }
    })

    if (activeMask && activeMask.length > 0) {
      return [
        ...activeMask.map(m => ({
          headerName: m.headerName.toUpperCase(),
          field: m.field === 'StockNo' ? 'stock_no' : 
                 m.field === 'ItemDescription' ? 'descr' :
                 m.field === 'GradeCd' ? 'grade' :
                 m.field === 'Sizecd' ? 'size' :
                 m.field === 'AC1' ? 'subclass1' :
                 m.field === 'AC2' ? 'subclass2' :
                 m.field === 'SalesStaff' ? 'salesman' :
                 m.field === 'Rate' ? 'rate' :
                 m.field === 'Qty' ? 'qty' :
                 m.field === 'Total' ? 'total' :
                 m.field === 'ItemValue' ? 'item_value' :
                 m.field === 'DiscAmt' ? 'disc_amt' :
                 m.field === 'DiscPerc' ? 'disc_per' :
                 m.field.toLowerCase(),
          width: m.width || 120,
          hide: m.visible === false,
          sortable: false,
          valueGetter: m.field === 'ItemValue' ? (p: any) => p.data ? (p.data.rate * p.data.qty) : 0 : undefined,
          cellStyle: { borderRight: '1px solid var(--border-subtle)' },
          cellRenderer: (params: any) => {
             if (m.field === 'Rate' || m.field === 'Total' || m.field === 'DiscAmt' || m.field === 'ItemValue') {
               return <span className="font-mono text-[var(--primary)]">₹{Number(params.value || 0).toLocaleString()}</span>
             }
             return params.value
          }
        })),
        { headerName: 'ACTIONS', width: 80, cellRenderer: (p: any) => (
          <button 
            key="delete-btn"
            onClick={() => setItems(prev => prev.filter(i => i.id !== p.data.id))} 
            className="text-red-400 p-2 hover:bg-red-500/10 rounded-full transition-all"
          >
            <Trash2 size={14} />
          </button>
        )}
      ]
    }

    return [
      { headerName: 'STOCK NO', field: 'stock_no', flex: 1.5, cellStyle: { borderRight: '1px solid var(--border-subtle)' } },
      { headerName: 'DESCRIPTION', field: 'descr', flex: 3, cellStyle: { borderRight: '1px solid var(--border-subtle)' } },
      { headerName: 'RATE', field: 'rate', flex: 1, valueFormatter: (p: any) => `₹${p.value}`, cellStyle: { borderRight: '1px solid var(--border-subtle)' } },
      { headerName: 'QTY', field: 'qty', flex: 0.8, editable: true, cellStyle: { borderRight: '1px solid var(--border-subtle)', backgroundColor: 'rgba(52, 211, 153, 0.05)' } },
      { headerName: 'TOTAL', field: 'total', flex: 1, valueFormatter: (p: any) => `₹${p.value}`, cellStyle: { fontWeight: 'bold' } },
      { headerName: '', width: 50, cellRenderer: (p: any) => (
        <button onClick={() => setItems(prev => prev.filter(i => i.id !== p.data.id))} className="text-red-400 p-2 hover:bg-red-500/10 rounded-full transition-all">
          <Trash2 size={14} />
        </button>
      )}
    ]
  }, [fieldMask, setItems])

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* ── INDUSTRIAL HEADER ── */}
      <header className="h-16 bg-[var(--surface)] flex items-center px-6 justify-between border-b border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-black uppercase tracking-widest text-sm">
            <FileText size={18} className="text-[var(--primary)]" /> 
            Terminal <span className="text-[var(--primary)] ml-1">#{billNo}</span>
          </div>
          <div className="h-6 w-px bg-[var(--border-subtle)]" />
          <div className="flex items-center gap-4 text-[10px] font-black uppercase text-[var(--text-tertiary)]">
             <div className="flex items-center gap-2"><Calendar size={14} /> {dateTime.split(',')[0]}</div>
             <div className="flex items-center gap-2"><Clock size={14} /> {dateTime.split(',')[1]}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Customer & Salesman Quick Entry */}
           <div className="flex items-center gap-2 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5">
              <User size={14} className="text-[var(--primary)]" />
              <input 
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-32 placeholder:opacity-30" 
                placeholder={isCustomerMandatory ? "CUSTOMER (REQUIRED)" : "CUSTOMER MOBILE"}
                value={customer.phone}
                onChange={e => setCustomer({...customer, phone: e.target.value})}
              />
              {isCustomerMandatory && <span className="text-red-500 text-[10px] font-bold">*</span>}
           </div>
           <div className="flex items-center gap-2 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5">
              <UserCheck size={14} className="text-emerald-500" />
              <input 
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase w-32 placeholder:opacity-30" 
                placeholder={isSalesmanMandatory ? "SALESMAN (REQUIRED)" : "SALES PERSONNEL"}
                value={salesman}
                onChange={e => setSalesman(e.target.value)}
              />
              {isSalesmanMandatory && <span className="text-red-500 text-[10px] font-bold">*</span>}
           </div>
           <Badge variant="info">F8: SETTLE</Badge>
        </div>
      </header>
      
      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
        {/* Main Grid Area */}
        <div className="flex-1 w-full h-full rounded-xl overflow-hidden border border-[var(--border-subtle)] shadow-xl">
          <AgGridReact 
            theme={themeQuartz}
            ref={gridRef} 
            rowData={items} 
            columnDefs={columnDefs} 
            onGridReady={p => p.api.sizeColumnsToFit()} 
          />
        </div>

        {/* Input & Summary Section */}
        <div className="grid grid-cols-12 gap-4">
           {/* Entry Area */}
           <div className="col-span-8 bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xl flex gap-4 items-end">
              <div className="flex-1 relative">
                <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Scan SKU / Stock No (F1)</label>
                <div className="relative">
                  <Barcode size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]" />
                  <input 
                    ref={entryRef} 
                    className="w-full h-12 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg pl-10 pr-4 text-xs font-black uppercase outline-none focus:border-[var(--primary)] transition-all" 
                    value={activeEntry.stock_no} 
                    onChange={e => setActiveEntry({...activeEntry, stock_no: e.target.value.toUpperCase()})} 
                    onKeyDown={e => handleKeyDown(e, 'stock')} 
                    placeholder="READY FOR SCAN..." 
                    autoFocus
                  />
                </div>
              </div>
              <div className="w-20">
                <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Qty</label>
                <input type="number" className="w-full h-12 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg text-center font-black text-sm" value={activeEntry.qty} onChange={e => setActiveEntry({...activeEntry, qty: Number(e.target.value)})} onKeyDown={e => handleKeyDown(e, 'qty')} />
              </div>
              <div className="w-24">
                <label className="block text-[9px] font-black uppercase text-[var(--text-tertiary)] mb-1 tracking-widest">Item Disc %</label>
                <input type="number" className="w-full h-12 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded-lg text-center font-black text-sm text-amber-600" value={activeEntry.disc_per} onChange={e => setActiveEntry({...activeEntry, disc_per: Number(e.target.value)})} onKeyDown={e => handleKeyDown(e, 'disc')} />
              </div>
              <Button onClick={() => { commitLine(); entryRef.current?.focus(); }} className="h-12 bg-[var(--primary)] text-white font-black uppercase px-6 rounded-lg">COMMIT (ENTER)</Button>
           </div>

           {/* Summary Area */}
           <div className="col-span-4 bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between">
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-[var(--text-tertiary)]">
                    <span>Gross Total</span>
                    <span>₹{totals.gross.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase text-amber-600">
                    <span>Item Discount</span>
                    <span>-₹{totals.disc.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-blue-600">Bill Discount (₹)</span>
                    <input 
                      type="number" 
                      className="w-24 h-8 bg-[var(--surface-container-low)] border border-[var(--border-subtle)] rounded text-right px-2 font-black text-xs text-blue-600" 
                      value={billDiscount}
                      onChange={e => setBillDiscount(Number(e.target.value))}
                    />
                 </div>
              </div>
              <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Net Amount</p>
                    <p className="text-4xl font-black text-[var(--primary)] tracking-tighter">₹{totals.finalNet.toLocaleString()}</p>
                 </div>
                 <Button onClick={() => setShowSettle(true)} className="h-12 bg-[var(--primary)] text-white font-black px-6 rounded-lg shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.02] transition-all">SETTLE (F8)</Button>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
