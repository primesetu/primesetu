/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
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
 * Static fallback menu — mirrors MODULES in ModuleRegistry.
 * Used when: (a) no auth token, (b) API unreachable, (c) IndexedDB empty.
 */
const STATIC_FALLBACK_MENU: MenuItem[] = [
  { id: 'dashboard',   label: 'Overview',          route: 'dashboard',   module: 'dashboard',   required_permission: 'dashboard.view',    category: 'OPERATIONS', children: [], shortcut: undefined },
  { id: 'sales',       label: 'Billing (POS)',      route: 'sales',       module: 'sales',       required_permission: 'billing.view',      category: 'OPERATIONS', children: [], shortcut: 'F1' },
  { id: 'returns',     label: 'Sales Returns',      route: 'returns',     module: 'returns',     required_permission: 'billing.returns',   category: 'OPERATIONS', children: [], shortcut: undefined },
  { id: 'tills',       label: 'Till Management',    route: 'tills',       module: 'tills',       required_permission: 'finance.till',      category: 'OPERATIONS', children: [], shortcut: undefined },
  { id: 'dayend',      label: 'Day End Closure',    route: 'dayend',      module: 'dayend',      required_permission: 'billing.dayend',    category: 'OPERATIONS', children: [], shortcut: 'F12' },
  { id: 'price',       label: 'Price Master',       route: 'price',       module: 'price',       required_permission: 'catalogue.price',   category: 'OPERATIONS', children: [], shortcut: undefined },
  { id: 'customers',   label: 'Customer Master',    route: 'customers',   module: 'customers',   required_permission: 'crm.view',          category: 'OPERATIONS', children: [], shortcut: undefined },
  { id: 'loyalty',     label: 'Loyalty Program',    route: 'loyalty',     module: 'loyalty',     required_permission: 'crm.loyalty',       category: 'OPERATIONS', children: [], shortcut: undefined },
  { id: 'vouchers',    label: 'Gift Vouchers',       route: 'vouchers',    module: 'vouchers',    required_permission: 'billing.vouchers',  category: 'OPERATIONS', children: [], shortcut: undefined },
  { id: 'schemes',     label: 'Promotions',         route: 'schemes',     module: 'schemes',     required_permission: 'catalogue.schemes', category: 'OPERATIONS', children: [], shortcut: undefined },
  { id: 'inventory',   label: 'Stock Status',       route: 'inventory',   module: 'inventory',   required_permission: 'inventory.view',    category: 'INVENTORY',  children: [], shortcut: 'F9' },
  { id: 'grn',         label: 'Goods Inward (GRN)', route: 'grn',         module: 'grn',         required_permission: 'inventory.grn',     category: 'INVENTORY',  children: [], shortcut: undefined },
  { id: 'procurement', label: 'Purchase Orders',    route: 'procurement', module: 'procurement', required_permission: 'inventory.po',      category: 'INVENTORY',  children: [], shortcut: undefined },
  { id: 'movement',    label: 'Stock Movement',     route: 'movement',    module: 'movement',    required_permission: 'inventory.view',    category: 'INVENTORY',  children: [], shortcut: undefined },
  { id: 'reconcile',   label: 'Physical Audit',     route: 'reconcile',   module: 'reconcile',   required_permission: 'inventory.audit',   category: 'INVENTORY',  children: [], shortcut: undefined },
  { id: 'barcode',     label: 'Barcode Studio',     route: 'barcode',     module: 'barcode',     required_permission: 'inventory.view',    category: 'INVENTORY',  children: [], shortcut: undefined },
  { id: 'finance',     label: 'Finance Hub',        route: 'finance',     module: 'finance',     required_permission: 'finance.view',      category: 'FINANCE',    children: [], shortcut: undefined },
  { id: 'analytics',   label: 'Sales Reports',      route: 'analytics',   module: 'analytics',   required_permission: 'reports.view',      category: 'FINANCE',    children: [], shortcut: 'F3' },
  { id: 'ho',          label: 'HO Sync',            route: 'ho',          module: 'ho',          required_permission: 'ho.view',           category: 'NETWORK',    children: [], shortcut: undefined },
  { id: 'settings',    label: 'System Config',      route: 'settings',    module: 'settings',    required_permission: 'settings.view',     category: 'SETTINGS',   children: [], shortcut: 'F10' },
  { id: 'security',    label: 'Security',           route: 'security',    module: 'security',    required_permission: 'settings.security', category: 'SETTINGS',   children: [], shortcut: undefined },
];

export const fetchMenu = async (): Promise<MenuItem[]> => {
  const db = await initDB();

  try {
    const response = await apiClient.get<MenuItem[]>('/menu');
    const liveMenu = response.data;

    if (!Array.isArray(liveMenu) || liveMenu.length === 0) {
      throw new Error('Empty or invalid menu from API');
    }

    // Cache on success
    await db.put(STORE_NAME, liveMenu, CACHE_KEY);
    return liveMenu;

  } catch {
    // Try IndexedDB cache first
    try {
      const cachedMenu = await db.get(STORE_NAME, CACHE_KEY);
      if (cachedMenu && Array.isArray(cachedMenu) && cachedMenu.length > 0) {
        return cachedMenu as MenuItem[];
      }
    } catch { /* ignore IDB errors */ }

    // Final fallback: static SYSTEM menu — always works, no auth needed
    return STATIC_FALLBACK_MENU;
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
