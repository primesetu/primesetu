import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/SovereignUI';
import { CartItem } from '@/modules/billing/stores/useCartStore';

interface CartRowProps {
  item: CartItem;
  index: number;
  onRemove: (stockno: string) => void;
  onQtyChange: (stockno: string, qty: number) => void;
}

/**
 * [RULE R5-C] CartRow uses React.memo and explicit displayName for performance auditing.
 * [RULE R6-A] Strictly binds to Shoper9 legacy field names (stockno, itemdesc, retail_price).
 */
export const CartRow = memo(({ item, onRemove, onQtyChange }: CartRowProps) => {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-white uppercase truncate tracking-tight">
          {item.itemdesc}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] font-mono font-black text-[var(--gold)] bg-[var(--gold)]/10 px-1.5 py-0.5 rounded">
            {item.stockno}
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase">
             PRICE: ₹{item.retail_price.toFixed(2)}
          </span>
          {item.brand && (
            <span className="text-[9px] font-bold text-slate-600 uppercase">
              [{item.brand}]
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="number"
          value={item.quantity}
          onChange={(e) => onQtyChange(item.stockno, parseFloat(e.target.value))}
          className="w-16 h-8 bg-black/40 border border-white/10 rounded text-center text-xs font-mono font-black text-white focus:outline-none focus:border-[var(--gold)]/50"
        />
      </div>

      <div className="w-32 text-right">
        <div className="text-[14px] font-mono font-black text-white">
          ₹{(item.retail_price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onRemove(item.stockno)}
        className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-slate-500 hover:text-red-500 transition-all"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
});

CartRow.displayName = 'CartRow';
