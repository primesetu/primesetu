import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SecurityOverrideResult } from '@/domain/connectivity/types';

interface SecurityOverrideProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<SecurityOverrideResult>;
  onSuccess: (result: SecurityOverrideResult) => void;
  correlationId: string;
}

export const SecurityOverride: React.FC<SecurityOverrideProps> = ({
  isOpen,
  onClose,
  onVerify,
  onSuccess,
  correlationId
}) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onVerify(pin);
      if (result.approved) {
        onSuccess(result);
        onClose();
      } else {
        setError('Invalid Manager PIN. Access Denied.');
        setPin('');
      }
    } catch (err: any) {
      setError(err.message || 'Verification system error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#1e293b] border border-white/10 p-8 rounded-3xl w-full max-w-[320px] shadow-2xl text-center space-y-6"
          >
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto border border-amber-500/20">
              <Lock size={28} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Security Override</h3>
              <p className="text-[10px] text-white/40 font-medium">Enter Manager PIN to switch node</p>
              <div className="text-[8px] text-white/10 font-mono">CID: {correlationId}</div>
            </div>

            <div className="space-y-4">
              <input 
                type="password"
                maxLength={4}
                value={pin}
                autoFocus
                disabled={isLoading}
                onChange={(e) => setPin(e.target.value)}
                className={cn(
                  "w-full h-14 bg-black/40 border rounded-2xl text-center text-2xl font-black tracking-[1em] text-white focus:outline-none transition-all",
                  error ? "border-red-500/50" : "border-white/10 focus:border-amber-500/50"
                )}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isLoading || pin.length < 4}
                className="flex-1 h-12 bg-amber-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-30 active:scale-95"
              >
                {isLoading ? 'Verifying...' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
