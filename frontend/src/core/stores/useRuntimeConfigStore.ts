import { create } from 'zustand';

export interface RuntimeConfig {
  BACKEND_URL: string;
  CLOUD_API_URL?: string;
  ENVIRONMENT: 'production' | 'development' | 'staging';
  NODE_ID: string;
  STORE_NAME?: string;
  CONFIG_VERSION: number;
}

interface RuntimeConfigState {
  config: RuntimeConfig | null;
  isLoading: boolean;
  error: string | null;
  loadConfig: () => Promise<void>;
}

export const useRuntimeConfigStore = create<RuntimeConfigState>((set) => ({
  config: null,
  isLoading: true,
  error: null,
  loadConfig: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/runtime-config.json');
      if (!response.ok) throw new Error('Failed to load runtime-config.json');
      const config = await response.json();
      set({ config, isLoading: false });
      console.log('[SMRITI-OS] Runtime Config Loaded:', config);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      console.error('[SMRITI-OS] Runtime Config Error:', err);
    }
  },
}));
