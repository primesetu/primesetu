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
import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { motion } from 'framer-motion'
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, AlertCircle, ClipboardPaste, X, ChevronRight } from 'lucide-react'
import { api } from '@/api/client'

interface BulkItem {
  code: string
  name: string
  brand: string
  category: string
  mrp: number
  cost: number
  tax: number
  size: string
  color: string
  anal1?: string // Material
  anal2?: string // Season
  status?: 'pending' | 'valid' | 'error'
  message?: string
}

interface ColumnMap {
  id: string
  label: string
  mappedTo: keyof BulkItem | 'skip'
  required: boolean
}

export default function BulkItemMaster({ onClose }: { onClose: () => void }) {
  const [rawData, setRawData] = useState<string[][]>([])
  const [data, setData] = useState<BulkItem[]>([])
  const [columns, setColumns] = useState<ColumnMap[]>([
    { id: '1', label: 'Item Code', mappedTo: 'code', required: true },
    { id: '2', label: 'Description', mappedTo: 'name', required: true },
    { id: '3', label: 'Brand (Class1)', mappedTo: 'brand', required: true },
    { id: '4', label: 'Category (Class2)', mappedTo: 'category', required: true },
    { id: '5', label: 'MRP', mappedTo: 'mrp', required: true },
    { id: '6', label: 'Cost', mappedTo: 'cost', required: false },
    { id: '7', label: 'Tax %', mappedTo: 'tax', required: true },
    { id: '8', label: 'Size', mappedTo: 'size', required: false },
    { id: '9', label: 'Color', mappedTo: 'color', required: false },
  ])
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Process Raw Data (Paste or File)
  const processRaw = (rows: string[][]) => {
    setRawData(rows)
    setStep('map')
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('text')
    const rows = pasteData.split('\n').filter(row => row.trim() !== '').map(row => row.split('\t'))
    processRaw(rows)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][]
      processRaw(json)
    }
    reader.readAsBinaryString(file)
  }

  const [isProcessing, setIsProcessing] = useState(false)

  // 2. Validate and Map (The "Present Check")
  const finalizeMapping = () => {
    const mapped = rawData.map(row => {
      const item: any = { status: 'valid', message: '' }
      columns.forEach((col, idx) => {
        if (col.mappedTo !== 'skip') {
          const val = row[idx]?.trim()
          item[col.mappedTo] = col.mappedTo === 'mrp' || col.mappedTo === 'cost' || col.mappedTo === 'tax' 
            ? Number(val || 0) 
            : val

          // Shoper 9 Style "Present Check"
          if (col.required && !val) {
            item.status = 'error'
            item.message = `${col.label} is Mandatory`
          }
        }
      })
      
      // Class1 & Class2 Combination Check (Simulated)
      if (item.brand === 'INVALID' || !item.category) {
        item.status = 'error'
        item.message = 'Brand/Category Combination Invalid'
      }

      return item as BulkItem
    })

    setData(mapped)
    setStep('preview')
  }

  const handleCommit = async () => {
    const validItems = data.filter(d => d.status === 'valid')
    if (validItems.length === 0) return

    setIsProcessing(true)
    try {
      await api.inventory.bulkCreate(
        validItems.map(item => ({
          code: item.code,
          name: item.name,
          brand: item.brand,
          category: item.category,
          mrp: item.mrp,
          cost_price: item.cost,
          tax_rate: item.tax,
          size: item.size,
          color: item.color,
          is_tax_inclusive: true,
          attributes: { anal1: item.anal1, anal2: item.anal2 }
        }))
      )

      alert(`Successfully imported ${validItems.length} SKUs!`)
      onClose()
    } catch (err) {
      alert('Error during commitment: ' + err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-xl bg-navy/40">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-7xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="bg-navy p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-navy shadow-lg">
              <ClipboardPaste className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black">Sovereign Importer</h2>
              <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold">Exact Shoper 9 Parity · Mapping & Present Check Engine</p>
            </div>
          </div>
          <div className="flex gap-4">
            {step !== 'upload' && (
              <button 
                onClick={() => setStep('upload')}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black tracking-widest transition-all"
              >
                ← START OVER
              </button>
            )}
            <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"><X /></button>
          </div>
        </div>

        {/* Dynamic Content based on Step */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {step === 'upload' && (
            <div 
              onPaste={handlePaste}
              tabIndex={0}
              className="flex-1 flex flex-col items-center justify-center p-20 outline-none group cursor-pointer"
            >
              <div className="w-32 h-32 bg-cream rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <FileSpreadsheet className="w-12 h-12 text-navy opacity-30" />
              </div>
              <h3 className="text-3xl font-serif font-black text-navy mb-4">Paste Data Here</h3>
              <p className="text-muted text-sm text-center max-w-md leading-relaxed">
                Click here and press <kbd className="bg-navy text-white px-2 py-1 rounded">Ctrl + V</kbd> to ingest data from Excel, or select a file below.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-10 bg-gold text-navy px-10 py-4 rounded-2xl font-black text-xs tracking-widest shadow-xl hover:shadow-gold/20 transition-all"
              >
                SELECT EXCEL FILE
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx,.csv" />
            </div>
          )}

          {step === 'map' && (
            <div className="flex-1 flex flex-col p-12 overflow-hidden">
              <h3 className="text-2xl font-serif font-black text-navy mb-2">Column Mapping</h3>
              <p className="text-xs text-muted mb-10">Map Shoper 9 fields to PrimeSetu attributes. System will perform "Present Check" on commit.</p>
              
              <div className="flex-1 overflow-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 content-start pb-10">
                {columns.map((col, i) => (
                  <div key={col.id} className="bg-cream/30 p-6 rounded-[2rem] border border-border/50 relative">
                    <div className="text-[10px] font-black text-navy/40 uppercase tracking-widest mb-4">Column {i + 1}</div>
                    <div className="text-sm font-bold text-navy mb-4 truncate">{rawData[0]?.[i] || 'No Data'}</div>
                    <select 
                      value={col.mappedTo}
                      onChange={(e) => setColumns(columns.map(c => c.id === col.id ? {...c, mappedTo: e.target.value as any} : c))}
                      className="w-full bg-white border border-border rounded-xl px-4 py-3 text-xs font-black text-navy outline-none focus:border-saffron"
                    >
                      <option value="skip">Ignore Column</option>
                      <option value="code">Item Code (Barcode)</option>
                      <option value="name">Item Description</option>
                      <option value="brand">Brand (Class1)</option>
                      <option value="category">Category (Class2)</option>
                      <option value="mrp">MRP</option>
                      <option value="cost">Cost Price</option>
                      <option value="tax">Tax Rate</option>
                    </select>
                    {col.required && <span className="absolute top-6 right-6 text-rose-500 font-black text-[8px]">* REQ</span>}
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t border-border flex justify-end">
                <button 
                  onClick={finalizeMapping}
                  className="bg-navy text-white px-12 py-5 rounded-[2rem] font-black text-xs tracking-widest shadow-2xl hover:bg-navy/90 transition-all flex items-center gap-3"
                >
                  PERFORM PRESENT CHECK <ChevronRight className="w-4 h-4 text-gold" />
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-navy text-white/60 sticky top-0 z-20">
                  <tr>
                    <th className="px-10 py-5 font-black uppercase tracking-widest">Status</th>
                    {columns.filter(c => c.mappedTo !== 'skip').map(c => (
                      <th key={c.id} className="px-6 py-5 font-black uppercase tracking-widest border-l border-white/5">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map((item, i) => (
                    <tr key={i} className={`hover:bg-gold/5 transition-colors group ${item.status === 'error' ? 'bg-rose-50/50' : ''}`}>
                      <td className="px-10 py-4">
                        <div className="flex items-center gap-3">
                          {item.status === 'valid' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${item.status === 'valid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {item.status === 'valid' ? 'Passed' : item.message}
                          </span>
                        </div>
                      </td>
                      {columns.filter(c => c.mappedTo !== 'skip').map(c => (
                        <td key={c.id} className="px-6 py-4 font-bold text-navy border-l border-border/50">{(item as any)[c.mappedTo]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-[#FAF7F2] border-t border-border flex items-center justify-between">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Total Ingested</span>
              <span className="text-xl font-serif font-black text-navy">{rawData.length} Rows</span>
            </div>
            {step === 'preview' && (
              <>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Passed Check</span>
                  <span className="text-xl font-serif font-black text-emerald-600">{data.filter(d => d.status === 'valid').length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Failed Check</span>
                  <span className="text-xl font-serif font-black text-rose-600">{data.filter(d => d.status === 'error').length}</span>
                </div>
              </>
            )}
          </div>
          {step === 'preview' && data.some(d => d.status === 'valid') && (
            <button 
              onClick={handleCommit}
              disabled={isProcessing}
              className={`bg-emerald-500 text-white px-12 py-5 rounded-[2rem] font-black text-xs tracking-widest shadow-2xl hover:bg-emerald-600 transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? 'COMMITTING...' : 'COMMIT VALID SKUS (PARITY MODE)'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
