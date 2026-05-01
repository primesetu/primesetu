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
import { Users, Search, Plus, UserPlus, Phone, Award, Loader2 } from 'lucide-react';
import { DataTable, Text, Button, Badge } from '../../components/ui/SovereignUI';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export default function CustomerMaster() {
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.list()
  });

  const filtered = customers.filter((c: any) => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.mobile?.includes(search) ||
    c.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="xs" className="uppercase tracking-[0.3em] text-navy/40 font-black mb-1">
            Institutional CRM Registry
          </Text>
          <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight">
            Customer Master
          </h1>
        </div>
        <Button
          variant="pri"
          className="h-14 px-8 rounded-2xl gap-3 bg-brand-navy text-white hover:scale-105 shadow-2xl transition-all"
        >
          <UserPlus size={20} className="text-brand-gold" />
          ENROLL SOVEREIGN MEMBER
        </Button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-xl">
        <Search
          size={18}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-navy/20"
        />
        <input
          placeholder="SEARCH REGISTRY BY MOBILE, NAME, OR UID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-16 pl-14 pr-6 text-sm font-black uppercase tracking-widest bg-white border-2 border-navy/5 focus:border-brand-navy rounded-3xl outline-none transition-all shadow-xl placeholder:text-navy/10"
        />
        {isLoading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-navy/20" size={18} />}
      </div>

      <div className="bg-white rounded-[3rem] border border-navy/5 shadow-2xl overflow-hidden min-h-[500px]">
        <DataTable
          data={filtered}
          loading={isLoading}
          emptyMessage="No matching members found in Sovereign Registry"
          columns={[
            { 
              header: 'Identity', 
              accessor: (item: any) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center font-black text-navy/40">
                    {item.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-navy uppercase text-sm">{item.name}</div>
                    <div className="text-[10px] text-navy/30 font-bold font-mono uppercase">{item.id}</div>
                  </div>
                </div>
              )
            },
            { 
              header: 'Contact Protocol', 
              accessor: (item: any) => (
                <div className="flex items-center gap-2 font-mono font-bold text-navy/60">
                  <Phone size={12} className="text-brand-gold" />
                  {item.mobile || 'N/A'}
                </div>
              )
            },
            { 
              header: 'Registry Date', 
              accessor: (item: any) => new Date(item.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              className: 'text-[10px] font-black uppercase text-navy/30'
            },
            { 
              header: 'Loyalty Points', 
              accessor: (item: any) => (
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-brand-gold" />
                  <span className="font-black text-brand-navy">{item.points || 0}</span>
                </div>
              ),
              align: 'center'
            },
            { 
              header: 'Status', 
              accessor: (item: any) => (
                <Badge variant={item.active !== false ? 'success' : 'muted'} className="font-black tracking-widest text-[9px]">
                  {item.active !== false ? 'VERIFIED' : 'SUSPENDED'}
                </Badge>
              ),
              align: 'right'
            }
          ]}
        />
      </div>
    </div>
  );
}




