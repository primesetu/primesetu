import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FilePlus, ShoppingBag, List, Truck
} from 'lucide-react';
import POManager from './POManager';
import POForm from './POForm';
import GRNProcessor from './GRNProcessor';

export default function ProcurementModule() {
  const [activeTab, setActiveTab] = useState<'LIST' | 'PO' | 'GRN'>('LIST');
  
  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Header & Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-navy text-amber-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-md">Procurement Intelligence</div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <h1 className="text-5xl font-serif font-black text-text-primary uppercase tracking-tight">Purchase & GRN</h1>
          <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-3 flex items-center gap-2 italic">
            <Truck className="w-3.5 h-3.5 text-text-primary" /> Automated Stock Replenishment Active
          </p>
        </div>
        
        <div className="flex bg-navy/5 p-1.5 rounded-2xl border border-border/50 shadow-inner">
          {[
            { id: 'LIST', label: 'Order Registry', icon: List },
            { id: 'PO', label: 'New Order', icon: FilePlus },
            { id: 'GRN', label: 'Goods Receipt', icon: ShoppingBag }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-brand-navy text-white shadow-2xl scale-105' : 'text-text-secondary hover:text-text-primary hover:bg-bg-float'}`}
            >
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'LIST' && (
          <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <POManager />
          </motion.div>
        )}

        {activeTab === 'PO' && (
          <motion.div key="po" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <POForm />
          </motion.div>
        )}

        {activeTab === 'GRN' && (
          <motion.div key="grn" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <GRNProcessor />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




