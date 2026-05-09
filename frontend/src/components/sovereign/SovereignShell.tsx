import React from 'react';
import { cn } from '@/lib/utils';

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
      "flex flex-col bg-[var(--background)] overflow-hidden border border-[var(--border-subtle)]",
      isFullscreen ? "fixed inset-0 z-[999999] h-screen w-screen" : "h-full",
      className
    )}>
      {/* Header Area */}
      <div className="h-20 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          {icon}
          <div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter flex items-center gap-3">
              {title}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {headerActions}
        </div>
      </div>

      {/* Main Content Area (Scroll Fix built-in) */}
      <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden bg-[var(--background-alt)]">
        {children}
      </div>

      {/* Footer Area */}
      {footer}
    </div>
  );
};
