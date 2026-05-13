import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SovereignShellProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  isFullscreen?: boolean;
}

export const SovereignShell = ({ 
  title, 
  icon, 
  children, 
  headerActions, 
  footer, 
  className,
  isFullscreen = false
}: SovereignShellProps) => {
  return (
    <div className={cn(
      "flex flex-col bg-[#020617] overflow-hidden selection:bg-blue-500/30",
      isFullscreen ? "fixed inset-0 z-[999999] h-screen w-screen" : "h-full",
      className
    )}>
      {/* Background Mesh Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-600/10 blur-[100px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      {/* Header Area — High Gloss */}
      <div className="h-20 bg-[#0f172a]/60 border-b border-white/5 px-8 flex items-center justify-between shrink-0 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center shadow-2xl">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-[-0.05em] flex items-center gap-3">
              {title}
              <span className="text-[10px] font-black bg-blue-600 px-2 py-0.5 rounded-sm tracking-widest text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">PRO</span>
            </h2>
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mt-0.5">SMRITI-OS v3.0 · Institutional Core</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {headerActions}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden z-10">
        {children}
      </div>

      {/* Footer Area */}
      <div className="z-50">
        {footer}
      </div>
    </div>
  );
};
