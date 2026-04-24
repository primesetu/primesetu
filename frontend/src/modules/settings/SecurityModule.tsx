/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, User, Key, Lock, Fingerprint, Eye, EyeOff, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityModule() {
  const [showPass, setShowPass] = useState(false);

  const users = [
    { id: 1, name: 'Admin Sovereign', role: 'OWNER', status: 'ACTIVE', lastLogin: '10m ago' },
    { id: 2, name: 'Jawahar R.M.', role: 'MANAGER', status: 'ACTIVE', lastLogin: '1h ago' },
    { id: 3, name: 'Store Cashier A', role: 'CASHIER', status: 'LOCKED', lastLogin: '2d ago' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy flex items-center gap-4">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
            Security & Users
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2">Access Control & Sovereignty Guard</p>
        </div>
        <button className="bg-navy text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-navy/90 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4 text-rose-400" /> CREATE SYSTEM USER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User List */}
        <div className="glass p-10 rounded-[3rem] shadow-xl space-y-6">
          <h3 className="text-lg font-serif font-black text-navy uppercase tracking-tight flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-500" /> Authorized Personnel
          </h3>
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/50 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-navy text-white rounded-xl flex items-center justify-center font-black text-xs uppercase">
                    {u.name[0]}
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-navy">{u.name}</div>
                    <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{u.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase ${
                    u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {u.status}
                  </span>
                  <div className="text-[8px] text-muted font-bold mt-1">{u.lastLogin}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials & Policy */}
        <div className="space-y-6">
          <div className="glass p-10 rounded-[3rem] shadow-xl space-y-6">
            <h3 className="text-lg font-serif font-black text-navy uppercase tracking-tight flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" /> Sovereign Key Mgr
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-muted uppercase tracking-widest">Master Node Password</label>
                <div className="relative">
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value="SOVEREIGN_NODE_2026_SECURE" 
                    readOnly
                    className="w-full bg-cream/50 border-2 border-border rounded-xl px-5 py-3 text-sm font-black text-navy outline-none"
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button className="w-full bg-[#1a2340] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                ROTATE MASTER KEYS
              </button>
            </div>
          </div>

          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-200 flex items-start gap-4">
            <Fingerprint className="w-10 h-10 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-navy uppercase tracking-widest mb-1">Audit Protocol Active</h4>
              <p className="text-[10px] text-amber-800 leading-relaxed font-bold">Every interaction is logged with a forensic timestamp. Multi-factor auth is recommended for ADMIN roles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
