import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ValidationResult } from '@/types/billing.validation';

interface Props {
  results:   ValidationResult[];
  onDismiss: (rule_id: string) => void;
}

const TIER_CONFIG = {
  error: {
    wrapper: 'bg-red-50 border-red-300 text-red-800',
    icon:    <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />,
  },
  warn: {
    wrapper: 'bg-amber-50 border-amber-300 text-amber-800',
    icon:    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />,
  },
  info: {
    wrapper: 'bg-blue-50 border-blue-300 text-blue-800',
    icon:    <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />,
  },
};

export const ValidationBanner: React.FC<Props> = ({ results, onDismiss }) => {
  if (results.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 px-2 pt-1 shrink-0">
      {results.map(r => {
        const config = TIER_CONFIG[r.severity];
        return (
          <div
            key={r.rule_id}
            className={`flex items-start gap-2 border rounded px-3 py-1.5 text-[11px] font-bold ${config.wrapper}`}
          >
            {config.icon}
            <span className="flex-1 leading-snug">{r.message}</span>
            {!r.block && (
              <button
                onClick={() => onDismiss(r.rule_id)}
                className="opacity-50 hover:opacity-100 transition-opacity ml-1"
              >
                <X size={12} />
              </button>
            )}
            {r.block && (
              <span className="text-[9px] font-black uppercase opacity-60 tracking-widest shrink-0">
                BLOCKED
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
