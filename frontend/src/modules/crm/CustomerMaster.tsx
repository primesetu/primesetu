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

import React, { useState, useRef, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  CreditCard, 
  RefreshCw,
  MoreVertical,
  History,
  ShieldCheck,
  Zap,
  Target,
  ShieldAlert,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

import { formatCurrency } from '../../utils/currency';
import CustomerForm from './CustomerForm';
import { usePermission } from '../../hooks/usePermission';
import { useOfflineFallback } from '../../hooks/useOfflineFallback';
import { apiClient } from '../../api/client';
import { 
  DataTable, 
  Badge, 
  Text, 
  Button 
} from '@/components/ui/SovereignUI';

interface Customer {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  loyalty_points?: number;
  outstanding_paise?: number;
  created_at: string;
  found?: boolean;
}

const CustomerMaster: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { hasPermission } = usePermission();

  // 1. Fetch Customers
  const { 
    data: customers = [], 
    loading: isLoading, 
    isOfflineData 
  } = useOfflineFallback<Customer[]>(
    `customers_${searchTerm}`,
    async () => {
      if (searchTerm.length === 10 && /^\d+$/.test(searchTerm)) {
        const res = await apiClient.get<Customer>(`/customers/lookup?phone=${searchTerm}`);
        if (res.data?.found) return [res.data];
      }
      const res = await apiClient.get<Customer[]>(`/customer/search?type=customer&q=${searchTerm}`);
      return res.data;
    },
    []
  );

  // 2. Permission Guard
  if (!hasPermission('customers.view')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShieldAlert size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-black text-navy uppercase tracking-tighter">Access Denied</h2>
        <p className="text-xs text-navy/40 uppercase tracking-widest mt-2">Insufficient permissions to view Customer Registry</p>
      </div>
    );
  }

  // 3. Hotkeys
  useHotkeys('f3', (e) => { e.preventDefault(); searchInputRef.current?.focus(); }, { enableOnFormTags: true });
  useHotkeys('f4', (e) => { 
    e.preventDefault(); 
    if (hasPermission('customers.edit')) {
      setIsFormOpen(true); 
      setSelectedCustomerId(null); 
    }
  }, { enableOnFormTags: true });

  // 4. Columns Definition
  const columns = useMemo(() => [
    {
      header: "PROTOCOL CODE",
      accessor: (item: Customer) => (
        <span className="bg-navy/5 text-navy px-3 py-1 rounded-lg font-mono text-[11px] font-black uppercase">
          {item.code || '-'}
        </span>
      ),
      width: 150,
      pinned: 'left' as const
    },
    {
      header: "IDENTITY DNA",
      accessor: (item: Customer) => (
        <div className="flex flex-col py-2 leading-tight">
          <span className="text-sm font-black text-navy uppercase tracking-tight">{item.name}</span>
          <span className="text-[9px] font-bold text-navy/30 uppercase tracking-widest mt-1 flex items-center gap-1">
            <ShieldCheck size={10} className="text-emerald-500" /> Joined {new Date(item.created_at).getFullYear()}
          </span>
        </div>
      ),
      flex: 2,
      pinned: 'left' as const
    },
    {
      header: "CONTACT PROTOCOL",
      accessor: (item: Customer) => <span className="font-mono text-xs font-black text-navy/60">{item.phone}</span>,
      width: 180,
      className: 'text-center'
    },
    {
      header: "LOYALTY TIER",
      accessor: (item: Customer) => (
        <Badge variant="info" className="inline-flex items-center gap-1 bg-brand-gold/10 text-brand-gold border-none font-black text-[9px]">
          <Zap size={10} strokeWidth={3} /> {item.loyalty_points || 0} PTS
        </Badge>
      ),
      width: 140,
      className: 'text-center'
    },
    {
      header: "LEDGER BALANCE",
      accessor: (item: Customer) => (
        <span className={`font-mono text-sm font-black ${item.outstanding_paise! > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
          {formatCurrency(item.outstanding_paise || 0)}
        </span>
      ),
      width: 180,
      className: 'text-right'
    },
    {
      header: "ACTIONS",
      accessor: (item: Customer) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => { setSelectedCustomerId(item.id); setIsFormOpen(true); }}
            className="p-2.5 bg-navy/5 text-navy rounded-xl hover:bg-navy hover:text-white transition-all shadow-sm group/btn"
          >
            <RefreshCw size={16} className="group-hover/btn:rotate-180 transition-all duration-500" />
          </button>
          <button className="p-2.5 bg-navy/5 text-navy/20 hover:text-brand-saffron hover:bg-brand-saffron/10 rounded-xl transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      ),
      width: 120,
      pinned: 'right' as const
    }
  ], []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Breadcrumb Pattern */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/20 mb-4">
         <span>Home</span> <ChevronRight size={10} />
         <span>CRM</span> <ChevronRight size={10} />
         <span className="text-navy/60">Customer Registry</span>
      </nav>

      {/* Header Panel */}
      <div className="flex items-center justify-between bg-white/50 p-10 rounded-[40px] border border-navy/5 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-navy rounded-[24px] flex items-center justify-center text-brand-gold shadow-2xl shadow-navy/20">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-black text-navy uppercase tracking-tight leading-none">Customer Master</h1>
            <div className="flex items-center gap-3 mt-3">
              <p className="text-[10px] font-mono text-navy/40 uppercase tracking-[0.2em]">CRM · Loyalty Matrix · Ledger Alignment</p>
              {isOfflineData && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded-lg">Offline Buffer</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-brand-gold transition-colors" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search Phone / Name... [F3]"
              className="w-80 bg-white border-2 border-navy/5 rounded-[2rem] py-5 pl-14 pr-6 text-xs font-black outline-none focus:border-brand-gold transition-all shadow-sm uppercase tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-5 bg-white rounded-2xl text-navy/20 hover:text-navy border border-navy/5 shadow-sm transition-all"><Filter size={20} /></button>
          {hasPermission('customers.edit') && (
            <button 
              onClick={() => { setSelectedCustomerId(null); setIsFormOpen(true); }}
              className="flex items-center gap-4 bg-brand-navy text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-navy/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              New Member <span className="opacity-40 ml-1 text-[9px]">[F4]</span>
            </button>
          )}
        </div>
      </div>

      {/* Registry Grid */}
      <div className="bg-white rounded-[50px] border border-navy/5 shadow-2xl overflow-hidden mt-10">
         <div className="h-[600px]">
            <DataTable 
               data={customers}
               columns={columns}
               loading={isLoading && customers.length === 0}
               overlayNoRowsTemplate={`
                 <div class="flex flex-col items-center justify-center opacity-10 h-full">
                    <Users size="80" class="mb-4" />
                    <div class="text-lg font-black uppercase tracking-[0.5em]">No Members in Registry</div>
                 </div>
               `}
            />
         </div>
      </div>

      {isFormOpen && (
        <CustomerForm 
          editId={selectedCustomerId} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default CustomerMaster;
