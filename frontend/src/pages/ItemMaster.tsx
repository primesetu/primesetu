import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
  AllCommunityModule, 
  ModuleRegistry, 
  themeQuartz, 
  RowClassParams, 
  ColDef,
  GridApi,
  GridReadyEvent,
  CellValueChangedEvent
} from 'ag-grid-community';
import { 
  Save, Plus, Trash2, Search, RefreshCw, Layers, 
  Database, Hash, Barcode, CheckCircle, Check, AlertCircle,
  AlertTriangle, Loader2, Zap, Settings, Activity, FileText, Grid3X3, X, Lock, Unlock, ChevronUp, ChevronDown, Copy, Sparkles, Printer
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { api, apiClient } from '@/api/client';
import BarcodePrintPreview from '../modules/tools/BarcodePrintPreview';
import { useSysParams } from '@/hooks/useSysParams';
import { useLookup } from '@/hooks/useLookup';

ModuleRegistry.registerModules([AllCommunityModule]);

interface ItemRow {
  id: string | number;
  stockno: string;
  batchsrlno: string;
  itemdesc: string;
  class1: string;
  class2: string;
  subclass1: string;
  subclass2: string;
  size: string;
  barcode: string;
  mrp: number;
  cost: number;
  hsn: string;
  gst: number;
  stock: number;
  [key: string]: any; 
}

const smritiTheme = themeQuartz.withParams({
  backgroundColor: 'transparent',
  foregroundColor: 'hsl(var(--outline))',
  headerBackgroundColor: 'hsl(var(--surface-container))',
  headerTextColor: 'hsl(var(--outline))',
  rowHoverColor: 'rgba(var(--primary-rgb), 0.05)',
  selectedRowBackgroundColor: 'rgba(var(--primary-rgb), 0.1)',
  fontFamily: 'inherit',
  rowBorder: '1px solid hsl(var(--outline-variant))',
  pinnedRowBorder: '1px solid hsl(var(--outline-variant))',
});

export default function ItemMaster() {
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modified, setModified] = useState<Set<string | number>>(new Set());
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  
  const [masters, setMasters] = useState({
    products: [] as any[],
    brands: [] as any[],
    captions: {} as Record<string, string>
  });

  const [activeTab, setActiveTab] = useState<"VIEW" | "COMMON" | "DETAILS">("DETAILS");
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [matrixSourceRow, setMatrixSourceRow] = useState<ItemRow | null>(null);
  const [viewFilter, setViewFilter] = useState<"all" | "modified">("modified");
  
  // Barcode Printing State
  const [printTemplates, setPrintTemplates] = useState<any[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPrintTemplate, setSelectedPrintTemplate] = useState<any | null>(null);

  // System Parameters
  const { getParam } = useSysParams();
  const enableBarcodePrinting = getParam('ENABLE_BARCODE_PRINTING', true);
  const defaultTemplateName = getParam('DEF_BARCODE_TEMPLATE', null);

  // ── GenLookup Resolvers (Sovereign Data-Driven Dropdowns) ────────────────
  const { options: class1Options, resolve: resolveClass1 } = useLookup(1);       // RecID 1 = Class1
  const { options: class2Options, resolve: resolveClass2 } = useLookup(2);       // RecID 2 = Class2
  const { options: analcode1Options, resolve: resolveAC1 } = useLookup(65);      // AnalCode1 (e.g. Color)
  const { options: analcode2Options, resolve: resolveAC2 } = useLookup(66);      // AnalCode2 (e.g. Material)
  const { options: analcode3Options, resolve: resolveAC3 } = useLookup(67);      // AnalCode3
  const { options: sizeGroupOptions, resolve: resolveSizeGroup } = useLookup(53); // SizeGroup

  // ── Persistent Field Selection (Alt+1) ───────────────────────────────
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    const saved = localStorage.getItem('smriti_item_fields');
    return saved ? JSON.parse(saved) : ['stockno', 'itemdesc', 'class1', 'class2', 'size', 'mrp', 'cost', 'hsn', 'gst'];
  });

  // ── Persistent Common Values (Alt+2) ─────────────────────────────────
  const [bulkDefaults, setBulkDefaults] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('smriti_item_defaults');
    return saved ? JSON.parse(saved) : {};
  });

  const [tempDefaults, setTempDefaults] = useState<Record<string, any>>(bulkDefaults);

  // Auto-save fields on change is removed, we now use explicit save
  // but we still want to persist the state for the session
  useEffect(() => {
    // localStorage.setItem('smriti_item_fields', JSON.stringify(selectedFields));
  }, [selectedFields]);

  const saveCommonDefaults = () => {
    localStorage.setItem('smriti_item_defaults', JSON.stringify(tempDefaults));
    setBulkDefaults(tempDefaults);
    setToast({ msg: "Common Fields Locked and Saved!", ok: true });
  };
  const [comboValues, setComboValues] = useState<any[]>([]);
  const [isFetchingCombo, setIsFetchingCombo] = useState(false);
  const [class1List, setClass1List] = useState<any[]>([]);
  const [class2List, setClass2List] = useState<any[]>([]);

  // ── Matrix React State (M6: replace DOM getElementById) ──────────────
  const [matrixClass1, setMatrixClass1] = useState('');
  const [matrixClass2, setMatrixClass2] = useState('');
  const [matrixBase, setMatrixBase] = useState('');
  const [matrixPivot, setMatrixPivot] = useState('');
  const [matrixManualSNs, setMatrixManualSNs] = useState('');
  const [selectedCombos, setSelectedCombos] = useState<Set<string>>(new Set());
  const [matrixGenMode, setMatrixGenMode] = useState<'db' | 'fast'>('fast');
  const [fastSizes, setFastSizes] = useState('');
  const [fastColors, setFastColors] = useState('');

  // Fetch distinct class1 codes (filtered by class2 if provided)
  const fetchClass1List = async (class2cd?: string) => {
    try {
      const res = await api.items.getClass1List(class2cd);
      setClass1List(res || []);
    } catch (e) {
      console.error('Class1 list fetch failed', e);
    }
  };

  // Fetch distinct class2 codes (filtered by class1 if provided)
  const fetchClass2List = async (class1cd?: string) => {
    try {
      const res = await api.items.getClass2List(class1cd);
      setClass2List(res || []);
    } catch (e) {
      console.error('Class2 list fetch failed', e);
    }
  };

  // M4 fix: read tempDefaults first (most current), fall back to bulkDefaults
  // Also uses matrixClass1/matrixClass2 state when modal overrides are set
  const fetchComboValues = async (class1Override?: string, class2Override?: string, pivotOverride?: string) => {
    const class1 = class1Override || tempDefaults.class1 || bulkDefaults.class1;
    if (!class1) {
      setToast({ msg: 'Set Class1 (Product) first', ok: false });
      return;
    }
    const pivot = pivotOverride || matrixPivot;
    if (pivot === 'size' && !class2Override) {
      setToast({ msg: 'Set Class2 (Brand) to fetch Sizes', ok: false });
      return;
    }

    setIsFetchingCombo(true);
    setSelectedCombos(new Set());
    try {
      if (pivot === 'size') {
        const res = await api.items.getSizeCat(class1, class2Override || '');
        setComboValues(Array.isArray(res) ? res : []);
      } else {
        const res = await api.items.getComboValues(class1, class2Override || '');
        // M1 fix: API now returns array directly (not res.values)
        setComboValues(Array.isArray(res) ? res : (res.values || []));
      }
    } catch (e) {
      console.error('Combo fetch failed', e);
      setToast({ msg: 'Failed to fetch variants', ok: false });
    } finally {
      setIsFetchingCombo(false);
    }
  };

  const onColumnMoved = (e: any) => {
    const columns = e.api.getAllGridColumns();
    const newOrder = columns
      .filter((c: any) => !c.colId.startsWith('ag-')) 
      .map((c: any) => c.colId);
    
    const currentSelected = new Set(selectedFields);
    const orderedSelection = newOrder.filter((id: string) => currentSelected.has(id));
    const remaining = selectedFields.filter(id => !newOrder.includes(id));
    
    const finalOrder = [...orderedSelection, ...remaining];
    setSelectedFields(finalOrder);
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const idx = selectedFields.indexOf(id);
    if (idx === -1) return;
    const newFields = [...selectedFields];
    if (direction === 'up' && idx > 0) {
      [newFields[idx], newFields[idx-1]] = [newFields[idx-1], newFields[idx]];
    } else if (direction === 'down' && idx < selectedFields.length - 1) {
      [newFields[idx], newFields[idx+1]] = [newFields[idx+1], newFields[idx]];
    }
    setSelectedFields(newFields);
  };

  const gridRef = useRef<AgGridReact<ItemRow>>(null);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.onFilterChanged();
    }
  }, [viewFilter, modified]);

  useEffect(() => {
    loadData();
    fetchMasters();
    fetchClass1List();
    fetchClass2List();
  }, []);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') setActiveTab("VIEW");
      if (e.altKey && e.key === '2') setActiveTab("COMMON");
      if (e.altKey && e.key === '3') setActiveTab("DETAILS");
      if (e.key === 'F9' && activeTab === 'COMMON') saveCommonDefaults();
      if (e.key === 'F10') handleSave();
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [tempDefaults, bulkDefaults, rows, modified, activeTab]);

  // Initialize matrix state from source row (expand mode) OR session defaults (new mode)
  useEffect(() => {
    if (isMatrixOpen) {
      if (matrixSourceRow) {
        // ── EXPAND MODE: pre-fill everything from the selected Tab 3 row ──
        setMatrixClass1(matrixSourceRow.class1 || '');
        setMatrixClass2(matrixSourceRow.class2 || '');
        // Extract prefix from stockno (e.g. "NIKE-8" → "NIKE") or use itemdesc words
        const snParts = String(matrixSourceRow.stockno || '').split('-');
        const guessedBase = snParts.length > 1 ? snParts.slice(0, -1).join('-') : String(matrixSourceRow.stockno || '');
        setMatrixBase(guessedBase);
      } else {
        // ── NEW MATRIX MODE: pre-fill from session defaults ──
        setMatrixClass1(tempDefaults.class1 || bulkDefaults.class1 || '');
        setMatrixClass2(tempDefaults.class2 || bulkDefaults.class2 || '');
        setMatrixBase('');
      }
      setMatrixPivot('');
      setMatrixManualSNs('');
      setSelectedCombos(new Set());
      setComboValues([]);
    }
  }, [isMatrixOpen]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchMasters = async () => {
    try {
      const [captionRes] = await Promise.all([api.items.getCaptions()]);
      const caps = captionRes.captions || {};
      setMasters({
        products: [{code: '01', descr: 'FOOTWEAR'}, {code: '02', descr: 'APPAREL'}],
        brands: [{code: 'NK', descr: 'NIKE'}, {code: 'AD', descr: 'ADIDAS'}],
        captions: caps
      });

      // ── Intelligent Auto-Selection ───────────────────────────────
      // If the user hasn't saved a custom layout, auto-enable active analcodes
      const hasSavedPrefs = !!localStorage.getItem('smriti_item_fields');
      if (!hasSavedPrefs) {
        const activeAnalCodes = Object.keys(caps).filter(k => k.startsWith('analcode'));
        if (activeAnalCodes.length > 0) {
          setSelectedFields(prev => {
            const combined = Array.from(new Set([...prev, ...activeAnalCodes]));
            return combined;
          });
        }
      }
      
      // Fetch Barcode Templates
      try {
        const templatesRes = await apiClient.get('/barcode/templates');
        const templates = templatesRes.data || [];
        setPrintTemplates(templates);
        if (templates.length > 0) {
          if (defaultTemplateName) {
            const matched = templates.find((t: any) => t.name === defaultTemplateName);
            setSelectedPrintTemplate(matched || templates[0]);
          } else {
            setSelectedPrintTemplate(templates[0]);
          }
        }
      } catch (err) {
        console.error("Barcode Templates fetch failed", err);
      }
    } catch (e) {
      console.error("Masters fetch failed", e);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.items.list();
      const mapped = data.map((item: any) => ({
        id: item.stockno,
        stockno: item.stockno,
        batchsrlno: item.batchsrlno,
        itemdesc: item.itemdesc,
        class1: item.class1cd,
        class2: item.class2cd,
        subclass1: item.subclass1cd,
        subclass2: item.subclass2cd,
        size: item.sizecd,
        barcode: item.barcode || '',
        mrp: item.retail_price || 0,
        cost: item.dealer_price || 0,
        hsn: item.hsn_code || '',
        gst: item.gst_per || 0,
        stock: 0,
        ...item
      }));
      setRows(mapped);
      setModified(new Set());
    } catch (e) {
      setToast({ msg: "Sovereign Node Offline", ok: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (modified.size === 0) return;
    setIsSaving(true);
    try {
      const rowsToSave = rows.filter(r => modified.has(r.id));
      
      // ── Step 1: Extract & Sync Lookups (Product/Brand/AnalCodes) ───
      const lookupItems: any[] = [];
      rowsToSave.forEach(r => {
        if (r.class1) lookupItems.push({ recid: 1, code: r.class1, descr: r.class1 });
        if (r.class2) lookupItems.push({ recid: 2, code: r.class2, descr: r.class2 });
        // Add active analcodes to lookup sync if needed...
      });

      if (lookupItems.length > 0) {
        await api.items.syncLookups({ items: lookupItems });
      }

      // ── Step 2: Atomic Batch Create ──────────────────────────────
      const payload = rowsToSave.map(r => {
        const item: any = {
          stockno: r.stockno,
          itemdesc: r.itemdesc,
          class1cd: r.class1 || (bulkDefaults.use_class1 ? bulkDefaults.class1 : ""),
          class2cd: r.class2 || (bulkDefaults.use_class2 ? bulkDefaults.class2 : ""),
          subclass1cd: r.subclass1 || (bulkDefaults.use_subclass1 ? bulkDefaults.subclass1 : ""),
          subclass2cd: r.subclass2 || (bulkDefaults.use_subclass2 ? bulkDefaults.subclass2 : ""),
          sizecd: r.size || (bulkDefaults.use_size ? bulkDefaults.size : ""),
          retail_price: Number(r.mrp || (bulkDefaults.use_mrp ? bulkDefaults.mrp : 0)),
          dealer_price: Number(r.cost || (bulkDefaults.use_cost ? bulkDefaults.cost : 0)),
          hsn_code: r.hsn || (bulkDefaults.use_hsn ? bulkDefaults.hsn : ""),
          gst_per: Number(r.gst || (bulkDefaults.use_gst ? bulkDefaults.gst : 0)),
          batchsrlno: r.batchsrlno || '0',
        };

        // Add 36 analcodes with "use_" check
        for (let i = 1; i <= 36; i++) {
          const id = `analcode${i}`;
          item[id] = r[id] || (bulkDefaults[`use_${id}`] ? bulkDefaults[id] : "");
        }

        return item;
      });

      const res = await api.items.batchCreate({ items: payload, omit_duplicates: false });
      if (res.error_count === 0 && res.success_count > 0) {
        setToast({ msg: `Sovereign Sync Successful: ${res.success_count} items`, ok: true });
        setModified(new Set());
        loadData();
      } else if (res.success_count > 0 || res.error_count > 0) {
        setToast({ msg: `Sync Warning: ${res.success_count} saved, ${res.error_count} errors, ${res.skipped_count} skipped. ${res.last_error || ''}`, ok: false });
        if (res.success_count > 0) setModified(new Set());
      } else {
        setToast({ msg: `SYNC WARNING: ${res.success_count} SAVED, ${res.error_count} ERRORS. ${res.skipped_count} SKIPPED.`, ok: false });
      }
    } catch (e: any) {
      setToast({ msg: e.message || "Network Error during Sync", ok: false });
    } finally {
      setIsSaving(false);
    }
  };

  const columnDefs = useMemo((): ColDef[] => [
    { colId: 'stockno', field: 'stockno', headerName: 'Stock No', minWidth: 150, pinned: 'left', cellClass: 'font-mono font-bold', hide: !selectedFields.includes('stockno') },
    { colId: 'itemdesc', field: 'itemdesc', headerName: 'Description', minWidth: 200, hide: !selectedFields.includes('itemdesc') },
    { 
      colId: 'class1', field: 'class1', 
      headerName: masters.captions['class1cd'] || 'Product', 
      width: 100,
      cellStyle: (p: any) => !p.value ? { color: 'rgba(var(--primary-rgb), 0.4)', fontStyle: 'italic' } : null,
      valueGetter: (p: any) => p.data.class1 || bulkDefaults.class1,
      hide: !selectedFields.includes('class1')
    },
    { 
      colId: 'class2', field: 'class2', 
      headerName: masters.captions['class2cd'] || 'Brand', 
      width: 100,
      cellStyle: (p: any) => !p.value ? { color: 'rgba(var(--primary-rgb), 0.4)', fontStyle: 'italic' } : null,
      valueGetter: (p: any) => p.data.class2 || bulkDefaults.class2,
      hide: !selectedFields.includes('class2')
    },
    { colId: 'size', field: 'size', headerName: 'Size', width: 80, hide: !selectedFields.includes('size'), valueGetter: p => p.data.size || bulkDefaults.size, valueFormatter: p => resolveSizeGroup(p.value) || p.value },
    { 
      colId: 'mrp', field: 'mrp', headerName: 'Retail (₹)', type: 'numericColumn', cellClass: 'text-primary font-bold',
      valueGetter: (p: any) => p.data.mrp || bulkDefaults.mrp, hide: !selectedFields.includes('mrp')
    },
    { 
      colId: 'cost', field: 'cost', headerName: 'Cost (₹)', type: 'numericColumn',
      valueGetter: (p: any) => p.data.cost || bulkDefaults.cost, hide: !selectedFields.includes('cost')
    },
    { colId: 'hsn', field: 'hsn', headerName: 'HSN', width: 100, valueGetter: (p: any) => p.data.hsn || bulkDefaults.hsn, hide: !selectedFields.includes('hsn') },
    { colId: 'gst', field: 'gst', headerName: 'GST %', width: 80, valueGetter: (p: any) => p.data.gst || bulkDefaults.gst, hide: !selectedFields.includes('gst') },
    { colId: 'barcode', field: 'barcode', headerName: 'Barcode', width: 120, hide: !selectedFields.includes('barcode') },
    { colId: 'subclass1', field: 'subclass1', headerName: masters.captions['subclass1cd'] || 'Section', width: 100, hide: !selectedFields.includes('subclass1'), valueGetter: p => p.data.subclass1 || bulkDefaults.subclass1 },
    { colId: 'subclass2', field: 'subclass2', headerName: masters.captions['subclass2cd'] || 'Article', width: 100, hide: !selectedFields.includes('subclass2'), valueGetter: p => p.data.subclass2 || bulkDefaults.subclass2 },
    { colId: 'batchsrlno', field: 'batchsrlno', headerName: 'Batch No', width: 100, hide: !selectedFields.includes('batchsrlno') },
    ...Array.from({ length: 36 }).map((_, i) => {
      const id = `analcode${i + 1}`;
      const caption = masters.captions[id] || masters.captions[id.toUpperCase()] || `Anal Code ${i + 1}`;
      // Resolve recid for this analcode (1→RecID65, 2→RecID66, 3→RecID67, etc.)
      const analRecid = i < 6 ? 65 + i : 7000 + (i - 6);
      const col: ColDef = {
        colId: id, field: id, headerName: caption, width: 140, hide: !selectedFields.includes(id),
        valueGetter: (p: any) => p.data[id] || (bulkDefaults[`use_${id}`] ? bulkDefaults[id] : null),
        // Show description from GenLookup if a match exists, else show raw code
        valueFormatter: (p: any) => {
          if (!p.value) return '';
          // We can only sync resolve for analcode1–3 which are pre-fetched
          if (i === 0) return resolveAC1(p.value) || p.value;
          if (i === 1) return resolveAC2(p.value) || p.value;
          if (i === 2) return resolveAC3(p.value) || p.value;
          return p.value; // Others show raw code until lazy-fetched
        }
      };
      return col;
    })
  ], [selectedFields, masters, bulkDefaults]);

  const commonFields = useMemo(() => {
    const allPossible = [
      { id: 'class1', name: masters.captions['class1cd'] || 'Category', type: 'select', options: class1Options.map(o => ({ code: o.code, descr: o.label })) },
      { id: 'class2', name: masters.captions['class2cd'] || 'Brand', type: 'select', options: class2Options.map(o => ({ code: o.code, descr: o.label })) },
      { id: 'subclass1', name: masters.captions['subclass1cd'] || 'Section', type: 'text' },
      { id: 'subclass2', name: masters.captions['subclass2cd'] || 'Article', type: 'text' },
      { id: 'size', name: 'Size', type: 'text' },
      { id: 'mrp', name: 'Retail Price (₹)', type: 'number' },
      { id: 'cost', name: 'Dealer Price (₹)', type: 'number' },
      { id: 'hsn', name: 'HSN Code', type: 'text' },
      { id: 'gst', name: 'GST %', type: 'number' },
      { id: 'taxtype', name: 'Tax Type', type: 'text' },
      { id: 'regularind', name: 'Reg/Pro', type: 'text' },
      ...Array.from({ length: 36 }).map((_, i) => {
        const id = `analcode${i+1}`;
        const caption = masters.captions[id] || masters.captions[id.toUpperCase()];
        if (!caption) return null;
        if (i === 0 && analcode1Options.length > 0) return { id, name: caption, type: 'select', options: analcode1Options.map(o => ({ code: o.code, descr: o.label })) };
        if (i === 1 && analcode2Options.length > 0) return { id, name: caption, type: 'select', options: analcode2Options.map(o => ({ code: o.code, descr: o.label })) };
        if (i === 2 && analcode3Options.length > 0) return { id, name: caption, type: 'select', options: analcode3Options.map(o => ({ code: o.code, descr: o.label })) };
        return { id, name: caption, type: 'text' };
      })
    ].filter(Boolean) as any[];
    return allPossible;
  }, [masters, class1Options, class2Options, analcode1Options, analcode2Options, analcode3Options]);

  // ── allPossibleFields: Flat string[] list of all configurable field IDs ──
  // This is the SINGLE SOURCE OF TRUTH for the VIEW tab classification panel.
  // The COMMON tab and Matrix Generator both derive from selectedFields (a subset of this).
  const allPossibleFields = useMemo(() => [
    'stockno', 'itemdesc', 'class1', 'class2', 'subclass1', 'subclass2',
    'size', 'mrp', 'cost', 'hsn', 'gst', 'barcode', 'batchsrlno',
    ...Array.from({ length: 36 }, (_, i) => `analcode${i + 1}`)
      .filter(id => !!(masters.captions[id] || masters.captions[id.toUpperCase()]))
  ], [masters.captions]);

  return (
    <div className="flex flex-col h-full bg-surface select-none overflow-hidden font-sans">
      <div className="flex-shrink-0 bg-surface border-b border-outline-variant flex gap-1 p-1 px-4 z-20">
        {[
          { id: 'VIEW', name: 'View (Alt+1)', icon: <Layers size={14} /> },
          { id: 'COMMON', name: 'Common Fields (Alt+2)', icon: <Database size={14} /> },
          { id: 'DETAILS', name: 'Item Details (Alt+3)', icon: <Grid3X3 size={14} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={cn("h-10 px-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-t-lg", activeTab === t.id ? "bg-primary text-white" : "text-outline/40 hover:text-outline")}>
            {t.icon} {t.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'VIEW' && (
          <div className="h-full flex flex-col p-8 bg-surface/50 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto w-full space-y-10">
              <div className="flex items-center justify-between border-b border-outline-variant pb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-outline">Institutional Classification</h2>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Configure Item DNA · Active Attributes Only</p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.setItem('smriti_item_fields', JSON.stringify(selectedFields));
                    setToast({ msg: "Institutional Setup Finalized!", ok: true });
                  }}
                  className="h-12 px-8 bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3"
                >
                  <Save size={18} /> Save Setup
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {allPossibleFields.map(f => {
                  const isCore = ['stockno', 'itemdesc', 'barcode'].includes(f);
                  const isSelected = selectedFields.includes(f);
                  const label = masters.captions[f] || masters.captions[f.toUpperCase()] || f;

                  return (
                    <div 
                      key={f} 
                      onClick={() => !isCore && setSelectedFields(prev => isSelected ? prev.filter(x => x !== f) : [...prev, f])}
                      className={cn(
                        "p-4 border-2 rounded-xl cursor-pointer transition-all flex flex-col gap-2 group",
                        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-outline-variant opacity-60 hover:opacity-100",
                        isCore && "border-emerald-500/20 bg-emerald-500/5 cursor-not-allowed opacity-100"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className={cn("p-1.5 rounded", isSelected ? "bg-primary text-white" : "bg-surface-container text-outline/40")}>
                          <Settings size={14} />
                        </div>
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", isSelected ? "border-primary bg-primary text-white" : "border-outline-variant")}>
                          {isSelected && <Check size={10} strokeWidth={4} />}
                        </div>
                      </div>
                      <p className="text-[10px] font-black uppercase truncate text-outline">{label}</p>
                      {isCore && <span className="text-[7px] font-black text-emerald-600 uppercase">Core</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'COMMON' && (
          <div className="h-full flex flex-col p-8 bg-surface/50 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto w-full space-y-8">
              <div className="flex items-center justify-between border-b border-outline-variant pb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-outline">Common Session Values</h2>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Locked Defaults for High-Velocity Entry</p>
                </div>
                <button onClick={saveCommonDefaults} className="h-12 px-10 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3">
                  <Lock size={18} /> Apply DNA Locks (F9)
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedFields
                  .filter(f => !['stockno', 'itemdesc', 'barcode', 'batchsrlno'].includes(f))
                  .map(f => (
                    <div key={f} className={cn("p-6 bg-surface border-2 rounded-2xl transition-all", tempDefaults[`use_${f}`] ? "border-primary shadow-lg shadow-primary/5" : "border-outline-variant")}>
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-[11px] font-black uppercase tracking-widest text-outline">{masters.captions[f] || f}</label>
                        <div 
                          onClick={() => setTempDefaults(prev => ({ ...prev, [`use_${f}`]: !prev[`use_${f}`] }))}
                          className={cn("w-12 h-6 rounded-full p-1 cursor-pointer transition-all", tempDefaults[`use_${f}`] ? "bg-primary" : "bg-outline-variant")}
                        >
                          <div className={cn("w-4 h-4 bg-white rounded-full transition-all", tempDefaults[`use_${f}`] ? "translate-x-6" : "translate-x-0")} />
                        </div>
                      </div>
                      {f === 'class1' ? (
                        <select
                          value={tempDefaults[f] || ""}
                          disabled={!tempDefaults[`use_${f}`]}
                          onChange={e => {
                            const val = e.target.value;
                            setTempDefaults(prev => ({ ...prev, [f]: val }));
                            fetchClass2List(val);
                          }}
                          className={cn("w-full h-12 bg-surface-container/50 border border-outline-variant rounded-xl px-4 text-xs font-bold transition-all text-outline", !tempDefaults[`use_${f}`] && "opacity-30")}
                        >
                          <option value="">-- Select Product --</option>
                          {class1List.map((c: any) => <option key={c.code} value={c.code}>{c.descr || c.code}</option>)}
                        </select>
                      ) : f === 'class2' ? (
                        <select
                          value={tempDefaults[f] || ""}
                          disabled={!tempDefaults[`use_${f}`]}
                          onChange={e => {
                            const val = e.target.value;
                            setTempDefaults(prev => ({ ...prev, [f]: val }));
                            fetchClass1List(val);
                          }}
                          className={cn("w-full h-12 bg-surface-container/50 border border-outline-variant rounded-xl px-4 text-xs font-bold transition-all text-outline", !tempDefaults[`use_${f}`] && "opacity-30")}
                        >
                          <option value="">-- All Brands --</option>
                          {class2List.map((c: any) => <option key={c.code} value={c.code}>{c.descr || c.code}</option>)}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={tempDefaults[f] || ""} 
                          disabled={!tempDefaults[`use_${f}`]}
                          onChange={e => setTempDefaults(prev => ({ ...prev, [f]: e.target.value }))}
                          className={cn("w-full h-12 bg-surface-container/50 border border-outline-variant rounded-xl px-4 text-xs font-bold transition-all text-outline", !tempDefaults[`use_${f}`] && "opacity-30")}
                          placeholder="Value..."
                        />
                      )}
                    </div>
                  ))}
                {selectedFields.filter(f => !['stockno', 'itemdesc', 'barcode', 'batchsrlno'].includes(f)).length === 0 && (
                  <div className="col-span-full py-20 text-center border-4 border-dashed border-outline-variant rounded-3xl opacity-40">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">No Active Attributes</p>
                    <p className="text-[10px] font-bold uppercase mt-2">Enable classification in the View tab first</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DETAILS' && (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 bg-surface-container/30 border-b border-outline-variant px-4 h-12 flex items-center justify-between">
              <div className="flex gap-4">
                <button onClick={() => setViewFilter("all")} className={cn("text-[10px] font-black uppercase tracking-widest", viewFilter === "all" ? "text-primary" : "text-outline/40")}>Whole Catalog</button>
                <button onClick={() => setViewFilter("modified")} className={cn("text-[10px] font-black uppercase tracking-widest", viewFilter === "modified" ? "text-primary" : "text-outline/40")}>Draft Workbench ({modified.size})</button>
              </div>
              <div className="flex items-center gap-3">
                <input placeholder="Quick filter..." onChange={e => gridRef.current?.api.setGridOption('quickFilterText', e.target.value)} className="h-8 w-64 bg-surface border border-outline-variant text-[10px] px-3 font-bold rounded" />
                <button
                  onClick={() => setIsMatrixOpen(true)}
                  className={cn(
                    "h-8 px-4 border text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                    matrixSourceRow
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500 hover:text-white"
                      : "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white"
                  )}
                >
                  <Zap size={14} />
                  {matrixSourceRow ? `Expand: ${String(matrixSourceRow.stockno).slice(0,12)}...` : 'Matrix'}
                </button>
                {enableBarcodePrinting && matrixSourceRow && printTemplates.length > 0 && (
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="h-8 px-4 bg-surface-container-high border border-outline-variant text-[9px] font-black uppercase flex items-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all text-outline"
                  >
                    <Printer size={14} />
                    Print
                  </button>
                )}
                <button onClick={() => {
                  const now = Date.now();
                  setRows([{ id: now, stockno: `NEW-${now}`, batchsrlno: '0', itemdesc: 'NEW ITEM', class1: '', class2: '', subclass1: '', subclass2: '', size: '', barcode: '', mrp: 0, cost: 0, hsn: '', gst: 0, stock: 0 }, ...rows]);
                  setModified(prev => new Set(prev).add(now));
                  setViewFilter("modified");
                }} className="h-8 px-4 bg-surface border border-outline-variant text-[9px] font-black uppercase flex items-center gap-2"><Plus size={14} /> Add Row</button>
                <button onClick={handleSave} disabled={isSaving || modified.size === 0} className="h-8 px-6 bg-emerald-600 text-white text-[9px] font-black uppercase flex items-center gap-2">{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Commit ({modified.size})</button>
              </div>
            </div>
            <div className="flex-1 relative">
              <AgGridReact
                ref={gridRef}
                rowData={rows}
                columnDefs={columnDefs}
                theme={smritiTheme}
                onCellValueChanged={e => setModified(prev => new Set(prev).add(e.data.id))}
                onColumnMoved={onColumnMoved}
                stopEditingWhenCellsLoseFocus={true}
                getRowId={p => String(p.data.id)}
                isExternalFilterPresent={() => viewFilter === "modified"}
                doesExternalFilterPass={n => modified.has(n.data.id)}
                rowSelection={{ mode: 'singleRow' }}
                onRowSelected={e => {
                  if (e.node.isSelected()) {
                    setMatrixSourceRow(e.data as ItemRow);
                  } else {
                    setMatrixSourceRow(null);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Matrix Generator Engine Modal ────────────────────────────── */}
      {showPrintModal && selectedPrintTemplate && matrixSourceRow && (
        <div className="z-[200] relative">
          <BarcodePrintPreview 
            template={selectedPrintTemplate}
            items={[matrixSourceRow]}
            copiesPerItem={1}
            onClose={() => setShowPrintModal(false)}
          />
        </div>
      )}

      {isMatrixOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-surface w-full max-w-3xl shadow-2xl border border-outline-variant flex flex-col max-h-[92vh] rounded-xl overflow-hidden">

            {/* ── Header ── */}
            <div className="p-5 border-b border-outline-variant flex items-center justify-between bg-surface-container/40 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 text-white rounded-xl shadow-lg", matrixSourceRow ? "bg-amber-500 shadow-amber-500/20" : "bg-primary shadow-primary/20")}><Sparkles size={20} /></div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-outline">
                    {matrixSourceRow ? 'Expand Item Matrix' : 'Sovereign Matrix Engine'}
                  </h2>
                  <p className={cn("text-[9px] font-bold uppercase tracking-[0.2em]", matrixSourceRow ? "text-amber-600" : "text-primary")}>
                    {matrixSourceRow
                      ? `Expanding: ${String(matrixSourceRow.stockno)} · ${selectedCombos.size > 0 ? `${selectedCombos.size} Variants Selected` : 'Pick Variants'}`
                      : `Class12Combo DNA · S9-Core · ${selectedCombos.size > 0 ? `${selectedCombos.size} Selected` : 'Select Combinations'}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {matrixSourceRow && (
                  <button
                    onClick={() => setMatrixSourceRow(null)}
                    className="text-[9px] font-black uppercase text-outline/50 hover:text-outline border border-outline-variant px-3 py-1 rounded-lg hover:bg-surface-container transition-all"
                  >
                    Clear Source
                  </button>
                )}
                <button onClick={() => setIsMatrixOpen(false)} className="p-2 hover:bg-surface-container rounded-full text-outline/40 hover:text-outline transition-all"><X size={20} /></button>
              </div>
            </div>

            {/* ── Source Row Banner (Expand Mode) ── */}
            {matrixSourceRow ? (
              <div className="mx-6 mt-4 mb-0 p-4 bg-amber-500/8 border-2 border-amber-500/30 rounded-xl flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center mt-0.5">▼</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-[11px] font-black uppercase text-amber-700">{matrixSourceRow.stockno}</span>
                      <span className="text-[10px] font-bold text-outline/70 truncate">{matrixSourceRow.itemdesc}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { k: 'Class1', v: matrixSourceRow.class1 },
                        { k: 'Class2', v: matrixSourceRow.class2 },
                        { k: masters.captions['subclass1cd'] || 'SC1', v: (matrixSourceRow as any).subclass1 },
                        { k: masters.captions['subclass2cd'] || 'SC2', v: (matrixSourceRow as any).subclass2 },
                        { k: 'MRP', v: matrixSourceRow.mrp ? `₹${matrixSourceRow.mrp}` : null },
                        { k: 'Cost', v: matrixSourceRow.cost ? `₹${matrixSourceRow.cost}` : null },
                        { k: 'GST', v: matrixSourceRow.gst ? `${matrixSourceRow.gst}%` : null },
                        { k: 'HSN', v: matrixSourceRow.hsn },
                        // Show all analcodes that have values
                        ...selectedFields
                          .filter(f => f.startsWith('analcode') && (matrixSourceRow as any)[f])
                          .map(f => ({ k: masters.captions[f] || f, v: (matrixSourceRow as any)[f] }))
                      ].filter(x => x.v).map(({ k, v }) => (
                        <span key={k} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/15 border border-amber-500/30 rounded-md text-[8px] font-black uppercase">
                          <span className="text-amber-800/60">{k}:</span>
                          <span className="text-amber-900">{String(v)}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-[8px] font-bold text-amber-600/70 uppercase mt-2">All above fields will be inherited by every generated variant. Only the pivot value will change.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-6 mt-4 mb-0 px-4 py-2 bg-surface-container/50 border border-outline-variant rounded-xl flex items-center gap-2">
                <AlertCircle size={12} className="text-outline/40 flex-shrink-0" />
                <span className="text-[9px] font-bold uppercase text-outline/50">No source row selected — fields will use Common Defaults. Select a row in Tab 3 to expand it.</span>
              </div>
            )}

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

              {/* ── STEP 0: Class DNA Selectors ─────────────────────────────────── */}
              <div className="p-6 border-b border-outline-variant bg-primary/3 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">0</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-outline">Class DNA — Product & Brand Selection</span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-outline/70 ml-1">{masters.captions['class1cd'] || 'Class1 / Product'}</label>
                    <select
                      value={matrixClass1}
                      onChange={e => { 
                        const val = e.target.value;
                        setMatrixClass1(val); 
                        setComboValues([]); 
                        setSelectedCombos(new Set()); 
                        fetchClass2List(val);
                      }}
                      className="w-full h-11 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-4 rounded-xl text-outline"
                    >
                      <option value="">-- Select Product --</option>
                      {class1List.map((c: any) => (
                        <option key={c.code} value={c.code}>{c.descr || c.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-outline/70 ml-1">{masters.captions['class2cd'] || 'Class2 / Brand'} (Optional Filter)</label>
                    <select
                      value={matrixClass2}
                      onChange={e => { 
                        const val = e.target.value;
                        setMatrixClass2(val); 
                        setComboValues([]); 
                        setSelectedCombos(new Set()); 
                        fetchClass1List(val);
                      }}
                      className="w-full h-11 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-4 rounded-xl text-outline"
                    >
                      <option value="">-- All Brands --</option>
                      {class2List.map((c: any) => (
                        <option key={c.code} value={c.code}>{c.descr || c.code}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => fetchComboValues(matrixClass1, matrixClass2, matrixPivot)}
                    disabled={!matrixClass1 || isFetchingCombo || (matrixPivot === 'size' && !matrixClass2)}
                    className={cn("h-11 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                      matrixClass1 && !(matrixPivot === 'size' && !matrixClass2) ? "bg-primary text-white shadow-lg active:scale-95" : "bg-surface-container text-outline/30 cursor-not-allowed"
                    )}
                  >
                    {isFetchingCombo ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                    {matrixPivot === 'size' ? 'Load Sizes' : 'Load Combos'}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">

                {/* ── STEP 1: StockNo + Pivot ───────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">1</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-outline">StockNo Generation</span>
                    </div>
                    <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant w-fit mb-2">
                      <button onClick={() => setTempDefaults({...tempDefaults, stockno_mode: 'auto'})}
                        className={cn("px-4 py-1.5 text-[9px] font-black uppercase rounded-md transition-all", (tempDefaults.stockno_mode || 'auto') === 'auto' ? "bg-primary text-white" : "text-outline/60 hover:text-outline")}
                      >Auto</button>
                      <button onClick={() => setTempDefaults({...tempDefaults, stockno_mode: 'manual'})}
                        className={cn("px-4 py-1.5 text-[9px] font-black uppercase rounded-md transition-all", tempDefaults.stockno_mode === 'manual' ? "bg-primary text-white" : "text-outline/60 hover:text-outline")}
                      >Manual</button>
                    </div>
                    {tempDefaults.stockno_mode === 'manual' ? (
                      <textarea
                        value={matrixManualSNs}
                        onChange={e => setMatrixManualSNs(e.target.value)}
                        className="w-full h-20 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-[11px] font-mono font-bold p-3 rounded-xl text-outline resize-none"
                        placeholder="SN001, SN002, SN003  (comma separated)"
                      />
                    ) : (
                      <input
                        type="text"
                        value={matrixBase}
                        onChange={e => setMatrixBase(e.target.value)}
                        className="w-full h-11 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-sm font-bold px-4 rounded-xl text-outline"
                        placeholder="Item Prefix e.g. NIKE-AIR-MAX"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">2</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-outline">Pivot Attribute</span>
                    </div>
                    <select
                      value={matrixPivot}
                      onChange={e => {
                        setMatrixPivot(e.target.value);
                        setComboValues([]);
                        setSelectedCombos(new Set());
                      }}
                      className="w-full h-11 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-sm font-bold px-4 rounded-xl text-outline"
                    >
                      <option value="">-- Select Pivot --</option>
                      <option value="class2">Brand (Class2)</option>
                      <option value="size">Size</option>
                      <option value="subclass1">{masters.captions['subclass1cd'] || 'SubClass1'}</option>
                      <option value="subclass2">{masters.captions['subclass2cd'] || 'SubClass2'}</option>
                      {selectedFields.filter(f => !['stockno','itemdesc','barcode','batchsrlno','class1','class2','size','subclass1','subclass2','mrp','cost','hsn','gst'].includes(f)).map(f => (
                        <option key={f} value={f}>{masters.captions[f] || masters.captions[f.toUpperCase()] || f}</option>
                      ))}
                    </select>
                    {/* Balance attrs — controlled inputs via tempDefaults */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {!bulkDefaults.use_mrp && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-outline/70 uppercase ml-1">MRP ₹</span>
                          <input type="number" value={tempDefaults.matrix_mrp || ''} onChange={e => setTempDefaults(p => ({...p, matrix_mrp: e.target.value}))}
                            className="w-full h-9 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-3 rounded-lg text-outline" placeholder="0" />
                        </div>
                      )}
                      {!bulkDefaults.use_cost && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-outline/70 uppercase ml-1">Cost ₹</span>
                          <input type="number" value={tempDefaults.matrix_cost || ''} onChange={e => setTempDefaults(p => ({...p, matrix_cost: e.target.value}))}
                            className="w-full h-9 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-3 rounded-lg text-outline" placeholder="0" />
                        </div>
                      )}
                      {!bulkDefaults.use_gst && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-outline/70 uppercase ml-1">GST %</span>
                          <input type="number" value={tempDefaults.matrix_gst || ''} onChange={e => setTempDefaults(p => ({...p, matrix_gst: e.target.value}))}
                            className="w-full h-9 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-3 rounded-lg text-outline" placeholder="0" />
                        </div>
                      )}
                      {!bulkDefaults.use_hsn && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-outline/70 uppercase ml-1">HSN</span>
                          <input type="text" value={tempDefaults.matrix_hsn || ''} onChange={e => setTempDefaults(p => ({...p, matrix_hsn: e.target.value}))}
                            className="w-full h-9 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-3 rounded-lg text-outline" placeholder="HSN Code" />
                        </div>
                      )}
                    </div>

                    {/* Additional DNA Attributes (Subclass1, Subclass2, Analcodes) only in New Mode */}
                    {!matrixSourceRow && (
                      <div className="mt-4 border-t border-outline-variant pt-3">
                        <span className="text-[9px] font-black uppercase text-outline/60 tracking-widest block mb-2">Additional Matrix DNA</span>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedFields
                            .filter(f => !['stockno', 'itemdesc', 'barcode', 'batchsrlno', 'class1', 'class2', 'size', 'mrp', 'cost', 'hsn', 'gst'].includes(f))
                            .filter(f => !bulkDefaults[`use_${f}`]) // skip if locked in common
                            .map(f => (
                              <div key={f} className="space-y-1">
                                <span className="text-[9px] font-black text-outline/70 uppercase ml-1">{masters.captions[f] || masters.captions[f.toUpperCase()] || f}</span>
                                {f === 'analcode1' ? (
                                  <select 
                                    value={tempDefaults[`matrix_${f}`] || ''} 
                                    onChange={e => setTempDefaults(p => ({...p, [`matrix_${f}`]: e.target.value}))}
                                    className="w-full h-9 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-3 rounded-lg text-outline"
                                  >
                                    <option value="">-- Select --</option>
                                    {analcode1Options.map((o: any) => <option key={o.code} value={o.code}>{o.descr || o.code}</option>)}
                                  </select>
                                ) : f === 'analcode2' ? (
                                  <select 
                                    value={tempDefaults[`matrix_${f}`] || ''} 
                                    onChange={e => setTempDefaults(p => ({...p, [`matrix_${f}`]: e.target.value}))}
                                    className="w-full h-9 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-3 rounded-lg text-outline"
                                  >
                                    <option value="">-- Select --</option>
                                    {analcode2Options.map((o: any) => <option key={o.code} value={o.code}>{o.descr || o.code}</option>)}
                                  </select>
                                ) : f === 'analcode3' ? (
                                  <select 
                                    value={tempDefaults[`matrix_${f}`] || ''} 
                                    onChange={e => setTempDefaults(p => ({...p, [`matrix_${f}`]: e.target.value}))}
                                    className="w-full h-9 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-3 rounded-lg text-outline"
                                  >
                                    <option value="">-- Select --</option>
                                    {analcode3Options.map((o: any) => <option key={o.code} value={o.code}>{o.descr || o.code}</option>)}
                                  </select>
                                ) : (
                                  <input type="text" value={tempDefaults[`matrix_${f}`] || ''} onChange={e => setTempDefaults(p => ({...p, [`matrix_${f}`]: e.target.value}))}
                                    className="w-full h-9 bg-surface border-2 border-outline-variant focus:border-primary outline-none text-xs font-bold px-3 rounded-lg text-outline" placeholder="..." />
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── STEP 3: Generation Engine ────────────────────────────── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">3</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-outline">
                        Variant Generation Engine
                        {matrixGenMode === 'db' && comboValues.length > 0 && <span className="ml-2 text-primary">({comboValues.length} found)</span>}
                      </span>
                    </div>
                    <div className="flex bg-surface border border-outline-variant rounded p-0.5 shadow-sm">
                      <button onClick={() => setMatrixGenMode('db')} className={cn("px-4 py-1 text-[9px] font-black uppercase rounded transition-all", matrixGenMode === 'db' ? "bg-primary text-white" : "text-outline/50 hover:text-outline")}>Database Sync</button>
                      <button onClick={() => setMatrixGenMode('fast')} className={cn("px-4 py-1 text-[9px] font-black uppercase rounded transition-all", matrixGenMode === 'fast' ? "bg-primary text-white" : "text-outline/50 hover:text-outline")}>Ad-Hoc Multiplier</button>
                    </div>
                  </div>

                  {matrixGenMode === 'db' && comboValues.length > 0 && (
                    <div className="flex justify-end gap-2 mb-1">
                      <button onClick={() => setSelectedCombos(new Set(comboValues.map((v: any) => v.code)))}
                        className="text-[9px] font-black uppercase text-primary hover:underline">Select All</button>
                      <span className="text-outline/30">·</span>
                      <button onClick={() => setSelectedCombos(new Set())}
                        className="text-[9px] font-black uppercase text-outline/50 hover:text-outline hover:underline">Clear</button>
                    </div>
                  )}

                  {matrixGenMode === 'db' ? (
                    <div className="h-52 bg-surface-container/40 border-2 border-outline-variant rounded-xl overflow-y-auto p-3 custom-scrollbar">
                    {isFetchingCombo ? (
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-primary" size={28} />
                        <span className="text-[9px] font-black text-primary uppercase">
                          {matrixPivot === 'size' ? 'Loading Sizes from Sizecat...' : 'Loading DNA from Class12combo...'}
                        </span>
                      </div>
                    ) : comboValues.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {comboValues.map((v: any) => {
                          const isSelected = selectedCombos.has(v.code);
                          return (
                            <button
                              key={v.code}
                              onClick={() => {
                                const next = new Set(selectedCombos);
                                isSelected ? next.delete(v.code) : next.add(v.code);
                                setSelectedCombos(next);
                              }}
                              className={cn(
                                "text-left p-3 rounded-lg border-2 transition-all",
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-md"
                                  : "border-outline-variant/50 hover:border-primary/50 hover:bg-surface"
                              )}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-[11px] font-black uppercase truncate text-outline flex-1">{v.descr || v.code}</span>
                                {isSelected && <Check size={12} className="text-primary flex-shrink-0 mt-0.5" strokeWidth={3} />}
                              </div>
                              {/* M5 fix: show actual class12combo fields only if not size pivot */}
                              {matrixPivot !== 'size' && (
                                <span className="text-[8px] font-bold text-outline/50 uppercase">
                                  {v.prodtaxtype ? `Tax: ${v.prodtaxtype}` : 'Std Tax'}
                                  {v.retailmarkup > 0 ? ` · Mkup: ${v.retailmarkup}%` : ''}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                        <Database size={36} className="text-outline/40 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-outline/60">
                          {matrixClass1 ? 'Click "Load Combos" to fetch Class12combo data' : 'Select Class1 (Product) first, then Load Combos'}
                        </p>
                      </div>
                    )}
                  </div>
                  ) : (
                    <div className="h-52 bg-surface-container/40 border-2 border-outline-variant rounded-xl p-5 flex flex-col gap-4">
                      <div className="space-y-2 flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary flex justify-between">
                          <span>Sizes Array</span>
                          <span className="text-outline/40">Comma Separated</span>
                        </label>
                        <textarea value={fastSizes} onChange={e=>setFastSizes(e.target.value)} className="w-full h-12 bg-surface border-2 border-outline-variant focus:border-primary text-xs font-bold p-3 rounded-xl outline-none" placeholder="e.g. 36, 37, 38, 39, 40" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary flex justify-between">
                          <span>Colors Array (Analcode 1)</span>
                          <span className="text-outline/40">Comma Separated</span>
                        </label>
                        <textarea value={fastColors} onChange={e=>setFastColors(e.target.value)} className="w-full h-12 bg-surface border-2 border-outline-variant focus:border-primary text-xs font-bold p-3 rounded-xl outline-none" placeholder="e.g. Red, Blue, Black" />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* ── Footer / Generate Button ── */}
            <div className="p-5 bg-surface-container/50 border-t border-outline-variant flex gap-4 flex-shrink-0">
              <button
                onClick={() => {
                  // All values from React state — zero DOM queries (M6 fix)
                  const mode = tempDefaults.stockno_mode || 'auto';
                  const base = matrixBase || 'ITEM';
                  const manualSNs = matrixManualSNs.split(',').map(s => s.trim()).filter(s => s);
                  const vals = Array.from(selectedCombos);

                  if (!matrixClass1) {
                    setToast({ msg: 'Select Class1 (Product) first', ok: false }); return;
                  }

                  let genConfigs: {v: string, descr: string, size: string, color: string, isCombo: boolean, comboRec: any}[] = [];

                  if (matrixGenMode === 'fast') {
                    const sizes = fastSizes ? fastSizes.split(',').map(s=>s.trim()).filter(Boolean) : [''];
                    const colors = fastColors ? fastColors.split(',').map(s=>s.trim()).filter(Boolean) : [''];
                    sizes.forEach(s => {
                      colors.forEach(c => {
                        if (!s && !c) return; // skip if both empty
                        const suffix = [c, s].filter(Boolean).join('-');
                        genConfigs.push({ v: suffix, descr: suffix, size: s, color: c, isCombo: false, comboRec: {} });
                      });
                    });
                  } else {
                    const vals = Array.from(selectedCombos);
                    genConfigs = vals.map(code => {
                      const rec = comboValues.find((x: any) => x.code === code) || {} as any;
                      return { v: code, descr: rec.descr || code, size: '', color: '', isCombo: true, comboRec: rec };
                    });
                  }

                  if (genConfigs.length === 0) {
                    setToast({ msg: matrixGenMode === 'fast' ? 'Enter at least one size or color' : 'Select at least one combination', ok: false }); return;
                  }
                  if (mode === 'manual' && manualSNs.length < genConfigs.length) {
                    setToast({ msg: `Provide at least ${genConfigs.length} StockNos (have ${manualSNs.length})`, ok: false }); return;
                  }

                  const newRows: ItemRow[] = genConfigs.map(({v, descr: variantDescr, size, color, isCombo, comboRec}, idx) => {
                    const stockno = mode === 'manual' ? manualSNs[idx] : `${base}-${v}`;

                    const sourceFields: any = matrixSourceRow ? { ...matrixSourceRow } : {};

                    // Calculate fast fields mapping (map Size to 'size' and Color to 'subclass2')
                    const fastOverrides = matrixGenMode === 'fast' ? { 
                      ...(size ? { size } : {}), 
                      ...(color ? { analcode1: color } : {}) 
                    } : {};

                    const item: any = {
                      ...sourceFields,
                      id: `${Date.now()}-${idx}`,
                      stockno,
                      batchsrlno: sourceFields.batchsrlno || '0',
                      itemdesc: matrixSourceRow
                        ? `${matrixSourceRow.itemdesc || base} - ${variantDescr}`.trim()
                        : `${base} ${variantDescr}`.trim(),
                      class1: matrixClass1 || comboRec.class1cd || sourceFields.class1 || bulkDefaults.class1 || '',
                      class2: comboRec.class2cd || matrixClass2 || sourceFields.class2 || bulkDefaults.class2 || '',
                      hsn: tempDefaults.matrix_hsn || sourceFields.hsn || bulkDefaults.hsn || '',
                      gst: Number(tempDefaults.matrix_gst || sourceFields.gst || bulkDefaults.gst || 0),
                      mrp: Number(tempDefaults.matrix_mrp || sourceFields.mrp || bulkDefaults.mrp || 0),
                      cost: Number(tempDefaults.matrix_cost || sourceFields.cost || bulkDefaults.cost || 0),
                      ...Object.fromEntries(
                        selectedFields
                          .filter(f => !['stockno', 'itemdesc', 'barcode', 'batchsrlno', 'class1', 'class2', 'size', 'mrp', 'cost', 'hsn', 'gst'].includes(f))
                          .map(f => [f, tempDefaults[`matrix_${f}`] || sourceFields[f] || bulkDefaults[f] || ''])
                      ),
                      ...Object.fromEntries(
                        Object.keys(bulkDefaults)
                          .filter(k => k.startsWith('use_') && bulkDefaults[k])
                          .map(k => [k.replace('use_', ''), bulkDefaults[k.replace('use_', '')]])
                      ),
                      ...(isCombo ? { [matrixPivot || 'class2']: v } : fastOverrides),
                      stock: 0,
                    };
                    return item as ItemRow;
                  });

                  // Pre-flight collision warning check locally
                  const existingStockNos = new Set(rows.map(r => r.stockno));
                  const collisions = newRows.filter(r => existingStockNos.has(r.stockno));
                  let finalRows = newRows;
                  if (collisions.length > 0) {
                    if (!window.confirm(`Warning: ${collisions.length} StockNos already exist in the grid and will be skipped. Continue?`)) {
                      return;
                    }
                    finalRows = newRows.filter(r => !existingStockNos.has(r.stockno));
                  }
                  
                  if (finalRows.length === 0) return;

                  setRows(prev => [...finalRows, ...prev]);
                  setModified(prev => {
                    const next = new Set(prev);
                    finalRows.forEach(nr => next.add(nr.id));
                    return next;
                  });
                  setViewFilter('modified');
                  setIsMatrixOpen(false);
                  setActiveTab('DETAILS');
                  setToast({ msg: `${newRows.length} Atomic SKUs generated — Review & Commit`, ok: true });
                }}
                className="flex-1 h-12 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 rounded-xl"
              >
                <Zap size={18} fill="currentColor" />
                Generate {selectedCombos.size > 0 ? selectedCombos.size : ''} Atomic SKUs
              </button>
              <button onClick={() => setIsMatrixOpen(false)}
                className="px-8 h-12 border-2 border-outline-variant text-[11px] font-black uppercase tracking-[0.1em] hover:bg-surface-container transition-all rounded-xl text-outline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 h-8 bg-surface-container border-t border-outline-variant px-4 flex items-center justify-between text-[9px] font-mono font-bold uppercase text-outline">
        <div className="flex gap-5 items-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Sovereign Node X01 · AG Grid v35</span>
          {modified.size > 0 && <span className="text-amber-600 animate-bounce">{modified.size} PENDING COMMIT</span>}
        </div>
        <div className="flex gap-4">
          <span className="text-outline/40">Alt+1: Config</span>
          <span className="text-outline/40">Alt+2: Common</span>
          <span className="text-outline/40">Alt+3: Grid</span>
          <span className="text-primary font-black">F9: Lock Env</span>
          <span className="text-emerald-600 font-black">F10: Sovereign Commit</span>
        </div>
      </div>

      {toast && (
        <div className={cn("fixed bottom-12 right-6 px-6 py-3 text-xs font-black uppercase shadow-2xl border-l-4 z-50 flex items-center gap-3", toast.ok ? "bg-emerald-600 text-white border-emerald-400" : "bg-red-600 text-white border-red-400")}>
          {toast.ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} {toast.msg}
        </div>
      )}
    </div>
  );
}
