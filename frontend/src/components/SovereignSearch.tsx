/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation : AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Package, 
  Zap,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  Modal, 
  Button, 
  Input, 
  Text, 
  Badge, 
  DataTable,
  Card
} from './ui/SovereignUI';
import { api } from '@/api/client';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';

interface SearchFilter {
  field: string;
  operator: string;
  value: string;
}

interface ProductResult {
  id: string;
  code: string;
  name: string;
  brand: string;
  mrp_paise: number;
  tax_rate: number;
  stock: number;
  category: string;
  uom: string;
  colour?: string;
  size?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: ProductResult) => void;
  title?: string;
  initialFilter?: {
    field: string;
    value: string;
    operator?: string;
  };
}

const SEARCHABLE_FIELDS = [
  { value: 'barcode', label: 'BARCODE / EAN' },
  { value: 'item_code', label: 'SKU / ITEM CODE' },
  { value: 'item_name', label: 'PRODUCT NAME' },
  { value: 'brand', label: 'BRAND' },
  { value: 'colour', label: 'COLOUR' },
  { value: 'hsn_code', label: 'HSN CODE' },
];

const OPERATORS = [
  { value: 'contains', label: 'CONTAINS' },
  { value: 'starts_with', label: 'STARTS WITH' },
  { value: 'ends_with', label: 'ENDS WITH' },
  { value: 'equals', label: 'EQUALS TO' },
];

