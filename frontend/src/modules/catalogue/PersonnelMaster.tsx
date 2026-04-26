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

import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, KeyRound, Search, Edit2, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from '@/hooks/useSession';
import { api } from '@/api/client';

interface Personnel {
  id: string;
  full_name: string;
  email: string;
  role: string;
  store_id: string;
  active: boolean;
  last_login?: string;
}

export default function PersonnelMaster() {
  const { t } = useLanguage();
  const { session } = useSession();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Personnel | null>(null);
  
  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const data = await api.users.list();
      setPersonnel(data);
    } catch (error) {
      console.error("Failed to fetch personnel", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const filtered = personnel.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full gap-4">
      {/* ── Left Panel: Personnel List ── */}
      <div className="flex-[2] shoper-panel flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-black text-navy">Personnel & Roles</h2>
              <p className="text-xs font-bold text-muted uppercase tracking-widest">Sovereign Identity Management</p>
            </div>
          </div>
          <button className="btn-primary px-6 h-touch">
            <UserPlus className="w-5 h-5" />
            New User [F4]
          </button>
        </div>

        <div className="p-4 bg-cream/50 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input 
              type="text" 
              placeholder="Search by name or email [F2]..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-border focus:border-saffron rounded-xl pl-12 pr-4 h-touch text-sm font-bold outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white custom-scrollbar">
          <div className="grid grid-cols-[1fr_1fr_120px_100px_80px] gap-4 p-4 text-xs font-black text-muted uppercase tracking-wider border-b border-border bg-cream/30 sticky top-0 z-10">
            <div>Full Name</div>
            <div>Email / Login</div>
            <div>Role</div>
            <div className="text-center">Status</div>
            <div className="text-center">Actions</div>
          </div>
          
          <div className="flex flex-col">
            {filtered.map(user => (
              <div 
                key={user.id} 
                onClick={() => setSelectedUser(user)}
                className={`grid grid-cols-[1fr_1fr_120px_100px_80px] gap-4 p-4 items-center border-b border-border/50 cursor-pointer transition-all hover:bg-saffron/5 ${selectedUser?.id === user.id ? 'bg-navy/5 border-l-4 border-l-navy' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="font-bold text-navy text-sm">{user.full_name}</div>
                <div className="font-mono text-xs text-muted">{user.email}</div>
                <div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    user.role === 'OWNER' ? 'bg-rose-100 text-rose-700' : 
                    user.role === 'MANAGER' ? 'bg-amber-100 text-amber-700' : 
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold ${user.active ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {user.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {user.active ? 'ACTIVE' : 'LOCKED'}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button className="p-2 text-muted hover:text-navy hover:bg-navy/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 shoper-panel flex flex-col bg-white overflow-hidden">
        {selectedUser ? (
          <>
            <div className="p-6 border-b border-border bg-cream/30">
              <div className="w-16 h-16 bg-navy text-gold text-2xl font-black rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-navy/20">
                {selectedUser.full_name.charAt(0)}
              </div>
              <h3 className="text-2xl font-black text-navy">{selectedUser.full_name}</h3>
              <p className="text-sm font-mono text-muted mt-1">{selectedUser.email}</p>
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted border-b border-border pb-2">Role & Permissions</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border rounded-xl p-4 bg-cream/50">
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Current Role</div>
                    <div className="text-lg font-black text-navy">{selectedUser.role}</div>
                  </div>
                  <div className="border border-border rounded-xl p-4 bg-cream/50">
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Assigned Store</div>
                    <div className="text-lg font-black font-mono text-navy">{selectedUser.store_id}</div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                  <div className="flex items-start gap-3">
                    <KeyRound className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-amber-900">Access Identity</div>
                      <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                        User permissions are governed by the Sovereign RBAC engine. The role of <b>{selectedUser.role}</b> dictates UI element visibility and API execution boundaries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted border-b border-border pb-2">Account Actions</h4>
                
                <button className="w-full h-touch bg-white border-2 border-border hover:border-navy text-navy font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  Reset Password
                </button>
                
                <button className={`w-full h-touch border-2 font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${selectedUser.active ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-300' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'}`}>
                  {selectedUser.active ? (
                    <><ShieldAlert className="w-5 h-5" /> Revoke Access</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> Restore Access</>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Shield className="w-24 h-24 text-navy mb-6" />
            <h3 className="text-2xl font-black text-navy uppercase tracking-wider">Select Personnel</h3>
            <p className="text-sm font-bold text-muted mt-2 max-w-[250px]">Choose a user from the list to view roles, reset credentials, or revoke access.</p>
          </div>
        )}
      </div>
    </div>
  );
}
