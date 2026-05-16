import React, { forwardRef } from 'react';
import { Search, Zap } from 'lucide-react';
import { Input } from '@/components/ui/SovereignUI';
import { cn } from '@/lib/utils';

interface ProductSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onBarcodeScan?: (barcode: string) => void;
  isProcessing?: boolean;
}

/**
 * [RULE R4-B] ProductSearch implements forwardRef to allow the 
 * parent Billing Orchestrator to maintain focus control during scanning.
 */
export const ProductSearch = forwardRef<HTMLInputElement, ProductSearchProps>(
  ({ className, onBarcodeScan, isProcessing, ...props }, ref) => {
    return (
      <div className={cn("relative group w-full", className)}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          {isProcessing ? (
            <Zap size={16} className="text-[var(--gold)] animate-pulse" />
          ) : (
            <Search size={16} className="text-slate-500 group-focus-within:text-[var(--gold)] transition-colors" />
          )}
        </div>
        <Input
          ref={ref}
          type="text"
          className={cn(
            "pl-12 pr-4 h-14 bg-[#0f172a]/50 border-white/5 focus:border-[var(--gold)]/50",
            "text-lg font-mono font-black placeholder:text-slate-600 uppercase tracking-widest",
            "transition-all duration-200"
          )}
          placeholder="SCAN BARCODE OR SEARCH ITEM (F2)..."
          {...props}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
          <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-black text-slate-500 uppercase">
            Auto-Focus Active
          </kbd>
        </div>
      </div>
    );
  }
);

ProductSearch.displayName = 'ProductSearch';
