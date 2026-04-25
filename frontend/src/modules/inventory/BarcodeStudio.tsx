/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ScanBarcode, Printer, Settings2, Trash2, Plus, 
  ChevronRight, LayoutGrid, Type, Tag, Search,
  Download, RefreshCw, X, CheckCircle2, AlertCircle,
  FileCode, Terminal, Zap, Cpu, FileInput, History,
  Barcode as BarcodeIcon, Layers, Save, FolderOpen,
  Usb, MousePointer2, Info, ExternalLink, Scissors,
  Grid3X3, ArrowRight, Sparkles, Wand2, StickyNote, Palette,
  FileText, Columns
} from 'lucide-react';
import { api } from '@/api/client';

interface PrintItem {
  id: string;
  code: string;
  name: string;
  mrp: number;
  brand: string;
  size: string;
  qty: number;
  color?: string;
  note?: string;
  isNew?: boolean;
}

interface LabelTemplate {
  id: string;
  name: string;
  width: number; // mm
  height: number; // mm
  columns: number;
  rowsPerPage: number;
  topMargin: number;
  leftMargin: number;
  colGap: number;
  rowGap: number;
  showName: boolean;
  showPrice: boolean;
  showBrand: boolean;
  showSize: boolean;
  fontSize: number;
  symbology: 'CODE128' | 'CODE39' | 'EAN13';
  isRaw: boolean;
  isSheet: boolean;
  rawContent: string;
}

const DEFAULT_PRN = '^XA^FO50,50^ADN,36,20^FD{NAME}^FS^FO50,100^B3N,N,100,Y,N^FD{CODE}^FS^XZ';

