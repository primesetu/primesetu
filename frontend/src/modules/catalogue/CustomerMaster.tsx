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
import { Users, Search, Plus, Save, X, Phone, User, MapPin, Hash, Star, Trophy, ShieldCheck, Award } from 'lucide-react'

export default function CustomerMaster() {
  const [customers, setCustomers] = useState([
    { id: '1', name: 'Ramesh Kumar', phone: '9876543210', address: 'Delhi', loyalty: 1250, gst: '' },
    { id: '2', name: 'Suresh Patel', phone: '9876543211', address: 'Mumbai', loyalty: 450, gst: '27AABCT1234D1Z5' },
  ])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  const [form, setForm] = useState({ name: '', phone: '', address: '', gst: '' })

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  )

  const handleSave = () => {
    if (!form.name || !form.phone) return
    setCustomers([{ id: Date.now().toString(), ...form, loyalty: 0 }, ...customers])
    setShowForm(false)
    setForm({ name: '', phone: '', address: '', gst: '' })
  }

  return (
    <div className="flex flex-col h-full bg-[#f0ede8] font-sans">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 bg-[#1a2340] rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-400"/>
          </div>
          <div>
            <div className="text-xs font-black text-[#1a2340] uppercase tracking-widest leading-none">Customer Registry</div>
            <div className="text-[9px] text-gray-400 font-bold">Catalogue › Customers</div>
          </div>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full bg-white border-2 border-gray-200 focus:border-emerald-400 rounded-xl pl-9 pr-3 py-2 text-xs font-mono outline-none transition-all"/>
        </div>

        <div className="flex-1"/>

        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase px-4 py-2 rounded-xl shadow-md border-b-2 border-emerald-700 transition-all">
          <Plus className="w-4 h-4"/> New Customer
        </button>
      </div>

      <div className="flex-1 px-4 pb-3 overflow-hidden flex gap-4">
        {/* List */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-5 bg-[#1a2340] text-white text-[10px] font-black uppercase tracking-widest p-3">
            <div className="col-span-2">Name</div>
            <div>Phone</div>
            <div>GSTIN</div>
            <div className="text-right">Loyalty Points</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(c => (
              <div key={c.id} className="grid grid-cols-5 p-3 border-b border-gray-50 text-xs items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-2 font-bold text-navy flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center uppercase">{c.name[0]}</div>
                  {c.name}
                </div>
                <div className="font-mono text-gray-500">{c.phone}</div>
                <div className="font-mono text-gray-400">{c.gst || '-'}</div>
                <div className="text-right flex items-center justify-end gap-2">
                  <span className="font-black text-amber-500">{c.loyalty}</span>
                  {c.loyalty > 1000 ? <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" /> : 
                   c.loyalty > 500 ? <Trophy className="w-3.5 h-3.5 text-amber-500" /> : 
                   <Award className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col overflow-hidden shrink-0">
            <div className="bg-[#1a2340] text-white p-4 flex items-center justify-between">
              <div className="font-black text-sm">New Customer</div>
              <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3"/> Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3"/> Phone *</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} maxLength={10} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 font-mono"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3"/> Address</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Hash className="w-3 h-3"/> GSTIN</label>
                <input value={form.gst} onChange={e => setForm({...form, gst: e.target.value.toUpperCase()})} maxLength={15} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 font-mono uppercase"/>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
              <button onClick={handleSave} disabled={!form.name || !form.phone}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-sm py-2.5 rounded-xl shadow-md border-b-2 border-emerald-700 transition-all flex items-center justify-center gap-2">
                <Save className="w-4 h-4"/> Save Customer
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
