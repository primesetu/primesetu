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
import { Input, Badge, Text, Button } from '@/components/ui/SovereignUI';
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {results.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <Info size={48} strokeWidth={1} />
            <p className="mt-4 text-xs font-black uppercase tracking-widest">Awaiting Sovereign Query...</p>
          </div>
        )}

        {results.map((item) => (
          <div key={item.id} className="bg-white/5 border border-white/10 p-6 rounded-none flex gap-8 items-start hover:border-accent/40 transition-all">
            <div className="w-24 h-24 bg-white/5 flex items-center justify-center border border-white/5">
                <Package size={40} className="text-white/10" />
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-8">
                <div>
                    <Text variant="xs" className="opacity-40 uppercase font-black tracking-widest mb-1">Product Identity</Text>
                    <h3 className="text-2xl font-black text-white uppercase">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="muted" className="font-mono text-accent">{item.code}</Badge>
                        <Badge variant="muted" className="opacity-60">{item.brand}</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 border border-white/5">
                        <Text variant="xs" className="opacity-40 uppercase font-black tracking-widest mb-1">Price (MRP)</Text>
                        <div className="text-xl font-black text-status-green">₹{(item.mrp_paise / 100).toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 p-4 border border-white/5">
                        <Text variant="xs" className="opacity-40 uppercase font-black tracking-widest mb-1">Available Stock</Text>
                        <div className={cn(
                            "text-xl font-black",
                            item.stock <= 0 ? "text-status-red" : "text-accent"
                        )}>{item.stock} {item.uom}</div>
                    </div>
                </div>

                <div className="col-span-2 grid grid-cols-4 gap-4 mt-2">
                    <div className="text-[10px] flex items-center gap-2">
                        <Tag size={12} className="text-accent" />
                        <span className="opacity-40 font-bold uppercase">Tax:</span>
                        <span className="font-black text-white">{item.tax_rate}% GST</span>
                    </div>
                    <div className="text-[10px] flex items-center gap-2">
                        <Info size={12} className="text-accent" />
                        <span className="opacity-40 font-bold uppercase">HSN:</span>
                        <span className="font-black text-white">{item.hsn_code || 'N/A'}</span>
                    </div>
                </div>
            </div>
          </div>
        ))}
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
