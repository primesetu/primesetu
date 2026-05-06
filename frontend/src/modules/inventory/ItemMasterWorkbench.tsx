/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * Item Master Workbench — Spreadsheet-Driven Cataloging
 * ============================================================ */
// @ts-nocheck
import React, { useState, useRef, useCallback, useEffect, useMemo, Fragment } from "react";
import { 
  Zap,
  ChevronLeft,
  LayoutGrid,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Search,
  Filter as FilterIcon,
  DownloadCloud,
  Loader2,
  Trash2,
  Settings2,
  Wand2,
  Plus,
  ExternalLink,
  ChevronsRight,
  ChevronsLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Save,
  Eye
} from "lucide-react";
import { api } from "../../api/client";
import { cn } from "@/lib/utils";

// ── Shoper 9 master field registry (all possible catalogue fields)
const ALL_FIELDS = [
  { key: "item_code",    label: "Stock No",       required: true,  type: "text",   f2Type: undefined, f2Category: undefined, width: 120 },
  { key: "item_name",    label: "Description",    required: true,  type: "text",   f2Type: undefined, f2Category: undefined, width: 250 },
  { key: "barcode",      label: "Barcode/EAN",    required: false, type: "text",   f2Type: undefined, f2Category: undefined, width: 140 },
  { key: "department",   label: "Class1/Dept",    required: false, type: "text",   f2Type: "lookups", f2Category: "CLASS1",  width: 120 },
  { key: "brand",        label: "Class2/Brand",   required: false, type: "text",   f2Type: "lookups", f2Category: "CLASS2",  width: 120 },
  { key: "subclass1",    label: "Sub-Class1",     required: false, type: "text",   f2Type: "lookups", f2Category: "SUBCLASS1", width: 120 },
  { key: "colour",       label: "Colour",         required: false, type: "text",   f2Type: "lookups", f2Category: "COLOUR",  width: 100 },
  { key: "size",         label: "Size",           required: false, type: "text",   f2Type: "lookups", f2Category: "SIZE",    width: 80 },
  { key: "mrp_paise",    label: "MRP",            required: false, type: "number", f2Type: undefined, f2Category: undefined, width: 90 },
  { key: "sales_price",  label: "Sales Price",    required: false, type: "number", f2Type: undefined, f2Category: undefined, width: 100 },
  { key: "cost_price",   label: "Cost Price",     required: false, type: "number", f2Type: undefined, f2Category: undefined, width: 100 },
  { key: "markup_percent",label: "Markup %",      required: false, type: "number", f2Type: undefined, f2Category: undefined, width: 90 },
  { key: "tax_percent",  label: "Tax %",          required: false, type: "number", f2Type: undefined, f2Category: undefined, width: 80 },
  { key: "hsn_code",     label: "HSN Code",       required: false, type: "text",   f2Type: undefined, f2Category: undefined, width: 100 },
  { key: "vendor_code",  label: "Pref. Vendor",   required: false, type: "text",   f2Type: "vendors", f2Category: undefined, width: 120 },
  { key: "total_stock",  label: "Stock Qty",      required: false, type: "number", f2Type: undefined, f2Category: undefined, width: 80, readonly: true },
];

const MANDATORY_KEYS = ["item_code", "item_name"];
const DEFAULT_SELECTED = ["item_code", "item_name", "barcode", "department", "brand", "colour", "size", "mrp_paise", "sales_price"];

// Legacy schemas kept for Classification / Attributes sheets
const SCHEMAS = {
  COMMON_FIELDS: [
    { key: "department", label: "Default Dept", width: 120, f2Type: "lookups", f2Category: "CLASS1" },
    { key: "brand", label: "Default Brand", width: 120, f2Type: "lookups", f2Category: "CLASS2" },
    { key: "subclass1", label: "Def. Sub-Class1", width: 120, f2Type: "lookups", f2Category: "SUBCLASS1" },
    { key: "colour", label: "Def. Colour", width: 120, f2Type: "lookups", f2Category: "COLOUR" },
    { key: "hsn_code", label: "Def. HSN", width: 120 },
    { key: "vendor_code", label: "Def. Vendor", width: 120, f2Type: "vendors" },
    { key: "tax_percent", label: "Def. Tax %", width: 100, type: "number" },
    { key: "markup_percent", label: "Def. Markup %", width: 120, type: "number" }
  ],
  ITEM_MASTER: [
    { key: "item_code", label: "Stock No", width: 120, required: true },
    { key: "item_name", label: "Description", width: 250, required: true },
    { key: "barcode", label: "Barcode/EAN", width: 140 },
    { key: "brand", label: "Brand", width: 100, f2Type: "lookups", f2Category: "CLASS2" },
    { key: "department", label: "Dept/Class1", width: 100, f2Type: "lookups", f2Category: "CLASS1" },
    { key: "subclass1", label: "Sub-Class1", width: 100, f2Type: "lookups", f2Category: "SUBCLASS1" },
    { key: "colour", label: "Colour", width: 100, f2Type: "lookups", f2Category: "COLOUR" },
    { key: "size", label: "Size", width: 80, f2Type: "lookups", f2Category: "SIZE" },
    { key: "mrp_paise", label: "MRP", width: 80, type: "number" },
    { key: "sales_price", label: "Sales Price", width: 100, type: "number" },
    { key: "cost_price", label: "Cost Price", width: 100, type: "number" },
    { key: "hsn_code", label: "HSN", width: 100 },
    { key: "total_stock", label: "Stock", width: 70, type: "number", readonly: true },
  ],
  CLASSIFICATION: [
    { key: "class12combo", label: "Class12Combo", width: 180, required: true, readonly: true },
    { key: "dept", label: "Class1 (Dept)", width: 150, required: true, f2Type: "lookups", f2Category: "CLASS1" },
    { key: "brand", label: "Class2 (Brand)", width: 150, required: true, f2Type: "lookups", f2Category: "CLASS2" },
    { key: "product", label: "Class3 (Product)", width: 150, f2Type: "lookups", f2Category: "CLASS3" },
    { key: "size_group", label: "Size Group", width: 120, f2Type: "lookups", f2Category: "SIZEGROUP" },
    { key: "tax_percent", label: "Tax %", width: 80, type: "number" },
    { key: "vendor_code", label: "Pref. Vendor", width: 120, f2Type: "vendors" },
    { key: "markup_percent", label: "Markup %", width: 80, type: "number" },
  ],
  ATTRIBUTES: [
    { key: "LookupType", label: "Lookup Type (Category)", width: 250, required: true },
    { key: "LookupCode", label: "Lookup Code", width: 150, required: true },
    { key: "LookupDesc", label: "Description", width: 300, required: true },
    { key: "SortOrder", label: "Sort Order", width: 100, type: "number" },
    { key: "Active", label: "Active (Y/N)", width: 100 },
  ]
};

