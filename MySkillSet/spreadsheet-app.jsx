import { useState, useRef, useCallback, useEffect } from "react";

const COLS = ["A","B","C","D","E","F","G","H","I","J"];
const ROWS = 20;
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
    // In a real app, this would be a lookup in a price_master cache
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

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [styles, setStyles] = useState({});
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [history, setHistory] = useState([{}]);
  const [histIdx, setHistIdx] = useState(0);
  const [fileName, setFileName] = useState("spreadsheet");
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
    <div style={{
      minHeight: "100vh", background: "#0f1117",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e2e8f0",
      display: "flex", flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{
        background: "#1a1d2e", borderBottom: "1px solid #2d3154",
        padding: "0 16px", display: "flex", alignItems: "center", gap: 12, height: 52
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6ee7b7,#3b82f6)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#0f1117" }}>X</div>
          <input value={fileName} onChange={e => setFileName(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#e2e8f0", fontSize: 14, fontWeight: 600, width: 160, outline: "none", fontFamily: "inherit" }} />
          <span style={{ fontSize: 11, color: saved ? "#6ee7b7" : "#f59e0b", background: saved ? "#064e3b22" : "#78350f22", padding: "2px 8px", borderRadius: 10, border: `1px solid ${saved ? "#6ee7b766" : "#f59e0b66"}` }}>{saved ? "● saved" : "○ unsaved"}</span>
        </div>
        <div style={{ flex: 1 }} />
        {/* Undo/Redo */}
        {[["↩", undo, histIdx === 0], ["↪", redo, histIdx >= history.length - 1]].map(([icon, fn, dis], i) => (
          <button key={i} onClick={fn} disabled={dis} title={i === 0 ? "Undo" : "Redo"}
            style={{ background: "none", border: "1px solid #2d3154", borderRadius: 6, color: dis ? "#444" : "#94a3b8", padding: "4px 10px", cursor: dis ? "default" : "pointer", fontSize: 15 }}>{icon}</button>
        ))}
        <label style={{ background: "#1e2235", border: "1px solid #2d3154", borderRadius: 6, color: "#94a3b8", padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>
          Open CSV <input type="file" accept=".csv" onChange={loadCSV} style={{ display: "none" }} />
        </label>
        <button onClick={downloadCSV} style={{ background: "linear-gradient(135deg,#6ee7b7,#3b82f6)", border: "none", borderRadius: 6, color: "#0f1117", padding: "5px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⬇ Save CSV</button>
        <button onClick={clearAll} style={{ background: "none", border: "1px solid #ef444455", borderRadius: 6, color: "#ef4444", padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Clear</button>
      </div>

      {/* Toolbar */}
      <div style={{ background: "#13162a", borderBottom: "1px solid #1e2235", padding: "6px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        {TOOLBAR_BTNS.map(({ icon, title, style: s, value, off }) => (
          <button key={title} onClick={() => toggleStyle(s, value, off)} title={title}
            style={{ background: selected && styles[selected]?.[s] === value ? "#2d3154" : "none", border: "1px solid #2d3154", borderRadius: 5, color: "#94a3b8", width: 30, height: 28, cursor: "pointer", fontSize: title === "Bold" ? 15 : 13, fontWeight: title === "Bold" ? 700 : 400, fontStyle: title === "Italic" ? "italic" : "normal" }}>{icon}</button>
        ))}
        <div style={{ width: 1, height: 22, background: "#2d3154", margin: "0 4px" }} />
        {[["⬅", "left"], ["≡", "center"], ["➡", "right"]].map(([icon, a]) => (
          <button key={a} onClick={() => setAlign(a)} title={`Align ${a}`}
            style={{ background: selected && styles[selected]?.textAlign === a ? "#2d3154" : "none", border: "1px solid #2d3154", borderRadius: 5, color: "#94a3b8", width: 30, height: 28, cursor: "pointer", fontSize: 13 }}>{icon}</button>
        ))}
        <div style={{ width: 1, height: 22, background: "#2d3154", margin: "0 4px" }} />
        {/* Formula bar */}
        <span style={{ fontSize: 11, color: "#64748b", marginRight: 2 }}>fx</span>
        <input ref={barRef}
          value={editing ? editVal : (selected ? (data[selected] || "") : "")}
          onChange={e => { if (editing) setEditVal(e.target.value); else if (selected) { setEditing(selected); setEditVal(e.target.value); } }}
          onKeyDown={handleKey}
          onBlur={finishEdit}
          placeholder="Enter value or formula…"
          style={{ flex: 1, background: "#0f1117", border: "1px solid #2d3154", borderRadius: 5, color: "#e2e8f0", padding: "4px 10px", fontSize: 12, fontFamily: "inherit", outline: "none", maxWidth: 400 }}
        />
        {selected && <span style={{ fontSize: 11, color: "#6ee7b7", minWidth: 30 }}>{selected}</span>}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 0 24px 0" }}>
        <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: 46, minWidth: 46, background: "#1a1d2e", borderRight: "1px solid #2d3154", borderBottom: "1px solid #2d3154", color: "#4a5568", fontSize: 11, position: "sticky", top: 0, left: 0, zIndex: 10 }}></th>
              {COLS.map(c => (
                <th key={c} style={{ 
                  background: selCol === c ? "#22264a" : "#1a1d2e", 
                  borderRight: "1px solid #1e2235", 
                  borderBottom: "1px solid #2d3154", 
                  color: selCol === c ? "#6ee7b7" : "#64748b", 
                  fontSize: 11, fontWeight: 600, padding: "6px 0", 
                  textAlign: "center", position: "sticky", top: 0, zIndex: 5, 
                  minWidth: colWidths[c] || 96, width: colWidths[c] || 96, 
                  userSelect: "none" 
                }}>
                  {c}
                  <div 
                    onMouseDown={(e) => onResizeStart(e, c)}
                    style={{ 
                      position: "absolute", right: 0, top: 0, bottom: 0, width: 4, 
                      cursor: "col-resize", zIndex: 10,
                      background: resizing.current?.col === c ? "#3b82f6" : "transparent"
                    }} 
                    onMouseEnter={e => e.target.style.background = "#3b82f644"}
                    onMouseLeave={e => { if (resizing.current?.col !== c) e.target.style.background = "transparent"; }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, ri) => {
              const r = ri + 1;
              return (
                <tr key={r}>
                  <td style={{ background: selRow === r ? "#22264a" : "#1a1d2e", borderRight: "1px solid #2d3154", borderBottom: "1px solid #1e2235", color: selRow === r ? "#6ee7b7" : "#4a5568", fontSize: 11, textAlign: "center", padding: "0 8px", position: "sticky", left: 0, zIndex: 2, userSelect: "none", minWidth: 46 }}>{r}</td>
                  {COLS.map(c => {
                    const id = cellId(r, c);
                    const isSel = selected === id;
                    const isEdit = editing === id;
                    const cellStyle = styles[id] || {};
                    const display = getDisplay(r, c);
                    const isNum = display !== "" && !isNaN(display);
                    return (
                      <td key={c}
                        onClick={() => { if (!isEdit) { setSelected(id); setEditing(null); } }}
                        onDoubleClick={() => startEdit(r, c)}
                        style={{
                          background: isSel ? "#1e2a4a" : "#0f1117",
                          border: isSel ? "2px solid #3b82f6" : "1px solid #1a1d2e",
                          padding: 0, position: "relative", cursor: "cell",
                          minWidth: colWidths[c] || 96, width: colWidths[c] || 96, maxWidth: colWidths[c] || 96,
                          height: 28, overflow: "hidden"
                        }}>
                        {isEdit ? (
                          <input ref={inputRef} value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onKeyDown={handleKey}
                            onBlur={finishEdit}
                            style={{ width: "100%", height: "100%", background: "#1e2a4a", border: "none", color: "#e2e8f0", padding: "0 6px", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box", ...cellStyle }}
                          />
                        ) : (
                          <div style={{
                            padding: "0 6px", fontSize: 12, lineHeight: "28px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            color: display === "#ERR" ? "#ef4444" : (isNum && display < 0 ? "#ef4444" : (isNum ? "#6ee7b7" : "#e2e8f0")),
                            textAlign: cellStyle.textAlign || (isNum ? "right" : "left"),
                            fontWeight: cellStyle.fontWeight || "normal",
                            fontStyle: cellStyle.fontStyle || "normal",
                            textDecoration: cellStyle.textDecoration || "none",
                            background: isNum && display < 0 ? "#ef444411" : "transparent"
                          }}>{display}</div>
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

      {/* Status bar */}
      <div style={{ background: "#1a1d2e", borderTop: "1px solid #2d3154", padding: "4px 16px", display: "flex", gap: 20, fontSize: 11, color: "#4a5568" }}>
        <span>{ROWS} rows × {COLS.length} cols</span>
        {selected && (() => {
          const nums = COLS.flatMap(c => Array.from({ length: ROWS }, (_, i) => {
            const v = getDisplay(i + 1, c);
            return typeof v === "number" || (!isNaN(v) && v !== "") ? parseFloat(v) : null;
          })).filter(v => v !== null);
          const selVal = getDisplay(selRow, selCol);
          return <>
            <span>Selected: <span style={{ color: "#6ee7b7" }}>{selVal}</span></span>
            {nums.length > 0 && <>
              <span>Sum: <span style={{ color: "#6ee7b7" }}>{nums.reduce((a, b) => a + b, 0).toFixed(2)}</span></span>
              <span>Avg: <span style={{ color: "#6ee7b7" }}>{(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)}</span></span>
              <span>Count: <span style={{ color: "#6ee7b7" }}>{nums.length}</span></span>
            </>}
          </>;
        })()}
        <span style={{ marginLeft: "auto", color: "#2d3154" }}>Double-click to edit • = for formulas • SUM, AVERAGE, MAX, MIN supported</span>
      </div>
    </div>
  );
}
