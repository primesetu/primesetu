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
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

import { ICON_MAP } from '../lib/ModuleRegistry';
import { fetchMenu, MenuItem } from '../api/menuService';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export default function CommandBar({ isOpen, onClose, onNavigate }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [commands, setCommands] = useState<any[]>([]);

  useEffect(() => {
    // Flatten recursive menu into a searchable list
    fetchMenu().then(menu => {
      const flattened: any[] = [];
      const traverse = (items: MenuItem[]) => {
        items.forEach(item => {
          flattened.push({
            id: item.id,
            label: item.label,
            icon: ICON_MAP[item.id] || ICON_MAP['dashboard'],
            shortcut: item.shortcut || '',
            tab: item.id,
            description: `Jump to ${item.label}`
          });
          if (item.children) traverse(item.children);
        });
      };
      traverse(menu);
      setCommands(flattened);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isOpen]); // Re-fetch on open to ensure cache sync

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
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
          {/* Search Input */}
          <div className="p-8 border-b border-border flex items-center gap-4">
            <Search className="w-6 h-6 text-navy" />
            <input 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search for a bill number..."
              className="flex-1 bg-transparent border-none outline-none text-xl font-serif font-black text-navy placeholder:text-muted/40"
            />
            <button onClick={onClose} className="p-2 hover:bg-cream rounded-full transition-all">
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          {/* Results */}
          <div className="p-4 max-h-[400px] overflow-y-auto">
            <div className="px-4 py-2 text-[10px] font-black text-navy/40 uppercase tracking-widest">Quick Navigation</div>
            <div className="space-y-1 mt-2">
              {commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())).map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onNavigate(cmd.tab);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-cream transition-all group"
                >
                  <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center text-navy group-hover:bg-navy group-hover:text-white transition-all">
                    <cmd.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-navy">{cmd.label}</div>
                    <div className="text-[10px] text-muted font-medium">{cmd.description}</div>
                  </div>
                  <div className="px-3 py-1 bg-cream border border-border rounded-lg text-[9px] font-black text-muted group-hover:border-navy/20 transition-all">
                    {cmd.shortcut}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-cream/50 border-t border-border flex justify-between items-center">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-muted"><span className="px-1.5 py-0.5 bg-white border border-border rounded">↑↓</span> to navigate</span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-muted"><span className="px-1.5 py-0.5 bg-white border border-border rounded">Enter</span> to select</span>
            </div>
            <div className="text-[10px] font-black text-gold uppercase tracking-widest">Sovereign Command Bar</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
