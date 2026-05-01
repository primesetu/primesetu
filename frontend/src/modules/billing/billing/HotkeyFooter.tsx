import React from 'react';
import type { HotkeyMask, HotkeyAction } from '@/types/billing.hotkeys';

interface Props {
  mask:      HotkeyMask[];
  cartEmpty: boolean;
  onAction:  (action: HotkeyAction) => void;
}

export const HotkeyFooter: React.FC<Props> = ({ mask, cartEmpty, onAction }) => {
  const visibleKeys = mask
    .filter(hk => hk.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="bg-slate-900 fixed bottom-0 left-0 w-full z-50 flex items-center h-10 border-t border-slate-700 divide-x divide-slate-700 overflow-x-auto whitespace-nowrap scrollbar-none">
      {visibleKeys.map(hk => {
        const isDisabled = hk.condition === 'cart_non_empty' && cartEmpty;
        return (
          <button
            key={hk.hotkey_id}
            disabled={isDisabled}
            onClick={() => !isDisabled && onAction(hk.action)}
            className={[
              'px-4 h-full flex items-center font-black text-[10px] tracking-widest uppercase transition-all active:scale-95',
              isDisabled
                ? 'text-slate-600 cursor-not-allowed opacity-50'
                : hk.variant === 'primary'
                  ? 'bg-secondary text-on-secondary hover:bg-secondary/90'
                  : hk.variant === 'danger'
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-slate-300 hover:bg-slate-800',
            ].join(' ')}
          >
            <span className="text-slate-500 mr-1.5 font-bold">{hk.key.toUpperCase()}:</span>
            {hk.label}
          </button>
        );
      })}

      <div className="flex-1 flex justify-end items-center px-4">
        <span className="text-slate-600 font-black text-[9px] tracking-widest uppercase opacity-40">
          © 2026 PrimeSetu · SMRITI-OS v7
        </span>
      </div>
    </footer>
  );
};
