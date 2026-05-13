import { create } from 'zustand';

interface SheetState {
  rowData: any[];
  modifiedRows: Set<string | number>;
  deletedRows: Set<string | number>;
  schema: string;
}

interface SovereignState {
  sheets: Record<string, SheetState>;
  activeSheet: string;
  zoomLevel: number;
  
  // Actions
  setActiveSheet: (name: string) => void;
  setZoomLevel: (level: number) => void;
  updateSheet: (name: string, updates: Partial<SheetState>) => void;
  addSheet: (name: string, initialState?: Partial<SheetState>) => void;
  deleteSheet: (name: string) => void;
  resetStore: () => void;
  
  // Network
  isForcedOffline: boolean;
  toggleForcedOffline: () => void;
  isBackendAvailable: boolean;
  setBackendAvailable: (available: boolean) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  companyAddress: string;
  setCompanyAddress: (addr: string) => void;
  sysParams: any[];
  setSysParams: (params: any[]) => void;
  getParam: (code: string) => string | undefined;
}

const STORAGE_KEY = "smriti_workbench_draft_v2";
const OFFLINE_KEY  = "smriti_forced_offline_v1";
const COMPANY_KEY  = "smriti_company_name_v1";

// Read persisted offline preference — survives page refresh
const loadForcedOffline = (): boolean => {
  try { return localStorage.getItem(OFFLINE_KEY) === 'true'; }
  catch { return false; }
};

const loadCompanyName = (): string => {
  try { return localStorage.getItem(COMPANY_KEY) || "SMRITI SOVEREIGN NODE"; }
  catch { return "SMRITI SOVEREIGN NODE"; }
};

const saveToLocal = (sheets: Record<string, SheetState>) => {
  const toSave: any = {};
  Object.entries(sheets).forEach(([k, v]) => {
    if (!v) return;
    toSave[k] = {
      ...v,
      modifiedRows: Array.from(v.modifiedRows || []),
      deletedRows: Array.from(v.deletedRows || [])
    };
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
};

export const useSovereignStore = create<SovereignState>((set) => ({
  sheets: {},
  activeSheet: "ITEM",
  zoomLevel: 100,
  isForcedOffline: loadForcedOffline(), // ← persisted — user controls this
  isBackendAvailable: true,
  companyName: loadCompanyName(),
  companyAddress: "",

  setActiveSheet: (name) => set({ activeSheet: name }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  toggleForcedOffline: () => set((state) => {
    const next = !state.isForcedOffline;
    try { localStorage.setItem(OFFLINE_KEY, String(next)); } catch {}
    return { isForcedOffline: next };
  }),
  setBackendAvailable: (available) => set({ isBackendAvailable: available }),
  setCompanyName: (name) => set(() => {
    try { localStorage.setItem(COMPANY_KEY, name); } catch {}
    return { companyName: name };
  }),
  setCompanyAddress: (addr) => set({ companyAddress: addr }),
  sysParams: [],
  setSysParams: (params) => set({ sysParams: params }),
  getParam: (code) => {
    const state = useSovereignStore.getState();
    const p = state.sysParams.find((p: any) => p.param_code === code);
    return p?.value_txt;
  },
  
  updateSheet: (name, updates) => set((state) => {
    const existing = state.sheets[name] || {
      rowData: [],
      modifiedRows: new Set<string | number>(),
      deletedRows: new Set<string | number>(),
      schema: "ITEM_MASTER"
    };
    const newSheets = {
      ...state.sheets,
      [name]: { ...existing, ...updates }
    };
    saveToLocal(newSheets);
    return { sheets: newSheets };
  }),

  addSheet: (name, initialState) => set((state) => {
    const newSheet: SheetState = {
      rowData: [],
      modifiedRows: new Set<string | number>(),
      deletedRows: new Set<string | number>(),
      schema: "ITEM_MASTER",
      ...initialState
    };
    const newSheets = {
      ...state.sheets,
      [name]: newSheet
    };
    saveToLocal(newSheets);
    return { sheets: newSheets };
  }),

  deleteSheet: (name) => set((state) => {
    const newSheets = { ...state.sheets };
    delete newSheets[name];
    saveToLocal(newSheets);
    return {
      sheets: newSheets,
      activeSheet: state.activeSheet === name ? "Item Master" : state.activeSheet
    };
  }),

  resetStore: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ sheets: {}, activeSheet: "Item Master", zoomLevel: 100 });
  }
}));
