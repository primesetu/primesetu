/* ============================================================
 * SMRITI-OS — Item Master (Catalogue DNA)
 * Parity: Shoper9 Item Master Entry v2.4
 * © 2026 AITDL Network
 * ============================================================ */
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Save, 
  X, 
  Table as TableIcon,
  ChevronRight,
  Monitor,
  Settings,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Trash2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import { 
  Button, 
  Input, 
  Card, 
  Text, 
  Badge, 
  cn 
} from '../../components/ui/SovereignUI';

interface FieldConfig {
  id: string;
  label: string;
  mandatory: boolean;
}

const ALL_FIELDS: FieldConfig[] = [
  { id: 'stock_number', label: 'Stock Number', mandatory: true },
  { id: 'item_name', label: 'Item Name', mandatory: true },
  { id: 'department', label: 'Department', mandatory: true },
  { id: 'brand', label: 'Brand', mandatory: false },
  { id: 'mrp', label: 'MRP (₹)', mandatory: true },
  { id: 'cost', label: 'Cost (₹)', mandatory: false },
  { id: 'gst', label: 'GST %', mandatory: true },
  { id: 'shade', label: 'Shade', mandatory: false },
  { id: 'size', label: 'Size', mandatory: false },
  { id: 'fabric', label: 'Fabric', mandatory: false },
  { id: 'pattern', label: 'Pattern', mandatory: false },
];

interface ItemMasterProps {
  onOpenMatrix?: (styleCode: string) => void;
}

