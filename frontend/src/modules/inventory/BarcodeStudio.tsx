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
import { useState, useRef } from 'react'
import Barcode from 'react-barcode'
import { useReactToPrint } from 'react-to-print'
import { Printer, FileText, Search, Settings, ScanLine, ShoppingCart, ListChecks, Download, Plus, Minus, Tag } from 'lucide-react'

interface PrintItem {
  id: string
  code: string
  name: string
  brand: string
  mrp: number
  size: string
  qty: number
}

type PrintSource = 'MANUAL' | 'TRANSACTION' | 'PO' | 'DIRECT_SCAN' | 'MASTERS'

export default function BarcodeStudio({ onClose, initialItems }: { onClose?: () => void, initialItems?: any[] }) {
  const [source, setSource] = useState<PrintSource>('MANUAL')
  const [rollType, setRollType] = useState(2) // 1, 2, or 3-up Thermal
  const [outputTo, setOutputTo] = useState<'PORT' | 'PDF' | 'FILE'>('FILE') // Default to Thermal PRN
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [scriptFile, setScriptFile] = useState('STANDARD_THERMAL.blf')

  const [printList, setPrintList] = useState<PrintItem[]>(
    initialItems?.map(item => ({ ...item, qty: 1 })) || [
      { id: '1', code: '8901234567890', name: 'Cotton Premium Shirt', brand: 'Arrow', mrp: 1999, size: 'XL', qty: 2 },
      { id: '2', code: '8900987654321', name: 'Slim Fit Denim Jeans', brand: 'Levi', mrp: 2499, size: '32', qty: 4 }
    ]
  )

  const componentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'PrimeSetu_Barcodes',
  })

  const updateQty = (id: string, delta: number) => {
    setPrintList(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ))
  }

  const labels = printList.flatMap(item => 
    Array.from({ length: item.qty }).map((_, i) => ({ ...item, labelId: `${item.id}-${i}` }))
  )

  const executePrint = () => {
    if (outputTo === 'PDF') {
      handlePrint()
    } else if (outputTo === 'FILE') {
      // Shoper9 PRN Export simulation (Zebra ZPL format)
      const prnContent = labels.map(l => 
        `^XA\n^FO50,50^ADN,36,20^FD${l.brand}^FS\n^FO50,100^ADN,18,10^FD${l.name}^FS\n^FO50,150^BCN,50,Y,N,N^FD${l.code}^FS\n^FO50,220^ADN,18,10^FDSize: ${l.size}  MRP: INR ${l.mrp}^FS\n^XZ`
      ).join('\n')
      
      const blob = new Blob([prnContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PRiMESETU_LABELS_${new Date().getTime()}.prn`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      alert("Direct Port (LPT1/COM1/USB) writing requires the native PrimeSetu Desktop Bridge to bypass browser sandbox.")
    }
  }

  const Content = (
    <div className={`flex flex-col font-sans ${onClose ? 'h-full' : 'h-full bg-[#f0ede8]'}`}>
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 bg-[#1a2340] rounded-lg flex items-center justify-center">
            <ScanLine className="w-4 h-4 text-emerald-400"/>
          </div>
          <div>
            <div className="text-xs font-black text-[#1a2340] uppercase tracking-widest leading-none">Tag Printing</div>
            <div className="text-[9px] text-gray-400 font-bold">Stock › Barcode › Print Labels</div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          <button onClick={() => setSource('MANUAL')} className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 ${source === 'MANUAL' ? 'bg-[#1a2340] text-emerald-400' : 'text-gray-400 hover:text-navy'}`}><ListChecks className="w-3 h-3"/> Manual</button>
          <button onClick={() => setSource('TRANSACTION')} className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 ${source === 'TRANSACTION' ? 'bg-[#1a2340] text-emerald-400' : 'text-gray-400 hover:text-navy'}`}><ShoppingCart className="w-3 h-3"/> Trans</button>
          <button onClick={() => setSource('PO')} className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 ${source === 'PO' ? 'bg-[#1a2340] text-emerald-400' : 'text-gray-400 hover:text-navy'}`}><FileText className="w-3 h-3"/> PO</button>
          <button onClick={() => setSource('DIRECT_SCAN')} className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 ${source === 'DIRECT_SCAN' ? 'bg-[#1a2340] text-emerald-400' : 'text-gray-400 hover:text-navy'}`}><ScanLine className="w-3 h-3"/> Scan</button>
        </div>

        <div className="flex-1"/>

        {onClose && (
          <button onClick={onClose} className="px-3 py-1.5 text-[10px] font-black uppercase bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-lg transition-all mr-2">
            Cancel
          </button>
        )}

        <button className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-navy transition-all">
          <Settings className="w-3.5 h-3.5"/> Format (.blf)
        </button>

        <button onClick={executePrint} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase px-4 py-2 rounded-xl shadow-md border-b-2 border-emerald-700 transition-all">
          <Printer className="w-4 h-4"/> Print Labels
        </button>
      </div>

      <div className="flex-1 px-4 pb-3 overflow-hidden flex gap-4">
        {/* Left Panel - User Friendly Flow */}
        <div className="w-[380px] flex flex-col gap-4 shrink-0">
          
          {/* STEP 1: ADD ITEMS */}
          <div className="bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden shrink-0">
            <div className="bg-[#1a2340] p-3 text-white">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Step 1</div>
              <div className="text-sm font-bold">Select Items to Print</div>
            </div>
            
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex gap-2">
              <button onClick={() => setSource('MANUAL')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${source === 'MANUAL' ? 'bg-white shadow-sm border border-gray-200 text-navy' : 'text-gray-400 hover:bg-gray-100'}`}>Manual</button>
              <button onClick={() => setSource('PO')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${source === 'PO' ? 'bg-white shadow-sm border border-gray-200 text-navy' : 'text-gray-400 hover:bg-gray-100'}`}>From PO</button>
              <button onClick={() => setSource('TRANSACTION')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${source === 'TRANSACTION' ? 'bg-white shadow-sm border border-gray-200 text-navy' : 'text-gray-400 hover:bg-gray-100'}`}>From Bill</button>
            </div>

            {source === 'MANUAL' && (
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500"/>
                  <input placeholder="Type item name or scan barcode..." className="w-full bg-emerald-50/50 border-2 border-emerald-100 focus:border-emerald-400 rounded-xl pl-9 pr-3 py-3 text-sm font-bold outline-none transition-all placeholder:font-normal"/>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: ADJUST QUANTITY */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Step 2</div>
                <div className="text-xs font-bold text-navy">Adjust Label Quantities</div>
              </div>
              <div className="bg-[#1a2340] text-white text-[10px] font-black px-3 py-1 rounded-full">
                Total: {printList.reduce((a,c)=>a+c.qty, 0)}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {printList.map(item => (
                <div key={item.id} className="bg-white border-2 border-gray-100 p-3 rounded-xl hover:border-emerald-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-sm text-navy">{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.code} | Size: {item.size}</div>
                    </div>
                    <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">₹{item.mrp}</div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Print Count</span>
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50"><Minus className="w-4 h-4"/></button>
                      <span className="text-sm font-black font-mono w-10 text-center text-navy">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-emerald-500 hover:bg-emerald-50"><Plus className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hardware Toggle */}
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-navy text-center py-2">
            {showAdvanced ? 'Hide Printer Settings' : '⚙️ Show Printer Settings'}
          </button>

          {showAdvanced && (
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 space-y-3 shrink-0">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase">Thermal Paper Type</label>
                <select value={rollType} onChange={e => setRollType(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none bg-white">
                  <option value={1}>1-Up (50mm Thermal Roll)</option>
                  <option value={2}>2-Up (100mm Thermal Roll) - Standard</option>
                  <option value={3}>3-Up (100mm Mini Thermal)</option>
                  <option value={4}>A4 Sheet (Laser Fallback)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase">Hardware Output</label>
                <select value={outputTo} onChange={e => setOutputTo(e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs font-bold outline-none bg-white">
                  <option value="FILE">Barcode Printer (.PRN / LPT)</option>
                  <option value="PDF">Screen Preview (PDF)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Print Preview canvas */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col items-center p-8 overflow-y-auto relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#1a2340] px-4 py-2 rounded-xl shadow-lg text-[10px] font-black text-amber-400 uppercase tracking-widest z-10">
            <Tag className="w-4 h-4"/> Thermal Roll Preview
          </div>

          <div className="bg-[#fdfbf7] shadow-2xl transition-all duration-500 origin-top overflow-hidden border-x-4 border-gray-300" style={{ width: rollType === 4 ? '210mm' : rollType === 1 ? '50mm' : '100mm', minHeight: '150mm', paddingBottom: '200mm' }}>
            {/* Scalloped edge effect for thermal paper */}
            <div className="h-2 w-full bg-[radial-gradient(circle,transparent_4px,#fdfbf7_4px)] bg-[length:10px_10px] -mt-1 relative z-10"></div>
            <div 
              ref={componentRef}
              className="grid gap-x-2 gap-y-1 print:gap-0 mt-4 px-2"
              style={{ gridTemplateColumns: `repeat(${rollType === 4 ? 3 : rollType}, minmax(0, 1fr))` }}
            >
              {labels.map((label, idx) => (
                <div key={idx} className="barcode-label p-3 border border-dashed border-gray-300 print:border-none flex flex-col items-center justify-center text-center overflow-hidden" style={{ height: '38mm' }}>
                  <div className="text-[9px] font-black text-black uppercase tracking-widest mb-0.5">{label.brand}</div>
                  <div className="text-[8px] font-bold text-gray-800 truncate w-full mb-1">{label.name}</div>
                  
                  <div className="scale-[0.8] origin-center -my-2 mix-blend-multiply">
                    <Barcode 
                      value={label.code} 
                      width={1.2} 
                      height={30} 
                      fontSize={11} 
                      margin={0}
                      background="transparent"
                    />
                  </div>

                  <div className="flex justify-between w-full mt-1.5 px-2">
                    <div className="text-[8px] font-black uppercase text-gray-700">Size: {label.size}</div>
                    <div className="text-[10px] font-black text-black">₹{label.mrp}.00</div>
                  </div>
                  <div className="text-[5px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">PrimeSetu / POS</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global CSS for Printing */}
        <style>{`
          @media print {
            @page { size: auto; margin: 0mm; }
            body { margin: 0; }
            .barcode-label { page-break-inside: avoid; border: none !important; }
          }
        `}</style>
      </div>
    </div>
  )

  if (onClose) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-xl bg-navy/40">
        <div className="bg-[#f0ede8] w-full max-w-7xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
          {Content}
        </div>
      </div>
    )
  }

  return Content
}
