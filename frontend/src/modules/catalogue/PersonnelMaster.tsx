/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState } from 'react';
import { UserPlus, Shield, KeyRound, Search, Edit2, CheckCircle2, ShieldAlert, Loader2, Mail, Store } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { DataTable, Text, Button, Badge } from '../../components/ui/SovereignUI';

export default function PersonnelMaster() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: personnel = [], isLoading } = useQuery({
    queryKey: ['personnel'],
    queryFn: () => api.users.list()
  });

  const filtered = personnel.filter((p: any) => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full gap-8 p-6 overflow-hidden">
      {/* ── Left Panel: List ── */}
      <div className="flex-[2] flex flex-col gap-6 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <Text variant="xs" className="uppercase tracking-[0.3em] text-navy/40 font-black mb-1">
              Institutional Identity Hub
            </Text>
            <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight">
              Personnel Registry
            </h1>
          </div>
          <Button
            variant="pri"
            className="h-14 px-8 rounded-2xl gap-3 bg-brand-navy text-white hover:scale-105 shadow-2xl transition-all"
          >
            <UserPlus size={20} className="text-brand-gold" />
            NEW DEPLOYMENT
          </Button>
        </div>

        <div className="relative max-w-xl">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-navy/20"
          />
          <input
            placeholder="SEARCH BY NAME OR EMAIL ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-14 pr-6 text-sm font-black uppercase tracking-widest bg-white border-2 border-navy/5 focus:border-brand-navy rounded-3xl outline-none transition-all shadow-xl placeholder:text-navy/10"
          />
          {isLoading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-navy/20" size={18} />}
        </div>

        <div className="bg-white rounded-[3rem] border border-navy/5 shadow-2xl overflow-hidden flex-1 flex flex-col">
          <DataTable
            data={filtered}
            loading={isLoading}
            onRowClick={(row) => setSelectedUser(row)}
            emptyMessage="No personnel records found in Sovereign Node"
            columns={[
              { 
                header: 'User Identity', 
                accessor: (item: any) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-navy text-brand-gold rounded-xl flex items-center justify-center font-black">
                      {item.full_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-navy uppercase text-sm">{item.full_name}</div>
                      <div className="text-[10px] text-navy/30 font-bold uppercase tracking-tighter">Node UID: {item.id?.slice(0,8)}</div>
                    </div>
                  </div>
                )
              },
              { 
                header: 'Designation', 
                accessor: (item: any) => (
                  <Badge variant={item.role === 'OWNER' ? 'info' : 'muted'} className="font-black tracking-widest text-[9px]">
                    {item.role}
                  </Badge>
                )
              },
              { 
                header: 'Auth Protocol', 
                accessor: (item: any) => (
                  <div className="flex items-center gap-2 font-mono text-[10px] text-navy/60 font-bold">
                    <Mail size={12} className="opacity-30" />
                    {item.email}
                  </div>
                )
              },
              { 
                header: 'Status', 
                accessor: (item: any) => (
                  <div className={`flex items-center gap-1.5 text-[9px] font-black ${item.active ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    {item.active ? 'OPERATIONAL' : 'LOCKED'}
                  </div>
                ),
                align: 'right'
              }
            ]}
          />
        </div>
      </div>

      {/* ── Right Panel: Profile / Form ── */}
      <div className="flex-1 min-w-[400px]">
        {selectedUser ? (
          <div className="h-full bg-white rounded-[3rem] border border-navy/5 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-500">
            <div className="p-10 bg-brand-navy text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 blur-[100px] rounded-full" />
               <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-brand-gold mb-6 border border-white/10">
                    {selectedUser.full_name?.charAt(0)}
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-2">{selectedUser.full_name}</h3>
                  <Badge variant="muted" className="bg-white/5 text-white/60 border-white/10">{selectedUser.role}</Badge>
               </div>
            </div>

            <div className="flex-1 p-10 space-y-10 overflow-y-auto custom-scrollbar">
               <div className="space-y-4">
                  <Text variant="xs" className="uppercase font-black tracking-[0.2em] text-navy/20">Deployment Specs</Text>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 bg-navy/[0.02] border border-navy/5 rounded-2xl">
                        <Text variant="xs" className="text-navy/30 mb-2 block uppercase">Store Node</Text>
                        <div className="flex items-center gap-2 text-navy font-black">
                           <Store size={14} className="text-brand-gold" />
                           {selectedUser.store_id || 'Global'}
                        </div>
                     </div>
                     <div className="p-6 bg-navy/[0.02] border border-navy/5 rounded-2xl">
                        <Text variant="xs" className="text-navy/30 mb-2 block uppercase">Last Access</Text>
                        <div className="text-navy font-black">
                           {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'NEVER'}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <Text variant="xs" className="uppercase font-black tracking-[0.2em] text-navy/20">Sovereign Controls</Text>
                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                     <Shield className="text-amber-500 shrink-0" size={24} />
                     <div>
                        <Text variant="xs" className="text-amber-800 font-black mb-1 uppercase">RBAC Enforcement</Text>
                        <p className="text-[10px] text-amber-700/60 font-bold leading-relaxed">
                           Permissions for this node are governed by the Sovereign Identity Engine. Access level is pinned to {selectedUser.role} protocol.
                        </p>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 pt-4">
                  <Button variant="sec" className="w-full h-14 rounded-2xl gap-3 border-navy/10">
                     <KeyRound size={18} />
                     RESET ACCESS KEY
                  </Button>
                  <Button variant="sec" className={`w-full h-14 rounded-2xl gap-3 ${selectedUser.active ? 'text-rose-500 border-rose-100 bg-rose-50' : 'text-emerald-600 border-emerald-100 bg-emerald-50'}`}>
                     {selectedUser.active ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
                     {selectedUser.active ? 'REVOKE DEPLOYMENT' : 'RESTORE DEPLOYMENT'}
                  </Button>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-navy/[0.02] border border-dashed border-navy/10 rounded-[3rem] flex flex-col items-center justify-center text-center p-10 opacity-40">
            <Shield size={64} className="text-navy mb-6" />
            <Text variant="h2" className="text-navy uppercase tracking-widest">Awaiting Identity</Text>
            <p className="text-xs font-bold text-navy/40 mt-4 max-w-[280px] uppercase leading-relaxed">
              Select a personnel node from the registry to view operational specs and auth protocols.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}




