/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * Sovereign Spreadsheet Module
 * ============================================================ */
// @ts-nocheck
import React, { useState, useRef, useCallback, useEffect } from "react";

const COLS = ["A","B","C","D","E","F","G","H","I","J"];
const ROWS = 50;
const INITIAL_DATA = {};

function cellId(row, col) { return `${col}${row}`; }

function evalFormula(formula, data) {
  if (!formula.startsWith("=")) return formula;
  let expr = formula.slice(1).toUpperCase();

  // SUM(A1:B3)
  expr = expr.replace(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (_, a, b) => {
    const colA = a.replace(/\d/g, ""), rowA = parseInt(a.replace(/\D/g, ""));
    const colB = b.replace(/\d/g, ""), rowB = parseInt(b.replace(/\D/g, ""));
    let sum = 0;
    for (let r = rowA; r <= rowB; r++) {
      for (let c = COLS.indexOf(colA); c <= COLS.indexOf(colB); c++) {
        const v = parseFloat(data[`${COLS[c]}${r}`] || 0);
        if (!isNaN(v)) sum += v;
      }
    }
    return sum;
  });

  // AVERAGE(A1:B3)
  expr = expr.replace(/AVERAGE\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (_, a, b) => {
    const colA = a.replace(/\d/g, ""), rowA = parseInt(a.replace(/\D/g, ""));
    const colB = b.replace(/\d/g, ""), rowB = parseInt(b.replace(/\D/g, ""));
    let sum = 0, count = 0;
    for (let r = rowA; r <= rowB; r++) {
      for (let c = COLS.indexOf(colA); c <= COLS.indexOf(colB); c++) {
        const v = parseFloat(data[`${COLS[c]}${r}`] || "");
        if (!isNaN(v)) { sum += v; count++; }
      }
    }
    return count ? sum / count : 0;
  });

  // MAX / MIN
  expr = expr.replace(/(MAX|MIN)\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (_, fn, a, b) => {
    const colA = a.replace(/\d/g, ""), rowA = parseInt(a.replace(/\D/g, ""));
    const colB = b.replace(/\d/g, ""), rowB = parseInt(b.replace(/\D/g, ""));
    const vals = [];
    for (let r = rowA; r <= rowB; r++)
      for (let c = COLS.indexOf(colA); c <= COLS.indexOf(colB); c++) {
        const v = parseFloat(data[`${COLS[c]}${r}`] || "");
        if (!isNaN(v)) vals.push(v);
      }
    if (!vals.length) return 0;
    return fn === "MAX" ? Math.max(...vals) : Math.min(...vals);
  });

  // SMRITI_PRICE("ITEM_CODE") - Mock Data Binding
  expr = expr.replace(/SMRITI_PRICE\("(.+?)"\)/g, (_, code) => {
    const mockPrices = { "NIKE001": 5999, "PUMA002": 3499, "ADID003": 7999 };
    return mockPrices[code] || 0;
  });

  // Replace cell refs
  expr = expr.replace(/([A-J])(\d+)/g, (_, c, r) => {
    const val = data[`${c}${r}`] || "0";
    return isNaN(val) ? `"${val}"` : (val || "0");
  });

  try { return Function(`"use strict"; return (${expr})`)(); }
  catch { return "#ERR"; }
}

const TOOLBAR_BTNS = [
  { icon: "B", title: "Bold", style: "fontWeight", value: "bold", off: "normal" },
  { icon: "I", title: "Italic", style: "fontStyle", value: "italic", off: "normal" },
  { icon: "U̲", title: "Underline", style: "textDecoration", value: "underline", off: "none" },
];

