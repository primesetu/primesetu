import { useState } from 'react'
import { Search, Plus, Save, Activity, LayoutGrid, FileSpreadsheet } from 'lucide-react'

interface HSNCode {
  id: string;
  hsnCode: string;
  description: string;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function HSNManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [hsnList, setHsnList] = useState<HSNCode[]>([
    { id: '1', hsnCode: '6205', description: 'Men Shirts (Cotton)', cgst: 2.5, sgst: 2.5, igst: 5.0, cess: 0, status: 'ACTIVE' },
    { id: '2', hsnCode: '6206', description: 'Women Blouses/Shirts', cgst: 6.0, sgst: 6.0, igst: 12.0, cess: 0, status: 'ACTIVE' },
    { id: '3', hsnCode: '6403', description: 'Footwear (Leather outer)', cgst: 9.0, sgst: 9.0, igst: 18.0, cess: 0, status: 'ACTIVE' },
    { id: '4', hsnCode: '6109', description: 'T-Shirts (Knit)', cgst: 2.5, sgst: 2.5, igst: 5.0, cess: 0, status: 'ACTIVE' },
    { id: '5', hsnCode: '4202', description: 'Handbags & Wallets', cgst: 9.0, sgst: 9.0, igst: 18.0, cess: 0, status: 'INACTIVE' },
  ])
  const [selectedHsn, setSelectedHsn] = useState<HSNCode | null>(null)