export const SovereignSearch: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  title = "SOVEREIGN PRODUCT SEARCH",
  initialFilter
}) => {
  const [filters, setFilters] = useState<SearchFilter[]>([
    { field: 'item_name', operator: 'contains', value: '' }
  ]);

  // Sync initial filter when dialog opens
  useEffect(() => {
    if (isOpen && initialFilter) {
      setFilters([{
        field: initialFilter.field,
        value: initialFilter.value,
        operator: initialFilter.operator || 'contains'
      }]);
    } else if (isOpen) {
      setFilters([{ field: 'item_name', operator: 'contains', value: '' }]);
    }
  }, [isOpen, initialFilter]);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const addFilter = () => {
    setFilters([...filters, { field: 'item_name', operator: 'contains', value: '' }]);
  };

  const removeFilter = (index: number) => {
    if (filters.length > 1) {
      setFilters(filters.filter((_, i) => i !== index));
    }
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    setFilters(filters.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await api.inventory.advancedSearch({ filters, logic });
      setResults(data || []);
    } catch (err) {
      console.error('[SMRITI-OS] Advanced search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Multi-Attribute Sovereign Query Protocol"
      maxWidth="max-w-6xl"
    >
      <div className="flex flex-col h-[75vh]" onKeyDown={handleKeyDown}>
        {/* Filter Configuration Area */}
        <div className="p-6 bg-bg-elevated/40 border-b border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-accent" />
              <Text variant="xs" className="font-black uppercase tracking-[0.2em]">Query Parameters</Text>
            </div>
            <div className="flex bg-bg-base border border-border-subtle p-1 rounded-sm">
              <button 
                onClick={() => setLogic('AND')}
                className={cn(
                  "px-4 py-1 text-[10px] font-black transition-all",
                  logic === 'AND' ? "bg-accent text-white" : "text-text-tertiary hover:text-text-primary"
                )}
              >
                MATCH ALL (AND)
              </button>
              <button 
                onClick={() => setLogic('OR')}
                className={cn(
                  "px-4 py-1 text-[10px] font-black transition-all",
                  logic === 'OR' ? "bg-accent text-white" : "text-text-tertiary hover:text-text-primary"
                )}
              >
                MATCH ANY (OR)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filters.map((filter, idx) => (
              <div key={idx} className="flex gap-2 items-center group animate-in fade-in slide-in-from-left-2 duration-200">
                <select 
                  value={filter.field}
                  onChange={(e) => updateFilter(idx, { field: e.target.value })}
                  className="w-48 h-10 bg-bg-base border border-border-subtle text-[11px] font-bold px-3 focus:border-accent outline-none appearance-none cursor-pointer"
                >
                  {SEARCHABLE_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>

                <select 
                  value={filter.operator}
                  onChange={(e) => updateFilter(idx, { operator: e.target.value })}
                  className="w-40 h-10 bg-bg-base border border-border-subtle text-[11px] font-bold px-3 focus:border-accent outline-none appearance-none cursor-pointer"
                >
                  {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                <div className="flex-1 relative">
                  <Input 
                    ref={idx === 0 ? firstInputRef : null}
                    value={filter.value}
                    onChange={(e) => updateFilter(idx, { value: e.target.value })}
                    placeholder="ENTER CRITERIA..."
                    className="h-10 text-xs font-mono font-bold tracking-widest"
                  />
                  {idx === filters.length - 1 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-30 pointer-events-none">
                      <Zap size={12} className="text-accent" />
                      <span className="text-[8px] font-black uppercase">Auto</span>
                    </div>
                  )}
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFilter(idx)}
                  className="w-10 h-10 p-0 text-text-tertiary hover:text-status-red hover:bg-status-red/10 border border-transparent hover:border-status-red/20"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="sec" size="sm" onClick={addFilter} className="gap-2 text-[10px] h-9 border-dashed">
              <Plus size={14} /> ADD CONDITION
            </Button>
            <div className="flex-1" />
            <Button variant="sec" size="sm" onClick={onClose} className="h-9 px-6 uppercase font-bold text-[10px]">
              CANCEL
            </Button>
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="h-10 px-8 gap-3 bg-accent text-white shadow-lg shadow-accent/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              <span className="font-black uppercase tracking-widest text-xs">Execute Search</span>
            </Button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-bg-base/40">
          {!hasSearched ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 select-none">
              <Package size={64} strokeWidth={1} />
              <Text variant="sm" className="mt-4 font-black uppercase tracking-[0.3em]">Awaiting Instruction</Text>
              <Text variant="xs" className="mt-1 opacity-60">Enter query parameters above to begin</Text>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-status-red/40 select-none">
              <X size={64} strokeWidth={1} />
              <Text variant="sm" className="mt-4 font-black uppercase tracking-[0.3em]">No Matches Found</Text>
              <Text variant="xs" className="mt-1 opacity-60">Try broadening your search criteria</Text>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <DataTable 
                data={results}
                loading={loading}
                columns={[
                  {
                    header: 'CODE',
                    accessor: (item: ProductResult) => <Badge variant="muted" className="font-mono text-accent">{item.code}</Badge>,
                    className: 'w-32'
                  },
                  {
                    header: 'PRODUCT / DESCRIPTION',
                    accessor: (item: ProductResult) => (
                      <div className="flex flex-col py-2">
                        <span className="font-bold text-sm text-text-primary uppercase">{item.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-text-tertiary uppercase">{item.brand}</span>
                          {item.colour && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-border-subtle" />
                              <span className="text-[10px] text-text-tertiary uppercase">{item.colour}</span>
                            </>
                          )}
                          <span className="w-1 h-1 rounded-full bg-border-subtle" />
                          <span className="text-[10px] text-text-tertiary uppercase">{item.category}</span>
                        </div>
                      </div>
                    ),
                    className: 'min-w-[300px]'
                  },
                  {
                    header: 'PRICE',
                    accessor: (item: ProductResult) => <span className="font-mono font-bold">{formatCurrency(item.mrp_paise)}</span>,
                    className: 'w-32 text-right'
                  },
                  {
                    header: 'STOCK',
                    accessor: (item: ProductResult) => (
                      <Badge variant={item.stock > 0 ? "success" : "error"} className="font-mono">
                        {item.stock} {item.uom}
                      </Badge>
                    ),
                    className: 'w-24 text-center'
                  },
                  {
                    header: '',
                    accessor: (item: ProductResult) => (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onSelect(item)}
                        className="group-hover:bg-accent group-hover:text-white transition-all rounded-full w-8 h-8 p-0"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    ),
                    className: 'w-12 text-center'
                  }
                ]}
                onRowClick={(row: ProductResult) => onSelect(row)}
              />
            </div>
          )}
        </div>

        {/* Footer Statistics */}
        <div className="h-10 bg-bg-float border-t border-border-subtle flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-status-green" />
              <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                Found {results.length} Matches
              </span>
            </div>
            <div className="h-3 w-[1px] bg-border-subtle" />
            <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">
              F10 Select · ENTER Search · ESC Close
            </span>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="muted" className="text-[8px] opacity-40">SOVEREIGN V3</Badge>
          </div>
        </div>
      </div>
    </Modal>
  );
};
