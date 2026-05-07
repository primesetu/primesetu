import { useReducer, useEffect } from 'react';

export const WIN_DEFAULTS: Record<string, string> = {
  pos:      'sales',
  ho:       'dashboard',
  wh:       'warehouse_os',
  dist:     'vouchers',
  cat:      'item_workbench',
  mis:      'analytics',
  settings: 'sysparams',
};

export type WinState = 'open' | 'minimized' | 'maximized' | 'closed';

export type WinRecord = {
  state: WinState;
  activeModule: string | null;
};

export type WindowRegistry = Record<string, WinRecord>;

type WinAction = 
  | { type: 'TOGGLE_WIN'; key: string; mid?: string | null }
  | { type: 'TOGGLE_MIN'; key: string }
  | { type: 'TOGGLE_MAX'; key: string }
  | { type: 'CLOSE'; key: string };

function winReducer(state: WindowRegistry, action: WinAction): WindowRegistry {
  const current = state[action.key] || { state: 'closed', activeModule: null };
  
  switch (action.type) {
    case 'TOGGLE_WIN': {
      const resolvedMid = action.mid || WIN_DEFAULTS[action.key] || null;
      if (current.state === 'closed') {
        return { ...state, [action.key]: { state: 'open', activeModule: resolvedMid } };
      }
      if (current.state === 'minimized') {
        return { ...state, [action.key]: { state: 'open', activeModule: resolvedMid || current.activeModule } };
      }
      if (resolvedMid && current.activeModule !== resolvedMid) {
        return { ...state, [action.key]: { ...current, activeModule: resolvedMid } };
      }
      // If it's open/maximized and we just clicked it without a new mid, close it.
      return { ...state, [action.key]: { state: 'closed', activeModule: null } };
    }
    case 'TOGGLE_MIN': {
      if (current.state === 'minimized') {
        return { ...state, [action.key]: { ...current, state: 'open' } };
      } else if (current.state !== 'closed') {
        return { ...state, [action.key]: { ...current, state: 'minimized' } };
      }
      return state;
    }
    case 'TOGGLE_MAX': {
      if (current.state === 'maximized') {
        return { ...state, [action.key]: { ...current, state: 'open' } };
      } else if (current.state !== 'closed') {
        return { ...state, [action.key]: { ...current, state: 'maximized' } };
      }
      return state;
    }
    case 'CLOSE': {
      return { ...state, [action.key]: { state: 'closed', activeModule: null } };
    }
    default:
      return state;
  }
}

export function useWindowManager() {
  const [wins, dispatch] = useReducer(winReducer, {}, () => {
    try {
      const saved = localStorage.getItem('sov_windows');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { pos: { state: 'open', activeModule: 'sales' } };
  });

  useEffect(() => {
    localStorage.setItem('sov_windows', JSON.stringify(wins));
  }, [wins]);

  const openWins = Object.entries(wins).filter(([_, w]) => w.state !== 'closed').map(([k]) => k);
  const minWins = Object.entries(wins).filter(([_, w]) => w.state === 'minimized').map(([k]) => k);
  const maxWins = Object.entries(wins).filter(([_, w]) => w.state === 'maximized').map(([k]) => k);
  
  const activeWinModule: Record<string, string | null> = {};
  for (const k of openWins) {
    activeWinModule[k] = wins[k].activeModule;
  }

  const toggleWin = (key: string, mid: string | null = null) => dispatch({ type: 'TOGGLE_WIN', key, mid });
  const toggleMin = (key: string) => dispatch({ type: 'TOGGLE_MIN', key });
  const toggleMax = (key: string) => dispatch({ type: 'TOGGLE_MAX', key });
  const closeWin = (key: string) => dispatch({ type: 'CLOSE', key });

  return { wins, openWins, minWins, maxWins, activeWinModule, toggleWin, toggleMin, toggleMax, closeWin };
}
