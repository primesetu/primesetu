import { create } from 'zustand';

interface WindowInstance {
  id: string;
  title: string;
  type: string; // 'item-viewer', 'pos', etc.
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMaximized: boolean;
  isMinimized: boolean;
}

interface WindowState {
  windows: WindowInstance[];
  activeWindowId: string | null;
  nextZIndex: number;
  openWindow: (title: string, type: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowInstance>) => void;
  toggleMaximize: (id: string) => void;
}

export const useWindowStore = create<WindowState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,

  openWindow: (title, type) => {
    const { windows, nextZIndex } = get();
    
    // Check if window of this type already exists and focus it?
    // Or allow multiple instances? For now, multiple instances.
    const id = `${type}-${Date.now()}`;
    const newWindow: WindowInstance = {
      id,
      title,
      type,
      x: 50 + (windows.length * 30),
      y: 50 + (windows.length * 30),
      width: 900,
      height: 600,
      zIndex: nextZIndex,
      isMaximized: false,
      isMinimized: false,
    };

    set({
      windows: [...windows, newWindow],
      activeWindowId: id,
      nextZIndex: nextZIndex + 1
    });
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter(w => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
    }));
  },

  focusWindow: (id) => {
    const { nextZIndex } = get();
    set((state) => ({
      activeWindowId: id,
      windows: state.windows.map(w => 
        w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
      ),
      nextZIndex: nextZIndex + 1
    }));
  },

  updateWindow: (id, updates) => {
    set((state) => ({
      windows: state.windows.map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  },

  toggleMaximize: (id) => {
    set((state) => ({
      windows: state.windows.map(w => 
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    }));
  }
}));