  const filteredHsn = hsnList.filter(h => 
    h.hsnCode.includes(searchTerm) || 
    h.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (hsn: HSNCode) => {
    setSelectedHsn({ ...hsn })
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      {/* LEFT PANE - HSN Directory */}
      <div className="w-[350px] flex flex-col gap-6">
        <div className="glass p-6 rounded-[2rem] shadow-xl">
          <h2 className="text-2xl font-serif font-black text-navy uppercase mb-4">HSN Directory</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40" />
            <input 
              type="text" 
              placeholder="SEARCH HSN/DESC [F3]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-cream/50 text-navy font-bold rounded-2xl py-4 pl-12 pr-4 outline-none border-2 border-transparent focus:border-gold/30 transition-all uppercase placeholder:text-navy/30 text-xs tracking-widest"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-navy/30 bg-navy/5 px-2 py-1 rounded">F3</div>
          </div>
          <button 
            onClick={() => setSelectedHsn({ id: 'NEW', hsnCode: '', description: '', cgst: 0, sgst: 0, igst: 0, cess: 0, status: 'ACTIVE' })}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-navy text-white py-4 rounded-2xl text-[10px] font-black tracking-widest hover:bg-navy/90 transition-all uppercase"
          >
            <Plus className="w-4 h-4" /> Define New HSN [Alt+N]
          </button>
        </div>

        <div className="glass flex-1 rounded-[2.5rem] p-4 shadow-2xl overflow-y-auto overflow-x-hidden relative">
          <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-cream to-transparent z-10 pointer-events-none"></div>
          <div className="flex flex-col gap-2 pt-4">
            {filteredHsn.map((hsn) => (
              <button 
                key={hsn.id}
                onClick={() => handleEdit(hsn)}
                className={`flex flex-col text-left p-4 rounded-2xl transition-all border-l-4 ${selectedHsn?.id === hsn.id ? 'bg-navy border-gold text-white shadow-lg translate-x-2' : 'bg-cream/30 border-transparent hover:bg-cream hover:border-navy/20 text-navy'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black">{hsn.hsnCode}</span>
                  <span className={`w-2 h-2 rounded-full ${hsn.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </div>
                <div className={`text-xs font-bold truncate mt-1 ${selectedHsn?.id === hsn.id ? 'text-white/70' : 'text-navy/60'}`}>
                  {hsn.description}
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest mt-2 flex gap-3 ${selectedHsn?.id === hsn.id ? 'text-gold' : 'text-navy/40'}`}>
                  <span>IGST: {hsn.igst}%</span>
                  <span>CGST: {hsn.cgst}%</span>
                </div>
              </button>
            ))}
            {filteredHsn.length === 0 && (
              <div className="text-center py-10 text-muted font-bold text-xs">No HSN Codes found.</div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANE - HSN Configuration Matrix */}
      <div className="flex-1 glass rounded-[3rem] p-10 flex flex-col shadow-2xl relative overflow-hidden">
        {selectedHsn ? (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight">
                  {selectedHsn.id === 'NEW' ? 'New Nomenclature' : `HSN Matrix: ${selectedHsn.hsnCode}`}
                </h1>
                <div className="text-[10px] font-black text-muted uppercase tracking-widest mt-2 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Master Database Sync Active
                </div>
              </div>
              <div className="flex gap-4">
                 <button className="px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all">
                  Deactivate [Del]
                 </button>
                 <button className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase bg-gold text-navy hover:shadow-lg transition-all hover:scale-105 active:scale-95">
                  <Save className="w-4 h-4" /> Save Configuration [F2]
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">HSN Code (8 Digit Target)</label>
                <input 
                  type="text" 
                  value={selectedHsn.hsnCode} 
                  onChange={e => setSelectedHsn({...selectedHsn, hsnCode: e.target.value})}
                  className="w-full bg-white text-navy font-black text-lg rounded-2xl py-5 px-6 outline-none border-2 border-transparent focus:border-navy/20 transition-all shadow-sm"
                  placeholder="E.g., 62052000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-navy/40 uppercase tracking-widest ml-4">Commodity Description</label>
                <input 
                  type="text" 
                  value={selectedHsn.description} 
                  onChange={e => setSelectedHsn({...selectedHsn, description: e.target.value})}
                  className="w-full bg-white text-navy font-bold text-lg rounded-2xl py-5 px-6 outline-none border-2 border-transparent focus:border-navy/20 transition-all shadow-sm"
                  placeholder="E.g., Men's Shirts of Cotton"
                />
              </div>
            </div>

            {/* Tax Matrix */}
            <div className="mt-6 bg-navy text-cream p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden flex-1">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <LayoutGrid className="w-6 h-6 text-gold" />
                <h3 className="text-xl font-serif font-black uppercase">Statutory Tax Matrix</h3>
              </div>

              <div className="grid grid-cols-4 gap-6 relative z-10">
                {[
                  { label: 'IGST (%)', val: selectedHsn.igst, key: 'igst' },
                  { label: 'CGST (%)', val: selectedHsn.cgst, key: 'cgst' },
                  { label: 'SGST (%)', val: selectedHsn.sgst, key: 'sgst' },
                  { label: 'CESS (%)', val: selectedHsn.cess, key: 'cess' }
                ].map(tax => (
                  <div key={tax.key} className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center gap-4">
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest">{tax.label}</span>
                    <input 
                      type="number"
                      value={tax.val}
                      onChange={e => setSelectedHsn({...selectedHsn, [tax.key]: parseFloat(e.target.value) || 0})}
                      className="w-24 bg-transparent text-center text-4xl font-black text-white outline-none border-b-2 border-white/20 focus:border-gold pb-2 transition-all appearance-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest">Impact Analysis</h4>
                  <p className="text-xs text-white/50 mt-1 max-w-lg">
                    Modifying these statutory rates will automatically recalculate Net Margins across all linked items in the Item Master upon the next Sovereign Sync cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-navy/20 flex items-center justify-center mb-6">
              <LayoutGrid className="w-12 h-12 text-navy/40" />
            </div>
            <h2 className="text-2xl font-serif font-black text-navy uppercase">Select Nomenclature</h2>
            <p className="text-sm font-bold text-navy/60 max-w-xs mt-2">Choose an HSN code from the directory to configure statutory GST rates.</p>
          </div>
        )}
      </div>
    </div>
  )
}
