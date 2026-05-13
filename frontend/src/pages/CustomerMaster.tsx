import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, CellValueChangedEvent, RowClassParams } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import {
  Grid3X3, FileText, Search, Database, Plus, Save,
  Trash2, CheckCircle2, Activity, AlertTriangle, X, Download, Users, Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/api/client';

// ── Register ALL AG Grid Community modules once ──────────────────────────────
ModuleRegistry.registerModules([AllCommunityModule]);

// ── Smriti Dark Theme via AG Grid Theming API ────────────────────────────────
const smritiTheme = themeQuartz.withParams({
  backgroundColor:          '#020617',
  foregroundColor:          'rgba(255,255,255,0.82)',
  headerBackgroundColor:    '#0f172a',
  headerTextColor:          'rgba(255,255,255,0.5)',
  headerFontWeight:         700,
  headerFontSize:           10,
  rowHoverColor:            '#1e293b',
  selectedRowBackgroundColor: '#1e3a5f',
  oddRowBackgroundColor:    '#020f1f',
  borderColor:              'rgba(255,255,255,0.06)',
  fontFamily:               'Inter, sans-serif',
  fontSize:                 11,
  cellHorizontalPaddingScale: 0.8,
  rowHeight:                32,
  headerHeight:             34,
  inputFocusBorder:         'solid 2px #1E40AF',
  rangeSelectionBorderColor:'#1E40AF',
  cellEditingBorder:        'solid 2px #1E40AF',
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface CustomerRow {
  id: number;
  custcd: string;
  name: string;
  mobile: string;
  email: string;
  loyalty_tier: string;
  points: number;
  last_visit: string;
  total_spend: number;
  city: string;
  state: string;
}

let nextId = 5;

const SEED: CustomerRow[] = [
  { id:1, custcd:'CST-1001', name:'Aarav Sharma',     mobile:'9876543210', email:'aarav@example.com', loyalty_tier:'GOLD',   points:1250, last_visit:'2026-05-10', total_spend:45000, city:'Mumbai',    state:'MH' },
  { id:2, custcd:'CST-1002', name:'Priya Patel',      mobile:'9876543211', email:'priya@example.com', loyalty_tier:'SILVER', points:450,  last_visit:'2026-05-08', total_spend:15000, city:'Ahmedabad', state:'GJ' },
  { id:3, custcd:'CST-1003', name:'Rohan Desai',      mobile:'9876543212', email:'rohan@example.com', loyalty_tier:'BRONZE', points:120,  last_visit:'2026-05-01', total_spend:5000,  city:'Pune',      state:'MH' },
  { id:4, custcd:'CST-1004', name:'Neha Gupta',       mobile:'9876543213', email:'neha@example.com',  loyalty_tier:'PLATINUM',points:3500, last_visit:'2026-05-11', total_spend:120000,city:'Delhi',     state:'DL' },
];

type ViewMode = 'grid' | 'form';

const CustomerMaster: React.FC = () => {
  const [rows, setRows]         = useState<CustomerRow[]>([]);
  const [modified, setModified] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search,   setSearch]   = useState('');
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef    = useRef<AgGridReact<CustomerRow>>(null);
  const pendingEdit = useRef<number | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.legacy.getData('customers');
      if (data && data.length > 0) {
        setRows(data);
      } else {
        setRows(SEED);
      }
      setModified(new Set());
    } catch (err: any) {
      console.warn("[Sovereign Mode] Failed to load customer data from backend. Using Seed data.", err.message);
      setRows(SEED);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Initial Data Load ──────────────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }
  }, [toast]);

  useEffect(() => {
    if (pendingEdit.current === null) return;
    const idx = pendingEdit.current;
    pendingEdit.current = null;
    setTimeout(() => {
      const api = gridRef.current?.api;
      if (!api) return;
      api.ensureIndexVisible(idx);
      api.startEditingCell({ rowIndex: idx, colKey: 'name' });
    }, 80);
  }, [rows]);

  useEffect(() => {
    gridRef.current?.api?.setGridOption('quickFilterText', search);
  }, [search]);

  // ── Health ─────────────────────────────────────────────────────────────────
  const health = useMemo(() => {
    const total = rows.length;
    const noMobile = rows.filter(r => !r.mobile || r.mobile.length < 10).length;
    const noEmail  = rows.filter(r => !r.email).length;
    const issues   = noMobile + noEmail;
    return { total, issues, score: total ? Math.max(0, Math.round(100 - (issues / (total * 2)) * 100)) : 100 };
  }, [rows]);

  // ── Column Definitions ─────────────────────────────────────────────────────
  const columnDefs = useMemo<ColDef<CustomerRow>[]>(() => [
    {
      headerName: '#',
      valueGetter: p => (p.node?.rowIndex ?? 0) + 1,
      width: 48, pinned: 'left', editable: false, sortable: false, filter: false,
      cellStyle: { color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textAlign: 'center', fontSize: '10px' },
      cellRenderer: (p: any) => {
        if (!p.data) return '';
        const isMod = modified.has(p.data.id);
        return isMod
          ? <span style={{ color:'#f59e0b', fontWeight:900, fontSize:14 }}>●</span>
          : <span>{(p.node?.rowIndex ?? 0) + 1}</span>;
      }
    },
    { field:'custcd',    headerName:'Customer ID *', width:130, pinned:'left', editable:true,
      cellStyle:{ color:'#60a5fa', fontFamily:'monospace', fontWeight:700 } },
    { field:'name',      headerName:'Name *',        flex:1, minWidth:200, editable:true },
    { field:'mobile',    headerName:'Mobile',        width:120, editable:true,
      cellStyle:(p:any)=>!p.value||p.value.length<10?{ color:'rgba(239,68,68,0.6)',fontStyle:'italic',fontFamily:'monospace'}:{ fontFamily:'monospace'} },
    { field:'email',     headerName:'Email',         width:180, editable:true,
      cellStyle:(p:any)=>!p.value?{color:'rgba(239,68,68,0.6)',fontStyle:'italic'}:{} },
    { field:'loyalty_tier', headerName:'Tier',       width:100, editable:true,
      cellStyle:(p:any)=>{
        if(p.value==='PLATINUM') return {color:'#e2e8f0',fontWeight:700};
        if(p.value==='GOLD') return {color:'#fbbf24',fontWeight:700};
        if(p.value==='SILVER') return {color:'#94a3b8',fontWeight:700};
        return {color:'#b45309',fontWeight:700};
      } },
    { field:'points',    headerName:'Points',        width:90,  editable:true, type:'numericColumn',
      cellStyle:{color:'rgba(52,211,153,0.85)',fontFamily:'monospace',fontWeight:700} },
    { field:'total_spend',headerName:'Total Spend ₹',width:110, editable:false, type:'numericColumn',
      valueFormatter:p=>p.value!=null?`₹${Number(p.value).toLocaleString('en-IN')}` : '',
      cellStyle:{fontFamily:'monospace'} },
    { field:'last_visit', headerName:'Last Visit',   width:100, editable:true, fontFamily:'monospace' },
    { field:'city',      headerName:'City',          width:120, editable:true },
    { field:'state',     headerName:'State',         width:80,  editable:true },
    {
      headerName:'', width:36, editable:false, sortable:false, filter:false, pinned:'right',
      cellRenderer:(p:any)=>!p.data?null:(
        <button
          onClick={()=>deleteRow(p.data.id)}
          style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}
          onMouseEnter={e=>(e.currentTarget.style.color='rgb(239,68,68)')}
          onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.1)')}>
          ✕
        </button>
      )
    },
  ], [modified]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable:true, filter:true, resizable:true,
    cellStyle:{ borderRight:'1px solid rgba(255,255,255,0.04)' },
  }), []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const onCellValueChanged = useCallback((e: CellValueChangedEvent<CustomerRow>) => {
    if (!e.data) return;
    setRows(prev => prev.map(r => r.id === e.data!.id ? { ...r, [e.colDef.field!]: e.newValue } : r));
    setModified(prev => new Set(prev).add(e.data!.id));
  }, []);

  const onRowClicked = useCallback((e: any) => {
    if (e.data) setSelected(e.data);
  }, []);

  const addRow = useCallback(() => {
    const id = nextId++;
    const newRow: CustomerRow = {
      id, custcd:`CST-${String(1000 + id)}`,
      name:'', mobile:'', email:'', loyalty_tier:'BRONZE', points:0, last_visit:'', total_spend:0, city:'', state:''
    };
    pendingEdit.current = rows.length;
    setRows(prev => [...prev, newRow]);
    setModified(prev => new Set(prev).add(id));
  }, [rows.length]);

  const deleteRow = useCallback((id: number) => {
    setRows(prev => prev.filter(r => r.id !== id));
    setModified(prev => { const n = new Set(prev); n.delete(id); return n; });
    setSelected(prev => prev?.id === id ? null : prev);
  }, []);

  const handleSave = async () => {
    if (modified.size === 0) return;
    setIsSaving(true);
    try {
      const itemsToSync = rows.filter(r => modified.has(r.id));
      await api.legacy.bulkUpsert('customers', itemsToSync);
      setModified(new Set());
      setToast({ msg: `${itemsToSync.length} Customer records synced to Sovereign DB`, ok: true });
    } catch (err: any) {
      setToast({ msg: err.message === 'Network Error' ? 'Offline Node Unreachable' : 'Sync Failed', ok: false });
    } finally {
      setIsSaving(false);
    }
  };

  const getRowClass = useCallback((p: RowClassParams<CustomerRow>) => {
    return p.data && modified.has(p.data.id) ? 'smriti-modified-row' : '';
  }, [modified]);

  const updateFormField = (key: keyof CustomerRow, val: string | number) => {
    if (!selected) return;
    const updated = { ...selected, [key]: val };
    setRows(prev => prev.map(r => r.id === selected.id ? updated : r));
    setSelected(updated);
    setModified(prev => new Set(prev).add(selected.id));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-surface border-b border-outline-variant">
        <div className="flex border border-outline-variant">
          {(['grid','form'] as ViewMode[]).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={cn("h-9 px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all border-r last:border-r-0 border-outline-variant",
                viewMode === m ? "bg-primary text-white" : "hover:bg-surface-container text-outline")}>
              {m==='grid'?<Grid3X3 size={13}/>:<FileText size={13}/>}
              {m==='grid'?'AG Grid Workbench':'Master Detail Form'}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3 px-4 h-9 bg-surface-container border border-outline-variant text-[10px] font-black uppercase">
          <CheckCircle2 size={13} className={health.score>90?"text-emerald-500":"text-amber-500"} />
          <span className="text-outline">Data Health {health.score}%</span>
          <div className="w-px h-3 bg-outline-variant"/>
          <Users size={13} className="text-primary"/>
          <span className="text-outline">{health.total} Profiles</span>
          {health.issues>0&&<><div className="w-px h-3 bg-outline-variant"/><AlertTriangle size={13} className="text-amber-500"/><span className="text-amber-600">{health.issues} gaps</span></>}
        </div>

        <div className="flex items-center h-9 px-3 bg-surface-container border border-outline-variant focus-within:border-primary ml-auto transition-colors">
          <Search size={13} className="text-outline mr-2 flex-shrink-0"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} type="text" placeholder="Quick filter..."
            className="bg-transparent text-xs outline-none w-36 text-primary placeholder:text-outline/40"/>
          {search&&<button onClick={()=>setSearch('')}><X size={12} className="text-outline ml-1"/></button>}
        </div>

        <button onClick={loadData} title="Refresh / View All from Database"
          className="h-9 px-3 flex items-center border border-outline-variant text-outline hover:bg-surface-container transition-all">
          <RefreshCw size={13} className={cn(isLoading && "animate-spin")} />
        </button>
        <button onClick={addRow} className="h-9 px-4 flex items-center gap-2 border border-outline-variant text-[10px] font-black uppercase hover:bg-surface-container transition-all">
          <Plus size={13}/>Add Row
        </button>
        <button title="Export CSV" onClick={()=>gridRef.current?.api?.exportDataAsCsv({fileName:'customer-master.csv'})}
          className="h-9 px-3 flex items-center border border-outline-variant text-outline hover:bg-surface-container transition-all">
          <Download size={13}/>
        </button>
        <button onClick={handleSave} disabled={modified.size===0 || isSaving}
          className={cn("h-9 px-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all",
            modified.size>0?"bg-emerald-600 text-white hover:bg-emerald-500":"bg-surface-container text-outline/30 border border-outline-variant cursor-not-allowed")}>
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Database size={13}/>}
          {isSaving ? 'Syncing...' : (modified.size>0?`Commit (${modified.size})`:'Commit Ledger')}
        </button>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode==='grid' && (
          <div className="h-full w-full">
            <style>{`.smriti-modified-row { box-shadow: inset 3px 0 0 #f59e0b; }`}</style>
            <AgGridReact<CustomerRow>
              ref={gridRef}
              rowData={rows}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              theme={smritiTheme}
              onCellValueChanged={onCellValueChanged}
              onRowClicked={onRowClicked}
              getRowClass={getRowClass}
              rowSelection={{ mode:'singleRow', checkboxes:false, enableClickSelection:true }}
              stopEditingWhenCellsLoseFocus={true}
              enterNavigatesVertically={true}
              enterNavigatesVerticallyAfterEdit={true}
              undoRedoCellEditing={true}
              undoRedoCellEditingLimit={20}
              getRowId={p=>String(p.data.id)}
              noRowsOverlayComponent={()=>(
                <div style={{color:'rgba(255,255,255,0.2)',fontFamily:'monospace',fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase'}}>
                  {isLoading ? 'Fetching Sovereign Data...' : 'No customers — click Add Row to start'}
                </div>
              )}
            />
          </div>
        )}

        {viewMode==='form' && (
          <div className="h-full overflow-auto">
            {!selected ? (
              <div className="flex items-center justify-center h-full text-outline/30 gap-3">
                <FileText size={32}/><span className="text-sm font-black uppercase tracking-widest">Select a row in Grid view first</span>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-8 space-y-8">
                <div className="grid grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-outline">Customer ID *</label>
                    <input value={selected.custcd} readOnly className="w-full h-11 px-4 bg-surface-container border border-outline-variant font-mono text-sm font-black text-primary/70 outline-none opacity-70"/>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-outline">Name *</label>
                    <input value={selected.name} onChange={e=>updateFormField('name',e.target.value)}
                      className="w-full h-11 px-4 bg-surface border border-outline-variant focus:border-primary outline-none text-sm font-medium transition-colors"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-outline">Mobile</label>
                    <input value={selected.mobile} onChange={e=>updateFormField('mobile',e.target.value)}
                      className="w-full h-11 px-4 bg-surface border border-outline-variant focus:border-primary outline-none text-xs font-bold transition-colors font-mono"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-outline">Email</label>
                    <input type="email" value={selected.email} onChange={e=>updateFormField('email',e.target.value)}
                      className="w-full h-11 px-4 bg-surface border border-outline-variant focus:border-primary outline-none text-xs font-bold transition-colors"/>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-outline">Loyalty Tier</label>
                    <select value={selected.loyalty_tier} onChange={e=>updateFormField('loyalty_tier',e.target.value)}
                      className="w-full h-11 px-4 bg-surface border border-outline-variant focus:border-primary outline-none text-xs font-bold transition-colors">
                      <option value="BRONZE">BRONZE</option>
                      <option value="SILVER">SILVER</option>
                      <option value="GOLD">GOLD</option>
                      <option value="PLATINUM">PLATINUM</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-outline">City</label>
                    <input value={selected.city} onChange={e=>updateFormField('city',e.target.value)}
                      className="w-full h-11 px-4 bg-surface border border-outline-variant focus:border-primary outline-none text-xs font-bold transition-colors"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-outline">State</label>
                    <input value={selected.state} onChange={e=>updateFormField('state',e.target.value)}
                      className="w-full h-11 px-4 bg-surface border border-outline-variant focus:border-primary outline-none text-xs font-bold transition-colors"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5 p-6 bg-primary/5 border border-primary/20">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Reward Points</label>
                    <div className="h-16 flex items-center px-5 bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-2xl font-mono font-black text-emerald-600">{selected.points}</span>
                      <span className="ml-3 text-[9px] font-black text-emerald-600/50 uppercase">PTS</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-outline">Total Lifetime Spend (₹)</label>
                    <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline/40 font-mono text-lg">₹</span>
                      <input type="number" readOnly value={selected.total_spend}
                        className="w-full h-16 pl-9 pr-4 bg-surface border border-outline-variant focus:border-primary outline-none font-mono text-2xl font-black opacity-70"/>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-outline-variant">
                  <button onClick={()=>deleteRow(selected.id)} className="h-10 px-6 border border-red-500/30 text-red-500 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-red-500/10 transition-all">
                    <Trash2 size={13}/>Delete
                  </button>
                  <div className="flex gap-3">
                    <button onClick={()=>setViewMode('grid')} className="h-10 px-6 border border-outline-variant text-[10px] font-black uppercase hover:bg-surface-container transition-all">Back to Grid</button>
                    <button onClick={handleSave} disabled={isSaving} className="h-10 px-8 bg-primary text-white text-[10px] font-black uppercase flex items-center gap-2 hover:bg-primary/90">
                      {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13}/>}
                      {isSaving ? 'Saving...' : 'Save (F10)'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Status Bar ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between bg-surface-container border-t border-outline-variant px-4 h-8 text-[9px] font-mono font-bold uppercase text-outline">
        <div className="flex gap-5">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"/>AG Grid v35 · Sovereign X01</span>
          {selected&&<span className="text-primary">Selected: {selected.custcd}</span>}
          {modified.size>0&&<span className="text-amber-500">{modified.size} unsaved</span>}
        </div>
        <span className="text-outline/40">Click: Select · DblClick/F2: Edit · Ctrl+Z: Undo · Ctrl+C/V: Copy/Paste · ↓CSV Export</span>
      </div>

      {toast&&(
        <div className={cn("fixed bottom-6 right-6 px-6 py-3 text-xs font-black uppercase tracking-wider shadow-2xl border-l-4 z-50 flex items-center gap-3",
          toast.ok?"bg-emerald-600 text-white border-emerald-400":"bg-red-600 text-white border-red-400")}>
          <CheckCircle2 size={16}/>{toast.msg}
        </div>
      )}
    </div>
  );
};

export default CustomerMaster;
