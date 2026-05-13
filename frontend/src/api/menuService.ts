/* ============================================================
 * SMRITI-OS — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project : SMRITI-OS
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { openDB, IDBPDatabase } from 'idb';
import { apiClient } from './client';

/**
 * SMRITI-OS Dynamic Menu Structure
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

const DB_NAME = 'SMRITI-OSDB';
const DB_VERSION = 1;
const STORE_NAME = 'sys_config';
const CACHE_KEY = 'SMRITI-OS_menu_cache';

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
export const STATIC_FALLBACK_MENU: MenuItem[] = [
  { id: 'dashboard',   label: 'Overview',          route: 'dashboard',   module: 'dashboard',   required_permission: 'dashboard.view',    category: 'POS',       children: [], shortcut: undefined },
  { id: 'sales',       label: 'Billing (POS)',      route: 'sales',       module: 'sales',       required_permission: 'billing.view',      category: 'POS',       children: [], shortcut: 'F1' },
  { id: 'returns',     label: 'Sales Returns',      route: 'returns',     module: 'returns',     required_permission: 'billing.returns',   category: 'POS',       children: [], shortcut: undefined },
  { id: 'tills',       label: 'Till Management',    route: 'tills',       module: 'tills',       required_permission: 'finance.till',      category: 'POS',       children: [], shortcut: undefined },
  { id: 'dayend',      label: 'Day End Closure',    route: 'dayend',      module: 'dayend',      required_permission: 'billing.dayend',    category: 'POS',       children: [], shortcut: 'F12' },
  
  { id: 'sales_journal',    label: 'Sales Journal',      route: 'sales_journal',    module: 'sales_journal',    required_permission: 'billing.view',      category: 'TRANSACTIONS', children: [], shortcut: undefined },
  { id: 'purchase_journal', label: 'Purchase Journal',   route: 'purchase_journal', module: 'purchase_journal', required_permission: 'inventory.view',    category: 'TRANSACTIONS', children: [], shortcut: undefined },
  { id: 'stock_ledger',     label: 'Stock Ledger',       route: 'stock_ledger',     module: 'stock_ledger',     required_permission: 'inventory.view',    category: 'TRANSACTIONS', children: [], shortcut: undefined },
  { id: 'purchase_entry',   label: 'Purchase Workbench',     route: 'purchase_entry',   module: 'purchase_entry',   required_permission: 'inventory.view',    category: 'TRANSACTIONS', children: [], shortcut: undefined },

  { id: 'item_master', label: 'Item Master',        route: 'item_master', module: 'item_master', required_permission: 'catalogue.view',   category: 'CATALOGUE', children: [], shortcut: undefined },
  { id: 'item_workbench', label: 'Bulk Item Entry',  route: 'item_workbench', module: 'item_workbench', required_permission: 'catalogue.edit', category: 'CATALOGUE', children: [], shortcut: 'F6' },
  { id: 'customers',   label: 'Customer Master',    route: 'customers',   module: 'customers',   required_permission: 'crm.view',          category: 'CATALOGUE', children: [], shortcut: undefined },
  { id: 'vendors',     label: 'Vendor Master',      route: 'vendors',     module: 'vendors',     required_permission: 'catalogue.view',   category: 'CATALOGUE', children: [], shortcut: undefined },
  { id: 'chainstores', label: 'Inter-Store',        route: 'chainstores', module: 'chainstores', required_permission: 'catalogue.view',   category: 'CATALOGUE', children: [], shortcut: undefined },
  { id: 'price',       label: 'Price Workbench',    route: 'price',       module: 'price',       required_permission: 'catalogue.price',   category: 'CATALOGUE', children: [], shortcut: undefined },
  { id: 'schemes',     label: 'Promotions',         route: 'schemes',     module: 'schemes',     required_permission: 'catalogue.schemes', category: 'CATALOGUE', children: [], shortcut: undefined },
  { id: 'loyalty',     label: 'Loyalty Program',    route: 'loyalty',     module: 'loyalty',     required_permission: 'crm.loyalty',       category: 'CATALOGUE', children: [], shortcut: undefined },
  { id: 'personnel',   label: 'Personnel Master',   route: 'personnel',   module: 'personnel',   required_permission: 'catalogue.view',    category: 'CATALOGUE', children: [], shortcut: undefined },
  { id: 'hsn',         label: 'HSN Manager',        route: 'hsn',         module: 'hsn',         required_permission: 'catalogue.view',    category: 'CATALOGUE', children: [], shortcut: undefined },
  { id: 'object_lookup', label: 'Object Lookup',     route: 'object_lookup', module: 'object_lookup', required_permission: 'catalogue.view', category: 'CATALOGUE', children: [], shortcut: undefined },

  { id: 'inventory',   label: 'Stock Status',       route: 'inventory',   module: 'inventory',   required_permission: 'inventory.view',    category: 'WAREHOUSE', children: [], shortcut: 'F9' },
  { id: 'grn',         label: 'Goods Inward (GRN)', route: 'grn',         module: 'grn',         required_permission: 'inventory.grn',     category: 'TRANSACTIONS', children: [], shortcut: undefined },
  { id: 'procurement', label: 'Purchase Orders',    route: 'procurement', module: 'procurement', required_permission: 'inventory.po',      category: 'WAREHOUSE', children: [], shortcut: undefined },
  { id: 'movement',    label: 'Stock Movement',     route: 'movement',    module: 'movement',    required_permission: 'inventory.view',    category: 'WAREHOUSE', children: [], shortcut: undefined },
  { id: 'reconcile',   label: 'Physical Audit',     route: 'reconcile',   module: 'reconcile',   required_permission: 'inventory.audit',   category: 'WAREHOUSE', children: [], shortcut: undefined },
  { id: 'barcode',     label: 'Barcode Studio',     route: 'barcode',     module: 'barcode',     required_permission: 'inventory.view',    category: 'WAREHOUSE', children: [], shortcut: undefined },
  
  { id: 'finance',     label: 'Finance Hub',        route: 'finance',     module: 'finance',     required_permission: 'finance.view',      category: 'FINANCE',   children: [], shortcut: undefined },
  { id: 'analytics',   label: 'Sales Reports',      route: 'analytics',   module: 'analytics',   required_permission: 'reports.view',      category: 'FINANCE',   children: [], shortcut: 'F3' },
  { id: 'vouchers',    label: 'Gift Vouchers',       route: 'vouchers',    module: 'vouchers',    required_permission: 'billing.vouchers',  category: 'FINANCE',   children: [], shortcut: undefined },
  
  { id: 'ho',          label: 'HO Sync',            route: 'ho',          module: 'ho',          required_permission: 'ho.view',           category: 'HO',        children: [], shortcut: undefined },
  { id: 'settings',    label: 'System Config',      route: 'settings',    module: 'settings',    required_permission: 'settings.view',     category: 'SYSTEM',    children: [], shortcut: 'F10' },
  { id: 'security',    label: 'Security',           route: 'security',    module: 'security',    required_permission: 'settings.security', category: 'SYSTEM',    children: [], shortcut: undefined },
  { id: 'table_viewer',    label: 'DB Explorer',     route: 'table_viewer',    module: 'table_viewer',    required_permission: 'settings.view', category: 'SYSTEM', children: [], shortcut: undefined },
  { id: 'hybrid_storage',  label: 'Hybrid Storage',  route: 'hybrid_storage',  module: 'hybrid_storage',  required_permission: 'settings.view', category: 'SYSTEM', children: [], shortcut: undefined },
  { id: 'architect_config',label: 'SMRITI Config',   route: 'architect_config',module: 'architect_config',required_permission: 'settings.view', category: 'SYSTEM', children: [], shortcut: 'F7' },
  { id: 'spreadsheet',     label: 'Sovereign Audit', route: 'spreadsheet',     module: 'spreadsheet',     required_permission: 'settings.view', category: 'SYSTEM', children: [], shortcut: undefined },
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




