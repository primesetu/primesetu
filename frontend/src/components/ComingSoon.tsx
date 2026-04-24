/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Construction, ShieldAlert } from 'lucide-react';

export default function ComingSoon({ moduleName }: { moduleName: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 mb-8 shadow-xl shadow-amber-500/10 border border-amber-200"
      >
        <Zap className="w-12 h-12 fill-amber-500" />
      </motion.div>
      
      <h2 className="text-3xl font-serif font-black text-navy mb-4">
        {moduleName}
      </h2>
      
      <div className="flex items-center gap-2 bg-navy text-gold px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
        <Construction className="w-3.5 h-3.5" /> Under Sovereign Construction
      </div>
      
      <p className="max-w-md text-gray-500 text-sm font-bold leading-relaxed mb-8">
        This module is currently being calibrated for institutional parity. 
        The Sovereign Bridge for <span className="text-navy">{moduleName}</span> will be active in the next release cycle.
      </p>

      <div className="flex items-center gap-3 text-muted">
        <ShieldAlert className="w-4 h-4" />
        <span className="text-[9px] font-black uppercase tracking-widest">Phase 4 Roadmap · AITDL Network</span>
      </div>
    </div>
  );
}
