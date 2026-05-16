import React from 'react';
import { useCartStore } from '@/modules/billing/stores/useCartStore';
import { CartRow } from './CartRow';

/**
 * [RULE R5-C] CartTable uses selector-based subscriptions to prevent 
 * rerenders from unrelated store state changes.
 */
export const CartTable = () => {
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-white/5 rounded-2xl m-4">
        <div className="text-4xl mb-4">🛒</div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em]">Sovereign Cart Empty</div>
        <div className="text-[8px] font-mono mt-2 text-slate-500">READY FOR SCANNING...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f172a]/40 rounded-2xl border border-white/5 overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
        <div className="flex-1">Description / Code</div>
        <div className="w-16 text-center">Qty</div>
        <div className="w-32 text-right">Extension</div>
        <div className="w-8"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {items.map((item, index) => (
          <CartRow 
            key={item.stockno} 
            item={item} 
            index={index}
            onRemove={removeItem}
            onQtyChange={updateQuantity}
          />
        ))}
      </div>
    </div>
  );
};

CartTable.displayName = 'CartTable';