export default function BarcodeStudio() {
  const [queue, setQueue] = useState<PrintItem[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'visual' | 'raw' | 'setup'>('visual');
  const [usbDevice, setUsbDevice] = useState<any>(null);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('IDLE');

  // ── Template & State Persistence ──────────────────────────
  useEffect(() => {
    const savedTpls = localStorage.getItem('primesetu_barcode_templates');
    if (savedTpls) {
      const parsed = JSON.parse(savedTpls);
      setTemplates(parsed);
      if (parsed.length > 0) setActiveTemplateId(parsed[0].id);
    } else {
      const initial: LabelTemplate = {
        id: 'tpl-' + Date.now(),
        name: 'Standard ZPL Tag',
        width: 50, height: 25, columns: 1, rowsPerPage: 1, topMargin: 0, leftMargin: 0, colGap: 0, rowGap: 0,
        showName: true, showPrice: true, showBrand: true, showSize: true,
        fontSize: 10, symbology: 'CODE128', isRaw: true, isSheet: false, rawContent: DEFAULT_PRN
      };
      setTemplates([initial]);
      setActiveTemplateId(initial.id);
    }

    const pending = localStorage.getItem('primesetu_pending_print');
    if (pending) {
      const items = JSON.parse(pending);
      setQueue(prev => [...prev, ...items]);
      localStorage.removeItem('primesetu_pending_print');
      alert(`Imported ${items.length} labels from Procurement!`);
    }
  }, []);

  const saveTemplates = (newTemplates: LabelTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('primesetu_barcode_templates', JSON.stringify(newTemplates));
  };

  const activeTemplate = templates.find(t => t.id === activeTemplateId) || templates[0];

  const updateActiveTemplate = (updates: Partial<LabelTemplate>) => {
    const next = templates.map(t => t.id === activeTemplateId ? { ...t, ...updates } : t);
    saveTemplates(next);
  };

  const createNewTemplate = () => {
    const id = 'tpl-' + Date.now();
    const newTpl: LabelTemplate = { ...activeTemplate, id, name: 'New Template ' + (templates.length + 1) };
    saveTemplates([...templates, newTpl]);
    setActiveTemplateId(id);
  };

  // ── WebUSB Bridge ──────────────────────────────────────────
  const connectUSBPrinter = async () => {
    try {
      setStatus('CONNECTING');
      const device = await (navigator as any).usb.requestDevice({ filters: [] });
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      setUsbDevice(device);
      setStatus('CONNECTED');
    } catch { setStatus('ERROR'); }
  };

  const printViaUSB = async () => {
    if (!usbDevice || !activeTemplate?.rawContent) return;
    try {
      const encoder = new TextEncoder();
      for (const item of queue) {
        for (let i = 0; i < item.qty; i++) {
          let cmd = activeTemplate.rawContent
            .replace(/{NAME}/g, item.name)
            .replace(/{CODE}/g, item.code)
            .replace(/{PRICE}/g, item.mrp.toString())
            .replace(/{BRAND}/g, item.brand)
            .replace(/{SIZE}/g, item.size);
          await usbDevice.transferOut(1, encoder.encode(cmd + '\n'));
        }
      }
      alert('Printed!');
    } catch { alert('USB Printer Error.'); }
  };

  const BarcodeSVG = ({ code }: { code: string }) => (
    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
      <rect x="0" y="0" width="100" height="30" fill="white" />
      {code.split('').map((char, i) => (
        <rect key={i} x={i * (100/Math.max(1, code.length))} y="2" width={(100/Math.max(1, code.length)) * 0.6} height="26" fill="black" />
      ))}
    </svg>
  );

  // ── Sheet Layout Generator ─────────────────────────────────
  const expandedQueue = queue.flatMap(item => Array(item.qty).fill(item));

  if (!activeTemplate) return null;

  return (
    <div className="flex h-full bg-[#f0ede8] overflow-hidden">
      
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 no-print">
        <div className="p-4 bg-[#1a2340] text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <ScanBarcode className="w-5 h-5 text-navy" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Print Node</span>
          </div>
          <div className="flex gap-2">
             <button onClick={() => window.location.reload()} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-2 text-[10px] font-black uppercase tracking-widest transition-all">
                <RefreshCw className="w-3 h-3 inline mr-1" /> Sync GRN
             </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                 value={search}
                 onChange={e => {
                    setSearch(e.target.value);
                    if (e.target.value.length > 2) {
                       // Simulated catalogue search
                       setResults([
                          { id: 'S-001', code: 'PUMA-SHO-42', name: 'Puma RS-X Bold', mrp: 7999, brand: 'Puma', size: 'UK 9' },
                          { id: 'S-002', code: 'NIK-RUN-40', name: 'Nike Air Zoom', mrp: 12999, brand: 'Nike', size: 'UK 8' },
                       ].filter(i => i.name.toLowerCase().includes(e.target.value.toLowerCase())));
                    } else {
                       setResults([]);
                    }
                 }}
                 placeholder="Search catalogue..." 
                 className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:ring-4 ring-amber-400/10 focus:border-amber-400 transition-all"
              />
           </div>
           
           {results.length > 0 && (
             <div className="mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-40 overflow-y-auto z-20">
                {results.map(item => (
                  <button key={item.id} onClick={() => {
                     setQueue(prev => [...prev, { ...item, qty: 1 }]);
                     setResults([]);
                     setSearch('');
                  }} className="w-full text-left p-3 hover:bg-amber-50 flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors">
                     <div>
                        <div className="text-[10px] font-black text-navy uppercase">{item.name}</div>
                        <div className="text-[8px] text-gray-400 font-mono">{item.code}</div>
                     </div>
                     <Plus className="w-3 h-3 text-amber-500" />
                  </button>
                ))}
             </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest px-2 mb-2">Print Queue</div>
          {queue.map(item => (
            <div key={item.id} className={`border rounded-2xl p-3 ${item.isNew ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                   <div className="text-xs font-black text-navy truncate">{item.name}</div>
                   <div className="text-[10px] text-gray-400 font-mono">{item.code} | {item.size}</div>
                </div>
                <button onClick={() => setQueue(prev => prev.filter(i => i.id !== item.id))} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-400 uppercase">Qty:</span>
                <input type="number" value={item.qty} onChange={e => setQueue(prev => prev.map(i => i.id === item.id ? { ...i, qty: Math.max(1, Number(e.target.value)) } : i))}
                  className="w-12 bg-white border border-gray-100 rounded-lg py-1 text-center text-xs font-black outline-none" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
          {activeTemplate.isSheet ? (
             <button onClick={() => window.print()} className="w-full bg-navy text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
               <FileText className="w-5 h-5" /> Print Sheet (A4)
             </button>
          ) : status !== 'CONNECTED' ? (
            <button onClick={connectUSBPrinter} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
              <Usb className="w-5 h-5" /> Connect Printer
            </button>
          ) : (
            <button onClick={printViaUSB} disabled={queue.length === 0}
              className="w-full bg-amber-400 text-navy py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
              <Zap className="w-5 h-5" /> Flash Thermal Batch
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm no-print">
           <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setActiveTab('visual')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'bg-white text-navy shadow-sm' : 'text-gray-400'}`}>Designer</button>
            <button onClick={() => setActiveTab('raw')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'raw' ? 'bg-white text-navy shadow-sm' : 'text-gray-400'}`}>PRN Scripting</button>
          </div>
          <div className="flex items-center gap-2 bg-cream px-3 py-1.5 rounded-xl border border-border">
            <FolderOpen className="w-4 h-4 text-navy/40" />
            <select value={activeTemplateId} onChange={e => setActiveTemplateId(e.target.value)}
              className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-navy outline-none">
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={createNewTemplate} className="p-1 hover:bg-white rounded-lg transition-all text-amber-600"><Plus className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto print:p-0 print:bg-white bg-[#f0ede8]">
          {activeTab === 'visual' ? (
             <div className="flex gap-8 print:block">
                {/* Print Preview Area */}
                <div className="flex-1 flex flex-col items-center print:block">
                   <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 no-print">Live Preview</div>
                   
                   {activeTemplate.isSheet ? (
                      /* Sheet Layout Preview (Laser/Inkjet) */
                      <div className="bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden print:shadow-none print:border-none"
                        style={{ 
                          width: '210mm', height: '297mm', // A4
                          paddingTop: `${activeTemplate.topMargin}mm`,
                          paddingLeft: `${activeTemplate.leftMargin}mm`,
                        }}>
                        <div className="grid h-fit w-full" 
                             style={{ 
                               gridTemplateColumns: `repeat(${activeTemplate.columns}, ${activeTemplate.width}mm)`,
                               gap: `${activeTemplate.rowGap}mm ${activeTemplate.colGap}mm`,
                               justifyContent: 'start'
                             }}>
                           {expandedQueue.map((item, idx) => (
                             <div key={idx} className="border border-gray-100 flex flex-col items-center justify-center relative p-2 overflow-hidden"
                               style={{ width: `${activeTemplate.width}mm`, height: `${activeTemplate.height}mm` }}>
                                <div className="text-[8px] font-black uppercase text-gray-400 truncate w-full px-1">{item.name}</div>
                                <div className="w-full h-8 flex items-center justify-center my-1"><BarcodeSVG code={item.code} /></div>
                                <div className="flex justify-between w-full px-1 items-end">
                                   <div className="text-[7px] font-bold text-gray-400">SIZE: {item.size}</div>
                                   <div className="text-[10px] font-black text-navy">₹{item.mrp}</div>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                   ) : (
                      /* Single Label Preview (Thermal) */
                      <div className="bg-white shadow-2xl border border-gray-200 flex flex-col items-center justify-center overflow-hidden"
                        style={{ width: `${activeTemplate.width * 5}px`, height: `${activeTemplate.height * 5}px`, padding: '10px' }}>
                        <div className="w-full h-full border border-dashed border-gray-200 flex flex-col relative text-center">
                          {activeTemplate.showBrand && <div className="text-[10px] font-black uppercase text-gray-400 mb-0.5 tracking-tighter">PrimeSetu · Retail</div>}
                          {activeTemplate.showName && <div className="text-[11px] font-black text-navy leading-none mb-1 uppercase line-clamp-2">Example Product Name</div>}
                          <div className="flex-1 flex items-center justify-center my-1"><div className="w-full h-full max-h-[30px]"><BarcodeSVG code="SAMPLE123" /></div></div>
                          <div className="flex justify-between items-end mt-1 px-1">
                            <div className="text-left leading-none">
                              {activeTemplate.showSize && <div className="text-[9px] font-black text-gray-400">SIZE: UK10</div>}
                              <div className="text-[10px] font-mono text-navy">SAMPLE123</div>
                            </div>
                            {activeTemplate.showPrice && <div className="text-right leading-none"><div className="text-[8px] font-bold text-gray-400">MRP:</div><div className="text-lg font-black text-navy">₹999</div></div>}
                          </div>
                        </div>
                      </div>
                   )}
                </div>

                {/* Configuration Panel */}
                <div className="w-80 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 space-y-6 no-print">
                   <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button onClick={() => updateActiveTemplate({ isSheet: false })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${!activeTemplate.isSheet ? 'bg-white text-navy shadow-sm' : 'text-gray-400'}`}>Thermal</button>
                      <button onClick={() => updateActiveTemplate({ isSheet: true })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTemplate.isSheet ? 'bg-white text-navy shadow-sm' : 'text-gray-400'}`}>Sheet (A4)</button>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="text-xs font-black text-navy uppercase tracking-widest border-b pb-2">Label Identity</div>
                      <input value={activeTemplate.name} onChange={e => updateActiveTemplate({ name: e.target.value })}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-black outline-none focus:border-amber-400" />
                   </div>

                   {activeTemplate.isSheet ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Cols</label>
                          <input type="number" value={activeTemplate.columns} onChange={e => updateActiveTemplate({ columns: Number(e.target.value) })} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-black outline-none" /></div>
                        <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Rows Gap</label>
                          <input type="number" value={activeTemplate.rowGap} onChange={e => updateActiveTemplate({ rowGap: Number(e.target.value) })} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-black outline-none" /></div>
                        <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Top Mrg</label>
                          <input type="number" value={activeTemplate.topMargin} onChange={e => updateActiveTemplate({ topMargin: Number(e.target.value) })} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-black outline-none" /></div>
                        <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Left Mrg</label>
                          <input type="number" value={activeTemplate.leftMargin} onChange={e => updateActiveTemplate({ leftMargin: Number(e.target.value) })} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-black outline-none" /></div>
                      </div>
                   ) : (
                      <div className="space-y-4">
                         <div className="text-xs font-black text-navy uppercase tracking-widest border-b pb-2">Toggle Fields</div>
                         {['Name', 'Price', 'Brand', 'Size'].map(field => (
                           <button key={field} onClick={() => updateActiveTemplate({ [`show${field}` as any]: !activeTemplate[`show${field}` as any] })}
                             className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-cream transition-all group">
                             <span className="text-[11px] font-black text-gray-500">Show {field}</span>
                             <div className={`w-8 h-4 rounded-full relative transition-colors ${activeTemplate[`show${field}` as any] ? 'bg-amber-400' : 'bg-gray-200'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${activeTemplate[`show${field}` as any] ? 'left-4.5' : 'left-0.5'}`} /></div>
                           </button>
                         ))}
                      </div>
                   )}
                   
                   <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Width (mm)</label>
                        <input type="number" value={activeTemplate.width} onChange={e => updateActiveTemplate({ width: Number(e.target.value) })} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-black outline-none" /></div>
                      <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase">Height (mm)</label>
                        <input type="number" value={activeTemplate.height} onChange={e => updateActiveTemplate({ height: Number(e.target.value) })} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-xs font-black outline-none" /></div>
                   </div>
                   <button onClick={() => deleteTemplate(activeTemplate.id)} className="w-full p-3 text-[10px] font-black text-red-400 uppercase hover:text-red-600 transition-all">Delete Template</button>
                </div>
             </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
               <textarea value={activeTemplate.rawContent} onChange={e => updateActiveTemplate({ rawContent: e.target.value })}
                  className="w-full h-[500px] p-8 font-mono text-sm bg-[#1a1c23] text-emerald-400 rounded-3xl outline-none shadow-2xl border border-gray-800" />
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0 !important; }
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
}

function deleteTemplate(id: string) {
  // Global reference for simplicity in this draft
}
