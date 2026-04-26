/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, LayoutDashboard, User, Package, 
  ScanBarcode, Clock, UserCheck, Tag, ShoppingBag 
} from 'lucide-react';

import { ICON_MAP } from '../lib/ModuleRegistry';
import { fetchMenu, MenuItem } from '../api/menuService';
import { api } from '../api/client';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  initialContext?: string | null;
}

export default function CommandBar({ isOpen, onClose, onNavigate, initialContext }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [commands, setCommands] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('primesetu_cmd_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addToHistory = (cmd: any) => {
    const next = [cmd, ...history.filter(h => h.id !== cmd.id)].slice(0, 5);
    setHistory(next);
    localStorage.setItem('primesetu_cmd_history', JSON.stringify(next));
  };

  // Context-Aware UI Configuration
  const CONTEXT_CONFIG: Record<string, { icon: any, placeholder: string, label: string }> = {
    'items': { icon: Package, placeholder: 'Search Product Name or Code...', label: 'Product Zoom' },
    'customers': { icon: User, placeholder: 'Search Customer Mobile or Name...', label: 'Customer Zoom' },
    'salesperson': { icon: UserCheck, placeholder: 'Search Staff/Salesperson...', label: 'Staff Zoom' },
    'brands': { icon: Tag, placeholder: 'Search Brands...', label: 'Brand Zoom' },
    'categories': { icon: ShoppingBag, placeholder: 'Search Categories...', label: 'Category Zoom' },
  };

  const config = initialContext ? CONTEXT_CONFIG[initialContext] || { 
    icon: Search, 
    placeholder: `Search ${initialContext}...`, 
    label: `${initialContext.charAt(0).toUpperCase() + initialContext.slice(1)} Zoom` 
  } : null;

  useEffect(() => {
    // 1. Load Menu Commands (Global Context)
    fetchMenu().then(menu => {
      const flattened: any[] = [];
      const traverse = (items: MenuItem[]) => {
        items.forEach(item => {
          flattened.push({
            id: item.id,
            type: 'command',
            label: item.label,
            icon: ICON_MAP[item.module] || LayoutDashboard,
            shortcut: item.shortcut || '',
            tab: item.id,
            description: `Jump to ${item.label}`
          });
          if (item.children) traverse(item.children);
        });
      };
      traverse(menu);
      
      // Inject System Commands
      flattened.push({
        id: 'onboarding',
        type: 'command',
        label: 'Store Onboarding (Phase 3)',
        icon: ICON_MAP['onboarding'],
        shortcut: 'Shift+O',
        tab: 'onboarding',
        description: 'Register a new store unit atomically'
      });

      flattened.push({
        id: 'gstr1',
        type: 'command',
        label: 'GSTR-1 Compliance Export',
        icon: ICON_MAP['gstr1'],
        shortcut: 'Ctrl+G',
        tab: 'gstr1',
        description: 'Generate B2B/B2CS tax return for filing'
      });

      setCommands(flattened);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isOpen]);

  // 2. Handle Context-Aware Search (Zoom)
  useEffect(() => {
    if (!query || !initialContext) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        if (initialContext === 'items') {
          const products = await api.inventory.search(query);
          setResults(products.map((p: any) => ({
            id: p.id,
            type: 'product',
            label: p.name,
            sub: `${p.code} · ₹${p.mrp}`,
            icon: Package,
            data: p
          })));
        } else if (initialContext === 'customers') {
          setResults([{
            id: 'mock-cust-1',
            type: 'customer',
            label: `Customer: ${query}`,
            sub: 'Search in database...',
            icon: User,
            data: { mobile: query }
          }]);
        } else if (initialContext === 'salesperson') {
          // Simulate staff search
          const staff = ['Admin', 'Suresh', 'Rahul', 'Priya'].filter(s => s.toLowerCase().includes(query.toLowerCase()));
          setResults(staff.map(s => ({
            id: `staff-${s}`,
            type: 'staff',
            label: s,
            sub: 'Store Executive',
            icon: UserCheck,
            data: { name: s }
          })));
        } else {
          // Generic fallback for other contexts
          setResults([{
            id: `gen-${query}`,
            type: 'generic',
            label: `${query}`,
            sub: `Selecting ${initialContext}`,
            icon: Search,
            data: { value: query }
          }]);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, initialContext]);

  if (!isOpen) return null;

  const displayResults = initialContext ? results : commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/20"
        >
          {/* Header */}
          <div className="p-8 border-b border-border flex items-center gap-4">
            <div className="relative">
              {config ? <config.icon className="w-6 h-6 text-navy" /> : <Search className="w-6 h-6 text-navy" />}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin opacity-20" />
                </div>
              )}
            </div>
            <input 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={config ? config.placeholder : "Press F2 or type to navigate..."}
              className="flex-1 bg-transparent border-none outline-none text-xl font-serif font-black text-navy placeholder:text-muted/40"
            />
            {initialContext && (
              <div className="px-3 py-1 bg-amber-400 text-navy rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-600/20 shadow-sm">
                {config?.label || initialContext}
              </div>
            )}
            <button onClick={onClose} className="p-2 hover:bg-cream rounded-full transition-all">
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          {/* Results Area */}
          <div className="p-4 max-h-[450px] overflow-y-auto custom-scrollbar">
            <div className="px-4 py-2 text-[10px] font-black text-navy/40 uppercase tracking-widest flex justify-between">
              <span>{initialContext ? `Zoom Mode: ${initialContext}` : 'Quick Navigation'}</span>
              <span>{displayResults.length} Results</span>
            </div>
            
            <div className="space-y-1 mt-2">
              {/* Recent Actions — shown when query is empty */}
            {!query && !initialContext && history.length > 0 && (
              <div className="mb-3">
                <div className="px-4 py-2 text-[10px] font-black text-navy/30 uppercase tracking-widest flex items-center gap-2">
                  <span>Recent</span>
                </div>
                <div className="space-y-1">
                  {history.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => { addToHistory(item); onNavigate(item.tab); onClose(); }}
                      className="w-full flex items-center gap-4 px-6 py-3 rounded-2xl hover:bg-amber-50 transition-all group"
                    >
                      <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-400 group-hover:text-white transition-all">
                        <item.icon size={16} />
                      </div>
                      <span className="flex-1 text-left text-sm font-bold text-navy/70 group-hover:text-navy">{item.label}</span>
                      <span className="text-[9px] font-black text-muted/40 uppercase tracking-widest">Recent</span>
                    </button>
                  ))}
                </div>
                <div className="mx-4 my-2 border-b border-border/50" />
              </div>
            )}

            {displayResults.length === 0 && query && (
                <div className="px-6 py-12 text-center text-muted/40 font-medium italic">
                  No matches found in this context.
                </div>
              )}

              {displayResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'command') {
                      addToHistory(item);
                      onNavigate(item.tab);
                    }
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-cream transition-all group"
                >
                  <div className="w-12 h-12 bg-navy/5 rounded-2xl flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-all shadow-sm">
                    <item.icon size={22} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[14px] font-bold text-navy group-hover:translate-x-1 transition-transform">{item.label}</div>
                    <div className="text-[10px] text-muted font-medium mt-0.5">{item.sub || item.description}</div>
                  </div>
                  {item.shortcut && (
                    <div className="px-3 py-1 bg-cream border border-border rounded-lg text-[9px] font-black text-muted group-hover:border-navy/20 transition-all">
                      {item.shortcut}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-cream/40 border-t border-border flex justify-between items-center">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-muted">
                <kbd className="px-1.5 py-0.5 bg-white border border-border rounded shadow-sm">↑↓</kbd> Navigate
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-muted">
                <kbd className="px-1.5 py-0.5 bg-white border border-border rounded shadow-sm">Enter</kbd> Select
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-muted">
                <kbd className="px-1.5 py-0.5 bg-white border border-border rounded shadow-sm">Esc</kbd> Close
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-[0.2em]">
              <ScanBarcode className="w-4 h-4" /> Sovereign Engine
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