export default function SovereignSpreadsheet() {
  const [data, setData] = useState(INITIAL_DATA);
  const [styles, setStyles] = useState({});
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [history, setHistory] = useState([{}]);
  const [histIdx, setHistIdx] = useState(0);
  const [fileName, setFileName] = useState("sovereign-audit");
  const [saved, setSaved] = useState(false);
  const [colWidths, setColWidths] = useState({});
  const inputRef = useRef(null);
  const barRef = useRef(null);
  const resizing = useRef(null);

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const commit = useCallback((newData) => {
    setData(newData);
    const next = history.slice(0, histIdx + 1).concat([newData]);
    setHistory(next);
    setHistIdx(next.length - 1);
    setSaved(false);
  }, [history, histIdx]);

  const undo = () => {
    if (histIdx > 0) { setHistIdx(i => i - 1); setData(history[histIdx - 1]); setSaved(false); }
  };
  const redo = () => {
    if (histIdx < history.length - 1) { setHistIdx(i => i + 1); setData(history[histIdx + 1]); setSaved(false); }
  };

  const startEdit = (r, c) => {
    const id = cellId(r, c);
    setEditing(id);
    setEditVal(data[id] || "");
    setSelected(id);
  };

  const finishEdit = () => {
    if (!editing) return;
    const newData = { ...data, [editing]: editVal };
    commit(newData);
    setEditing(null);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") { finishEdit(); e.preventDefault(); }
    if (e.key === "Escape") { setEditing(null); setEditVal(""); }
    if (e.key === "Tab") { finishEdit(); e.preventDefault(); }
  };

  const toggleStyle = (styleKey, on, off) => {
    if (!selected) return;
    setStyles(s => ({
      ...s,
      [selected]: { ...(s[selected] || {}), [styleKey]: (s[selected]?.[styleKey] === on ? off : on) }
    }));
  };

  const setAlign = (align) => {
    if (!selected) return;
    setStyles(s => ({ ...s, [selected]: { ...(s[selected] || {}), textAlign: align } }));
  };

  const downloadCSV = () => {
    let csv = COLS.join(",") + "\n";
    for (let r = 1; r <= ROWS; r++) {
      csv += COLS.map(c => {
        const v = data[cellId(r, c)] || "";
        return v.includes(",") ? `"${v}"` : v;
      }).join(",") + "\n";
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${fileName}.csv`; a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  };

  const loadCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name.replace(/\.csv$/i, ""));
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n");
      const newData = {};
      lines.slice(1).forEach((line, ri) => {
        if (!line.trim()) return;
        line.split(",").forEach((val, ci) => {
          if (ci < COLS.length) newData[cellId(ri + 1, COLS[ci])] = val.replace(/^"|"$/g, "");
        });
      });
      commit(newData);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearAll = () => { commit({}); setStyles({}); };

  const onResizeStart = (e, col) => {
    e.preventDefault();
    resizing.current = { col, startX: e.pageX, startWidth: colWidths[col] || 96 };
    document.addEventListener("mousemove", onResizing);
    document.addEventListener("mouseup", onResizeEnd);
  };

  const onResizing = (e) => {
    if (!resizing.current) return;
    const diff = e.pageX - resizing.current.startX;
    const newWidth = Math.max(50, resizing.current.startWidth + diff);
    setColWidths(prev => ({ ...prev, [resizing.current.col]: newWidth }));
  };

  const onResizeEnd = () => {
    resizing.current = null;
    document.removeEventListener("mousemove", onResizing);
    document.removeEventListener("mouseup", onResizeEnd);
  };

  const getDisplay = (r, c) => {
    const id = cellId(r, c);
    const v = data[id];
    if (!v) return "";
    if (v.startsWith("=")) {
      const res = evalFormula(v, data);
      return typeof res === "number" ? (Number.isInteger(res) ? res : +res.toFixed(4)) : res;
    }
    return v;
  };

  const selRow = selected ? parseInt(selected.slice(1)) : null;
  const selCol = selected ? selected[0] : null;

  return (
    <div className="flex flex-col h-full bg-[#0f1117] text-[#e2e8f0] font-mono select-none">
      {/* Header */}
      <div className="bg-[#1a1d2e] border-b border-[#2d3154] px-4 flex items-center gap-3 h-[52px]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-md flex items-center justify-center text-[#0f1117] text-sm font-bold">X</div>
          <input 
            value={fileName} 
            onChange={e => setFileName(e.target.value)}
            className="bg-transparent border-none text-[#e2e8f0] text-sm font-semibold w-40 outline-none" 
          />
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${saved ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'}`}>
            {saved ? "● saved" : "○ unsaved"}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex gap-2">
          <button onClick={undo} disabled={histIdx === 0} className="px-3 py-1 border border-[#2d3154] rounded-md text-sm hover:bg-[#2d3154] disabled:opacity-30">↩</button>
          <button onClick={redo} disabled={histIdx >= history.length - 1} className="px-3 py-1 border border-[#2d3154] rounded-md text-sm hover:bg-[#2d3154] disabled:opacity-30">↪</button>
        </div>
        <label className="bg-[#1e2235] border border-[#2d3154] px-3 py-1.5 rounded-md text-xs cursor-pointer hover:bg-[#2d3154] transition-colors">
          Open CSV <input type="file" accept=".csv" onChange={loadCSV} className="hidden" />
        </label>
        <button onClick={downloadCSV} className="bg-gradient-to-br from-emerald-400 to-blue-500 text-[#0f1117] px-4 py-1.5 rounded-md text-xs font-bold hover:brightness-110 transition-all">⬇ Save CSV</button>
        <button onClick={clearAll} className="px-3 py-1.5 border border-rose-500/20 text-rose-500 rounded-md text-xs hover:bg-rose-500/10">Clear</button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#13162a] border-b border-[#1e2235] px-4 py-1.5 flex items-center gap-2">
        {TOOLBAR_BTNS.map(({ icon, title, style: s, value, off }) => (
          <button 
            key={title} 
            onClick={() => toggleStyle(s, value, off)} 
            title={title}
            className={`w-8 h-7 flex items-center justify-center border border-[#2d3154] rounded-md text-sm transition-colors ${selected && styles[selected]?.[s] === value ? 'bg-[#2d3154] text-white' : 'text-slate-400 hover:bg-[#1e2235]'}`}
          >
            {icon}
          </button>
        ))}
        <div className="w-px h-5 bg-[#2d3154] mx-1" />
        {[["⬅", "left"], ["≡", "center"], ["➡", "right"]].map(([icon, a]) => (
          <button 
            key={a} 
            onClick={() => setAlign(a)} 
            title={`Align ${a}`}
            className={`w-8 h-7 flex items-center justify-center border border-[#2d3154] rounded-md text-sm transition-colors ${selected && styles[selected]?.textAlign === a ? 'bg-[#2d3154] text-white' : 'text-slate-400 hover:bg-[#1e2235]'}`}
          >
            {icon}
          </button>
        ))}
        <div className="w-px h-5 bg-[#2d3154] mx-1" />
        <span className="text-[10px] text-slate-500 font-bold uppercase italic mr-1">fx</span>
        <input 
          ref={barRef}
          value={editing ? editVal : (selected ? (data[selected] || "") : "")}
          onChange={e => { if (editing) setEditVal(e.target.value); else if (selected) { setEditing(selected); setEditVal(e.target.value); } }}
          onKeyDown={handleKey}
          onBlur={finishEdit}
          placeholder="Enter value or formula..."
          className="flex-1 max-w-[500px] bg-[#0f1117] border border-[#2d3154] rounded-md text-[#e2e8f0] px-3 py-1 text-xs outline-none focus:border-blue-500/50"
        />
        {selected && <span className="text-[10px] text-emerald-400 font-bold ml-2">{selected}</span>}
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse table-fixed">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="w-[46px] bg-[#1a1d2e] border-r border-[#2d3154] border-b border-[#2d3154] sticky left-0 z-30"></th>
              {COLS.map(c => (
                <th 
                  key={c} 
                  style={{ width: colWidths[c] || 120, minWidth: colWidths[c] || 120 }}
                  className={`bg-[#1a1d2e] border-r border-[#1e2235] border-b border-[#2d3154] text-[10px] font-bold py-1.5 relative ${selCol === c ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {c}
                  <div 
                    onMouseDown={(e) => onResizeStart(e, c)}
                    className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/40 z-10 transition-colors ${resizing.current?.col === c ? 'bg-blue-500' : ''}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, ri) => {
              const r = ri + 1;
              return (
                <tr key={r} className="h-7">
                  <td className={`bg-[#1a1d2e] border-r border-[#2d3154] border-b border-[#1e2235] text-[10px] text-center sticky left-0 z-10 ${selRow === r ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {r}
                  </td>
                  {COLS.map(c => {
                    const id = cellId(r, c);
                    const isSel = selected === id;
                    const isEdit = editing === id;
                    const cellStyle = styles[id] || {};
                    const display = getDisplay(r, c);
                    const isNum = display !== "" && !isNaN(display);
                    return (
                      <td 
                        key={c}
                        onClick={() => { if (!isEdit) { setSelected(id); setEditing(null); } }}
                        onDoubleClick={() => startEdit(r, c)}
                        style={{ 
                          width: colWidths[c] || 120,
                          backgroundColor: isSel ? '#1e2a4a' : 'transparent',
                          borderColor: isSel ? '#3b82f6' : '#1a1d2e'
                        }}
                        className={`border relative cursor-cell overflow-hidden transition-colors ${isSel ? 'border-2 z-10' : 'border-[#1a1d2e]'}`}
                      >
                        {isEdit ? (
                          <input 
                            ref={inputRef} 
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onKeyDown={handleKey}
                            onBlur={finishEdit}
                            style={cellStyle}
                            className="w-full h-full bg-[#1e2a4a] text-[#e2e8f0] px-2 text-xs outline-none"
                          />
                        ) : (
                          <div 
                            style={{
                              ...cellStyle,
                              textAlign: cellStyle.textAlign || (isNum ? "right" : "left"),
                              color: display === "#ERR" ? "#ef4444" : (isNum && display < 0 ? "#ef4444" : (isNum ? "#10b981" : "#e2e8f0")),
                              backgroundColor: isNum && display < 0 ? "#ef444411" : "transparent"
                            }}
                            className="px-2 text-xs leading-7 truncate"
                          >
                            {display}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="bg-[#1a1d2e] border-t border-[#2d3154] px-4 h-7 flex items-center gap-5 text-[10px] text-slate-500">
        <span className="font-bold">{ROWS} ROWS × {COLS.length} COLS</span>
        {selected && (
          <div className="flex gap-4 items-center">
            <span>SELECTED: <span className="text-emerald-400 font-bold">{selected}</span></span>
            <div className="w-px h-3 bg-[#2d3154]" />
            <span className="uppercase opacity-50">Sovereign Audit Protocol Active</span>
          </div>
        )}
        <div className="flex-1" />
        <span className="text-[9px] opacity-40 uppercase tracking-widest">SMRITI-OS Spreadsheet v1.0 • Shift+Enter for Formulas</span>
      </div>
    </div>
  );
}