export default function ItemMaster({ onOpenMatrix }: ItemMasterProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'common' | 'details'>('view');
  const [isEditing, setIsEditing] = useState(false);
  const [autoGenStock, setAutoGenStock] = useState(true);
  
  // ── FIELD SELECTION STATE ───────────────────────────────────────────
  const [selectedFields, setSelectedFields] = useState<string[]>(['stock_number', 'item_name', 'department', 'mrp', 'gst']);
  const [unselectedFields, setUnselectedFields] = useState<string[]>(['brand', 'cost', 'shade', 'size', 'fabric', 'pattern', 'hsn']);
  const [activeSelection, setActiveSelection] = useState<string[]>([]);

  // ── COMMON FIELDS STATE ─────────────────────────────────────────────
  const [commonFields, setCommonFields] = useState<string[]>(['department', 'brand', 'gst']);
  const [commonData, setCommonData] = useState<Record<string, string>>({
    department: 'APPAREL',
    brand: 'SOVEREIGN',
    gst: '5'
  });

  // ── GRID DATA STATE ────────────────────────────────────────────────
  const [gridData, setGridData] = useState<any[]>([]);
  const [focusedCell, setFocusedCell] = useState<{ row: number, col: string } | null>(null);

  // ── KEYBOARD SHORTCUTS ──────────────────────────────────────────────
  useHotkeys('alt+1', (e) => { e.preventDefault(); setActiveTab('view') }, { enableOnFormTags: true });
  useHotkeys('alt+2', (e) => { e.preventDefault(); setActiveTab('common') }, { enableOnFormTags: true });
  useHotkeys('alt+3', (e) => { e.preventDefault(); setActiveTab('details') }, { enableOnFormTags: true });
  useHotkeys('f2', (e) => { e.preventDefault(); handleLookup() }, { enableOnFormTags: true });
  useHotkeys('f9', (e) => { e.preventDefault(); handleSave() }, { enableOnFormTags: true });

  const [showLookup, setShowLookup] = useState(false);
  const [lookupTarget, setLookupTarget] = useState<string | null>(null);

  const handleLookup = () => {
    if (focusedCell) {
      setLookupTarget(focusedCell.col);
      setShowLookup(true);
    }
  };

  const handleSave = () => {
    console.log('[SMRITI-OS] Committing Item Master Transaction...');
    setIsEditing(false);
  };

  const moveFields = (direction: 'select' | 'unselect') => {
    if (direction === 'select') {
      const toMove = activeSelection.filter(id => !selectedFields.includes(id));
      setSelectedFields([...selectedFields, ...toMove]);
      setUnselectedFields(unselectedFields.filter(id => !activeSelection.includes(id)));
    } else {
      const toMove = activeSelection.filter(id => !unselectedFields.includes(id));
      // Guard: Cannot remove mandatory fields
      const removable = toMove.filter(id => !ALL_FIELDS.find(f => f.id === id)?.mandatory);
      setUnselectedFields([...unselectedFields, ...removable]);
      setSelectedFields(selectedFields.filter(id => !removable.includes(id)));
    }
    setActiveSelection([]);
  };

  return (
    <div className="flex flex-col h-full bg-bg-base overflow-hidden selection:bg-accent/30 font-sans">
      
      {/* ── HEADER ── */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-border-subtle bg-bg-elevated/20 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <Text variant="h2" className="text-sm font-black tracking-[0.2em] uppercase">Item Master Entry</Text>
            <Text variant="xs" className="opacity-40 font-mono">CATALOGUE {' > '} MASTERS {' > '} SKU_REGISTRY</Text>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div className="flex items-center gap-4">
            <Badge variant="info" className={cn("px-3 py-1 border-accent/20 text-accent", !autoGenStock && "opacity-30")}>
              {autoGenStock ? "AUTO_GEN: ENABLED" : "MANUAL_ENTRY"}
            </Badge>
            <Button variant="sec" size="sm" onClick={() => setAutoGenStock(!autoGenStock)}>
              <Settings size={12}/> Configure
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="sec" className="h-9" onClick={() => setIsEditing(false)}>Cancel</Button>
          <Button variant="pri" className="h-9 gap-2 px-6" onClick={handleSave}>
            <Save size={16} /> Save [F9]
          </Button>
        </div>
      </header>

      {/* ── TABS ── */}
      <nav className="flex px-6 border-b border-border-subtle bg-bg-elevated/10 shrink-0">
        {[
          { id: 'view', label: 'View / Fields', shortcut: 'Alt+1' },
          { id: 'common', label: 'Common Fields', shortcut: 'Alt+2' },
          { id: 'details', label: 'Item Details', shortcut: 'Alt+3' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-8 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all relative group",
              activeTab === tab.id 
                ? "border-accent text-accent bg-accent/5" 
                : "border-transparent text-text-tertiary hover:text-text-secondary hover:bg-bg-float/40"
            )}
          >
            {tab.label}
            <span className="ml-2 opacity-20 font-mono text-[9px]">[{tab.shortcut}]</span>
          </button>
        ))}
      </nav>

      {/* ── CONTENT AREA ── */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          
          {/* 1. VIEW / FIELD SELECTION */}
          {activeTab === 'view' && (
            <motion.div 
              key="view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-8 h-full flex flex-col gap-6"
            >
              <div className="grid grid-cols-[1fr_120px_1fr] gap-8 h-[500px]">
                {/* Unselected Fields */}
                <div className="flex flex-col gap-3">
                  <Text variant="xs" className="font-bold uppercase tracking-wider text-text-tertiary">Unselected Fields</Text>
                  <div className="flex-1 bg-bg-elevated/10 border border-border-subtle rounded-xl overflow-y-auto p-2 no-scrollbar">
                    {unselectedFields.map(id => {
                      const field = ALL_FIELDS.find(f => f.id === id);
                      const isSelected = activeSelection.includes(id);
                      return (
                        <div 
                          key={id}
                          onClick={() => setActiveSelection(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all mb-1 group",
                            isSelected ? "bg-accent/20 border border-accent/30 text-accent" : "hover:bg-bg-float"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-accent" : "bg-text-tertiary/20")} />
                          <span className="text-xs font-medium">{field?.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transfer Controls */}
                <div className="flex flex-col justify-center gap-4">
                  <Button variant="sec" className="w-full" onClick={() => moveFields('select')}><ChevronRightIcon size={16}/></Button>
                  <Button variant="sec" className="w-full" onClick={() => moveFields('unselect')}><ChevronLeft size={16}/></Button>
                </div>

                {/* Selected Fields */}
                <div className="flex flex-col gap-3">
                  <Text variant="xs" className="font-bold uppercase tracking-wider text-text-tertiary">Selected Fields (Grid View)</Text>
                  <div className="flex-1 bg-bg-elevated/10 border border-border-subtle rounded-xl overflow-y-auto p-2 no-scrollbar">
                    {selectedFields.map(id => {
                      const field = ALL_FIELDS.find(f => f.id === id);
                      const isSelected = activeSelection.includes(id);
                      return (
                        <div 
                          key={id}
                          onClick={() => setActiveSelection(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                          className={cn(
                            "flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-all mb-1 group",
                            field?.mandatory ? "bg-bg-float/50 border border-border-subtle/50 text-text-disabled cursor-not-allowed" : 
                            isSelected ? "bg-accent/20 border border-accent/30 text-accent" : "hover:bg-bg-float"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <ArrowRightLeft size={12} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xs font-medium">{field?.label}</span>
                          </div>
                          {field?.mandatory && <Badge variant="muted" className="text-[8px] px-1 py-0 opacity-50">Locked</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-auto">
                <Button variant="sec" className="px-8"><Maximize2 size={14}/> Restore Defaults</Button>
                <Button variant="pri" className="px-8">Save Selection</Button>
              </div>
            </motion.div>
          )}

          {/* 2. COMMON FIELDS */}
          {activeTab === 'common' && (
            <motion.div 
              key="common"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-8 max-w-4xl"
            >
              <Card className="bg-bg-elevated/5 border-border-subtle/30 overflow-hidden">
                <div className="p-6 border-b border-border-subtle/30 bg-bg-elevated/10">
                  <Text variant="h3" className="text-sm font-black">Common Values Entry</Text>
                  <Text variant="xs" className="opacity-40">These values will be auto-applied to all new items in the Details grid.</Text>
                </div>
                <div className="p-8 grid grid-cols-2 gap-x-12 gap-y-8">
                  {selectedFields.map(fieldId => {
                    const field = ALL_FIELDS.find(f => f.id === fieldId);
                    return (
                      <div key={fieldId} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                            {field?.label} {field?.mandatory && <span className="text-accent">*</span>}
                          </label>
                          <input 
                            type="checkbox" 
                            checked={commonFields.includes(fieldId)}
                            onChange={(e) => setCommonFields(p => e.target.checked ? [...p, fieldId] : p.filter(x => x !== fieldId))}
                            className="w-3 h-3 rounded bg-bg-input border-border-subtle"
                          />
                        </div>
                        <Input 
                          disabled={!commonFields.includes(fieldId)}
                          value={commonData[fieldId] || ''}
                          onChange={(e) => setCommonData(p => ({ ...p, [fieldId]: e.target.value }))}
                          placeholder={commonFields.includes(fieldId) ? `Enter common ${field?.label}...` : "Field not common"}
                          className="font-mono text-sm bg-bg-input/50 focus:bg-bg-input transition-all"
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* 3. ITEM DETAILS GRID */}
          {activeTab === 'details' && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col p-6"
            >
              <div className="flex-1 bg-bg-elevated/5 border border-border-subtle rounded-2xl overflow-auto custom-scrollbar relative shadow-2xl">
                <table className="w-full text-left border-collapse whitespace-nowrap table-fixed">
                  <thead className="sticky top-0 z-30 bg-bg-elevated/90 backdrop-blur-md border-b border-border-subtle">
                    <tr className="font-mono text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                      <th className="w-12 px-4 py-4 text-center border-r border-border-subtle/30">#</th>
                      {selectedFields.map(id => (
                        <th key={id} className="px-6 py-4 border-r border-border-subtle/30">
                          {ALL_FIELDS.find(f => f.id === id)?.label}
                        </th>
                      ))}
                      <th className="w-12 px-4 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs divide-y divide-border-subtle/10">
                    {[1, 2, 3, 4, 5].map((rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-accent/[0.02] group transition-all">
                        <td className="px-4 py-3 text-center border-r border-border-subtle/10 text-text-disabled text-[10px]">{rowIdx}</td>
                        {selectedFields.map(fieldId => (
                          <td 
                            key={fieldId} 
                            className={cn(
                              "px-6 py-3 border-r border-border-subtle/10 relative",
                              focusedCell?.row === rowIdx && focusedCell?.col === fieldId && "bg-accent/5 ring-1 ring-inset ring-accent/30"
                            )}
                          >
                            <input 
                              onFocus={() => setFocusedCell({ row: rowIdx, col: fieldId })}
                              placeholder="..."
                              className="w-full bg-transparent outline-none focus:text-accent font-medium placeholder:opacity-10"
                              defaultValue={commonFields.includes(fieldId) ? commonData[fieldId] : ''}
                            />
                            {focusedCell?.row === rowIdx && focusedCell?.col === fieldId && (
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black opacity-30">F2</span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <button className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-status-red transition-all">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Empty add row */}
                    <tr className="bg-bg-float/20 cursor-pointer hover:bg-accent/5 transition-all">
                      <td colSpan={selectedFields.length + 2} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-accent text-[10px] font-black uppercase tracking-widest">
                          <Plus size={14} /> Click to add next item or press Enter
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER BAR ── */}
      <footer className="h-12 bg-bg-elevated border-t border-border-subtle flex items-center px-4 shrink-0 font-mono text-[9px] font-black text-text-tertiary z-50">
        <div className="flex gap-1 h-full">
          {[
            { key: 'F2', label: 'Lookup' },
            { key: 'F3', label: 'Toggle Edit' },
            { key: 'F9', label: 'Commit Batch', highlight: true },
            { divider: true },
            { key: 'Alt+1', label: 'Layout' },
            { key: 'Alt+2', label: 'Common' },
            { key: 'Alt+3', label: 'Details' },
            { divider: true },
            { key: 'Esc', label: 'Discard' },
          ].map((btn, i) => (
            btn.divider ? (
              <div key={`div-${i}`} className="w-px h-5 bg-border-subtle mx-2 self-center" />
            ) : (
              <button 
                key={btn.key}
                className={cn(
                  "px-3 flex items-center gap-2 hover:bg-bg-float transition-all group",
                  btn.highlight && "bg-accent/10 text-accent hover:bg-accent/20"
                )}
              >
                <span className="opacity-30 group-hover:opacity-100 transition-opacity">[{btn.key}]</span>
                <span className="uppercase tracking-widest">{btn.label}</span>
              </button>
            )
          ))}
        </div>
        <div className="ml-auto flex items-center gap-6 border-l border-border-subtle pl-6 h-full">
          <div className="flex flex-col text-right">
            <span className="text-text-disabled uppercase">Active Session</span>
            <span className="text-accent uppercase">BATCH_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
          <Monitor size={16} className="text-accent" />
        </div>
      </footer>

      {/* ── LOOKUP MODAL ── */}
      <AnimatePresence>
        {showLookup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLookup(false)}
              className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-bg-elevated border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-elevated/50">
                <div className="flex flex-col">
                  <Text variant="h3" className="text-xs font-black uppercase tracking-widest">Select {lookupTarget?.replace('_', ' ')}</Text>
                  <Text variant="xs" className="opacity-40">Double click or press Enter to accept</Text>
                </div>
                <button onClick={() => setShowLookup(false)} className="p-2 hover:bg-bg-float rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-4 border-b border-border-subtle bg-bg-base/50">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-accent transition-colors" />
                  <input 
                    autoFocus
                    placeholder="Search codes..." 
                    className="w-full bg-bg-input border border-border-subtle rounded-lg pl-12 pr-4 h-10 text-sm outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>

              <div className="h-80 overflow-y-auto p-2 no-scrollbar">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={i}
                    onClick={() => setShowLookup(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-accent/10 hover:text-accent cursor-pointer group transition-all mb-1 border border-transparent hover:border-accent/20"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black">CODE_{100 + i}</span>
                      <span className="text-[10px] opacity-50 uppercase tracking-wider">Example Description {i + 1}</span>
                    </div>
                    <Badge variant="muted" className="opacity-0 group-hover:opacity-100 transition-opacity">Select</Badge>
                  </div>
                ))}
              </div>

              <div className="px-6 py-3 bg-bg-elevated/50 border-t border-border-subtle flex justify-between items-center">
                <Text variant="xs" className="opacity-40 font-mono italic">Alt+A: Accept Codes</Text>
                <div className="flex gap-2">
                  <Button variant="sec" size="sm" onClick={() => setShowLookup(false)}>Close</Button>
                  <Button variant="pri" size="sm" onClick={() => setShowLookup(false)}>Accept Codes</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
