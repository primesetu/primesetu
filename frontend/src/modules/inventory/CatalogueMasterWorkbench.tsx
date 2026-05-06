// @ts-nocheck
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  ChevronLeft,
  Search,
  DownloadCloud,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  Filter as FilterIcon,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronsRight,
  ChevronsLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Save,
  Users,
  Building2,
  Store,
  UserCheck,
  FileSpreadsheet,
  Database,
} from "lucide-react";
import { 
  WorkbenchRibbon, 
  RibbonGroup, 
  RibbonButton 
} from "@/components/ui/WorkbenchUI";
import { api } from "../../api/client";
import { cn } from "@/lib/utils";

// ── Entity field registries (from Shoper 9 SQL schema) ───────────────────────
const ENTITY_FIELDS = {
  CUSTOMER: [
    { key: "Code", label: "Customer Code", width: 130, required: true },
    { key: "Nm", label: "Name", width: 220, required: true },
    { key: "PriceGrp", label: "Price Group", width: 120 },
    { key: "CustClass1", label: "Class 1", width: 100 },
    { key: "CustClass2", label: "Class 2222", width: 100 },
    { key: "CustClass3", label: "Class 3", width: 100 },
    { key: "CustProf1", label: "Profile 1", width: 140 },
    { key: "CustProf2", label: "Profile 2", width: 140 },
    // Mailing List / Address Fields
    { key: "StreetAddr", label: "Street Address", width: 200 },
    { key: "Locality", label: "Locality", width: 150 },
    { key: "Town", label: "City/Town", width: 130 },
    { key: "State", label: "State", width: 130 },
    { key: "Country", label: "Country", width: 120 },
    { key: "PostalCd", label: "Postal Code", width: 100 },
    { key: "MobilePhone", label: "Mobile", width: 120 },
    { key: "Email", label: "Email", width: 180 },
    // Other Details
    { key: "LSTNo", label: "LST No", width: 120 },
    { key: "CSTNo", label: "CST No", width: 120 },
    { key: "CreditDays", label: "Credit Days", width: 100, type: "number" },
    { key: "CreditLimit", label: "Credit Limit", width: 110, type: "number" },
    { key: "IsMale", label: "Gender (M/F)", width: 100 },
    { key: "BirthDate", label: "Birth Date", width: 110, type: "date" },
    { key: "WedAnniv", label: "Anniversary", width: 110, type: "date" },
    { key: "LoyaltyPgmId", label: "Loyalty Pgm", width: 120 },
    { key: "LoyaltyPgmCd", label: "Loyalty Code", width: 130 },
    { key: "DestTaxType", label: "Tax Type", width: 100 },
    { key: "PaymtTerms", label: "Paymt Terms", width: 110 },
    { key: "ModeOfTrans", label: "Mode of Trans", width: 120 },
    {
      key: "DtOfCreation",
      label: "Created On",
      width: 120,
      type: "date",
      readonly: true,
    },
  ],
  VENDOR: [
    { key: "Code", label: "Vendor Code", width: 130, required: true },
    { key: "Nm", label: "Vendor Name", width: 220, required: true },
    { key: "VendorType", label: "Vendor Type", width: 120 },
    // Mailing List / Address Fields
    { key: "StreetAddr", label: "Street Address", width: 200 },
    { key: "Locality", label: "Locality", width: 150 },
    { key: "Town", label: "City/Town", width: 130 },
    { key: "State", label: "State", width: 130 },
    { key: "Country", label: "Country", width: 120 },
    { key: "PostalCd", label: "Postal Code", width: 100 },
    { key: "MobilePhone", label: "Mobile", width: 120 },
    { key: "Email", label: "Email", width: 180 },
    // Other Details
    { key: "SrcTaxType", label: "Tax Type", width: 120 },
    { key: "VendorLst", label: "LST No", width: 130 },
    { key: "VendorCst", label: "CST No", width: 130 },
    {
      key: "CommissionPercent",
      label: "Commission %",
      width: 110,
      type: "number",
    },
    { key: "BuyingFactor", label: "Buying Factor", width: 110, type: "number" },
    {
      key: "SellingFactor",
      label: "Selling Factor",
      width: 110,
      type: "number",
    },
    { key: "AllowPartPOSupply", label: "Part PO Supply", width: 120 },
    { key: "POApplicable", label: "PO Applicable", width: 110, type: "number" },
  ],
  CHAINSTORE: [
    { key: "Code", label: "Store Code", width: 130, required: true },
    { key: "Nm", label: "Store Name", width: 220, required: true },
    { key: "Type", label: "Type", width: 80, type: "number" },
    // Mailing List / Address Fields
    { key: "StreetAddr", label: "Street Address", width: 200 },
    { key: "Locality", label: "Locality", width: 150 },
    { key: "Town", label: "City/Town", width: 130 },
    { key: "State", label: "State", width: 130 },
    { key: "Country", label: "Country", width: 120 },
    { key: "PostalCd", label: "Postal Code", width: 100 },
    { key: "MobilePhone", label: "Mobile", width: 120 },
    { key: "Email", label: "Email", width: 180 },
    // Other Details
    { key: "SrcTaxType", label: "Tax Type", width: 120 },
    { key: "BuyingFactor", label: "Buying Factor", width: 120, type: "number" },
    {
      key: "SellingFactor",
      label: "Selling Factor",
      width: 120,
      type: "number",
    },
    { key: "POApplicable", label: "PO Applicable", width: 110, type: "number" },
    { key: "AllowMiscRcpt", label: "Allow Misc Rcpt", width: 130 },
    { key: "AllowMiscIssue", label: "Allow Misc Issue", width: 130 },
  ],
  SALESSTAFF: [
    { key: "Code", label: "Staff Code", width: 130, required: true },
    { key: "Nm", label: "Full Name", width: 220, required: true },
    { key: "Role", label: "Role", width: 120 },
    // Mailing List / Address Fields
    { key: "StreetAddr", label: "Street Address", width: 200 },
    { key: "Locality", label: "Locality", width: 150 },
    { key: "Town", label: "City/Town", width: 130 },
    { key: "State", label: "State", width: 130 },
    { key: "Country", label: "Country", width: 120 },
    { key: "PostalCd", label: "Postal Code", width: 100 },
    { key: "MobilePhone", label: "Mobile", width: 120 },
    { key: "Email", label: "Email", width: 180 },
    // Other Details
    { key: "StoreCode", label: "Store Code", width: 120 },
    { key: "JoinDate", label: "Join Date", width: 110, type: "date" },
    { key: "TargetAmt", label: "Target Amt", width: 110, type: "number" },
    { key: "Commission", label: "Commission %", width: 110, type: "number" },
    { key: "Active", label: "Active (Y/N)", width: 100 },
  ],
  ACCOUNTS: [
    { key: "type", label: "Type", width: 100, required: true },
    { key: "code", label: "Code", width: 120, required: true },
    { key: "nm", label: "Account Name", width: 250, required: true },
    { key: "yropbaldb", label: "Op Bal (Dr)", width: 120, type: "number" },
    { key: "yropbalcr", label: "Op Bal (Cr)", width: 120, type: "number" },
    { key: "curbaldb", label: "Cur Bal (Dr)", width: 120, type: "number" },
    { key: "curbalcr", label: "Cur Bal (Cr)", width: 120, type: "number" },
  ],
  HSN: [
    { key: "code", label: "HSN Code", width: 150, required: true },
    { key: "descr", label: "Description", width: 350, required: true },
    { key: "flag", label: "Flag", width: 80 },
  ],
};

