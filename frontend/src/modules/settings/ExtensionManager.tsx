import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Settings2
} from 'lucide-react';

interface Extension {
  id: string;
  code: string;
  label: string;
  is_active: boolean;
  meta: Record<string, any> | null;
}

const AVAILABLE_EXTENSIONS = [
  {
    code: 'max_txn_value',
    label: 'High-Value Transaction Lock',
    description: 'Intercepts and blocks any transaction exceeding the configured safe threshold.',
    icon: AlertCircle,
    color: 'text-brand-saffron',
    defaultMeta: { max_value_paise: 5000000 } // 50k INR
  },
  {
    code: 'prevent_negative_stock',
    label: 'Zero-Stock Override Prevention',
    description: 'Strict enforcement blocking any sales when inventory falls to zero.',
    icon: ShieldCheck,
    color: 'text-brand-gold',
    defaultMeta: {}
  },
  {
    code: 'require_salesperson',
    label: 'Mandatory Sales Agent Tracking',
    description: 'Forces selection of a sales agent before finalizing a bill.',
    icon: Zap,
    color: 'text-brand-cream',
    defaultMeta: {}
  }
];

import { useTheme } from '@/hooks/useTheme';

export default function ExtensionManager() {
  const { accent, setAccent, theme, setTheme } = useTheme();
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExtensions();
  }, []);

  const fetchExtensions = async () => {
    try {
      // For real app:
      // const res = await api.get('/api/v1/extensions');
      // setExtensions(res.data);
      // Simulating API for UI demonstration
      setTimeout(() => {
        setExtensions([
          { id: '1', code: 'max_txn_value', label: 'High-Value Transaction Lock', is_active: true, meta: { max_value_paise: 5000000 } }
        ]);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const toggleExtension = async (code: string, currentStatus: boolean, meta: any) => {
    try {
      // Optimistic update
      setExtensions(prev => {
        const exists = prev.find(e => e.code === code);
        if (exists) {
          return prev.map(e => e.code === code ? { ...e, is_active: !currentStatus } : e);
        }
        return [...prev, { id: 'temp', code, label: code, is_active: true, meta }];
      });

      // API Call
      // await api.post('/api/v1/extensions', [{ code, is_active: !currentStatus, meta }]);
    } catch (err) {
      console.error(err);
      // Revert on failure
      fetchExtensions();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-t-2 border-brand-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans selection:bg-brand-gold/30">
      
      {/* Header - Tesla Style Minimalist */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mb-12 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-light tracking-tight text-white mb-2 flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-brand-gold" />
            Core DNA Extensions
          </h1>
          <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
            Sovereign OS // Interception Engine Configuration
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Mode */}
          <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50">
            {(['tesla', 'shoper9'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                title={t === 'tesla' ? 'Tesla Design Mode' : 'Classic Shoper 9 Mode'}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === t
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'tesla' ? '⚡ Tesla' : '🖥 Shoper 9'}
              </button>
            ))}
          </div>
          {/* Accent (only in Tesla mode) */}
          {theme === 'tesla' && (
            <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50">
              {([
                { id: 'default', label: '🟠', title: 'Saffron (Default)' },
                { id: 'gold',    label: '🟡', title: 'Gold' },
                { id: 'cream',   label: '🟤', title: 'Cream' },
                { id: 'crimson', label: '🔴', title: 'Crimson' },
              ] as const).map(a => (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  title={a.title}
                  className={`w-9 h-9 rounded-lg text-base transition-all ${
                    accent === a.id
                      ? 'bg-slate-800 shadow-md scale-110'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Grid of Extensions */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_EXTENSIONS.map((ext, idx) => {
          const dbData = extensions.find(e => e.code === ext.code);
          const isActive = dbData ? dbData.is_active : false;
          
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={ext.code}
              className={`
                relative overflow-hidden rounded-2xl p-6 transition-all duration-500 ease-out
                backdrop-blur-xl border border-slate-800/50
                ${isActive 
                  ? 'bg-slate-900/60 shadow-[0_0_30px_-10px_rgba(255,215,0,0.15)] shadow-brand-gold/10' 
                  : 'bg-slate-900/30 grayscale hover:grayscale-0'}
              `}
            >
              {/* Glass Reflection Highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 ${isActive ? ext.color : 'text-slate-500'}`}>
                  <ext.icon className="w-6 h-6" />
                </div>
                
                <button 
                  onClick={() => toggleExtension(ext.code, isActive, ext.defaultMeta)}
                  className="focus:outline-none transition-transform active:scale-90"
                >
                  {isActive ? (
                    <ToggleRight className="w-10 h-10 text-brand-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-slate-600" />
                  )}
                </button>
              </div>

              <h3 className="text-lg font-medium text-white mb-2 tracking-wide">
                {ext.label}
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-6 h-14">
                {ext.description}
              </p>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                <span className="relative flex h-2.5 w-2.5">
                  {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-40"></span>}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isActive ? 'bg-brand-gold shadow-[0_0_8px_#ffd700]' : 'bg-slate-700'}`}></span>
                </span>
                <span className={`text-xs font-mono uppercase tracking-wider ${isActive ? 'text-brand-gold' : 'text-slate-500'}`}>
                  {isActive ? 'Engine Active' : 'Offline'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
