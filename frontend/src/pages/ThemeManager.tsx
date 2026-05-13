import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  Image, 
  Check, 
  RotateCcw, 
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Save,
  CloudUpload
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ThemeManager: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState(2); // Default to HO Admin
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      {/* Control Sidebar */}
      <div className="w-80 bg-surface border border-outline-variant flex flex-col overflow-hidden">
        <div className="p-4 bg-surface-container border-b border-outline-variant">
           <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
             <Palette size={16} />
             Centralized Styling
           </h3>
        </div>

        {/* Level Selector */}
        <div className="grid grid-cols-3 border-b border-outline-variant bg-surface-container/30">
           {[1, 2, 3].map(lvl => (
             <button 
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={cn(
                "h-12 text-[10px] font-black uppercase tracking-widest border-r border-outline-variant last:border-r-0 transition-all",
                activeLevel === lvl ? "bg-primary text-white" : "hover:bg-surface-container text-outline"
              )}
             >
               LVL {lvl}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-8">
           {/* Section: Typography */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-outline">
                 <Type size={14} />
                 Typography
              </div>
              <div className="space-y-3">
                 <div className="p-4 bg-surface-container border border-primary/20 flex justify-between items-center cursor-pointer">
                    <div className="text-xs font-bold font-sans">Inter (Sans)</div>
                    <Check size={14} className="text-primary" />
                 </div>
                 <div className="p-4 bg-surface border border-outline-variant flex justify-between items-center opacity-50 cursor-pointer">
                    <div className="text-xs font-bold font-sans">Public Sans</div>
                 </div>
                 <div className="p-4 bg-surface border border-outline-variant flex justify-between items-center opacity-50 cursor-pointer">
                    <div className="text-xs font-bold font-mono">JetBrains Mono</div>
                 </div>
              </div>
           </div>

           {/* Section: Geometry */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-outline">
                 <Layout size={14} />
                 Geometry (Radius)
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <button className="h-10 bg-primary text-white text-[10px] font-black uppercase tracking-widest">Square (0px)</button>
                 <button className="h-10 border border-outline-variant text-outline text-[10px] font-black uppercase tracking-widest opacity-30 cursor-not-allowed">Modern (8px)</button>
              </div>
              <p className="text-[10px] italic text-outline/60">* Radius is locked by HO for Smriti OS Compliance.</p>
           </div>

           {/* Section: Branding */}
           <div className="space-y-4 pt-4 border-t border-outline-variant">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-outline">
                 <Image size={14} />
                 Institutional Assets
              </div>
              <div className="aspect-video bg-surface-container border border-dashed border-outline-variant flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-primary/5 hover:border-primary transition-all">
                 <CloudUpload size={24} className="text-outline/40 group-hover:text-primary" />
                 <span className="text-[9px] font-bold text-outline/60 uppercase">Upload Invoice Logo</span>
              </div>
           </div>
        </div>

        <div className="p-4 border-t border-outline-variant bg-surface-container">
           <button className="w-full h-12 bg-primary text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl">
             <Save size={16} />
             Pushed to All Stores
           </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col bg-[#020617] border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant bg-surface flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div className="h-8 px-4 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest flex items-center border border-primary/20">Live Preview</div>
              <span className="text-xs font-mono text-outline">Active Theme: SMITRI_TRANS_BLUE_V3</span>
           </div>
           
           <div className="flex bg-surface-container border border-outline-variant">
              <button 
                onClick={() => setPreviewDevice('desktop')}
                className={cn("w-10 h-10 flex items-center justify-center transition-colors", previewDevice === 'desktop' ? "bg-primary text-white" : "text-outline hover:bg-surface")}
              >
                <Monitor size={18} />
              </button>
              <button 
                onClick={() => setPreviewDevice('tablet')}
                className={cn("w-10 h-10 flex items-center justify-center border-x border-outline-variant transition-colors", previewDevice === 'tablet' ? "bg-primary text-white" : "text-outline hover:bg-surface")}
              >
                <Tablet size={18} />
              </button>
              <button 
                onClick={() => setPreviewDevice('mobile')}
                className={cn("w-10 h-10 flex items-center justify-center transition-colors", previewDevice === 'mobile' ? "bg-primary text-white" : "text-outline hover:bg-surface")}
              >
                <Smartphone size={18} />
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-auto p-12 flex items-center justify-center bg-grid-white/[0.02]">
           {/* Scaled Preview Frame */}
           <div className={cn(
             "bg-background border-4 border-surface shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-500 overflow-hidden",
             previewDevice === 'desktop' ? "w-full aspect-video" : previewDevice === 'tablet' ? "w-[600px] h-[800px]" : "w-[360px] h-[640px]"
           )}>
              {/* Mock App Interface */}
              <div className="h-full flex flex-col">
                 <div className="h-10 bg-primary flex items-center px-4 justify-between">
                    <span className="text-[10px] font-black text-white">SMRITI OS</span>
                    <div className="w-4 h-4 rounded-full bg-white/20"></div>
                 </div>
                 <div className="flex-1 flex">
                    <div className="w-12 bg-surface-container border-r border-outline-variant"></div>
                    <div className="flex-1 p-6 space-y-4">
                       <div className="h-8 bg-surface border border-outline-variant w-1/3"></div>
                       <div className="grid grid-cols-3 gap-4">
                          <div className="h-24 bg-surface border border-outline-variant"></div>
                          <div className="h-24 bg-surface border border-outline-variant"></div>
                          <div className="h-24 bg-surface border border-outline-variant"></div>
                       </div>
                       <div className="h-48 bg-surface border border-outline-variant"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="h-10 bg-surface border-t border-outline-variant flex items-center justify-center gap-8 text-[9px] font-black text-outline uppercase tracking-[0.4em]">
           <span>Sync Latency: 42ms</span>
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span>Broadcast Active</span>
        </div>
      </div>
    </div>
  );
};

export default ThemeManager;
