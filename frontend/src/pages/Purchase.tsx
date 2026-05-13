import React, { useState } from 'react';
import { Truck, Plus, Search, Database, CheckCircle2, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Row = Record<string, string | number>;

const GRN_COLS = [
  { key:'stockno',   label:'Stock No',    width:130, required:true },
  { key:'itemdesc',  label:'Description', width:280, required:true },
  { key:'hsn',       label:'HSN',         width:90 },
  { key:'ordqty',    label:'Ord Qty',     width:85,  type:'number' },
  { key:'rcvqty',    label:'Rcv Qty',     width:85,  type:'number', required:true },
  { key:'freeqty',   label:'Free',        width:70,  type:'number' },
  { key:'costprice', label:'Cost ₹',      width:95,  type:'number', required:true },
  { key:'mrp',       label:'MRP ₹',       width:90,  type:'number' },
  { key:'taxpct',    label:'GST %',       width:70,  type:'number' },
  { key:'amount',    label:'Amount ₹',    width:100, type:'number', readonly:true },
];

const RECENT_GRN = [
  { grnNo:'GRN-0841', supplier:'SOVEREIGN TEXTILES', date:'12-May-26', items:45, amount:124500, status:'POSTED' },
  { grnNo:'GRN-0840', supplier:'FASHION INDIA PVT LTD', date:'11-May-26', items:120, amount:380200, status:'PENDING' },
  { grnNo:'GRN-0839', supplier:'SUPER CLOTH HOUSE', date:'10-May-26', items:30, amount:45000, status:'POSTED' },
];

const EMPTY_ROW = (): Row => ({ stockno:'', itemdesc:'', hsn:'', ordqty:0, rcvqty:0, freeqty:0, costprice:0, mrp:0, taxpct:12, amount:0 });

const Purchase: React.FC = () => {
  const [view, setView] = useState<'list' | 'new'>('list');
  const [rows, setRows] = useState<Row[]>([EMPTY_ROW(), EMPTY_ROW(), EMPTY_ROW()]);
  const [editCell, setEditCell] = useState<{r:number;c:number}|null>(null);
  const [editVal, setEditVal] = useState('');
  const [search, setSearch] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { if (editCell) inputRef.current?.focus(); }, [editCell]);

  const startEdit = (r:number, c:number) => {
    const col = GRN_COLS[c];
    if (col.readonly) return;
    setEditCell({r, c});
    setEditVal(String(rows[r][col.key] ?? ''));
  };

  const commitEdit = () => {
    if (!editCell) return;
    const col = GRN_COLS[editCell.c];
    setRows(prev => {
      const n = [...prev];
      const val = col.type === 'number' ? (parseFloat(editVal) || 0) : editVal;
      const updated = { ...n[editCell.r], [col.key]: val };
      // Auto-calc amount
      const rcv = parseFloat(String(updated['rcvqty'])) || 0;
      const cost = parseFloat(String(updated['costprice'])) || 0;
      updated['amount'] = rcv * cost;
      n[editCell.r] = updated;
      return n;
    });
    setEditCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editCell) return;
    if (e.key === 'Enter') { commitEdit(); e.preventDefault(); }
    if (e.key === 'Escape') { setEditCell(null); e.preventDefault(); }
    if (e.key === 'Tab') {
      commitEdit(); e.preventDefault();
      const nc = (editCell.c + 1) % GRN_COLS.length;
      const nr = nc === 0 ? editCell.r + 1 : editCell.r;
      const nextRow = nr >= rows.length ? rows.length : nr;
      if (nr >= rows.length) setRows(p => [...p, EMPTY_ROW()]);
      setTimeout(() => startEdit(nextRow, nc), 0);
    }
  };

  const lineTotal = rows.reduce((s, r) => s + (parseFloat(String(r.amount)) || 0), 0);
  const filteredGRN = search ? RECENT_GRN.filter(g => g.grnNo.toLowerCase().includes(search.toLowerCase()) || g.supplier.toLowerCase().includes(search.toLowerCase())) : RECENT_GRN;

  // ── LIST VIEW ──
  if (view === 'list') return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-surface border border-outline-variant p-3">
        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <Truck size={16} className="text-primary" />Purchase & GRN Register
        </h2>
        <div className="flex gap-2">
          <div className="h-9 px-3 flex items-center bg-surface-container border border-outline-variant focus-within:border-primary transition-colors">
            <Search size={13} className="text-outline mr-2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search GRN / Supplier..."
              className="bg-transparent text-xs outline-none w-40 text-primary placeholder:text-outline/40" />
            {search && <button onClick={() => setSearch('')}><X size={11} className="text-outline ml-1" /></button>}
          </div>
          <button onClick={() => { setRows([EMPTY_ROW(),EMPTY_ROW(),EMPTY_ROW()]); setView('new'); }}
            className="h-9 px-5 bg-primary text-white text-[10px] font-black uppercase flex items-center gap-2">
            <Plus size={13} />New GRN
          </button>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container">
              {['GRN No','Supplier','Date','Items','Amount ₹','Status',''].map(h => (
                <th key={h} className="p-3 border border-outline-variant text-[9px] font-black uppercase tracking-widest text-outline">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredGRN.map((r, i) => (
              <tr key={i} className="hover:bg-surface-container/50 cursor-pointer transition-colors" onClick={() => setView('new')}>
                <td className="p-3 border border-outline-variant font-mono font-bold text-primary text-sm">{r.grnNo}</td>
                <td className="p-3 border border-outline-variant font-semibold text-sm">{r.supplier}</td>
                <td className="p-3 border border-outline-variant text-xs font-mono text-outline">{r.date}</td>
                <td className="p-3 border border-outline-variant text-center font-mono text-sm">{r.items}</td>
                <td className="p-3 border border-outline-variant text-right font-mono font-bold text-sm">₹{r.amount.toLocaleString('en-IN')}</td>
                <td className="p-3 border border-outline-variant">
                  <span className={cn("px-2 py-1 text-[9px] font-black uppercase flex items-center gap-1 w-fit",
                    r.status === 'POSTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    {r.status === 'POSTED' ? <CheckCircle2 size={10} /> : <Clock size={10} />}{r.status}
                  </span>
                </td>
                <td className="p-3 border border-outline-variant">
                  <span className="text-[9px] font-black text-primary uppercase cursor-pointer hover:underline">Open →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between bg-surface border border-outline-variant px-5 h-9 text-[9px] font-mono font-bold uppercase text-outline">
        <span>Module: PURCHASE & GRN · {RECENT_GRN.length} records</span>
        <span className="text-outline/40">F2: Lookup · F10: Post GRN</span>
      </div>
    </div>
  );

  // ── NEW GRN ENTRY ──
  return (
    <div className="h-full flex flex-col bg-background" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* GRN Header Fields */}
      <div className="flex-shrink-0 grid grid-cols-5 gap-3 px-3 py-3 bg-surface border-b border-outline-variant">
        {[
          { label:'GRN No',       val:'GRN-0842',   ro:true },
          { label:'GRN Date',     val:'2026-05-12', type:'date' },
          { label:'Supplier',     val:'SOVEREIGN TEXTILES' },
          { label:'Invoice No',   val:'' },
          { label:'Invoice Date', val:'', type:'date' },
        ].map((f, i) => (
          <div key={i} className="space-y-1">
            <div className="text-[8px] font-black uppercase tracking-widest text-outline">{f.label}</div>
            <input type={f.type ?? 'text'} defaultValue={f.val} readOnly={f.ro}
              className={cn("w-full h-9 px-3 bg-surface-container border border-outline-variant text-xs font-bold outline-none focus:border-primary transition-colors font-mono",
                f.ro ? "opacity-50 cursor-default" : "")} />
          </div>
        ))}
      </div>

      {/* Inline-Editable GRN Table */}
      <div className="flex-1 min-h-0 overflow-auto bg-[#020617]">
        <table className="border-collapse" style={{ tableLayout:'fixed', width: GRN_COLS.reduce((s,c)=>s+c.width, 40)+'px' }}>
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="border border-white/10 bg-[#0f172a] text-outline/40 text-[9px] font-black text-center" style={{width:40}}>#</th>
              {GRN_COLS.map(col => (
                <th key={col.key} className="border border-white/10 bg-[#0f172a] text-[9px] font-black uppercase tracking-wider text-left px-2 h-8 text-outline/70 whitespace-nowrap"
                  style={{width:col.width}}>
                  {col.label}{col.required && <span className="text-red-400 ml-0.5">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                <td className="border border-white/5 text-center text-[9px] font-mono text-outline/20">{rIdx+1}</td>
                {GRN_COLS.map((col, cIdx) => {
                  const isEditing = editCell?.r === rIdx && editCell?.c === cIdx;
                  const val = row[col.key];
                  const isEmpty = val === '' || val === 0 || val === undefined;
                  return (
                    <td key={col.key} onDoubleClick={() => startEdit(rIdx, cIdx)}
                      className={cn("border border-white/5 px-0 h-8 overflow-hidden", col.readonly ? "opacity-30" : "cursor-pointer")}
                      style={{width:col.width}}>
                      {isEditing ? (
                        <input ref={inputRef} value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={commitEdit}
                          type={col.type === 'number' ? 'number' : 'text'}
                          className="w-full h-full px-2 bg-primary/20 border-2 border-primary outline-none text-xs font-bold text-white" />
                      ) : (
                        <div className={cn("h-full flex items-center px-2 text-[11px] truncate",
                          col.type === 'number' ? "justify-end font-mono text-white/70" : "text-white/70",
                          col.key === 'stockno' ? "text-primary/80 font-black font-mono" : "",
                          isEmpty && !col.readonly ? "text-white/15 italic" : "")}>
                          {isEmpty ? '' : (col.type === 'number' ? Number(val).toLocaleString('en-IN') : String(val))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Add row */}
            <tr className="hover:bg-white/[0.02] cursor-pointer" onDoubleClick={() => setRows(p => [...p, EMPTY_ROW()])}>
              <td colSpan={GRN_COLS.length + 1} className="border border-white/5 h-8 text-center text-[9px] text-white/10 font-mono">
                + double-click to add row
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Totals & Actions */}
      <div className="flex-shrink-0 flex items-center justify-between bg-primary text-white px-5 h-12">
        <div className="flex gap-8 text-xs font-mono font-black">
          <span>Lines: {rows.filter(r => r.stockno).length}</span>
          <span>Grand Total: ₹{lineTotal.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className="h-8 px-5 bg-white/10 border border-white/20 text-[10px] font-black uppercase hover:bg-white/20 transition-all">← Back</button>
          <button className="h-8 px-8 bg-white text-primary text-[10px] font-black uppercase flex items-center gap-2">
            <Database size={12}/>Post GRN (F10)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Purchase;
