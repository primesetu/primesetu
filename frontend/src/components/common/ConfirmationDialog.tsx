import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'info' | 'warning' | 'danger' | 'security';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}) => {
  const themes = {
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', btn: 'bg-blue-500 hover:bg-blue-600' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', btn: 'bg-amber-500 hover:bg-amber-600' },
    danger: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', btn: 'bg-red-500 hover:bg-red-600' },
    security: { icon: ShieldAlert, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', btn: 'bg-purple-500 hover:bg-purple-600' },
  };

  const theme = themes[variant];
  const Icon = theme.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "relative w-full max-w-[340px] bg-[#1e293b] border p-6 rounded-3xl shadow-2xl space-y-6",
              theme.border
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-2xl", theme.bg)}>
                <Icon size={24} className={theme.color} />
              </div>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-tight text-white leading-none">{title}</h3>
              <p className="text-xs text-white/40 font-medium leading-relaxed">{message}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={onClose}
                className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors border border-white/5 rounded-xl"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => { onConfirm(); onClose(); }}
                className={cn(
                  "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95",
                  theme.btn
                )}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
