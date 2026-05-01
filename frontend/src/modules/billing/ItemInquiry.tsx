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

import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/api/client';
import { Input, Badge, Text, Button, DataTable } from '@/components/ui/SovereignUI';
import { SovereignSearch } from '@/components/SovereignSearch';
import { Filter, Search, Info, Package, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onClose: () => void;
}

const ItemInquiry: React.FC<Props> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState<{ isOpen: boolean; field: string; value: string }>({
    isOpen: false,
    field: 'barcode',
    value: ''
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const data = await api.inventory.search(query);
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy/95 text-white overflow-hidden">
      {/* Search Header */}
      <div className="p-6 border-b border-white/5 bg-black/20">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
          <Input 
            ref={inputRef}
            placeholder="SCAN OR TYPE SKU / BARCODE FOR INSTANT INQUIRY..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-16 text-xl font-mono font-bold tracking-widest bg-white/5 border-accent/20 focus:border-accent rounded-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <Button 
              type="button"
              variant="sec" 
              size="sm" 
              onClick={() => setShowAdvancedSearch({ isOpen: true, field: 'barcode', value: query })}
              className="h-10 px-4 gap-2 border-accent/20 hover:border-accent"
            >
              <Filter size={16} /> ADVANCED
            </Button>
            {loading && <Loader2 className="animate-spin text-accent" size={20} />}
          </div>
        </form>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-hidden p-6">
        <DataTable 
          data={results}
          loading={loading}
          emptyMessage="Awaiting Sovereign Query..."
          columns={[
            {
              header: 'PRODUCT IDENTITY',
              accessor: (item: any) => (
                <div className="flex flex-col py-2">
                  <span className="font-black text-sm uppercase leading-tight">{item.name}</span>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-mono text-accent">{item.code}</span>
                    <span className="text-[10px] opacity-40">{item.brand}</span>
                  </div>
                </div>
              ),
              flex: 2
            },
            {
              header: 'PRICE (MRP)',
              accessor: (item: any) => (
                <span className="font-mono font-black text-status-green">
                  ₹{(item.mrp_paise / 100).toLocaleString()}
                </span>
              ),
              align: 'right',
              width: 150
            },
            {
              header: 'AVAILABLE STOCK',
              accessor: (item: any) => (
                <span className={cn(
                  "font-black",
                  item.stock <= 0 ? "text-status-red" : "text-accent"
                )}>
                  {item.stock} {item.uom}
                </span>
              ),
              align: 'right',
              width: 180
            },
            {
              header: 'HSN / TAX',
              accessor: (item: any) => (
                <div className="flex flex-col text-[10px] opacity-60">
                   <span className="font-bold">HSN: {item.hsn_code || 'N/A'}</span>
                   <span className="font-black">{item.tax_rate}% GST</span>
                </div>
              ),
              width: 120
            }
          ]}
        />
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20 text-center">
        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">
            F2 · Institutional Stock Inquiry · Sovereign Node Ready
        </p>
      </div>

      <SovereignSearch 
        isOpen={showAdvancedSearch.isOpen}
        initialFilter={{
          field: showAdvancedSearch.field,
          value: showAdvancedSearch.value
        }}
        onClose={() => setShowAdvancedSearch(prev => ({ ...prev, isOpen: false }))}
        onSelect={(item) => {
          setResults([item]);
          setShowAdvancedSearch(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
};

export default ItemInquiry;
