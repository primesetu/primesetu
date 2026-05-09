import { create } from 'zustand';

interface SheetState {
  gridData: Record<string, any>;
  modifiedRows: Set<number>;
  deletedRows: Set<number>;
  rowsCount: number;
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
}

const STORAGE_KEY = "smriti_workbench_draft";

const saveToLocal = (sheets: Record<string, SheetState>) => {
  const toSave: any = {};
  Object.entries(sheets).forEach(([k, v]) => {
    toSave[k] = {
      ...v,
      modifiedRows: Array.from(v.modifiedRows),
      deletedRows: Array.from(v.deletedRows)
    };
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
};

export const useSovereignStore = create<SovereignState>((set) => ({
  sheets: {},
  activeSheet: "ITEM",
  zoomLevel: 100,

  setActiveSheet: (name) => set({ activeSheet: name }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  
  updateSheet: (name, updates) => set((state) => {
    const newSheets = {
      ...state.sheets,
      [name]: { ...state.sheets[name], ...updates }
    };
    saveToLocal(newSheets);
    return { sheets: newSheets };
  }),

  addSheet: (name, initialState) => set((state) => {
    const newSheet: SheetState = {
      gridData: {},
      modifiedRows: new Set<number>(),
      deletedRows: new Set<number>(),
      rowsCount: 50,
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
