/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React, { useState } from 'react';
import { Truck, Search, Plus, Loader2, Globe, Phone } from 'lucide-react';
import { DataTable, Text, Button, Badge } from '../../components/ui/SovereignUI';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export default function VendorMaster() {
  const [search, setSearch] = useState('');

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.vendors.list()
  });

  const filtered = vendors.filter((v: any) => 
    v.name?.toLowerCase().includes(search.toLowerCase()) || 
    v.id?.toLowerCase().includes(search.toLowerCase()) ||
    v.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="xs" className="uppercase tracking-[0.3em] text-navy/40 font-black mb-1">
            Sovereign Supply Chain
          </Text>
          <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight">
            Vendor Network
          </h1>
        </div>
        <Button
          variant="pri"
          className="h-14 px-8 rounded-2xl gap-3 bg-brand-navy text-white hover:scale-105 shadow-2xl transition-all"
        >
          <Plus size={20} className="text-brand-gold" />
          ONBOARD NEW VENDOR
        </Button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-xl">
        <Search
          size={18}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-navy/20"
        />
        <input
          placeholder="SEARCH VENDOR NAME, ID OR LOCATION..."
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
          emptyMessage="No vendors found in Sovereign Network"
          columns={[
            { 
              header: 'Vendor Identity', 
              accessor: (item: any) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Truck size={18} />
                  </div>
                  <div>
                    <div className="font-black text-navy uppercase text-sm">{item.name}</div>
                    <div className="text-[10px] text-navy/30 font-bold font-mono uppercase">{item.id}</div>
                  </div>
                </div>
              )
            },
            { 
              header: 'Category', 
              accessor: 'category',
              className: 'text-[10px] font-black uppercase text-brand-gold tracking-widest'
            },
            { 
              header: 'Base Location', 
              accessor: (item: any) => (
                <div className="flex items-center gap-2 font-bold text-navy/60">
                  <Globe size={12} className="opacity-30" />
                  {item.location || 'N/A'}
                </div>
              )
            },
            { 
              header: 'Contact Info', 
              accessor: (item: any) => (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-navy/80">{item.contact}</div>
                  <div className="text-[9px] text-navy/40 font-bold italic">{item.email}</div>
                </div>
              )
            },
            { 
              header: 'Status', 
              accessor: (item: any) => (
                <Badge variant="success" className="font-black tracking-widest text-[9px]">
                  ACTIVE LEDGER
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
