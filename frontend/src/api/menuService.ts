/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { openDB, IDBPDatabase } from 'idb';
import { apiClient } from './client';

/**
 * PrimeSetu Dynamic Menu Structure
 */
export interface MenuItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  module: string;
  category?: string;
  required_permission: string;
  shortcut?: string;
  children: MenuItem[];
}

const DB_NAME = 'PrimeSetuDB';
const DB_VERSION = 1;
const STORE_NAME = 'sys_config';
const CACHE_KEY = 'primesetu_menu_cache';

/**
 * Initialize IndexedDB for Sovereign Storage
 */
const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

/**
 * Fetches the dynamic menu tree with Sovereign Offline Fallback.
 * @returns A promise resolving to the MenuItem array.
 */
export const fetchMenu = async (): Promise<MenuItem[]> => {
  const db = await initDB();
  
  try {
    // 1. Fetch from Sovereign Backend (apiClient handles Supabase JWT injection)
    const response = await apiClient.get<MenuItem[]>('/menu');
    const liveMenu = response.data;
    
    if (!Array.isArray(liveMenu)) {
        throw new Error("Invalid Menu Data");
    }
    
    // 2. Sovereign Protocol: Sync local cache on success
    await db.put(STORE_NAME, liveMenu, CACHE_KEY);
    
    return liveMenu;
    
  } catch (error) {
    console.warn("[PrimeSetu] Navigation Engine: API unreachable. Engaging Sovereign Offline Fallback.");
    
    // 3. Fallback: Load last known configuration from IndexedDB
    const cachedMenu = await db.get(STORE_NAME, CACHE_KEY);
    
    if (!cachedMenu) {
      throw new Error("Sovereign Protocol Failure: No cached menu found and backend is unreachable.");
    }
    
    return cachedMenu as MenuItem[];
  }
};

/**
 * Clears the menu cache from IndexedDB.
 * Used during logout to prevent permission leaking across sessions.
 */
export const clearMenuCache = async (): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, CACHE_KEY);
};
