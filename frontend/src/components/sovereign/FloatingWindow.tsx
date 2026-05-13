import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Square, Copy, Maximize2, ExternalLink } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';
import { cn } from '@/lib/utils';

interface FloatingWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  zIndex: number;
  isActive: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  id, title, children, zIndex, isActive, isMaximized, x, y, width, height
}) => {
  const { closeWindow, focusWindow, toggleMaximize, updateWindow } = useWindowStore();

  const handleExternalize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const type = id.split('-')[0];
    const url = window.location.origin + `?tab=${type}&popout=true`;
    window.open(url, '_blank', 'width=1200,height=800');
    closeWindow(id);
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      onDragStart={() => focusWindow(id)}
      onDragEnd={(_, info) => {
        updateWindow(id, { x: x + info.offset.x, y: y + info.offset.y });
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: isMaximized ? 0 : x,
        y: isMaximized ? 0 : y,
        width: isMaximized ? '100vw' : width,
        height: isMaximized ? '100vh' : height,
        zIndex
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        "absolute bg-[#0f172a] border flex flex-col overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.7)]",
        isActive ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-white/10",
        isMaximized ? "inset-0 rounded-none z-[9999]" : "rounded-2xl"
      )}
      onClick={() => focusWindow(id)}
    >
      {/* ── Fixed Window Header (Absolute to prevent overlap) ── */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 h-11 z-[100] flex items-center justify-between px-4 border-b border-white/10 select-none cursor-grab active:cursor-grabbing",
          isActive ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-800 text-white/40"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-white animate-pulse" : "bg-white/20")} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate">{title}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button onClick={toggleFullScreen} className="p-1.5 hover:bg-white/10 rounded-md transition-colors" title="Full Screen">
            <Maximize2 size={14} />
          </button>
          <button onClick={handleExternalize} className="p-1.5 hover:bg-white/10 rounded-md transition-colors mr-2" title="External Window">
            <ExternalLink size={14} />
          </button>
          
          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
            {isMaximized ? <Copy size={14} /> : <Square size={14} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); closeWindow(id); }} className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md transition-colors">
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* ── Window Content Area (With Top Padding for Header) ── */}
      <div className="flex-1 mt-11 overflow-auto relative bg-[#020617] custom-scrollbar">
        {children}
      </div>

      {/* ── Resize Handle (Bottom Right) ── */}
      {!isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-6 h-6 z-[101] cursor-nwse-resize flex items-end justify-end p-1 group"
          onMouseDown={(e) => {
            e.stopPropagation();
            // Basic manual resize logic could go here, but for now we rely on content or future enhancement
          }}
        >
          <div className="w-2 h-2 border-r-2 border-b-2 border-white/20 group-hover:border-indigo-500 transition-colors" />
        </div>
      )}
    </motion.div>
  );
};
