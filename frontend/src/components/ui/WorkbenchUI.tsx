import React from 'react';
import { cn } from './SovereignUI';
import { LucideIcon } from 'lucide-react';

// ── SHARED WORKBENCH COMPONENTS ──

export const WorkbenchRibbon = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] p-2 flex items-center justify-between shadow-sm z-30", className)}>
    {children}
  </div>
);

export const RibbonGroup = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("px-4 border-r border-[var(--border-subtle)] last:border-r-0 flex flex-col items-center gap-1", className)}>
    <div className="flex items-center gap-1.5 h-10">
      {children}
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] opacity-60">
      {label}
    </span>
  </div>
);

export const RibbonButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled, 
  variant = 'ghost', 
  active,
  shortcut
}: { 
  icon: LucideIcon; 
  label: string; 
  onClick?: () => void; 
  disabled?: boolean; 
  variant?: 'ghost' | 'primary' | 'danger' | 'warning';
  active?: boolean;
  shortcut?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={shortcut ? `${label} [${shortcut}]` : label}
    className={cn(
      "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all group min-w-[56px] relative",
      variant === 'ghost' && "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--primary)]",
      variant === 'primary' && "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
      variant === 'danger' && "text-error hover:bg-error/10",
      variant === 'warning' && "text-warning hover:bg-warning/10",
      active && "bg-[var(--primary)]/10 text-[var(--primary)]",
      disabled && "opacity-30 cursor-not-allowed filter grayscale"
    )}
  >
    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-bold uppercase tracking-tight leading-none">{label}</span>
  </button>
);

export const GridCell = ({ 
  value, 
  onChange, 
  type = 'text', 
  active, 
  modified, 
  error,
  disabled
}: { 
  value: any; 
  onChange?: (val: any) => void; 
  type?: 'text' | 'number' | 'date'; 
  active?: boolean; 
  modified?: boolean; 
  error?: string;
  disabled?: boolean;
}) => (
  <div className={cn(
    "h-full w-full border-r border-b border-[var(--border-subtle)] flex items-center px-3 text-sm font-medium transition-all relative group",
    active ? "ring-2 ring-inset ring-[var(--primary)] bg-white z-10" : "bg-transparent",
    modified && !active && "bg-amber-500/5",
    disabled && "bg-[var(--surface)] text-[var(--text-tertiary)] opacity-60 cursor-not-allowed"
  )}>
    {active && !disabled ? (
      <input
        autoFocus
        type={type === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) => onChange?.(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        className="w-full bg-transparent outline-none border-none text-sm font-bold text-[var(--primary)]"
      />
    ) : (
      <span className="truncate">{value ?? '-'}</span>
    )}
    {modified && !active && (
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-t-amber-500 border-l-[6px] border-l-transparent" />
    )}
  </div>
);
