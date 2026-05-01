import React from 'react';
import { ShieldAlert, Lock, X } from 'lucide-react';
import type { OverrideRequest, PermissionMask } from '@/types/billing.permissions';

const ACTION_LABELS: Record<string, string> = {
  discount_exceeds_limit:  'Discount Exceeds Authorised Limit',
  void_bill:               'Void Entire Bill',
  void_line:               'Void Line Item',
  price_override:          'Manual Price Override',
  credit_bill:             'Credit Transaction Approval',
  reopen_closed_bill:      'Reopen Settled Bill',
  suspend_with_discount:   'Suspend Bill with Active Discount',
};

const ROLE_LABELS: Record<string, string> = {
  manager:    'Store Manager',
  owner:      'Owner / Director',
  supervisor: 'Supervisor',
};

interface Props {
  request:       OverrideRequest;
  permMask:      PermissionMask[];
  pin:           string;
  onPinChange:   (val: string) => void;
  onSubmit:      () => void;
  onCancel:      () => void;
  isValidating:  boolean;
  pinError:      string;
  pinInputRef:   React.RefObject<HTMLInputElement>;
}

export const OverrideModal: React.FC<Props> = ({
  request, permMask, pin, onPinChange, onSubmit, onCancel,
  isValidating, pinError, pinInputRef,
}) => {
  const mask = permMask.find(p => p.action === request.action);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[400px] bg-white border border-outline-variant rounded-lg overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-red-700 px-4 py-3 flex items-center gap-3">
          <ShieldAlert size={18} className="text-white shrink-0" />
          <div className="flex-1">
            <div className="text-white font-black text-[13px] uppercase tracking-widest">
              Manager Override Required
            </div>
            <div className="text-red-200 text-[10px] font-bold uppercase tracking-wide mt-0.5">
              {ACTION_LABELS[request.action] ?? request.action}
            </div>
          </div>
          <button onClick={onCancel} className="text-red-200 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Context */}
        {Object.keys(request.context).length > 0 && (
          <div className="bg-red-50 border-b border-red-100 px-4 py-2">
            <div className="text-[10px] font-black uppercase text-red-700 mb-1.5 tracking-wide">Action Context</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(request.context).map(([k, v]) => (
                <div key={k} className="flex gap-1.5 items-center">
                  <span className="text-[9px] font-black uppercase text-red-400">{k}:</span>
                  <span className="text-[11px] font-black text-red-800 font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIN Entry */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={13} className="text-slate-500" />
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wide">
              {mask ? ROLE_LABELS[mask.pin_role] : 'Authorised User'} PIN Required
            </span>
          </div>

          <input
            ref={pinInputRef}
            type="password"
            inputMode="numeric"
            maxLength={8}
            className={[
              'w-full h-12 text-center text-[20px] font-black tracking-[0.5em] rounded border-2 outline-none transition-all font-mono',
              pinError
                ? 'border-red-400 bg-red-50 text-red-700'
                : 'border-slate-200 bg-slate-50 focus:border-primary',
            ].join(' ')}
            placeholder="••••"
            value={pin}
            onChange={e => onPinChange(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && !isValidating && pin.length >= 4 && onSubmit()}
          />

          {pinError && (
            <div className="mt-2 text-[11px] font-bold text-red-600 text-center">{pinError}</div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={onCancel}
              className="flex-1 h-10 border border-slate-200 rounded font-black text-[11px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel [Esc]
            </button>
            <button
              disabled={pin.length < 4 || isValidating}
              onClick={onSubmit}
              className="flex-1 h-10 bg-red-700 text-white rounded font-black text-[11px] uppercase tracking-widest hover:bg-red-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isValidating ? 'Validating...' : 'Authorise [Enter]'}
            </button>
          </div>
        </div>

        {/* Audit notice */}
        {mask?.log_to_audit && (
          <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 text-center">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
              This action will be recorded in the audit log
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
