import React from 'react';
import { CheckCircle2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeCardProps {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  status: 'online' | 'offline' | 'checking';
  isActive: boolean;
  onClick: () => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  id,
  label,
  desc,
  icon: Icon,
  status,
  isActive,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-2xl border text-left transition-all group flex items-center gap-4",
        isActive 
          ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/5" 
          : "bg-white/5 border-white/5 hover:border-white/20"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
        isActive ? "bg-primary text-white" : "bg-white/5 text-white/40 group-hover:text-white"
      )}>
        <Icon size={18} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-white">{label}</span>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-500",
            status === 'online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
            status === 'checking' ? "bg-amber-500 animate-pulse" : "bg-red-500"
          )} />
        </div>
        <p className="text-[9px] text-white/40 font-medium mt-0.5">{desc}</p>
      </div>
      
      {isActive && (
        <div className="flex flex-col items-end gap-1">
          <CheckCircle2 size={16} className="text-primary" />
          <span className="text-[7px] font-black text-primary/60 uppercase tracking-widest">Active</span>
        </div>
      )}
    </button>
  );
};
