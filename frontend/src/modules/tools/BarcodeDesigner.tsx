import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { 
  Plus, Save, Trash2, Settings, QrCode, Type, Image as ImageIcon, 
  Layers, Move, Download, Printer, Wifi, CheckCircle, XCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import BarcodePrintPreview from './BarcodePrintPreview';

export default function BarcodeDesigner() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printerIp, setPrinterIp] = useState(() => localStorage.getItem('smriti_printer_ip') || '192.168.1.100');
  const [printStatus, setPrintStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle');
  const [printError, setPrintError] = useState('');

  // Available ItemMaster fields for binding
  const itemFields = [
    { id: 'sku', label: 'Stock Number' },
    { id: 'name', label: 'Item Description' },
    { id: 'mrp', label: 'MRP' },
    { id: 'cost_price', label: 'Cost Price' },
    { id: 'class1', label: 'Product (Class 1)' },
    { id: 'class2', label: 'Brand (Class 2)' },
    { id: 'barcode', label: 'Vendor Barcode' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/barcode/templates');
      setTemplates(res.data);
      if (res.data.length > 0 && !activeTemplate) {
        setActiveTemplate(res.data[0]);
      }
    } catch (e) {
      console.error(e);
      // Fallback for Phase 1: Provide a default template if backend fails (404)
      const defaultTemplate = {
        id: 'mock-1',
        name: 'Standard 38x25mm',
        description: 'Mocked standard template',
        printer_type: 'STANDARD',
        width_mm: 38.0,
        height_mm: 25.0,
        layout_json: [],
        is_active: true
      };
      setTemplates([defaultTemplate]);
      if (!activeTemplate) setActiveTemplate(defaultTemplate);
    }
    setLoading(false);
  };

  const handleNewTemplate = () => {
    setActiveTemplate({
      id: null,
      name: 'New Template ' + (templates.length + 1),
      description: '',
      printer_type: 'STANDARD',
      width_mm: 50.0,
      height_mm: 25.0,
      layout_json: [],
      is_active: true
    });
  };

  const handleSave = async () => {
    if (!activeTemplate) return;
    try {
      if (activeTemplate.id && activeTemplate.id !== 'mock-1') {
        await apiClient.put(`/barcode/templates/${activeTemplate.id}`, activeTemplate);
      } else {
        const res = await apiClient.post('/barcode/templates', activeTemplate);
        setActiveTemplate(res.data);
      }
      fetchTemplates();
      alert("Template Saved Successfully!");
    } catch (e) {
      alert("Error saving template.");
    }
  };

  const addNode = (type: string) => {
    if (!activeTemplate) return;
    const newNode = {
      type,
      x: 5,
      y: 5,
      content: type === 'text' ? 'Constant Text' : undefined,
      dataField: type === 'text' ? undefined : 'sku',
      symbology: type === 'barcode' ? 'code128' : undefined,
      fontSize: 10
    };
    setActiveTemplate({
      ...activeTemplate,
      layout_json: [...activeTemplate.layout_json, newNode]
    });
  };

  const updateNode = (idx: number, updates: any) => {
    const updatedNodes = [...activeTemplate.layout_json];
    updatedNodes[idx] = { ...updatedNodes[idx], ...updates };
    setActiveTemplate({ ...activeTemplate, layout_json: updatedNodes });
  };

  const deleteNode = (idx: number) => {
    const updatedNodes = [...activeTemplate.layout_json];
    updatedNodes.splice(idx, 1);
    setActiveTemplate({ ...activeTemplate, layout_json: updatedNodes });
  };

  const handleTestPrint = async () => {
    if (!activeTemplate || activeTemplate.id === 'mock-1') {
      alert('Please save the template first before test printing.');
      return;
    }
    setPrintStatus('sending');
    setPrintError('');
    try {
      localStorage.setItem('smriti_printer_ip', printerIp);
      const res = await apiClient.post(`/barcode/templates/${activeTemplate.id}/print`, {
        printer_ip: printerIp,
        copies: 1,
      });
      const data = res.data;
      if (data.dispatched > 0) {
        setPrintStatus('ok');
      } else {
        setPrintStatus('error');
        setPrintError('Printer did not respond. Check IP and ensure port 9100 is open.');
      }
    } catch (e: any) {
      setPrintStatus('error');
      setPrintError(e?.response?.data?.detail || e.message || 'Network error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface text-foreground font-sans">
      {/* Header */}
      <div className="flex-shrink-0 h-16 border-b border-outline-variant px-6 flex items-center justify-between bg-surface-container">
        <div className="flex items-center gap-3">
          <QrCode className="text-primary" size={24} />
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter">Barcode Designer</h1>
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Sovereign Print Node Templates</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleNewTemplate} className="h-9 px-4 bg-surface-container-high border border-outline-variant text-[10px] font-black uppercase flex items-center gap-2 hover:border-primary transition-all">
            <Plus size={14} /> New
          </button>
          <button onClick={() => { setPrintStatus('idle'); setPrintError(''); setShowPrintModal(true); }} disabled={!activeTemplate} className="h-9 px-4 bg-emerald-600 text-white text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-500 transition-all disabled:opacity-50">
            <Printer size={14} /> Test Print
          </button>
          <button onClick={handleSave} className="h-9 px-4 bg-primary text-white text-[10px] font-black uppercase flex items-center gap-2 hover:bg-primary/90 transition-all">
            <Save size={14} /> Save Template
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Template List */}
        <div className="w-64 border-r border-outline-variant bg-surface-container/30 flex flex-col">
          <div className="p-4 border-b border-outline-variant">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-outline">Saved Templates</h3>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs font-bold transition-all",
                  activeTemplate?.id === t.id ? "bg-primary/10 border-l-2 border-primary text-primary" : "hover:bg-surface-container text-foreground"
                )}
              >
                {t.name}
                <div className="text-[9px] text-outline font-normal mt-0.5">{t.printer_type} • {t.width_mm}x{t.height_mm}mm</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-surface-container-highest relative overflow-auto p-8">
          {activeTemplate ? (
            <div className="max-w-4xl mx-auto w-full space-y-6">
              
              {/* Template Meta */}
              <div className="bg-surface border border-outline-variant p-4 flex gap-4">
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-outline block mb-1">Template Name</label>
                  <input 
                    value={activeTemplate.name} 
                    onChange={e => setActiveTemplate({...activeTemplate, name: e.target.value})}
                    className="w-full h-9 px-3 bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs font-bold"
                  />
                </div>
                <div className="w-32">
                  <label className="text-[9px] font-black uppercase tracking-widest text-outline block mb-1">Printer Type</label>
                  <select 
                    value={activeTemplate.printer_type}
                    onChange={e => setActiveTemplate({...activeTemplate, printer_type: e.target.value})}
                    className="w-full h-9 px-3 bg-surface-container border border-outline-variant outline-none text-xs font-bold"
                  >
                    <option value="STANDARD">Standard (A4)</option>
                    <option value="THERMAL">Thermal (ZPL)</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-[9px] font-black uppercase tracking-widest text-outline block mb-1">Width (mm)</label>
                  <input 
                    type="number" value={activeTemplate.width_mm} 
                    onChange={e => setActiveTemplate({...activeTemplate, width_mm: parseFloat(e.target.value)})}
                    className="w-full h-9 px-3 bg-surface-container border border-outline-variant outline-none text-xs font-bold"
                  />
                </div>
                <div className="w-24">
                  <label className="text-[9px] font-black uppercase tracking-widest text-outline block mb-1">Height (mm)</label>
                  <input 
                    type="number" value={activeTemplate.height_mm} 
                    onChange={e => setActiveTemplate({...activeTemplate, height_mm: parseFloat(e.target.value)})}
                    className="w-full h-9 px-3 bg-surface-container border border-outline-variant outline-none text-xs font-bold"
                  />
                </div>
              </div>

              {/* Toolbar & Canvas */}
              <div className="bg-surface border border-outline-variant flex h-[500px]">
                {/* Toolbar */}
                <div className="w-14 border-r border-outline-variant flex flex-col items-center py-2 gap-2 bg-surface-container/50">
                  <button onClick={() => addNode('text')} className="w-10 h-10 flex flex-col items-center justify-center hover:bg-surface-container-high hover:text-primary transition-colors tooltip" title="Add Text">
                    <Type size={16} />
                    <span className="text-[7px] font-bold mt-1">TEXT</span>
                  </button>
                  <button onClick={() => addNode('barcode')} className="w-10 h-10 flex flex-col items-center justify-center hover:bg-surface-container-high hover:text-primary transition-colors tooltip" title="Add Barcode">
                    <QrCode size={16} />
                    <span className="text-[7px] font-bold mt-1">B-CODE</span>
                  </button>
                </div>

                {/* Canvas Area (Visual Approximation) */}
                <div className="flex-1 bg-surface-container-highest flex items-center justify-center overflow-auto p-8">
                  {/* Label Paper Representation - Scale 1mm = 4px for preview */}
                  <div 
                    className="bg-white shadow-2xl relative border border-outline-variant"
                    style={{ 
                      width: `${activeTemplate.width_mm * 4}px`, 
                      height: `${activeTemplate.height_mm * 4}px` 
                    }}
                  >
                    {activeTemplate.layout_json.map((node: any, idx: number) => (
                      <div 
                        key={idx}
                        className="absolute border border-transparent hover:border-primary border-dashed cursor-move group p-0.5"
                        style={{ left: `${node.x * 4}px`, top: `${node.y * 4}px` }}
                      >
                        {/* Node Render */}
                        {node.type === 'text' && (
                          <div style={{ fontSize: `${node.fontSize}px` }} className="text-black font-sans leading-none whitespace-nowrap">
                            {node.dataField ? `[${node.dataField}]` : node.content}
                          </div>
                        )}
                        {node.type === 'barcode' && (
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-full min-w-[80px] bg-black/80 text-white flex items-center justify-center text-[8px] font-mono opacity-50 repeating-linear-gradient">||||| | |||||</div>
                            <span className="text-[8px] font-mono mt-0.5 text-black">[{node.dataField}]</span>
                          </div>
                        )}

                        {/* Node Quick Delete */}
                        <button onClick={() => deleteNode(idx)} className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Inspector */}
                <div className="w-64 border-l border-outline-variant bg-surface-container/30 flex flex-col overflow-y-auto">
                  <div className="p-3 border-b border-outline-variant bg-surface">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Node Properties</h3>
                  </div>
                  <div className="p-3 space-y-4">
                    {activeTemplate.layout_json.map((node: any, idx: number) => (
                      <div key={idx} className="bg-surface border border-outline-variant p-3 relative group">
                        <span className="absolute -top-2 left-2 bg-surface px-1 text-[8px] font-black uppercase text-primary border border-outline-variant">
                          Node {idx + 1} ({node.type})
                        </span>
                        
                        <div className="space-y-2 mt-2">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="text-[8px] font-bold text-outline">X (mm)</label>
                              <input type="number" value={node.x} onChange={e => updateNode(idx, {x: parseFloat(e.target.value)})} className="w-full h-7 px-2 text-xs bg-surface-container border border-outline-variant outline-none" />
                            </div>
                            <div className="flex-1">
                              <label className="text-[8px] font-bold text-outline">Y (mm)</label>
                              <input type="number" value={node.y} onChange={e => updateNode(idx, {y: parseFloat(e.target.value)})} className="w-full h-7 px-2 text-xs bg-surface-container border border-outline-variant outline-none" />
                            </div>
                          </div>

                          {node.type === 'text' && (
                            <>
                              <div>
                                <label className="text-[8px] font-bold text-outline">Bind to Field</label>
                                <select value={node.dataField || ''} onChange={e => updateNode(idx, {dataField: e.target.value, content: undefined})} className="w-full h-7 px-2 text-xs bg-surface-container border border-outline-variant outline-none">
                                  <option value="">-- Static Text --</option>
                                  {itemFields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                </select>
                              </div>
                              {!node.dataField && (
                                <div>
                                  <label className="text-[8px] font-bold text-outline">Text Content</label>
                                  <input value={node.content || ''} onChange={e => updateNode(idx, {content: e.target.value})} className="w-full h-7 px-2 text-xs bg-surface-container border border-outline-variant outline-none" />
                                </div>
                              )}
                              <div>
                                <label className="text-[8px] font-bold text-outline">Font Size</label>
                                <input type="number" value={node.fontSize} onChange={e => updateNode(idx, {fontSize: parseFloat(e.target.value)})} className="w-full h-7 px-2 text-xs bg-surface-container border border-outline-variant outline-none" />
                              </div>
                            </>
                          )}

                          {node.type === 'barcode' && (
                            <>
                              <div>
                                <label className="text-[8px] font-bold text-outline">Barcode Content (Field)</label>
                                <select value={node.dataField || ''} onChange={e => updateNode(idx, {dataField: e.target.value})} className="w-full h-7 px-2 text-xs bg-surface-container border border-outline-variant outline-none">
                                  {itemFields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-outline">Symbology</label>
                                <select value={node.symbology} onChange={e => updateNode(idx, {symbology: e.target.value})} className="w-full h-7 px-2 text-xs bg-surface-container border border-outline-variant outline-none">
                                  <option value="code128">Code 128</option>
                                  <option value="code39">Code 39</option>
                                  <option value="ean13">EAN-13</option>
                                  <option value="upca">UPC-A</option>
                                </select>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {activeTemplate.layout_json.length === 0 && (
                      <div className="text-center p-4 text-outline/50 text-xs font-bold">
                        Add nodes from toolbar
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-outline/40">
              <QrCode size={48} className="mb-4 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">Select or create a template to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Sovereign ZPL Print Modal */}
      {showPrintModal && activeTemplate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant shadow-2xl w-[420px] rounded-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="h-14 bg-surface-container border-b border-outline-variant flex items-center justify-between px-5">
              <div className="flex items-center gap-3">
                <Printer size={18} className="text-primary" />
                <span className="text-sm font-black uppercase tracking-tighter">Sovereign Print Dispatch</span>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="text-outline hover:text-foreground text-xs font-bold uppercase">✕ Close</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Template info */}
              <div className="bg-surface-container rounded-xl p-4 border border-outline-variant">
                <div className="text-[9px] font-black text-outline uppercase tracking-widest mb-1">Active Template</div>
                <div className="text-sm font-black text-foreground">{activeTemplate.name}</div>
                <div className="text-[10px] text-outline mt-0.5">{activeTemplate.printer_type} · {activeTemplate.width_mm}×{activeTemplate.height_mm}mm · {activeTemplate.layout_json?.length || 0} nodes</div>
              </div>

              {/* Printer IP */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-outline block mb-2">
                  <Wifi size={10} className="inline mr-1" />Thermal Printer IP (Port 9100)
                </label>
                <input
                  type="text"
                  value={printerIp}
                  onChange={e => setPrinterIp(e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full h-10 px-4 bg-surface-container border-2 border-outline-variant focus:border-primary outline-none text-sm font-bold rounded-lg font-mono"
                />
                <p className="text-[9px] text-outline mt-1.5">ZPL raw string will be sent via TCP port 9100. Supported: Zebra GK420d, ZD220, TSC TDP-225, TVS LP45 Neo.</p>
              </div>

              {/* Status display */}
              {printStatus === 'ok' && (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-black text-emerald-600">Label Dispatched Successfully</div>
                    <div className="text-[10px] text-emerald-500/80 mt-0.5">ZPL sent via TCP to {printerIp}:9100</div>
                  </div>
                </div>
              )}
              {printStatus === 'error' && (
                <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <XCircle size={18} className="text-rose-500 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-black text-rose-600">Dispatch Failed</div>
                    <div className="text-[10px] text-rose-500/80 mt-0.5">{printError}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={handleTestPrint}
                disabled={printStatus === 'sending' || !printerIp.trim()}
                className="flex-1 h-11 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-40"
              >
                {printStatus === 'sending' ? (
                  <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Dispatching ZPL...</>
                ) : (
                  <><Printer size={14} />Send to Printer</>  
                )}
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="h-11 px-5 bg-surface-container border border-outline-variant rounded-xl font-black text-[11px] uppercase tracking-widest text-foreground hover:border-primary transition-all"
              >
                Browser Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browser fallback preview (legacy path) */}
      {showPreview && activeTemplate && (
        <BarcodePrintPreview
          template={activeTemplate}
          items={[
            { sku: '1001452', name: 'PREMIUM DENIM JEANS', mrp: 2499.00, cost_price: 1200, class1: 'DENIM', class2: 'LEVIS', barcode: '890123456789' },
            { sku: '1001453', name: 'COTTON T-SHIRT (M)', mrp: 899.00, cost_price: 400, class1: 'TSHIRT', class2: 'NIKE', barcode: '890123456790' },
          ]}
          copiesPerItem={1}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