export default function ItemMasterWorkbench({ initialData = [], onBack }: { initialData: any[], onBack: () => void }) {
  const STORAGE_KEY = "smriti_workbench_draft";

  const [sheets, setSheets] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    
    const defaultSheets = {
      "Common Fields": { schema: "COMMON_FIELDS", gridData: {}, rowsCount: 1, modifiedRows: [], deletedRows: [], validationErrors: {} },
      "Item Master": { schema: "ITEM_MASTER", gridData: {}, rowsCount: 50, modifiedRows: [], deletedRows: [], validationErrors: {} },
      "Item Classification": { schema: "CLASSIFICATION", gridData: {}, rowsCount: 20, modifiedRows: [], deletedRows: [], validationErrors: {} },
      "Master Attributes": { schema: "ATTRIBUTES", gridData: {}, rowsCount: 30, modifiedRows: [], deletedRows: [], validationErrors: {} }
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.gridData) return defaultSheets; // Old format
        // Ensure schemas exist on loaded sheets
        Object.values(parsed).forEach((sheet: any) => {
          if (!sheet.schema) sheet.schema = "ITEM_MASTER";
        });
        if (!parsed["Common Fields"]) parsed["Common Fields"] = defaultSheets["Common Fields"];
        return { ...defaultSheets, ...parsed }; // Merge saved with defaults
      } catch (e) {
        return defaultSheets;
      }
    }
    
    // Fallback to initialData if no draft (for Item Master)
    const initial: any = {};
    initialData.forEach((item, ri) => {
      SCHEMAS.ITEM_MASTER.forEach((col, ci) => {
        initial[`${ri + 1}-${ci}`] = item[col.key] ?? "";
      });
    });
    
    const finalSheets = { ...defaultSheets };
    finalSheets["Item Master"].gridData = initial;
    finalSheets["Item Master"].rowsCount = Math.max(initialData.length + 50, 100);
    return finalSheets;
  });

  const [activeSheet, setActiveSheet] = useState("Common Fields");
  const currentSheet = sheets[activeSheet] || sheets["Item Master"];
  const currentSchema = SCHEMAS[currentSheet.schema as keyof typeof SCHEMAS] || SCHEMAS.ITEM_MASTER;

  const updateActiveSheet = (updates: any) => {
    setSheets(prev => ({
      ...prev,
      [activeSheet]: { ...prev[activeSheet], ...updates }
    }));
  };

  const gridData = currentSheet.gridData || {};
  const rowsCount = currentSheet.rowsCount || 0;
  const setRowsCount = (val: number | ((p: number) => number)) => {
    const nextCount = typeof val === 'function' ? val(rowsCount) : val;
    updateActiveSheet({ rowsCount: nextCount });
  };

  const modifiedRows = new Set(currentSheet.modifiedRows || []);
  const deletedRows = new Set(currentSheet.deletedRows || []);
  const validationErrors = currentSheet.validationErrors || {};
  const setValidationErrors = (val: any) => updateActiveSheet({ validationErrors: val });

  // ── Shoper 9 three-tab model ──────────────────────────────────
  const [s9Tab, setS9Tab] = useState<'VIEW'|'COMMON'|'DETAILS'>('VIEW');
  // selectedFieldKeys: ordered list of keys visible in the Item Details grid
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem('smriti_wb_fields');
    return saved ? JSON.parse(saved) : DEFAULT_SELECTED;
  });
  // commonFieldKeys: subset of selectedFieldKeys marked as common
  const [commonFieldKeys, setCommonFieldKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem('smriti_wb_common_keys');
    return saved ? JSON.parse(saved) : ["department", "brand", "tax_percent"];
  });
  // commonFieldData: { [fieldKey]: value } — single row of shared data
  const [commonFieldData, setCommonFieldData] = useState<Record<string,string>>(() => {
    const saved = localStorage.getItem('smriti_wb_common_data');
    return saved ? JSON.parse(saved) : {};
  });
  // VIEW tab — highlight selections in both panels
  const [viewUnselHighlight, setViewUnselHighlight] = useState<string[]>([]);
  const [viewSelHighlight, setViewSelHighlight] = useState<string[]>([]);
  // ─────────────────────────────────────────────────────────────
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ r: number, c: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMatrixGenerator, setShowMatrixGenerator] = useState(false);
  const [matrixConfig, setMatrixConfig] = useState({ styleCode: "", baseName: "", colours: "", sizes: "", mrp: "", sp: "", cp: "" });
  const [filterText, setFilterText] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<number, string>>({});
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [sngMode, setSngMode] = useState<'GS1' | 'NON-GS1' | 'HYBRID'>('NON-GS1');
  const [showSngConfig, setShowSngConfig] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [newRowsCount, setNewRowsCount] = useState<number>(10);
  // derived: current schema = only the selected fields (from View tab)
  const s9Schema = useMemo(() =>
    selectedFieldKeys.map(k => ALL_FIELDS.find(f => f.key === k)).filter(Boolean)
  , [selectedFieldKeys]);
  const unselectedFields = useMemo(() =>
    ALL_FIELDS.filter(f => !selectedFieldKeys.includes(f.key))
  , [selectedFieldKeys]);
  // save field config to localStorage whenever it changes
  useEffect(() => { localStorage.setItem('smriti_wb_fields', JSON.stringify(selectedFieldKeys)); }, [selectedFieldKeys]);
  useEffect(() => { localStorage.setItem('smriti_wb_common_keys', JSON.stringify(commonFieldKeys)); }, [commonFieldKeys]);
  useEffect(() => { localStorage.setItem('smriti_wb_common_data', JSON.stringify(commonFieldData)); }, [commonFieldData]);
  // Alt+1/2/3 shortcuts (Shoper 9 parity)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') { e.preventDefault(); setS9Tab('VIEW'); }
      if (e.altKey && e.key === '2') { e.preventDefault(); setS9Tab('COMMON'); }
      if (e.altKey && e.key === '3') { e.preventDefault(); setS9Tab('DETAILS'); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  // View tab helpers
  const moveToSelected = () => {
    const toAdd = viewUnselHighlight.filter(k => !selectedFieldKeys.includes(k));
    setSelectedFieldKeys(prev => [...prev, ...toAdd]);
    setViewUnselHighlight([]);
  };
  const moveToUnselected = () => {
    const toRemove = viewSelHighlight.filter(k => !MANDATORY_KEYS.includes(k));
    setSelectedFieldKeys(prev => prev.filter(k => !toRemove.includes(k)));
    setCommonFieldKeys(prev => prev.filter(k => !toRemove.includes(k)));
    setViewSelHighlight([]);
  };
  const moveUp = () => {
    if (viewSelHighlight.length !== 1) return;
    const k = viewSelHighlight[0]; const idx = selectedFieldKeys.indexOf(k);
    if (idx <= 0) return;
    const arr = [...selectedFieldKeys]; [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
    setSelectedFieldKeys(arr);
  };
  const moveDown = () => {
    if (viewSelHighlight.length !== 1) return;
    const k = viewSelHighlight[0]; const idx = selectedFieldKeys.indexOf(k);
    if (idx < 0 || idx >= selectedFieldKeys.length - 1) return;
    const arr = [...selectedFieldKeys]; [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
    setSelectedFieldKeys(arr);
  };
  const inputRef = useRef<HTMLInputElement>(null);

  const filterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  }, [sheets]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        filterInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleCellChange = (r: number, c: number, value: any) => {
    const key = `${r}-${c}`;
    const newGridData = { ...gridData, [key]: value };
    const newModified = new Set(modifiedRows);
    newModified.add(r);
    
    updateActiveSheet({
      gridData: newGridData,
      modifiedRows: Array.from(newModified)
    });
  };

  const startEditing = (r: number, c: number) => {
    if (currentSchema[c].readonly) return;
    setEditingCell({ r, c });
    setEditValue(gridData[`${r}-${c}`] || "");
  };

  const finishEditing = () => {
    if (editingCell) {
      handleCellChange(editingCell.r, editingCell.c, editValue);
      setEditingCell(null);
    }
  };


  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (editingCell || (target.tagName === "INPUT" && (target as HTMLInputElement).type !== "checkbox")) return;
      
      const pasteData = e.clipboardData?.getData('text');
      if (!pasteData || !selectedCell) return;

      const lines = pasteData.split(/\r?\n/);
      const newData = { ...gridData };
      const newModified = new Set(modifiedRows);
      
      let startR = selectedCell.r;
      let startC = selectedCell.c;

      lines.forEach((line: string, rowIdx: number) => {
        if (!line.trim() && rowIdx === lines.length - 1) return;
        const cells = line.split('\t');
        cells.forEach((cellVal: string, colIdx: number) => {
          const targetR = startR + rowIdx;
          const targetC = startC + colIdx;
          
          if (targetR <= rowsCount && targetC < currentSchema.length) {
            if (!currentSchema[targetC].readonly) {
              newData[`${targetR}-${targetC}`] = cellVal.trim();
              newModified.add(targetR);
            }
          }
        });
      });

      updateActiveSheet({
        gridData: newData,
        modifiedRows: Array.from(newModified)
      });
      showToast("Data pasted successfully from clipboard.", 'success');
      e.preventDefault();
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [editingCell, selectedCell, gridData, modifiedRows, rowsCount, currentSchema, updateActiveSheet]);

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === "INPUT" && !editingCell) return;
    
    if (!selectedCell) return;
    const { r, c } = selectedCell;

    if (editingCell) {
      if (e.key === "Enter") {
        finishEditing();
        e.preventDefault();
      }
      if (e.key === "Escape") {
        setEditingCell(null);
      }
      return;
    }

    if (e.key === "ArrowUp") { setSelectedCell({ r: Math.max(1, r - 1), c }); e.preventDefault(); }
    if (e.key === "ArrowDown") { setSelectedCell({ r: Math.min(rowsCount, r + 1), c }); e.preventDefault(); }
    if (e.key === "ArrowLeft") { setSelectedCell({ r, c: Math.max(0, c - 1) }); e.preventDefault(); }
    if (e.key === "ArrowRight") { setSelectedCell({ r, c: Math.min(currentSchema.length - 1, c + 1) }); e.preventDefault(); }
    
    if (e.key === "Enter") {
      startEditing(r, c);
      e.preventDefault();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      handleCellChange(r, c, "");
    }

    if (e.key === "F11") {
      setIsFullscreen(prev => !prev);
      e.preventDefault();
    }
  }, [selectedCell, editingCell, gridData, rowsCount]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const applyCommonFields = () => {
    if (activeSheet !== "Item Master") return;
    
    const commonSheet = sheets["Common Fields"];
    if (!commonSheet || !commonSheet.gridData) {
      showToast("No common fields defined.", 'error');
      return;
    }

    const commonData = commonSheet.gridData;
    const defaults: Record<string, string> = {
      department: commonData["1-0"] || "",
      brand: commonData["1-1"] || "",
      subclass1: commonData["1-2"] || "",
      colour: commonData["1-3"] || "",
      hsn_code: commonData["1-4"] || "",
      vendor_code: commonData["1-5"] || "",
      tax_percent: commonData["1-6"] || "",
      markup_percent: commonData["1-7"] || ""
    };

    const newGridData = { ...gridData };
    const newModified = new Set(modifiedRows);
    const targetRows = selectedRows.size > 0 
      ? Array.from(selectedRows) 
      : Array.from({ length: rowsCount }, (_, i) => i + 1);

    let appliedCount = 0;
    targetRows.forEach(r => {
      SCHEMAS.ITEM_MASTER.forEach((col, ci) => {
        if (defaults[col.key] && !newGridData[`${r}-${ci}`]) {
          newGridData[`${r}-${ci}`] = defaults[col.key];
          newModified.add(r);
          appliedCount++;
        }
      });
    });

    if (appliedCount > 0) {
      updateActiveSheet({ gridData: newGridData, modifiedRows: Array.from(newModified) });
      showToast(`Applied defaults to ${targetRows.length} rows (${appliedCount} cells).`, 'success');
    } else {
      showToast("No empty fields to fill or no defaults set.", 'error');
    }
  };

  const generateMatrixItems = () => {
    if (!matrixConfig.styleCode || !matrixConfig.baseName) {
      showToast("Style Code and Base Name are required.", 'error');
      return;
    }

    const colors = matrixConfig.colours.split(',').map(c => c.trim()).filter(Boolean);
    const sizes = matrixConfig.sizes.split(',').map(s => s.trim()).filter(Boolean);
    
    // Ensure at least one loop executes
    const colorList = colors.length > 0 ? colors : [""];
    const sizeList = sizes.length > 0 ? sizes : [""];

    const newGridData = { ...gridData };
    const newModified = new Set(modifiedRows);
    
    // Find next available empty row
    let startRow = 1;
    while (newGridData[`${startRow}-0`] || newGridData[`${startRow}-1`]) {
      startRow++;
    }

    let currentRow = startRow;
    let addedCount = 0;

    colorList.forEach((c, cIdx) => {
      sizeList.forEach((s, sIdx) => {
        const cPrefix = c ? c.substring(0, 3).toUpperCase() : `C${cIdx}`;
        const sPrefix = s ? s.substring(0, 2).toUpperCase() : `S${sIdx}`;
        
        const sku = `${matrixConfig.styleCode}${cPrefix}${sPrefix}`;
        const descName = [matrixConfig.baseName, c, s].filter(Boolean).join(" - ");

        newGridData[`${currentRow}-0`] = sku;
        newGridData[`${currentRow}-1`] = descName;
        newGridData[`${currentRow}-2`] = sku; // Barcode defaults to SKU
        if (c) newGridData[`${currentRow}-6`] = c;
        if (s) newGridData[`${currentRow}-7`] = s;
        if (matrixConfig.mrp) newGridData[`${currentRow}-8`] = matrixConfig.mrp;
        if (matrixConfig.sp) newGridData[`${currentRow}-9`] = matrixConfig.sp;
        if (matrixConfig.cp) newGridData[`${currentRow}-10`] = matrixConfig.cp;

        newModified.add(currentRow);
        currentRow++;
        addedCount++;
      });
    });

    updateActiveSheet({
      gridData: newGridData,
      modifiedRows: Array.from(newModified),
      rowsCount: Math.max(rowsCount, currentRow + 10)
    });

    setShowMatrixGenerator(false);
    showToast(`Generated ${addedCount} matrix items.`, 'success');
  };

  const calculateEANChecksum = (code: string) => {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return check.toString();
  };

  const generateAllSmartSKUs = () => {
    const newData = { ...gridData };
    const newModified = new Set(modifiedRows);
    
    for (let r = 1; r <= rowsCount; r++) {
      const dept = String(newData[`${r}-4`] || "GN").substring(0, 2).toUpperCase();
      const brand = String(newData[`${r}-3`] || "SM").substring(0, 2).toUpperCase();
      const size = String(newData[`${r}-7`] || "XX").substring(0, 2).toUpperCase();
      const serial = r.toString().padStart(4, '0');

      if (sngMode === 'NON-GS1') {
        const sku = `${dept}${brand}${size}${serial}`;
        newData[`${r}-0`] = sku;
        newData[`${r}-2`] = sku;
      } else if (sngMode === 'GS1') {
        const base = "890" + r.toString().padStart(9, '0');
        const barcode = base + calculateEANChecksum(base);
        newData[`${r}-0`] = barcode;
        newData[`${r}-2`] = barcode;
      }
      newModified.add(r);
    }
    
    updateActiveSheet({ 
      gridData: newData,
      modifiedRows: Array.from(newModified)
    });
    showToast("Smart-SKUs generated for all rows.", 'success');
  };

  const handleBulkFill = (colIndex: number, mode: 'value' | 'serial' | 'derived') => {
    const newGridData = { ...gridData };
    const newModified = new Set(modifiedRows);
    const startRow = selectedCell?.r || 1;
    const baseValue = gridData[`${startRow}-${colIndex}`];

    for (let r = startRow + 1; r <= rowsCount; r++) {
      if (mode === 'value') {
        newGridData[`${r}-${colIndex}`] = baseValue;
      } else if (mode === 'serial') {
        const num = parseInt(baseValue);
        if (!isNaN(num)) newGridData[`${r}-${colIndex}`] = (num + (r - startRow)).toString();
      }
      newModified.add(r);
    }
    
    updateActiveSheet({
      gridData: newGridData,
      modifiedRows: Array.from(newModified)
    });
    showToast(`Applied ${mode} fill to column.`, 'success');
  };

  const handleAddRowAtTop = () => {
    setRowsCount(prev => prev + newRowsCount);
    showToast(`Added ${newRowsCount} blank rows.`, 'success');
  };

  const handleFreshStart = () => {
    if (window.confirm("This will clear THIS sheet. Are you sure?")) {
      updateActiveSheet({
        gridData: {},
        modifiedRows: [],
        deletedRows: [],
        validationErrors: {},
        rowsCount: activeSheet === "Common Fields" ? 1 : 50
      });
      setSelectedRows(new Set());
      showToast("Sheet cleared.", 'success');
    }
  };

  const handleAddSheet = () => {
    const type = prompt("Enter sheet type (1: Item Master, 2: Classification, 3: Attributes):", "1");
    let schemaType = "ITEM_MASTER";
    if (type === "2") schemaType = "CLASSIFICATION";
    if (type === "3") schemaType = "ATTRIBUTES";

    const name = `Custom Sheet ${Object.keys(sheets).length + 1}`;
    setSheets(prev => ({
      ...prev,
      [name]: { schema: schemaType, gridData: {}, rowsCount: 50, modifiedRows: [], deletedRows: [], validationErrors: {} }
    }));
    setActiveSheet(name);
  };

  const toggleRowSelection = (r: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(r)) newSelection.delete(r);
    else newSelection.add(r);
    setSelectedRows(newSelection);
  };

  const markForDeletion = (r: number) => {
    const newDeleted = new Set(deletedRows);
    if (newDeleted.has(r)) newDeleted.delete(r);
    else newDeleted.add(r);
    setDeletedRows(newDeleted);
  };

  const deleteSelected = () => {
    const newDeleted = new Set(deletedRows);
    selectedRows.forEach(r => newDeleted.add(r));
    setDeletedRows(newDeleted);
    setSelectedRows(new Set());
    showToast(`Marked ${selectedRows.size} rows for deletion.`, 'success');
  };

  const handlePullData = async () => {
    setIsPulling(true);
    try {
      const searchQuery = serverSearch.trim() || "*"; 
      
      // Determine target table and key mapping based on active sheet
      let tableName = 'itemmaster';
      let keyMap: Record<string, string> = {
        stockno: 'item_code',
        itemdesc: 'item_name',
        sfield1: 'barcode',
        class1cd: 'department',
        class2cd: 'brand',
        subclass1cd: 'subclass1',
        subclass2cd: 'colour',
        sizecd: 'size',
        retail_price: 'mrp_paise',
        dealer_price: 'sales_price',
        currentcost: 'cost_price',
        sfield2: 'hsn_code'
      };

      if (activeSheet === "Item Classification") {
        tableName = 'class12combo';
        keyMap = {
          class1cd: 'dept',
          class2cd: 'brand',
          superclass1: 'product',
          sizegroup: 'size_group',
          prodtaxtype: 'tax_percent',
          prefvendorid: 'vendor_code',
          retailmarkup: 'markup_percent'
        };
      } else if (activeSheet === "Master Attributes") {
        tableName = 'general_lookup';
        keyMap = {
          category: 'LookupType',
          code: 'LookupCode',
          label: 'LookupDesc',
          sort_order: 'SortOrder',
          is_active: 'Active'
        };
      }

      const response = await api.legacy.getData(tableName, { search: searchQuery, limit: 100 });
      const newData: any = {};
      
      // The API returns { total: X, data: [...], table: Y }
      const rows = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      if (rows.length === 0) {
        showToast(`No records found in ${tableName} for this query.`, 'error');
        return;
      }
      
      rows.forEach((item: any, ri: number) => {
        currentSchema.forEach((col, ci) => {
          // Find if there's a legacy key for this column
          const legacyKey = Object.keys(keyMap).find(k => keyMap[k] === col.key) || col.key;
          let val = item[legacyKey] ?? "";
          
          // Custom transformations
          if (activeSheet === "Item Master") {
            if (col.key === 'mrp_paise' && val !== "") {
              val = Math.round(parseFloat(val) * 100);
            }
          } else if (activeSheet === "Item Classification") {
            if (col.key === 'class12combo') {
              val = `${item.class1cd || ''}/${item.class2cd || ''}`;
            }
          } else if (activeSheet === "Master Attributes") {
            if (col.key === 'Active') {
              val = val === true || val === 'Y' || val === 1 ? 'Y' : 'N';
            }
          }
          
          newData[`${ri + 1}-${ci}`] = val;
        });
      });
      updateActiveSheet({ gridData: newData });
      showToast(`Successfully pulled ${rows.length} records from ${tableName}.`, 'success');
    } catch (err) {
      showToast("Pull failed: " + err, 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    setValidationErrors({});
    setIsSaving(true);
    try {
      const itemsToUpdate = [];
      const errors: Record<number, string> = {};

      for (let r = 1; r <= rowsCount; r++) {
        const item: any = {};
        let hasData = false;
        
        currentSchema.forEach((col, ci) => {
          const val = gridData[`${r}-${ci}`];
          if (val !== undefined && val !== "") {
            item[col.key] = col.type === "number" ? Number(val) : val;
            hasData = true;
          }
        });

        if (hasData) {
          // DYNAMIC SCHEMA VALIDATION
          const rowErrors = [];
          currentSchema.forEach((col) => {
            if (col.required && !item[col.key]) {
              rowErrors.push(`${col.label} is Required.`);
            }
          });
          
          // Contextual numeric checks
          if (item.mrp_paise !== undefined && item.mrp_paise <= 0) {
            rowErrors.push("MRP must be greater than zero.");
          }
          if (item.tax_percent !== undefined && (item.tax_percent < 0 || item.tax_percent > 100)) {
            rowErrors.push("Tax % must be valid.");
          }
          
          if (rowErrors.length > 0) {
            errors[r] = rowErrors.join(" | ");
          }

          if (initialData[r - 1]?.id) item.id = initialData[r - 1].id;
          else item.id = item.item_code; 

          itemsToUpdate.push(item);
        }
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        showToast("Validation failed. Please check highlighted rows.", 'error');
        setIsSaving(false);
        return;
      }

      if (itemsToUpdate.length === 0) {
        showToast("No data to commit.", 'error');
        setIsSaving(false);
        return;
      }

      console.log("Synchronizing items to Ledger...", itemsToUpdate);
      
      const response = await api.inventory.bulkUpdate(itemsToUpdate);
      
      localStorage.removeItem(STORAGE_KEY);
      showToast(response.message || `Successfully synchronized ${itemsToUpdate.length} items.`, 'success');
      setTimeout(onBack, 1500);
    } catch (err: any) {
      // Handle 422 and other API errors
      let errorMsg = "Synchronization failed.";
      if (err.response?.status === 422) {
        errorMsg = "Data Format Error (422): Some fields have invalid values. Check Stock Numbers and Prices.";
      }
      showToast(errorMsg, 'error');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className={cn(
      "flex flex-col bg-[var(--background)] text-[var(--text-primary)] font-mono overflow-hidden border border-[var(--border-subtle)] shadow-2xl transition-all duration-500",
      isFullscreen 
        ? "fixed inset-0 z-[999999] rounded-0 h-screen w-screen bg-[var(--background)]" 
        : "h-[80vh] rounded-[40px] mt-6"
    )}>
      {/* Workbench Header */}
      <div className="bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] p-6 flex items-center justify-between shrink-0 relative z-[100]">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { console.log("Back Clicked"); onBack(); }}
            className="w-12 h-12 rounded-2xl bg-[var(--background)] hover:bg-[var(--accent)] hover:text-white flex items-center justify-center text-[var(--text-tertiary)] transition-all border border-[var(--border-subtle)]"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-12 h-12 rounded-2xl bg-[var(--background)] hover:bg-[var(--accent)] hover:text-white flex items-center justify-center text-[var(--text-tertiary)] transition-all border border-[var(--border-subtle)]"
            title="Toggle Fullscreen [F11]"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button 
            onClick={() => window.open('/workbench', 'Workbench', 'width=1400,height=900,menubar=no,toolbar=no')}
            className="w-12 h-12 rounded-2xl bg-[var(--background)] hover:bg-[var(--accent)] hover:text-white flex items-center justify-center text-[var(--text-tertiary)] transition-all border border-[var(--border-subtle)]"
            title="Open in New Window"
          >
            <ExternalLink size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter flex items-center gap-3">
              <FileSpreadsheet className="text-[var(--accent)]" size={24} />
              Item Master Workbench
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={14} />
                <input 
                  type="text"
                  placeholder="Pull from DB... (e.g. NIKE)"
                  className="bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-500 w-48 transition-all text-[var(--text-primary)]"
                  value={serverSearch}
                  onChange={(e) => setServerSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePullData()}
                />
              </div>
              <button 
                onClick={handlePullData}
                disabled={isPulling}
                className="p-2 bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
              >
                {isPulling ? <Loader2 className="animate-spin" size={16} /> : <DownloadCloud size={16} />}
              </button>
              <div className="w-px h-6 bg-[var(--border-subtle)] mx-2" />
              <div className="relative flex items-center gap-1">
                <div className="relative">
                  <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={14} />
                  <input 
                    ref={filterInputRef}
                    type="text"
                    placeholder="Filter View... [F3]"
                    className="bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl py-2 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 w-48 transition-all text-[var(--text-primary)]"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowColumnFilters(!showColumnFilters)}
                  className={cn(
                    "p-2 border rounded-xl transition-all shadow-sm",
                    showColumnFilters 
                      ? "bg-blue-500 text-white border-blue-600 shadow-blue-500/20" 
                      : "bg-[var(--background)] border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-blue-500 hover:text-blue-500"
                  )}
                  title="Toggle Column Filters"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleFreshStart}
            className="flex items-center gap-3 bg-[var(--background)] text-slate-400 hover:text-on-surface px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 transition-all"
            title="Clear all and start fresh"
          >
            <Zap size={14} />
            Fresh Start
          </button>
          <div className="flex items-center bg-[var(--background)] border border-navy/10 rounded-2xl px-2">
            <input 
              type="number"
              min="1"
              max="500"
              value={newRowsCount}
              onChange={(e) => setNewRowsCount(parseInt(e.target.value) || 1)}
              className="w-12 bg-transparent text-center font-black text-xs outline-none py-3"
            />
            <button 
              onClick={handleAddRowAtTop}
              className="flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
            >
              <Plus size={14} />
              Create Blank Rows
            </button>
          </div>
          
          {activeSheet === "Item Master" && (
            <button 
              onClick={() => setShowMatrixGenerator(true)}
              className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 transition-all"
            >
              <LayoutGrid size={14} />
              Matrix Generator
            </button>
          )}

          <button 
            onClick={generateAllSmartSKUs}
            className="flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
          >
            <Wand2 size={14} className="text-tertiary" />
            Smart-SKU (All)
          </button>
          
          {activeSheet === "Item Master" && (
            <button 
              onClick={applyCommonFields}
              className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
              title="Apply Common Fields to empty cells"
            >
              <LayoutGrid size={14} />
              Apply Defaults
            </button>
          )}

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-3 bg-amber-500 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            Commit to Ledger
          </button>
        </div>
      </div>

      {showMatrixGenerator && (
        <div className="absolute inset-0 bg-black/60 z-[200] flex items-center justify-center backdrop-blur-sm p-8">
          <div className="bg-[var(--surface-elevated)] w-full max-w-2xl rounded-3xl p-8 border border-[var(--border-subtle)] shadow-2xl flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
              <LayoutGrid className="text-blue-500" /> Item Matrix Generator
            </h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Style / Base Code</label>
                <input 
                  type="text" 
                  value={matrixConfig.styleCode} 
                  onChange={(e) => setMatrixConfig({...matrixConfig, styleCode: e.target.value.toUpperCase()})}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold uppercase"
                  placeholder="E.g. NK01"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Base Description</label>
                <input 
                  type="text" 
                  value={matrixConfig.baseName} 
                  onChange={(e) => setMatrixConfig({...matrixConfig, baseName: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold"
                  placeholder="E.g. Nike Sports Shirt"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Colours (Comma Separated)</label>
                <input 
                  type="text" 
                  value={matrixConfig.colours} 
                  onChange={(e) => setMatrixConfig({...matrixConfig, colours: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold uppercase"
                  placeholder="RED, BLUE, BLACK"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Sizes (Comma Separated)</label>
                <input 
                  type="text" 
                  value={matrixConfig.sizes} 
                  onChange={(e) => setMatrixConfig({...matrixConfig, sizes: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold uppercase"
                  placeholder="S, M, L, XL"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Base MRP</label>
                <input 
                  type="number" 
                  value={matrixConfig.mrp} 
                  onChange={(e) => setMatrixConfig({...matrixConfig, mrp: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Base Sales Price</label>
                <input 
                  type="number" 
                  value={matrixConfig.sp} 
                  onChange={(e) => setMatrixConfig({...matrixConfig, sp: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-bold"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-auto">
              <button 
                onClick={() => setShowMatrixGenerator(false)}
                className="px-6 py-3 rounded-xl border border-[var(--border-subtle)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--surface-elevated-hover)] transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={generateMatrixItems}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
              >
                Generate Matrix Grid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Shoper 9 Tab Navigation ── */}
      <div className="flex px-6 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] shrink-0 gap-1">
        {([['VIEW','View','Alt+1'],['COMMON','Common Fields','Alt+2'],['DETAILS','Item Details','Alt+3']] as const).map(([tab,label,kbd]) => (
          <button key={tab} onClick={() => setS9Tab(tab as any)}
            className={cn("px-6 py-4 text-[11px] font-black uppercase tracking-widest border-b-[3px] transition-all whitespace-nowrap flex items-center gap-2",
              s9Tab === tab ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            )}>
            {label} <span className="text-[9px] opacity-40 font-mono">{kbd}</span>
          </button>
        ))}
      </div>

      {/* ── VIEW TAB ── Field Selector (Shoper 9 Alt+1) */}
      {s9Tab === 'VIEW' && (
        <div className="flex-1 flex flex-col p-8 gap-6 bg-[var(--background)]">
          <p className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">
            Select the fields to be displayed for capturing item details in the Item Details grid.
          </p>
          <div className="flex gap-6 flex-1 min-h-0">
            {/* Unselected Fields */}
            <div className="flex-1 flex flex-col border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <div className="bg-[var(--surface-elevated)] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
                Unselected Fields
              </div>
              <div className="flex-1 overflow-auto">
                {unselectedFields.map(f => (
                  <div key={f.key}
                    onClick={() => setViewUnselHighlight(prev => prev.includes(f.key) ? prev.filter(k=>k!==f.key) : [...prev, f.key])}
                    className={cn("px-4 py-2 text-xs cursor-pointer border-b border-[var(--border-subtle)] transition-all",
                      viewUnselHighlight.includes(f.key) ? "bg-blue-500 text-white" : "hover:bg-[var(--surface-elevated)]"
                    )}>
                    {f.label}
                  </div>
                ))}
                {unselectedFields.length === 0 && <div className="px-4 py-6 text-xs text-[var(--text-tertiary)] text-center">All fields selected</div>}
              </div>
            </div>

            {/* Arrow Controls */}
            <div className="flex flex-col items-center justify-center gap-3">
              <button onClick={moveToSelected} title="Add →" className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg"><ChevronsRight size={18}/></button>
              <button onClick={moveToUnselected} title="← Remove" className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)] flex items-center justify-center hover:border-rose-400 hover:text-rose-400 transition-all"><ChevronsLeft size={18}/></button>
              <div className="w-px h-6 bg-[var(--border-subtle)]"/>
              <button onClick={moveUp} title="Move Up" className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)] flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition-all"><ArrowUpCircle size={18}/></button>
              <button onClick={moveDown} title="Move Down" className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)] flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition-all"><ArrowDownCircle size={18}/></button>
            </div>

            {/* Selected Fields */}
            <div className="flex-1 flex flex-col border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <div className="bg-[var(--surface-elevated)] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <span>Selected Fields</span>
                <span className="text-[9px] opacity-50">Gray = Mandatory</span>
              </div>
              <div className="flex-1 overflow-auto">
                {selectedFieldKeys.map((k,i) => {
                  const f = ALL_FIELDS.find(x => x.key === k);
                  if (!f) return null;
                  const isMandatory = MANDATORY_KEYS.includes(k);
                  return (
                    <div key={k}
                      onClick={() => !isMandatory && setViewSelHighlight(prev => prev.includes(k) ? prev.filter(x=>x!==k) : [...prev, k])}
                      className={cn("px-4 py-2 text-xs border-b border-[var(--border-subtle)] transition-all flex items-center justify-between",
                        isMandatory ? "bg-slate-100 dark:bg-slate-800 text-[var(--text-tertiary)] cursor-not-allowed" :
                        viewSelHighlight.includes(k) ? "bg-blue-500 text-white cursor-pointer" : "hover:bg-[var(--surface-elevated)] cursor-pointer"
                      )}>
                      <span>{i+1}. {f.label}</span>
                      {isMandatory && <span className="text-[9px] font-black text-rose-400">REQUIRED</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => { localStorage.setItem('smriti_wb_fields', JSON.stringify(selectedFieldKeys)); showToast('Field selections saved.','success'); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
              <Save size={14}/> Save Field Selections
            </button>
            <button onClick={() => setS9Tab('COMMON')}
              className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border-subtle)] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-blue-400 transition-all">
              Next → Common Fields (Alt+2)
            </button>
          </div>
        </div>
      )}

      {/* ── COMMON FIELDS TAB ── (Shoper 9 Alt+2) */}
      {s9Tab === 'COMMON' && (
        <div className="flex-1 flex flex-col p-8 gap-6 bg-[var(--background)]">
          <p className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">
            Select fields to treat as common. Enter common data once per session — it will auto-fill blank cells on the grid.
          </p>
          <div className="flex gap-8 flex-1 min-h-0">
            {/* Field checklist */}
            <div className="w-72 flex flex-col border border-[var(--border-subtle)] rounded-2xl overflow-hidden shrink-0">
              <div className="bg-[var(--surface-elevated)] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
                Common Fields
              </div>
              <div className="flex-1 overflow-auto">
                {selectedFieldKeys.filter(k => !MANDATORY_KEYS.includes(k)).map(k => {
                  const f = ALL_FIELDS.find(x => x.key === k);
                  if (!f) return null;
                  return (
                    <label key={k} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-elevated)] cursor-pointer border-b border-[var(--border-subtle)]">
                      <input type="checkbox" checked={commonFieldKeys.includes(k)}
                        onChange={e => setCommonFieldKeys(prev => e.target.checked ? [...prev, k] : prev.filter(x=>x!==k))}
                        className="rounded border-[var(--border-subtle)] accent-blue-500"/>
                      <span className="text-xs font-bold">{f.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Common Field Data grid */}
            <div className="flex-1 flex flex-col border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <div className="bg-[var(--surface-elevated)] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
                Common Field Data
              </div>
              {commonFieldKeys.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-tertiary)]">
                  No common fields selected. Check fields on the left.
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-[var(--surface-elevated)]">
                      <tr>
                        <th className="px-4 py-2 text-[10px] font-black uppercase text-[var(--text-tertiary)] border-b border-r border-[var(--border-subtle)] text-left w-40">Field</th>
                        <th className="px-4 py-2 text-[10px] font-black uppercase text-[var(--text-tertiary)] border-b border-[var(--border-subtle)] text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commonFieldKeys.map(k => {
                        const f = ALL_FIELDS.find(x => x.key === k);
                        if (!f) return null;
                        return (
                          <tr key={k} className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]/40">
                            <td className="px-4 py-2 text-xs font-bold border-r border-[var(--border-subtle)]">{f.label}</td>
                            <td className="px-2 py-1">
                              <input type={f.type === 'number' ? 'number' : 'text'} value={commonFieldData[k] || ''}
                                onChange={e => setCommonFieldData(prev => ({...prev, [k]: e.target.value}))}
                                className="w-full bg-transparent px-2 py-1 text-xs font-bold outline-none border border-transparent focus:border-blue-500 rounded-lg"/>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => { localStorage.setItem('smriti_wb_common_data', JSON.stringify(commonFieldData)); localStorage.setItem('smriti_wb_common_keys', JSON.stringify(commonFieldKeys)); showToast('Common field data saved.','success'); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
              <Save size={14}/> Save Common Field Data
            </button>
            <button onClick={() => setS9Tab('DETAILS')}
              className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border-subtle)] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-blue-400 transition-all">
              Next → Item Details (Alt+3)
            </button>
          </div>
        </div>
      )}

      {/* Item Details tab — guard to only show the grid when s9Tab === 'DETAILS' */}
      {s9Tab !== 'DETAILS' ? null : (<>

      {/* Quick Action Toolbar */}
      {(selectedCell || selectedRows.size > 0) && (
        <div className="bg-primary/90 text-white p-2 flex items-center justify-between px-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-6">
            {selectedRows.size > 0 ? (
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                {selectedRows.size} Rows Selected
              </span>
            ) : selectedCell ? (
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                Row {selectedCell.r} · Col {currentSchema[selectedCell.c]?.label || "N/A"}
              </span>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                Bulk Selection Mode
              </span>
            )}
            <div className="w-px h-4 bg-white/10" />
            
            {selectedRows.size > 0 ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={deleteSelected}
                  className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-rose-600 shadow-lg"
                >
                  Delete Selected
                </button>
                <button 
                  onClick={() => setSelectedRows(new Set())}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleBulkFill(selectedCell.c, 'value')}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Copy Down
                </button>
                <button 
                  onClick={() => handleBulkFill(selectedCell.c, 'serial')}
                  className="bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Serial Fill
                </button>
                {(selectedCell.c === 0 || selectedCell.c === 2) && (
                  <button 
                    onClick={() => handleBulkFill(selectedCell.c, 'derived')}
                    className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Derived (Smart)
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[9px] font-black uppercase text-white/40">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> NEW
                <div className="w-2 h-2 rounded-full bg-amber-500 ml-2" /> EDITED
                <div className="w-2 h-2 rounded-full bg-rose-500 ml-2" /> DELETING
             </div>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div className="flex-1 overflow-auto bg-[var(--background-alt)] relative z-0">
        {Object.keys(gridData).length === 0 && !isPulling && rowsCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-[1000]">
            <LayoutGrid size={48} className="text-on-surface/10 mb-4" />
            <h3 className="text-xl font-serif font-black text-on-surface/40 uppercase tracking-tighter">Workbench is Empty</h3>
            <p className="text-[10px] font-black text-on-surface/20 uppercase tracking-[0.2em] mb-8">Pull from Ledger or start fresh</p>
            <div className="flex gap-4">
              <button 
                onClick={() => handlePullData()}
                className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
              >
                <DownloadCloud size={16} />
                Load Recent Items
              </button>
            </div>
          </div>
        )}
        <table className="border-collapse table-fixed select-none">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[var(--surface-elevated)]">
              <th className="w-10 border-b border-r border-[var(--border-subtle)] p-2">
                <input 
                  type="checkbox" 
                  checked={selectedRows.size === rowsCount}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedRows(new Set(Array.from({length: rowsCount}, (_, i) => i+1)));
                    else setSelectedRows(new Set());
                  }}
                  className="rounded border-[var(--border-subtle)]"
                />
              </th>
              <th className="w-12 border-b border-r border-[var(--border-subtle)] p-2 text-[10px] text-[var(--text-tertiary)] font-black uppercase">#</th>
              {currentSchema.map((col, ci) => (
                <th 
                  key={ci} 
                  style={{ width: col.width }}
                  className="border-b border-r border-[var(--border-subtle)] p-3 text-left text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-widest"
                >
                  <div className="flex items-center justify-between">
                    <span>{col.label} {col.required && <span className="text-rose-500">*</span>}</span>
                  </div>
                </th>
              ))}
              <th className="flex-1 border-b border-[var(--border-subtle)]"></th>
            </tr>
            {showColumnFilters && (
              <tr className="bg-[var(--background)]">
                <th className="border-b border-r border-[var(--border-subtle)]"></th>
                <th className="border-b border-r border-[var(--border-subtle)]"></th>
                {currentSchema.map((col, ci) => (
                  <th key={ci} className="border-b border-r border-[var(--border-subtle)] p-1">
                    <input 
                      type="text"
                      className="w-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-[9px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      placeholder={`Filter...`}
                      value={columnFilters[ci] || ""}
                      onChange={(e) => setColumnFilters(prev => ({ ...prev, [ci]: e.target.value }))}
                    />
                  </th>
                ))}
                <th className="border-b border-[var(--border-subtle)]"></th>
              </tr>
            )}
          </thead>
          <tbody>
            {Array.from({ length: rowsCount }, (_, ri) => {
              const r = ri + 1;
              
              // Row Filtering Logic
              if (filterText) {
                const rowValues = currentSchema.map((_, ci) => (gridData[`${r}-${ci}`] || "").toString().toLowerCase());
                const matches = rowValues.some(val => val.includes(filterText.toLowerCase()));
                if (!matches) return null;
              }

              // Column Specific Filtering
              const colMatches = Object.entries(columnFilters).every(([ci, filter]) => {
                if (!filter) return true;
                const cellVal = (gridData[`${r}-${ci}`] || "").toString().toLowerCase();
                return cellVal.includes(filter.toLowerCase());
              });
              if (!colMatches) return null;

              return (
                <tr 
                  key={r} 
                  className={cn(
                    "group transition-colors",
                    validationErrors[r] ? "bg-rose-500/10" : "hover:bg-[var(--accent)]/5",
                    deletedRows.has(r) ? "opacity-40 grayscale italic line-through decoration-rose-500" : "",
                    selectedRows.has(r) ? "bg-[var(--accent)]/10" : ""
                  )}
                  title={validationErrors[r]}
                >
                  <td className="border-r border-b border-[var(--border-subtle)] p-2 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedRows.has(r)}
                      onChange={() => toggleRowSelection(r)}
                      className="rounded border-[var(--border-subtle)]"
                    />
                  </td>
                  <td className={cn(
                    "border-r border-b border-[var(--border-subtle)] p-2 text-center text-[10px] font-bold relative",
                    validationErrors[r] ? "bg-rose-500 text-white" : "bg-[var(--surface-elevated)] text-[var(--text-tertiary)]",
                    modifiedRows.has(r) && !validationErrors[r] ? "border-l-4 border-l-amber-500" : ""
                  )}>
                    {r}
                    {/* Status Dot */}
                    {!deletedRows.has(r) && (
                      <div className="absolute right-1 top-1 flex flex-col gap-0.5">
                        {modifiedRows.has(r) && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        {r > initialData.length && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </div>
                    )}
                  </td>
                  {currentSchema.map((col, ci) => {
                    const isEditing = editingCell?.r === r && editingCell?.c === ci;
                    const isSelected = selectedCell?.r === r && selectedCell?.c === ci;
                    const value = gridData[`${r}-${ci}`];
                    
                    return (
                      <td 
                        key={ci}
                        onClick={() => { setSelectedCell({ r, c: ci }); setEditingCell(null); }}
                        onDoubleClick={() => startEditing(r, ci)}
                        className={cn(
                          "border-r border-b border-[var(--border-subtle)] relative p-0 transition-all",
                          isSelected ? 'bg-[var(--accent)]/10' : ''
                        )}
                      >
                        {isEditing ? (
                          <input 
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={finishEditing}
                            data-f2={col.f2Type || (activeSheet === "Master Attributes" ? "" : "lookups")}
                            data-f2-category={col.f2Category || ""}
                            className="w-full h-full bg-[var(--surface-elevated)] text-[var(--text-primary)] px-3 py-2 text-xs font-bold border-none outline-none ring-2 ring-[var(--accent)] inset-0 z-10"
                          />
                        ) : (
                          <div className={cn(
                            "px-3 py-2 text-xs truncate",
                            col.readonly ? 'opacity-30' : '',
                            value === "" ? 'text-[var(--text-tertiary)] italic' : 'text-[var(--text-primary)] font-bold'
                          )}>
                            {value === "" ? (isSelected ? "" : col.label.toLowerCase() + "...") : value}
                          </div>
                        )}
                        {isSelected && !isEditing && (
                          <div className="absolute inset-0 border-2 border-[var(--accent)] pointer-events-none" />
                        )}
                      </td>
                    );
                  })}
                  <td className="border-b border-[var(--border-subtle)] p-2 text-center w-12">
                     <button 
                       onClick={() => markForDeletion(r)}
                       className={cn(
                         "p-1.5 rounded-lg transition-all",
                         deletedRows.has(r) ? "bg-rose-500 text-white" : "text-rose-500 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100"
                       )}
                     >
                       <Trash2 size={12} />
                     </button>
                  </td>
                  <td className="border-b border-[var(--border-subtle)] flex-1"></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tab Bar Footer */}
      <div className="bg-primary text-white px-8 h-10 flex items-center gap-2 overflow-x-auto shrink-0 border-t border-white/10 select-none">
        {Object.keys(sheets).map(name => (
          <div 
            key={name}
            onClick={() => { setActiveSheet(name); setSelectedCell(null); setSelectedRows(new Set()); }}
            onDoubleClick={() => {
              const newName = prompt("Enter new sheet name:", name);
              if (newName && newName !== name) {
                setSheets(prev => {
                  const newSheets = { ...prev };
                  newSheets[newName] = newSheets[name];
                  delete newSheets[name];
                  return newSheets;
                });
                setActiveSheet(newName);
              }
            }}
            className={cn(
              "px-6 h-full flex items-center text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border-r border-white/5",
              activeSheet === name ? "bg-white text-on-surface" : "hover:bg-white/10"
            )}
          >
            {name}
          </div>
        ))}
        <button 
          onClick={handleAddSheet}
          className="px-4 h-full flex items-center hover:bg-white/10 transition-all text-emerald-400"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Footer Info */}
      <div className="bg-[var(--surface-elevated)] border-t border-[var(--border-subtle)] px-8 py-3 flex items-center justify-between text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-[0.2em] shrink-0">
        <div className="flex items-center gap-6">
          <span>{initialData.length} Items Loaded</span>
          <div className="w-px h-3 bg-[var(--border-subtle)]" />
          <span>Sync Status: <span className="text-emerald-500 font-black">Ready</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-40">Double-Click to Edit Cell</span>
          <span className="opacity-40 font-serif">SMRITI-OS Sovereign Edition</span>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={cn(
          "fixed bottom-12 right-12 px-8 py-4 rounded-3xl shadow-2xl animate-in slide-in-from-right-10 duration-500 z-[1000000] border font-black text-xs uppercase tracking-widest",
          toast.type === 'success' ? "bg-emerald-500 text-white border-emerald-400" : "bg-rose-500 text-white border-rose-400"
        )}>
          {toast.message}
        </div>
      )}
      </>)}
    </div>
  );
}
