import React from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  ArrowRightLeft, 
  ShieldCheck, 
  Database,
  Search,
  Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DICTIONARY_DATA = [
  {
    legacy: "AcceptDisplayDtls",
    sovereign: "SMRITI_AD",
    description: "Governs the layout, visibility, and masks of all UI fields across modules.",
    status: "Operational",
    type: "Metadata"
  },
  {
    legacy: "SysParam",
    sovereign: "SMRITI_PARAM",
    description: "The core rulebook for business logic, tax methods, and classification labels.",
    status: "Operational",
    type: "Configuration"
  },
  {
    legacy: "Genlookup",
    sovereign: "SMRITI_LOOKUP",
    description: "A unified dictionary of categorical data (Brands, Products, Articles, etc.)",
    status: "Live Sync",
    type: "Dictionary"
  },
  {
    legacy: "ItemMaster",
    sovereign: "SMRITI_ITEM",
    description: "Master product registry with HSN, Tax Analysis, and Pricing attributes.",
    status: "Master",
    type: "Data"
  },
  {
    legacy: "StockMaster",
    sovereign: "SMRITI_STOCK",
    description: "Real-time stock ledger reflecting current balances across all SKUs.",
    status: "Transaction",
    type: "Data"
  },
  {
    legacy: "Class12Combo",
    sovereign: "SMRITI_COMBO",
    description: "Validation gate for item classification combinations (Product + Brand).",
    status: "Validator",
    type: "Rules"
  },
  {
    legacy: "GenlookupExtd",
    sovereign: "SMRITI_LOOKUP_MAP",
    description: "Maps legacy RecIDs to human-readable categories for dynamic UI generation.",
    status: "Operational",
    type: "Mapping"
  },
  {
    legacy: "Personnel",
    sovereign: "SMRITI_STAFF",
    description: "Master registry of sales personnel, cashiers, and administrative staff.",
    status: "Master",
    type: "Data"
  },
  {
    legacy: "POSPayModes",
    sovereign: "SMRITI_PAY_MODE",
    description: "Defines accepted payment methods (Cash, Card, UPI, etc.) and their rules.",
    status: "Operational",
    type: "Financial"
  },
  {
    legacy: "PrefixTrnNo",
    sovereign: "SMRITI_DOCNO",
    description: "Manages the sequential numbering and prefixes for all store documents.",
    status: "Operational",
    type: "System"
  },
  {
    legacy: "StkTrnHdr / Dtl",
    sovereign: "SMRITI_SALE_HDR / DTL",
    description: "Finalized transaction registry for audit, analytics, and accounting exports.",
    status: "Registry",
    type: "Transaction"
  }
];

const LegacyDictionary: React.FC = () => {
  return (
    <div className="h-full bg-surface p-12 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">
              <Book className="w-3 h-3" />
              Sovereign Lexicon
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Architect's Dictionary</h1>
            <p className="text-on-surface-variant font-medium text-lg">Translation of Legacy Shoper9 Structures to SMRITI-OS Sovereign Identities.</p>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Version Control</span>
            <span className="text-sm font-black text-primary">v2.4 (Interoperability Build)</span>
          </div>
        </div>

        {/* SEARCH BAR (Visual Only for now) */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant opacity-40" />
          <input 
            type="text" 
            placeholder="SEARCH TABLES OR LOGIC..."
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 pl-12 text-xs font-black tracking-widest focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* MAPPING GRID */}
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-12 px-6 py-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 border-b border-outline-variant/20">
            <div className="col-span-3">Legacy (Shoper9)</div>
            <div className="col-span-1 flex justify-center"><ArrowRightLeft className="w-3 h-3" /></div>
            <div className="col-span-3">Sovereign (SMRITI-OS)</div>
            <div className="col-span-3">Purpose & Logic</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {DICTIONARY_DATA.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="grid grid-cols-12 items-center px-6 py-6 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl hover:border-primary/50 transition-all group"
            >
              {/* LEGACY */}
              <div className="col-span-3">
                <span className="text-xs font-black text-red-500/80 tracking-tight uppercase">{item.legacy}</span>
                <div className="flex items-center gap-1 mt-1 opacity-40">
                  <Database className="w-2 h-2" />
                  <span className="text-[8px] font-bold">SQL_DBA_X01</span>
                </div>
              </div>

              {/* ARROW */}
              <div className="col-span-1 flex justify-center">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors shadow-inner">
                  <ArrowRightLeft className="w-3 h-3" />
                </div>
              </div>

              {/* SOVEREIGN */}
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-primary tracking-tighter uppercase">{item.sovereign}</span>
                  <div className="px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-black text-primary border border-primary/20">
                    {item.type}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1 opacity-40">
                  <Code2 className="w-2 h-2" />
                  <span className="text-[8px] font-bold tracking-widest">PUBLIC_SCHEMA</span>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="col-span-3 pr-4">
                <p className="text-[10px] font-bold text-on-surface-variant leading-relaxed italic">
                  "{item.description}"
                </p>
              </div>

              {/* STATUS */}
              <div className="col-span-2 flex justify-end items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FOOTER QUOTE */}
        <div className="mt-12 flex items-center justify-center gap-4 py-8 border-t border-outline-variant/20 opacity-20">
          <ShieldCheck className="w-5 h-5" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">The Code is the Law . Data is Sovereign</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LegacyDictionary;
