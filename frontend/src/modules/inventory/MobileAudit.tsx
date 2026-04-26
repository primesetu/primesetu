/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * Mobile Handheld Audit (Warehouse Support)
 * Mobile-First Minimalist Scanning
 * ============================================================ */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  ArrowLeft, 
  X, 
  Zap,
  ChevronRight,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { formatCurrency } from '@/utils/currency';

export default function MobileAudit({ onBack }: { onBack: () => void }) {
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [lastScan, setLastScan] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the global scanner hook
  useBarcodeScanner((barcode) => {
    handleScan(barcode);
  });

  const handleScan = (barcode: string) => {
    // Mock lookup logic
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      code: barcode,
      name: `Product ${barcode.slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      price: 1299
    };
    
    setScannedItems(prev => [newItem, ...prev]);
    setLastScan(newItem);
    
    // Haptic feedback (if supported)
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    
    // Clear last scan notification after 3s
    setTimeout(() => setLastScan(null), 3000);
  };

  const handleCommit = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setScannedItems([]);
      alert('Institutional Audit Committed to Sovereign Ledger');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-navy z-[500] flex flex-col text-white font-sans">
      {/* ── MOBILE HEADER ── */}
      <div className="p-6 flex items-center justify-between border-b border-white/10 bg-navy/80 backdrop-blur-md sticky top-0">
         <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
         </button>
         <div className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold">Sovereign Mobile</span>
            <span className="text-sm font-black uppercase">Warehouse Audit</span>
         </div>
         <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* STATS STRIP */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Total Scanned</div>
              <div className="text-3xl font-black">{scannedItems.length}</div>
           </div>
           <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Sync Status</div>
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 <span className="text-xs font-black text-emerald-500 uppercase">Local Secure</span>
              </div>
           </div>
        </div>

        {/* RECENT SCAN NOTIFICATION */}
        <AnimatePresence>
          {lastScan && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-gold text-navy p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6"
            >
              <div className="w-12 h-12 bg-navy/10 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-50">Last Scan Successful</div>
                 <div className="text-lg font-black uppercase tracking-tight">{lastScan.code}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCAN LIST */}
        <div className="space-y-4">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20">Session History</h3>
              <button onClick={() => setScannedItems([])} className="text-[10px] font-black uppercase tracking-widest text-rose-400">Clear</button>
           </div>

           {scannedItems.length === 0 ? (
             <div className="py-20 flex flex-col items-center justify-center text-white/10 gap-4">
                <Package size={64} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting First Scan</span>
             </div>
           ) : (
             scannedItems.map((item, i) => (
               <motion.div 
                 key={item.id}
                 initial={{ x: -20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 className="bg-white/5 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between"
               >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/40">
                       <Zap size={18} />
                    </div>
                    <div>
                       <div className="text-sm font-black uppercase tracking-tight">{item.code}</div>
                       <div className="text-[9px] font-bold text-white/30 uppercase">{item.timestamp}</div>
                    </div>
                 </div>
                 <ChevronRight className="text-white/10 w-5 h-5" />
               </motion.div>
             ))
           )}
        </div>
      </div>

      {/* ── MOBILE FOOTER ACTIONS ── */}
      <div className="p-6 bg-navy/80 backdrop-blur-xl border-t border-white/10 grid grid-cols-1 gap-4">
         <button 
           onClick={handleCommit}
           disabled={scannedItems.length === 0 || isSyncing}
           className="w-full bg-brand-gold text-navy py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-20"
         >
           {isSyncing ? <RotateCcw className="animate-spin" /> : <ShieldCheck />}
           Commit Session
         </button>
         
         <div className="text-center">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Institutional Grade Warehouse Sync</p>
         </div>
      </div>

      {/* HIDDEN INPUT FOR KEYBOARD SCANNERS */}
      <input 
        ref={inputRef}
        type="text" 
        className="fixed -top-10 left-0 opacity-0 pointer-events-none" 
        autoFocus
        onBlur={() => inputRef.current?.focus()}
      />
    </div>
  );
}
