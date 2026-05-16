import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SheetState {
  rowData: any[];
  modifiedRows: Set<number>;
  deletedRows: Set<number>;
  schema: string;
}

interface NodeSwitchEvent {
  timestamp: string;
  previousUrl: string | null;
  newUrl: string | null;
  reason: string;
}

export type ConnectivityState = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'RECOVERING';

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
  
  // Network & Connectivity
  isForcedOffline: boolean;
  toggleForcedOffline: () => void;
  isBackendAvailable: boolean;
  setBackendAvailable: (available: boolean) => void;
  
  // Connectivity Governance
  connectivityState: ConnectivityState;
  setConnectivityState: (state: ConnectivityState) => void;
  
  // Telemetry Metrics
  metrics: {
    ho_pulse_failure_count: number;
  };
  incrementPulseFailure: () => void;
  resetPulseFailure: () => void;
  
  // Connection Configuration
  preferredBackendUrl: string | null;
  setPreferredBackendUrl: (url: string | null, reason?: string) => void;
  nodeSwitchHistory: NodeSwitchEvent[];
  
  companyName: string;
  setCompanyName: (name: string) => void;
  companyAddress: string;
  setCompanyAddress: (addr: string) => void;
  sysParams: any[];
  setSysParams: (params: any[]) => void;
  getParam: (code: string) => string | undefined;

  // Governance commands
  pendingCommands: any[];
  setPendingCommands: (commands: any[]) => void;
  clearCommand: (id: string) => void;

  // Maintenance Bypass
  guardBypassUntil: number | null;
  setGuardBypass: (hours: number | null) => void;
}

const STORAGE_KEY = "smriti_workbench_persistent_v3";

export const useSovereignStore = create<SovereignState>()(
  persist(
    (set, get) => ({
      sheets: {},
      activeSheet: "ITEM",
      zoomLevel: 100,
      isForcedOffline: false,
      isBackendAvailable: true,
      connectivityState: 'ONLINE',
      
      metrics: {
        ho_pulse_failure_count: 0
      },

      preferredBackendUrl: null,
      nodeSwitchHistory: [],
      
      companyName: "SMRITI SOVEREIGN NODE",
      companyAddress: "",
      sysParams: [],
      pendingCommands: [],
      guardBypassUntil: null,

      setActiveSheet: (name) => set({ activeSheet: name }),
      setZoomLevel: (level) => set({ zoomLevel: level }),
      
      toggleForcedOffline: () => set((state) => ({ isForcedOffline: !state.isForcedOffline })),
      
      setBackendAvailable: (available) => set({ isBackendAvailable: available }),
      setConnectivityState: (state) => set({ connectivityState: state }),
      
      incrementPulseFailure: () => set((state) => ({ 
        metrics: { ...state.metrics, ho_pulse_failure_count: state.metrics.ho_pulse_failure_count + 1 } 
      })),
      resetPulseFailure: () => set((state) => ({ 
        metrics: { ...state.metrics, ho_pulse_failure_count: 0 } 
      })),

      setPreferredBackendUrl: (url, reason = "Manual User Switch") => set((state) => {
        const event: NodeSwitchEvent = {
          timestamp: new Date().toISOString(),
          previousUrl: state.preferredBackendUrl,
          newUrl: url,
          reason
        };
        console.log('[Sovereign Mode] Node Switched:', event);
        return { 
          preferredBackendUrl: url,
          nodeSwitchHistory: [event, ...state.nodeSwitchHistory].slice(0, 50) // Keep last 50 events
        };
      }),

      setCompanyName: (name) => set({ companyName: name }),
      setCompanyAddress: (addr) => set({ companyAddress: addr }),
      setSysParams: (params) => set({ sysParams: params }),
      
      getParam: (code) => {
        const params = get().sysParams;
        return params.find((p: any) => p.param_code === code)?.value_txt;
      },
      
      setPendingCommands: (commands) => set({ pendingCommands: commands }),
      clearCommand: (id) => set((state) => ({ 
        pendingCommands: state.pendingCommands.filter(c => c.id !== id) 
      })),

      setGuardBypass: (hours) => set({ 
        guardBypassUntil: hours ? Date.now() + (hours * 60 * 60 * 1000) : null 
      }),
      
      updateSheet: (name, updates) => set((state) => {
        const existing = state.sheets[name] || {
          rowData: [],
          modifiedRows: new Set<number>(),
          deletedRows: new Set<number>(),
          schema: "ITEM_MASTER"
        };
        return {
          sheets: {
            ...state.sheets,
            [name]: { ...existing, ...updates }
          }
        };
      }),

      addSheet: (name, initialState) => set((state) => ({
        sheets: {
          ...state.sheets,
          [name]: {
            rowData: [],
            modifiedRows: new Set<number>(),
            deletedRows: new Set<number>(),
            schema: "ITEM_MASTER",
            ...initialState
          }
        }
      })),

      deleteSheet: (name) => set((state) => {
        const newSheets = { ...state.sheets };
        delete newSheets[name];
        return {
          sheets: newSheets,
          activeSheet: state.activeSheet === name ? "ITEM" : state.activeSheet
        };
      }),

      resetStore: () => set({ 
        sheets: {}, 
        activeSheet: "ITEM", 
        zoomLevel: 100, 
        preferredBackendUrl: null,
        nodeSwitchHistory: [] 
      })
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Handle Set serialization/deserialization
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Convert arrays back to Sets for each sheet
        Object.values(state.sheets).forEach((sheet: any) => {
          if (Array.isArray(sheet.modifiedRows)) sheet.modifiedRows = new Set(sheet.modifiedRows);
          if (Array.isArray(sheet.deletedRows)) sheet.deletedRows = new Set(sheet.deletedRows);
        });
      },
      partialize: (state) => {
        // Convert Sets to arrays for storage
        const sheetsCopy: any = {};
        Object.entries(state.sheets).forEach(([k, v]) => {
          sheetsCopy[k] = {
            ...v,
            modifiedRows: Array.from(v.modifiedRows),
            deletedRows: Array.from(v.deletedRows)
          };
        });
        return { ...state, sheets: sheetsCopy } as any;
      }
    }
  )
);
