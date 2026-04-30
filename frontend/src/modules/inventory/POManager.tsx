/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  RefreshCw,
  MoreVertical,
  Calendar,
  Truck,
  ShieldAlert,
  ChevronRight,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/currency';
import { usePermission } from '../../hooks/usePermission';
import { useOfflineFallback } from '../../hooks/useOfflineFallback';
import { DataTable } from '../../components/ui/SovereignUI';

const POManager: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { hasPermission } = usePermission();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 1. Permission Guard
  if (!hasPermission('inventory.view')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-black text-text-primary uppercase tracking-tighter">Access Denied</h2>
        <p className="text-xs text-text-secondary uppercase tracking-widest mt-2">Insufficient permissions to manage Purchase Orders</p>
      </div>
    );
  }

  // 2. Fetch POs with Offline Fallback
  const { 
    data: pos = [], 
    loading: isLoading, 
    isOfflineData 
  } = useOfflineFallback(
    `purchase_orders_${searchTerm}`,
    async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/purchase/?search=${searchTerm}`, 
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch POs");
      return response.json();
    },
    []
  );

  // 3. Hotkeys
  useHotkeys('f3', (e) => { e.preventDefault(); searchInputRef.current?.focus(); }, { enableOnFormTags: true });
  useHotkeys('f4', (e) => { e.preventDefault(); if (hasPermission('inventory.edit')) navigate('/purchase/new'); }, { enableOnFormTags: true });

  const statusColors: Record<string, string> = {
    'DRAFT': 'bg-gray-100 text-gray-600',
    'SUBMITTED': 'bg-blue-50 text-blue-600',
    'RECEIVED': 'bg-emerald-50 text-emerald-600',
    'CLOSED': 'bg-emerald-100 text-emerald-600',
    'CANCELLED': 'bg-rose-50 text-rose-600'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary/40 mb-4">
         <span>Home</span> <ChevronRight size={10} />
         <span>Procurement</span> <ChevronRight size={10} />
         <span className="text-text-primary/60">PO Registry</span>
      </nav>

      {/* Sovereign Header */}
      <div className="flex items-center justify-between bg-bg-elevated/40 p-10 rounded-[40px] border border-border backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-navy rounded-[24px] flex items-center justify-center text-brand-gold shadow-2xl shadow-navy/20">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-black text-text-primary uppercase tracking-tight leading-none">Purchase Orders</h1>
            <div className="flex items-center gap-6 mt-3">
              <p className="text-[10px] font-mono text-text-secondary uppercase tracking-[0.2em]">Procurement Lifecycle · Inwarding Protocol</p>
              <div className="flex items-center gap-4 border-l border-border pl-6">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-text-secondary/40 uppercase">Store Node</span>
                  <span className="text-[10px] font-bold text-text-primary uppercase">HQ-MUM-01</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-text-secondary/40 uppercase">Station</span>
                  <span className="text-[10px] font-bold text-text-primary uppercase">PCS-11</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-secondary/40 group-focus-within:text-brand-gold transition-colors" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search PO # / Vendor... [F3]"
              className="w-80 bg-bg-input border-2 border-border rounded-[2rem] py-5 pl-12 pr-6 text-xs font-black outline-none focus:border-brand-gold transition-all shadow-sm uppercase tracking-widest text-text-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: [`purchase_orders_${searchTerm}`] })} 
            className="p-5 bg-bg-float rounded-2xl text-text-secondary/40 hover:text-text-primary border border-border shadow-sm transition-all"
          >
            <RefreshCw size={20} />
          </button>
          {hasPermission('inventory.edit') && (
            <button 
              onClick={() => navigate('/purchase/new')}
              className="flex items-center gap-4 bg-brand-saffron text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-brand-saffron/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Raise PO <span className="opacity-40 ml-1 text-[9px]">[F4]</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-8">
        {[
          { label: 'Pending Arrival', val: '14 Orders', icon: Truck, color: 'navy' },
          { label: 'Total Value', val: '₹42.8L', icon: ArrowUpRight, color: 'gold' },
          { label: 'Draft Sessions', val: '04 Units', icon: Clock, color: 'saffron' },
          { label: 'Today\'s GRN', val: '12 Inbound', icon: FileText, color: 'green' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-bg-elevated rounded-[40px] p-10 border border-border shadow-xl relative overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl group">
             <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color === 'navy' ? 'bg-brand-navy text-white shadow-lg' : kpi.color === 'gold' ? 'bg-brand-gold/10 text-brand-gold' : kpi.color === 'saffron' ? 'bg-brand-saffron/10 text-brand-saffron' : 'bg-emerald-50 text-emerald-600'}`}>
                   <kpi.icon size={22} />
                </div>
                <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.3em]">{kpi.label}</span>
             </div>
             <div className="text-4xl font-serif font-black text-text-primary tracking-tight">{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* List Container */}
      <div className="bg-bg-elevated rounded-[50px] border border-border shadow-2xl overflow-hidden mt-10 min-h-[500px]">
        <DataTable
          data={pos}
          loading={isLoading}
          onRowClick={(po) => navigate(`/purchase/${po.id}`)}
          columns={[
            {
              header: 'PO Protocol',
              accessor: (po: any) => (
                <div className="flex items-center gap-4 py-4">
                   <div className="flex flex-col gap-1">
                     <span className="bg-bg-input text-text-primary px-4 py-2 rounded-xl font-mono text-[12px] font-black uppercase shadow-sm">{po.po_number}</span>
                     <div className="flex items-center gap-2 px-1">
                        <span className="text-[9px] font-black text-text-secondary/20 uppercase tracking-widest">#{po.id.slice(0,8)}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-[9px] font-bold text-accent uppercase tracking-tighter">{po.item_count || 0} SKUs · {po.total_qty || 0} Units</span>
                     </div>
                   </div>
                </div>
              ),
              className: 'px-12'
            },
            {
              header: 'Vendor Identity',
              accessor: (po: any) => (
                <div className="py-4">
                  <div className="text-base font-black text-text-primary uppercase tracking-tight">{po.vendor_name || 'Direct Procurement'}</div>
                  <div className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest mt-2 flex items-center gap-2">
                     <Calendar size={12} className="text-brand-gold" /> Created {new Date(po.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              ),
              className: 'px-12'
            },
            {
              header: 'Status Matrix',
              align: 'center',
              accessor: (po: any) => (
                <span className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${statusColors[po.status] || 'bg-gray-100 text-gray-400'}`}>
                  {po.status}
                </span>
              ),
              className: 'px-12'
            },
            {
              header: 'Order Value (INR)',
              align: 'right',
              accessor: (po: any) => formatCurrency(po.total_paise),
              className: 'px-12 font-mono text-base font-black text-text-primary'
            },
            {
              header: 'Expected On',
              align: 'center',
              accessor: (po: any) => po.expected_date ? new Date(po.expected_date).toLocaleDateString('en-IN') : 'IMMEDIATE',
              className: 'px-12 font-mono text-[12px] font-black text-text-secondary/60'
            },
            {
              header: '',
              align: 'right',
              accessor: (po: any) => (
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => navigate(`/purchase/${po.id}`)} className="p-4 bg-bg-float text-text-primary rounded-2xl hover:bg-brand-navy hover:text-white transition-all shadow-sm border border-border">
                    <ChevronRight size={22} />
                  </button>
                  <button className="p-4 bg-bg-float text-text-secondary/20 hover:text-brand-saffron hover:bg-brand-saffron/10 rounded-2xl transition-all border border-border"><MoreVertical size={22} /></button>
                </div>
              ),
              className: 'px-12'
            }
          ]}
        />
      </div>
    </div>
  );
};

export default POManager;