const MANDATORY_BY_ENTITY = {
  CUSTOMER: ["Code", "Nm"],
  VENDOR: ["Code", "Nm"],
  CHAINSTORE: ["Code", "Nm"],
  SALESSTAFF: ["Code", "Nm"],
  ACCOUNTS: ["code", "nm"],
  HSN: ["code", "descr"],
};
const DEFAULT_SELECTED_BY_ENTITY = {
  CUSTOMER: [
    "Code",
    "Nm",
    "StreetAddr",
    "Town",
    "MobilePhone",
    "PriceGrp",
    "CustClass1",
    "CustClass2",
    "CreditDays",
    "CreditLimit",
    "LSTNo",
  ],
  VENDOR: [
    "Code",
    "Nm",
    "StreetAddr",
    "Town",
    "MobilePhone",
    "VendorType",
    "SrcTaxType",
    "CommissionPercent",
    "BuyingFactor",
    "POApplicable",
  ],
  CHAINSTORE: [
    "Code",
    "Nm",
    "StreetAddr",
    "Town",
    "MobilePhone",
    "Type",
    "SrcTaxType",
    "BuyingFactor",
    "SellingFactor",
    "POApplicable",
  ],
  SALESSTAFF: [
    "Code",
    "Nm",
    "StreetAddr",
    "Mobile",
    "Role",
    "StoreCode",
    "TargetAmt",
    "Active",
  ],
  ACCOUNTS: ["type", "code", "nm", "yropbaldb", "yropbalcr", "curbaldb", "curbalcr"],
  HSN: ["code", "descr", "flag"],
};
const ENTITY_TABLE_MAP = {
  CUSTOMER: "customers",
  VENDOR: "vendors",
  CHAINSTORE: "chainstores",
  SALESSTAFF: "personnel",
  ACCOUNTS: "accountsmaster",
  HSN: "genlookup",
};
const ENTITY_META = {
  CUSTOMER: { label: "Customers", icon: Users, color: "blue" },
  VENDOR: { label: "Vendors", icon: Building2, color: "purple" },
  CHAINSTORE: { label: "Inter-Store", icon: Store, color: "amber" },
  SALESSTAFF: { label: "Sales Staff", icon: UserCheck, color: "emerald" },
  ACCOUNTS: { label: "Accounts", icon: Database, color: "rose" },
  HSN: { label: "HSN Codes", icon: FileSpreadsheet, color: "indigo", filters: { recid: 11000 } },
};

