import React from 'react';
import {
  Palette,
  Type,
  Layout,
  Image,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  Save,
  CloudUpload,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { SmritiTheme } from '@/lib/ThemeEngine';

const LEVEL_LABELS: Record<number, string> = { 1: 'Store', 2: 'HO Admin', 3: 'Super Admin' };

const ThemeManager: React.FC = () => {
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    themes,
    themeMeta,
    isInstitutional,
  } = useTheme();

  const [activeLevel, setActiveLevel] = React.useState(2);
  const [previewDevice, setPreviewDevice] = React.useState<'desktop' | 'mobile' | 'tablet'>('desktop');

  const handleThemeSelect = (t: SmritiTheme) => setTheme(t);

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      {/* ── Control Sidebar ── */}
      <div className="w-80 bg-surface border border-outline-variant flex flex-col overflow-hidden">
        <div className="p-4 bg-surface-container border-b border-outline-variant">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Palette size={16} />
            Centralized Styling
          </h3>
          <p className="text-[10px] text-outline mt-1 font-mono">
            Active: <span className="text-primary font-black">{theme}</span>
          </p>
        </div>

        {/* Admin Level Selector */}
        <div className="grid grid-cols-3 border-b border-outline-variant bg-surface-container/30">
          {[1, 2, 3].map(lvl => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={cn(
                'h-12 text-[10px] font-black uppercase tracking-widest border-r border-outline-variant last:border-r-0 transition-all',
                activeLevel === lvl ? 'bg-primary text-white' : 'hover:bg-surface-container text-outline'
              )}
            >
              {LEVEL_LABELS[lvl]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-8">
          {/* Section: Theme Presets */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-outline">
              <Palette size={14} />
              Theme Presets
            </div>
            <div className="space-y-2">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleThemeSelect(t.id as SmritiTheme)}
                  className={cn(
                    'w-full p-3 border flex justify-between items-center transition-all text-left',
                    theme === t.id
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-surface border-outline-variant text-on-surface hover:bg-surface-container'
                  )}
                >
                  <div>
                    <div className="text-[11px] font-black uppercase">{t.label}</div>
                    <div className="text-[10px] opacity-60 font-mono">{t.mode} mode</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: t.accent }} />
                    {theme === t.id && <Check size={14} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Accent Colour */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-outline">
              <Type size={14} />
              Accent Override
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 border border-outline-variant cursor-pointer"
                style={{ background: accent }}
              />
              <input
                type="color"
                value={accent}
                onChange={e => setAccent(e.target.value)}
                className="flex-1 h-10 cursor-pointer bg-surface border border-outline-variant px-2"
              />
            </div>
            <p className="text-[10px] italic text-outline/60">
              Accent override is per-device and does not override HO theme presets.
            </p>
          </div>

          {/* Section: Geometry */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-outline">
              <Layout size={14} />
              Geometry (Radius)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="h-10 bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                Square (0px)
              </button>
              <button className="h-10 border border-outline-variant text-outline text-[10px] font-black uppercase tracking-widest opacity-30 cursor-not-allowed" disabled>
                Modern (8px)
              </button>
            </div>
            <p className="text-[10px] italic text-outline/60">
              * Radius locked by HO for Smriti OS Compliance.
            </p>
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

        {/* Push Button */}
        <div className="p-4 border-t border-outline-variant bg-surface-container">
          <div className="text-[9px] text-outline mb-2 font-mono text-center uppercase tracking-widest">
            Mode: {isInstitutional ? '☀ Institutional Light' : '🌑 Sovereign Dark'}
          </div>
          <button className="w-full h-12 bg-primary text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl">
            <Save size={16} />
            Push to All Stores
          </button>
        </div>
      </div>

      {/* ── Live Preview Area ── */}
      <div className="flex-1 flex flex-col bg-[#020617] border border-outline-variant overflow-hidden">
        {/* Preview Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-8 px-4 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest flex items-center border border-primary/20">
              Live Preview
            </div>
            <span className="text-xs font-mono text-outline">
              Theme: {themeMeta?.label ?? theme}
            </span>
          </div>

          {/* Device Switcher */}
          <div className="flex bg-surface-container border border-outline-variant">
            {(['desktop', 'tablet', 'mobile'] as const).map((device, i) => {
              const Icon = device === 'desktop' ? Monitor : device === 'tablet' ? Tablet : Smartphone;
              return (
                <button
                  key={device}
                  onClick={() => setPreviewDevice(device)}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center transition-colors',
                    i === 1 && 'border-x border-outline-variant',
                    previewDevice === device ? 'bg-primary text-white' : 'text-outline hover:bg-surface'
                  )}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 overflow-auto p-12 flex items-center justify-center bg-grid-white/[0.02]">
          <div className={cn(
            'bg-background border-4 border-surface shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-500 overflow-hidden',
            previewDevice === 'desktop' ? 'w-full aspect-video' :
            previewDevice === 'tablet' ? 'w-[600px] h-[800px]' :
            'w-[360px] h-[640px]'
          )}>
            {/* Mock App Shell */}
            <div className="h-full flex flex-col">
              <div className="h-10 bg-primary flex items-center px-4 justify-between">
                <span className="text-[10px] font-black text-white uppercase">Smriti OS</span>
                <div className="flex items-center gap-2">
                  {isInstitutional ? <Sun size={12} className="text-white/70" /> : <Moon size={12} className="text-white/70" />}
                  <div className="w-4 h-4 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className="w-12 bg-surface-container border-r border-outline-variant flex flex-col items-center gap-3 py-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={cn('w-7 h-7 rounded-sm', i === 1 ? 'bg-primary' : 'bg-outline/20')} />
                  ))}
                </div>
                <div className="flex-1 p-6 space-y-4 bg-background">
                  <div className="h-8 bg-surface border border-outline-variant w-1/3" />
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-surface border border-outline-variant p-3 flex flex-col justify-end">
                        <div className="h-2 w-1/2 bg-primary/40 rounded-sm" />
                        <div className="h-1 w-3/4 bg-outline/20 rounded-sm mt-1" />
                      </div>
                    ))}
                  </div>
                  <div className="h-32 bg-surface border border-outline-variant">
                    <div className="h-6 bg-surface-container border-b border-outline-variant flex items-center px-3 gap-2">
                      <div className="w-8 h-2 bg-primary/40 rounded-sm" />
                      <div className="w-12 h-2 bg-outline/20 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-10 bg-surface border-t border-outline-variant flex items-center justify-center gap-8 text-[9px] font-black text-outline uppercase tracking-[0.4em]">
          <span>Sync Latency: 42ms</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Theme Broadcast Active</span>
        </div>
      </div>
    </div>
  );
};

export default ThemeManager;