type EntityKey = keyof typeof ENTITY_FIELDS;

export default function CatalogueMasterWorkbench({
  onBack,
  initialEntity,
}: {
  onBack: () => void;
  initialEntity?: EntityKey;
}) {
  const STORAGE_KEY = "smriti_catalogue_wb_v2"; // changed key to bust cache

  // ── Entity selection ──────────────────────────────────────────────────────
  const [entity, setEntity] = useState<EntityKey>(initialEntity || "CUSTOMER");

  useEffect(() => {
    if (initialEntity) setEntity(initialEntity);
  }, [initialEntity]);

  // ── Per-entity persisted state ────────────────────────────────────────────
  const [entityState, setEntityState] = useState<Record<string, any>>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) return JSON.parse(s);
    } catch {}
    const init: any = {};
    (Object.keys(ENTITY_FIELDS) as EntityKey[]).forEach((e) => {
      init[e] = {
        gridData: {},
        rowsCount: 30,
        modifiedRows: [],
        selectedFieldKeys: DEFAULT_SELECTED_BY_ENTITY[e],
        commonFieldKeys: [],
        commonFieldData: {},
      };
    });
    return init;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entityState));
  }, [entityState]);

  const updateEntity = (updates: any) =>
    setEntityState((prev) => ({
      ...prev,
      [entity]: { ...prev[entity], ...updates },
    }));
  const cur = entityState[entity] || {};
  const gridData: Record<string, string> = cur.gridData || {};
  const rowsCount: number = cur.rowsCount || 30;
  const modifiedRows: Set<number> = new Set(cur.modifiedRows || []);
  const selectedFieldKeys: string[] =
    cur.selectedFieldKeys || DEFAULT_SELECTED_BY_ENTITY[entity];
  const commonFieldKeys: string[] = cur.commonFieldKeys || [];
  const commonFieldData: Record<string, string> = cur.commonFieldData || {};
  const setSelectedFieldKeys = (fn: any) =>
    updateEntity({
      selectedFieldKeys: typeof fn === "function" ? fn(selectedFieldKeys) : fn,
    });
  const setCommonFieldKeys = (fn: any) =>
    updateEntity({
      commonFieldKeys: typeof fn === "function" ? fn(commonFieldKeys) : fn,
    });
  const setCommonFieldData = (fn: any) =>
    updateEntity({
      commonFieldData: typeof fn === "function" ? fn(commonFieldData) : fn,
    });

  const allFields = ENTITY_FIELDS[entity];
  const mandatoryKeys = MANDATORY_BY_ENTITY[entity];
  const s9Schema = useMemo(
    () =>
      selectedFieldKeys
        .map((k) => allFields.find((f) => f.key === k))
        .filter(Boolean),
    [selectedFieldKeys, entity],
  );
  const unselectedFields = useMemo(
    () => allFields.filter((f) => !selectedFieldKeys.includes(f.key)),
    [selectedFieldKeys, entity],
  );

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [s9Tab, setS9Tab] = useState<"VIEW" | "COMMON" | "DETAILS">("DETAILS");
  const [viewUnselHL, setViewUnselHL] = useState<string[]>([]);
  const [viewSelHL, setViewSelHL] = useState<string[]>([]);

  // ── Grid state ─────────────────────────────────────────────────────────────
  const [selectedCell, setSelectedCell] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    r: number;
    c: number;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filterText, setFilterText] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  const [isPulling, setIsPulling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [newRowsCount, setNewRowsCount] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Reset selection when entity changes
  useEffect(() => {
    setSelectedCell(null);
    setEditingCell(null);
    setSelectedRows(new Set());
    setFilterText("");
  }, [entity]);

  // ── Alt+1/2/3 shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setS9Tab("VIEW");
      }
      if (e.altKey && e.key === "2") {
        e.preventDefault();
        setS9Tab("COMMON");
      }
      if (e.altKey && e.key === "3") {
        e.preventDefault();
        setS9Tab("DETAILS");
      }
      if (e.key === "F11") {
        e.preventDefault();
        setIsFullscreen((p) => !p);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Paste support ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        editingCell ||
        (target.tagName === "INPUT" &&
          (target as HTMLInputElement).type !== "checkbox")
      )
        return;
      const pasteData = e.clipboardData?.getData("text");
      if (!pasteData || !selectedCell) return;
      const lines = pasteData.split(/\r?\n/);
      const newData = { ...gridData };
      const newMod = new Set(modifiedRows);
      lines.forEach((line, ri) => {
        if (!line.trim() && ri === lines.length - 1) return;
        line.split("\t").forEach((val, ci) => {
          const tr = selectedCell.r + ri,
            tc = selectedCell.c + ci;
          if (
            tr <= rowsCount &&
            tc < s9Schema.length &&
            !s9Schema[tc]?.readonly
          ) {
            newData[`${tr}-${tc}`] = val.trim();
            newMod.add(tr);
          }
        });
      });
      updateEntity({ gridData: newData, modifiedRows: Array.from(newMod) });
      showToast("Pasted from clipboard.", "success");
      e.preventDefault();
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [editingCell, selectedCell, gridData, modifiedRows, rowsCount, s9Schema]);

  // ── Cell ops ───────────────────────────────────────────────────────────────
  const handleCellChange = (r: number, c: number, v: string) => {
    const newData = { ...gridData, [`${r}-${c}`]: v };
    const nm = new Set(modifiedRows);
    nm.add(r);
    updateEntity({ gridData: newData, modifiedRows: Array.from(nm) });
  };

  const startEditing = (r: number, c: number) => {
    if (s9Schema[c]?.readonly) return;
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
    if (editingCell && inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.target.tagName === "INPUT" && !editingCell) return;
      if (!selectedCell) return;
      const { r, c } = selectedCell;
      if (editingCell) {
        if (e.key === "Enter") {
          finishEditing();
          e.preventDefault();
        }
        if (e.key === "Escape") setEditingCell(null);
        return;
      }
      if (e.key === "ArrowUp") {
        const nr = Math.max(1, r - 1);
        setSelectedCell({ r: nr, c });
        document
          .getElementById(`cell-${nr}-${c}`)
          ?.scrollIntoView({ block: "nearest", inline: "nearest" });
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        const nr = Math.min(rowsCount, r + 1);
        setSelectedCell({ r: nr, c });
        document
          .getElementById(`cell-${nr}-${c}`)
          ?.scrollIntoView({ block: "nearest", inline: "nearest" });
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") {
        const nc = Math.max(0, c - 1);
        setSelectedCell({ r, c: nc });
        document
          .getElementById(`cell-${r}-${nc}`)
          ?.scrollIntoView({ block: "nearest", inline: "nearest" });
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        const nc = Math.min(s9Schema.length - 1, c + 1);
        setSelectedCell({ r, c: nc });
        document
          .getElementById(`cell-${r}-${nc}`)
          ?.scrollIntoView({ block: "nearest", inline: "nearest" });
        e.preventDefault();
      }
      if (e.key === "Enter") {
        startEditing(r, c);
        e.preventDefault();
      }
      if (e.key === "Delete" || e.key === "Backspace")
        handleCellChange(r, c, "");
      if (e.key === "Tab") {
        const nc = Math.min(s9Schema.length - 1, c + 1);
        setSelectedCell({ r, c: nc });
        document
          .getElementById(`cell-${r}-${nc}`)
          ?.scrollIntoView({ block: "nearest", inline: "nearest" });
        e.preventDefault();
      }
    },
    [selectedCell, editingCell, gridData, rowsCount, s9Schema],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Pull from server ───────────────────────────────────────────────────────
  const handlePull = async () => {
    setIsPulling(true);
    try {
      const meta = ENTITY_META[entity];
      const table = ENTITY_TABLE_MAP[entity];
      const res = await api.legacy.getData(table, {
        search: serverSearch || "*",
        limit: rowsCount,
        filters: meta.filters ? JSON.stringify(meta.filters) : undefined
      });
      const rows = res?.data || res || [];
      const newData: any = {};
      rows.forEach((row: any, ri: number) => {
        allFields.forEach((col, ci) => {
          // Database returns lowercase keys, but schema uses Capitalized keys
          const val = row[col.key] ?? row[col.key.toLowerCase()] ?? "";
          newData[`${ri + 1}-${ci}`] = val;
        });
      });
      updateEntity({
        gridData: newData,
        rowsCount: Math.max(rows.length + 20, 30),
        modifiedRows: [],
      });
      showToast(
        `Loaded ${rows.length} ${ENTITY_META[entity].label}.`,
        "success",
      );
    } catch (err) {
      showToast("Pull failed.", "error");
    } finally {
      setIsPulling(false);
    }
  };

  // ── Save / commit ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const items: any[] = [];
      Array.from(modifiedRows).forEach((r) => {
        const item: any = {};
        allFields.forEach((col, ci) => {
          if (gridData[`${r}-${ci}`] !== undefined)
            item[col.key] = gridData[`${r}-${ci}`];
        });
        if (Object.keys(item).length > 0) items.push(item);
      });
      if (items.length === 0) {
        showToast("Nothing to commit.", "error");
        setIsSaving(false);
        return;
      }

      await api.legacy.bulkUpdate(ENTITY_TABLE_MAP[entity], items);

      updateEntity({ modifiedRows: [] });
      showToast(`${items.length} records committed.`, "success");
    } catch {
      showToast("Commit failed.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── View tab helpers ───────────────────────────────────────────────────────
  const moveToSelected = () => {
    setSelectedFieldKeys((p: string[]) => [
      ...p,
      ...viewUnselHL.filter((k) => !p.includes(k)),
    ]);
    setViewUnselHL([]);
  };
  const moveToUnselected = () => {
    const rm = viewSelHL.filter((k) => !mandatoryKeys.includes(k));
    setSelectedFieldKeys((p: string[]) => p.filter((k) => !rm.includes(k)));
    setCommonFieldKeys((p: string[]) => p.filter((k) => !rm.includes(k)));
    setViewSelHL([]);
  };
  const moveUp = () => {
    if (viewSelHL.length !== 1) return;
    const k = viewSelHL[0];
    const idx = selectedFieldKeys.indexOf(k);
    if (idx <= 0) return;
    const a = [...selectedFieldKeys];
    [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
    setSelectedFieldKeys(a);
  };
  const moveDown = () => {
    if (viewSelHL.length !== 1) return;
    const k = viewSelHL[0];
    const idx = selectedFieldKeys.indexOf(k);
    if (idx < 0 || idx >= selectedFieldKeys.length - 1) return;
    const a = [...selectedFieldKeys];
    [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]];
    setSelectedFieldKeys(a);
  };

  // ── Filtered rows for display ──────────────────────────────────────────────
  const visibleRows = useMemo(() => {
    const rows: number[] = [];
    for (let r = 1; r <= rowsCount; r++) {
      if (!filterText) {
        rows.push(r);
        continue;
      }
      const match = s9Schema.some((_, ci) =>
        (gridData[`${r}-${ci}`] || "")
          .toLowerCase()
          .includes(filterText.toLowerCase()),
      );
      if (match) rows.push(r);
    }
    return rows;
  }, [filterText, gridData, rowsCount, s9Schema]);

  // ── Row status ─────────────────────────────────────────────────────────────
  const rowClass = (r: number) => {
    if (modifiedRows.has(r)) return "bg-amber-50 dark:bg-amber-900/20";
    return "";
  };

  const Meta = ENTITY_META[entity];
  const EntityIcon = Meta.icon;

  const handleExport = () => {
    try {
      const dataToExport = [];
      for (let r = 1; r <= rowsCount; r++) {
        const rowObj: any = {};
        s9Schema.forEach((col, ci) => {
          if (col) rowObj[col.label] = gridData[`${r}-${ci}`] || "";
        });
        if (Object.values(rowObj).some((v) => v !== ""))
          dataToExport.push(rowObj);
      }
      if (dataToExport.length === 0)
        return showToast("No data to export.", "error");
      import("../../utils/excelUtils").then((m) => {
        m.excelUtils.exportToExcel(dataToExport, `${Meta.label}_Registry`);
        showToast("Exporting to Excel...", "success");
      });
    } catch (err) {
      showToast("Export failed.", "error");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-500",
        isFullscreen
          ? "fixed inset-0 z-[999999] rounded-none h-screen w-screen"
          : "h-[88vh] rounded-2xl mt-4",
      )}
    >
      <WorkbenchRibbon>
        <div className="flex items-center">
          <RibbonGroup label="Home">
            <RibbonButton
              icon={DownloadCloud}
              label="Pull"
              onClick={handlePull}
              disabled={isPulling}
              shortcut="F5"
            />
            <RibbonButton
              icon={CheckCircle2}
              label="Commit"
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || modifiedRows.size === 0}
              shortcut="F2"
            />
            <RibbonButton 
              icon={ExternalLink} 
              label="Popout" 
              onClick={() => window.open('/popout/customers', '_blank', 'width=1400,height=900')} 
            />
          </RibbonGroup>

          <RibbonGroup label="Data Ops">
            <RibbonButton
              icon={Plus}
              label="Add Rows"
              onClick={() => updateEntity({ rowsCount: rowsCount + newRowsCount })}
            />
            <RibbonButton
              icon={FileSpreadsheet}
              label="Export"
              onClick={handleExport}
              shortcut="Alt+E"
            />
          </RibbonGroup>

          <RibbonGroup label="Master Switch">
            {(Object.keys(ENTITY_META) as EntityKey[]).map((k) => (
              <RibbonButton
                key={k}
                icon={ENTITY_META[k].icon}
                label={ENTITY_META[k].label}
                active={entity === k}
                onClick={() => setEntity(k)}
              />
            ))}
          </RibbonGroup>
        </div>

        <div className="flex items-center gap-4 pr-4">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="SEARCH IN GRID..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-9 pr-4 text-[10px] font-black uppercase w-48 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="relative group">
             <input
              type="text"
              placeholder="PULL BY SEARCH..."
              value={serverSearch}
              onChange={(e) => setServerSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePull()}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-4 pr-4 text-[10px] font-black uppercase w-48 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setIsFullscreen((p) => !p)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </WorkbenchRibbon>

      {/* ── Sub-Ribbon / Sheet Tabs ── */}
      <div className="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between shrink-0 h-10 px-2 overflow-x-auto custom-scrollbar no-scrollbar">
        <div className="flex">
          {(Object.keys(ENTITY_FIELDS) as EntityKey[]).map((e) => {
            const m = ENTITY_META[e];
            const colors = {
              CUSTOMER: "border-blue-500 text-blue-600 bg-blue-50/50",
              VENDOR: "border-purple-500 text-purple-600 bg-purple-50/50",
              CHAINSTORE: "border-amber-500 text-amber-600 bg-amber-50/50",
              SALESSTAFF:
                "border-emerald-500 text-emerald-600 bg-emerald-50/50",
            };
            const isActive = entity === e;
            return (
              <button
                key={e}
                onClick={() => setEntity(e)}
                className={cn(
                  "px-4 h-full text-[9px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                  isActive
                    ? colors[e]
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50",
                )}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex">
          {(
            [
              ["DETAILS", "Grid View", "Alt+3"],
              ["VIEW", "Field Config", "Alt+1"],
              ["COMMON", "Common Data", "Alt+2"],
            ] as const
          ).map(([tab, lbl, kbd]) => (
            <button
              key={tab}
              onClick={() => setS9Tab(tab as any)}
              className={cn(
                "px-5 h-full text-[9px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                s9Tab === tab
                  ? "border-emerald-500 text-emerald-600 bg-emerald-50/30"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50",
              )}
            >
              {lbl}{" "}
              <span className="opacity-30 text-[8px] font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">
                {kbd}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── VIEW TAB ── */}
      {s9Tab === "VIEW" && (
        <div className="flex-1 flex flex-col p-8 gap-6 bg-white dark:bg-slate-900 overflow-auto">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
              Column Layout Config
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Choose which fields appear in the {Meta.label} grid.
            </p>
          </div>

          <div className="flex gap-6 flex-1 min-h-0">
            <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-[9px] font-black uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                Available Fields
              </div>
              <div className="flex-1 overflow-auto p-1">
                {unselectedFields.map((f) => (
                  <div
                    key={f.key}
                    onClick={() =>
                      setViewUnselHL((p) =>
                        p.includes(f.key)
                          ? p.filter((k) => k !== f.key)
                          : [...p, f.key],
                      )
                    }
                    className={cn(
                      "px-4 py-2.5 text-xs font-bold cursor-pointer rounded-lg mb-1 transition-all",
                      viewUnselHL.includes(f.key)
                        ? "bg-emerald-600 text-white shadow-md"
                        : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300",
                    )}
                  >
                    {f.label}
                  </div>
                ))}
                {!unselectedFields.length && (
                  <div className="p-10 text-xs text-center text-slate-400 font-bold italic">
                    All fields selected
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3">
              <button
                onClick={moveToSelected}
                className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
              >
                <ChevronsRight size={18} />
              </button>
              <button
                onClick={moveToUnselected}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-rose-400 hover:text-rose-500 transition-all text-slate-400 shadow-sm active:scale-95"
              >
                <ChevronsLeft size={18} />
              </button>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 my-2" />
              <button
                onClick={moveUp}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-500 transition-all text-slate-400 shadow-sm active:scale-95"
              >
                <ArrowUpCircle size={18} />
              </button>
              <button
                onClick={moveDown}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-500 transition-all text-slate-400 shadow-sm active:scale-95"
              >
                <ArrowDownCircle size={18} />
              </button>
            </div>

            <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-[9px] font-black uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                <span>Active Spreadsheet Columns</span>
                <span className="opacity-40">Gray = Required</span>
              </div>
              <div className="flex-1 overflow-auto p-1">
                {selectedFieldKeys.map((k, i) => {
                  const f = allFields.find((x) => x.key === k);
                  if (!f) return null;
                  const isMandatory = mandatoryKeys.includes(k);
                  return (
                    <div
                      key={k}
                      onClick={() =>
                        !isMandatory &&
                        setViewSelHL((p) =>
                          p.includes(k) ? p.filter((x) => x !== k) : [...p, k],
                        )
                      }
                      className={cn(
                        "px-4 py-2.5 text-xs border-b border-slate-100 dark:border-slate-800 transition-all flex justify-between rounded-lg mb-1",
                        isMandatory
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed font-medium"
                          : viewSelHL.includes(k)
                            ? "bg-emerald-600 text-white cursor-pointer shadow-md"
                            : "hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer font-bold text-slate-600 dark:text-slate-300",
                      )}
                    >
                      <span>
                        {i + 1}. {f.label}
                      </span>
                      {isMandatory && (
                        <span className="text-[8px] text-rose-500 font-black px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950 rounded">
                          MANDATORY
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              showToast("Field layout preference saved.", "success")
            }
            className="self-end flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95"
          >
            <Save size={14} /> Save Column Settings
          </button>
        </div>
      )}

      {/* ── COMMON FIELDS TAB ── */}
      {s9Tab === "COMMON" && (
        <div className="flex-1 flex flex-col p-8 gap-6 bg-white dark:bg-slate-900 overflow-auto">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
              Common Data Entry
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Mark fields as common — enter once, auto-fills all blank cells on
              Commit.
            </p>
          </div>

          <div className="flex gap-8 flex-1 min-h-0">
            <div className="w-72 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-[9px] font-black uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                Select Fields
              </div>
              <div className="flex-1 overflow-auto p-1">
                {selectedFieldKeys
                  .filter((k) => !mandatoryKeys.includes(k))
                  .map((k) => {
                    const f = allFields.find((x) => x.key === k);
                    if (!f) return null;
                    return (
                      <label
                        key={k}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white dark:hover:bg-slate-800 cursor-pointer rounded-lg transition-all border-b border-slate-100 dark:border-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={commonFieldKeys.includes(k)}
                          onChange={(e) =>
                            setCommonFieldKeys((p: string[]) =>
                              e.target.checked
                                ? [...p, k]
                                : p.filter((x) => x !== k),
                            )
                          }
                          className="rounded accent-emerald-600 w-4 h-4"
                        />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {f.label}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>
            <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-950 shadow-sm">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-[9px] font-black uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                Auto-Fill Values
              </div>
              {!commonFieldKeys.length ? (
                <div className="flex-1 flex flex-col items-center justify-center text-xs text-slate-400 font-bold italic gap-2">
                  <FilterIcon size={24} className="opacity-10" />
                  No common fields selected.
                </div>
              ) : (
                <div className="overflow-auto p-4">
                  <table className="w-full border-collapse border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900">
                        <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 border-b border-r border-slate-100 dark:border-slate-800 text-left w-48">
                          Spreadsheet Field
                        </th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 text-left">
                          Default Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {commonFieldKeys.map((k) => {
                        const f = allFields.find((x) => x.key === k);
                        if (!f) return null;
                        return (
                          <tr
                            key={k}
                            className="border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
                          >
                            <td className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-300 border-r border-slate-50 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/30">
                              {f.label}
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type={f.type === "number" ? "number" : "text"}
                                value={commonFieldData[k] || ""}
                                onChange={(e) =>
                                  setCommonFieldData((p: any) => ({
                                    ...p,
                                    [k]: e.target.value,
                                  }))
                                }
                                placeholder={`Enter common ${f.label.toLowerCase()}...`}
                                className="w-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-emerald-500 rounded-lg transition-all"
                              />
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
          <button
            onClick={() =>
              showToast("Common field templates saved.", "success")
            }
            className="self-end flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95"
          >
            <Save size={14} /> Apply Common Templates
          </button>
        </div>
      )}

      {/* ── ITEM DETAILS GRID ── */}
      {s9Tab === "DETAILS" && (
        <>
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700">
              <FilterIcon size={12} className="text-slate-400" />
              <input
                type="text"
                placeholder="Filter rows..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-transparent text-[10px] font-bold uppercase tracking-wider outline-none w-44 placeholder:text-slate-400"
              />
            </div>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {rowsCount} Rows · {s9Schema.length} Cols
            </span>

            {selectedRows.size > 0 && (
              <button
                onClick={() => {
                  const nd = { ...gridData };
                  const nm = new Set(modifiedRows);
                  selectedRows.forEach((r) => {
                    s9Schema.forEach((_, ci) => {
                      delete nd[`${r}-${ci}`];
                    });
                    nm.delete(r);
                  });
                  updateEntity({ gridData: nd, modifiedRows: Array.from(nm) });
                  setSelectedRows(new Set());
                }}
                className="flex items-center gap-1 bg-rose-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all ml-auto shadow-sm"
              >
                <Trash2 size={12} /> Remove {selectedRows.size} Records
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 relative border-r border-slate-200 dark:border-slate-800 shadow-inner">
            <table className="border-collapse table-fixed select-none min-w-max">
              <thead className="sticky top-0 z-30">
                <tr className="bg-slate-100 dark:bg-slate-900 shadow-sm">
                  <th className="w-10 border-b border-r border-slate-200 dark:border-slate-800 p-0 sticky left-0 z-40 bg-slate-100 dark:bg-slate-900">
                    <div className="flex items-center justify-center h-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === rowsCount}
                        onChange={(e) =>
                          setSelectedRows(
                            e.target.checked
                              ? new Set(
                                  Array.from(
                                    { length: rowsCount },
                                    (_, i) => i + 1,
                                  ),
                                )
                              : new Set(),
                          )
                        }
                        className="rounded border-slate-300 accent-emerald-600"
                      />
                    </div>
                  </th>
                  <th className="w-12 border-b border-r border-slate-200 dark:border-slate-800 p-2 text-[9px] text-slate-400 font-black uppercase sticky left-10 z-40 bg-slate-100 dark:bg-slate-900 text-center h-10">
                    #
                  </th>
                  {s9Schema.map((col, ci) => (
                    <th
                      key={ci}
                      style={{ width: col?.width }}
                      className="border-b border-r border-slate-200 dark:border-slate-800 p-2 text-left text-[9px] text-slate-500 font-black uppercase tracking-widest h-10 bg-slate-100 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <span>{col?.label}</span>
                        {col?.required && (
                          <span className="text-rose-500 font-black">*</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900">
                {visibleRows.map((r) => (
                  <tr
                    key={r}
                    className={cn(
                      "group border-b border-slate-100 dark:border-slate-800/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors",
                      r % 2 === 0 ? "bg-slate-50/40 dark:bg-slate-800/20" : "",
                      selectedRows.has(r)
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "",
                    )}
                  >
                    <td className="border-r border-slate-200 dark:border-slate-800 p-0 sticky left-0 z-20 bg-inherit text-center">
                      <div className="flex items-center justify-center h-9">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(r)}
                          onChange={(e) =>
                            setSelectedRows((p) => {
                              const ns = new Set(p);
                              e.target.checked ? ns.add(r) : ns.delete(r);
                              return ns;
                            })
                          }
                          className="rounded border-slate-300 accent-emerald-600"
                        />
                      </div>
                    </td>
                    <td className="border-r border-slate-200 dark:border-slate-800 p-2 text-[10px] text-slate-400 font-bold text-center sticky left-10 z-20 bg-inherit">
                      {r}
                    </td>
                    {s9Schema.map((col, ci) => {
                      const isEditing =
                        editingCell?.r === r && editingCell?.c === ci;
                      const isSelected =
                        selectedCell?.r === r && selectedCell?.c === ci;
                      const val = gridData[`${r}-${ci}`] || "";
                      const isModified = modifiedRows.has(r);

                      return (
                        <td
                          key={ci}
                          id={`cell-${r}-${ci}`}
                          style={{ width: col?.width }}
                          onClick={() => setSelectedCell({ r, c: ci })}
                          onDoubleClick={() => startEditing(r, ci)}
                          className={cn(
                            "border-r border-slate-100 dark:border-slate-800 p-0 text-xs relative h-9",
                            isSelected
                              ? "ring-2 ring-inset ring-emerald-500 z-10 bg-emerald-50/50 dark:bg-emerald-900/20"
                              : "",
                            col?.readonly
                              ? "bg-slate-50/80 dark:bg-slate-950/50 text-slate-400 cursor-not-allowed"
                              : "",
                            isModified && ci === 0
                              ? "border-l-2 border-l-amber-500"
                              : "",
                          )}
                        >
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={finishEditing}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") finishEditing();
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              className="w-full h-full px-3 py-1 bg-white dark:bg-slate-800 text-xs font-bold outline-none border-none shadow-inner ring-1 ring-emerald-500"
                            />
                          ) : (
                            <div
                              className={cn(
                                "px-3 py-2 truncate font-bold",
                                val === ""
                                  ? "text-slate-300 italic font-normal"
                                  : "text-slate-700 dark:text-slate-200",
                                isModified
                                  ? "text-emerald-700 dark:text-emerald-400"
                                  : "",
                              )}
                            >
                              {val || (isSelected ? "" : "...")}
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 border border-white dark:border-slate-900 z-20" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-8 right-8 px-6 py-3 rounded-2xl shadow-2xl z-[999999] font-black text-xs uppercase tracking-widest animate-in slide-in-from-right-10",
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white",
          )}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
