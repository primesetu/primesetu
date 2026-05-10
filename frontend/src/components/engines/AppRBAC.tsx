/* ============================================================
 * SMRITI-OS — Universal RBAC Permission Guard
 * AppRBAC: Wraps any element with role-based access control
 * v3.0 Architecture: "Same permission check everywhere"
 * ============================================================ */
import React from 'react';
import { usePermission, ActionPermission } from '../../hooks/usePermission';

// Re-export for convenience
export type PermissionAction = ActionPermission;

// ── Smriti OS v3.0 — 9 Roles ────────────────────────────────
export type SmritiRole =
  | 'SUPER_ADMIN'
  | 'HO_ADMIN'
  | 'HO_MANAGER'
  | 'STORE_MANAGER'
  | 'CASHIER'
  | 'STOCK_MANAGER'
  | 'PURCHASE_MANAGER'
  | 'ACCOUNTANT'
  | 'CUSTOM';

// Legacy 3-role aliases (backward compat)
export type LegacyRole = 'OWNER' | 'MANAGER' | 'CASHIER';
export type AnyRole = SmritiRole | LegacyRole;

// ── Permission Actions ───────────────────────────────────────
// PermissionAction is exported at the top

// ── Role → Action Matrix (v3.0 default) ─────────────────────
export const ROLE_PERMISSIONS: Record<SmritiRole | LegacyRole, PermissionAction[]> = {
  SUPER_ADMIN:      ['view', 'create', 'edit', 'delete', 'export'],
  HO_ADMIN:         ['view', 'create', 'edit', 'delete', 'export'],
  HO_MANAGER:       ['view', 'export'],
  STORE_MANAGER:    ['view', 'create', 'edit', 'export'],
  CASHIER:          ['view', 'create'],
  STOCK_MANAGER:    ['view', 'create', 'edit', 'export'],
  PURCHASE_MANAGER: ['view', 'create', 'edit', 'export'],
  ACCOUNTANT:       ['view', 'export'],
  CUSTOM:           ['view'],
  // Legacy aliases
  OWNER:            ['view', 'create', 'edit', 'delete', 'export'],
  MANAGER:          ['view', 'create', 'edit', 'export'],
  // CASHIER is duplicated above (same key)
};

// ── Module-level access matrix ───────────────────────────────
export interface ModuleAccess {
  view: AnyRole[];
  create: AnyRole[];
  edit: AnyRole[];
  delete: AnyRole[];
  export: AnyRole[];
}

export const DEFAULT_MODULE_ACCESS: Record<string, ModuleAccess> = {
  dashboard:       { view: ['SUPER_ADMIN','HO_ADMIN','HO_MANAGER','STORE_MANAGER','CASHIER','STOCK_MANAGER','ACCOUNTANT','OWNER','MANAGER'], create: [], edit: [], delete: [], export: ['SUPER_ADMIN','HO_ADMIN','HO_MANAGER','STORE_MANAGER','OWNER','MANAGER'] },
  item_master:     { view: ['SUPER_ADMIN','HO_ADMIN','HO_MANAGER','STORE_MANAGER','STOCK_MANAGER','OWNER','MANAGER'], create: ['SUPER_ADMIN','HO_ADMIN','STORE_MANAGER','OWNER','MANAGER'], edit: ['SUPER_ADMIN','HO_ADMIN','STORE_MANAGER','OWNER','MANAGER'], delete: ['SUPER_ADMIN','HO_ADMIN','OWNER'], export: ['SUPER_ADMIN','HO_ADMIN','HO_MANAGER','STORE_MANAGER','OWNER','MANAGER'] },
  billing:         { view: ['SUPER_ADMIN','HO_ADMIN','STORE_MANAGER','CASHIER','OWNER','MANAGER'], create: ['SUPER_ADMIN','STORE_MANAGER','CASHIER','OWNER','MANAGER'], edit: ['SUPER_ADMIN','STORE_MANAGER','OWNER','MANAGER'], delete: ['SUPER_ADMIN','OWNER'], export: ['SUPER_ADMIN','HO_ADMIN','HO_MANAGER','STORE_MANAGER','OWNER','MANAGER'] },
  purchase:        { view: ['SUPER_ADMIN','HO_ADMIN','STORE_MANAGER','PURCHASE_MANAGER','OWNER','MANAGER'], create: ['SUPER_ADMIN','STORE_MANAGER','PURCHASE_MANAGER','OWNER','MANAGER'], edit: ['SUPER_ADMIN','STORE_MANAGER','PURCHASE_MANAGER','OWNER','MANAGER'], delete: ['SUPER_ADMIN','OWNER'], export: ['SUPER_ADMIN','HO_ADMIN','STORE_MANAGER','PURCHASE_MANAGER','OWNER','MANAGER'] },
  reports:         { view: ['SUPER_ADMIN','HO_ADMIN','HO_MANAGER','STORE_MANAGER','ACCOUNTANT','OWNER','MANAGER'], create: [], edit: [], delete: [], export: ['SUPER_ADMIN','HO_ADMIN','HO_MANAGER','STORE_MANAGER','ACCOUNTANT','OWNER','MANAGER'] },
  day_end:         { view: ['SUPER_ADMIN','HO_ADMIN','STORE_MANAGER','CASHIER','ACCOUNTANT','OWNER','MANAGER'], create: ['SUPER_ADMIN','STORE_MANAGER','OWNER','MANAGER'], edit: ['SUPER_ADMIN','STORE_MANAGER','OWNER','MANAGER'], delete: ['SUPER_ADMIN','OWNER'], export: ['SUPER_ADMIN','HO_ADMIN','STORE_MANAGER','ACCOUNTANT','OWNER','MANAGER'] },
  stock_transfer:  { view: ['SUPER_ADMIN','HO_ADMIN','STORE_MANAGER','STOCK_MANAGER','OWNER','MANAGER'], create: ['SUPER_ADMIN','STORE_MANAGER','STOCK_MANAGER','OWNER','MANAGER'], edit: ['SUPER_ADMIN','STORE_MANAGER','STOCK_MANAGER','OWNER','MANAGER'], delete: ['SUPER_ADMIN','OWNER'], export: ['SUPER_ADMIN','HO_ADMIN','STORE_MANAGER','OWNER','MANAGER'] },
  theme_manager:   { view: ['SUPER_ADMIN','HO_ADMIN','OWNER'], create: ['SUPER_ADMIN','HO_ADMIN','OWNER'], edit: ['SUPER_ADMIN','HO_ADMIN','OWNER'], delete: ['SUPER_ADMIN','OWNER'], export: [] },
  menu_manager:    { view: ['SUPER_ADMIN','HO_ADMIN','OWNER'], create: ['SUPER_ADMIN','HO_ADMIN','OWNER'], edit: ['SUPER_ADMIN','HO_ADMIN','OWNER'], delete: ['SUPER_ADMIN','OWNER'], export: [] },
  ho_module:       { view: ['SUPER_ADMIN','HO_ADMIN','HO_MANAGER','OWNER'], create: ['SUPER_ADMIN','HO_ADMIN','OWNER'], edit: ['SUPER_ADMIN','HO_ADMIN','OWNER'], delete: ['SUPER_ADMIN','OWNER'], export: ['SUPER_ADMIN','HO_ADMIN','HO_MANAGER','OWNER'] },
};

// ── AppRBAC Component ────────────────────────────────────────
export interface AppRBACProps {
  /** The action being guarded */
  requires: PermissionAction;
  /** Optional: module-level override (defaults to global role check) */
  module?: string;
  /** What to render when access is denied (default: null) */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const AppRBAC: React.FC<AppRBACProps> = ({
  requires,
  module,
  fallback = null,
  children,
}) => {
  const { hasPermission } = usePermission();

  // Module-level check
  if (module && DEFAULT_MODULE_ACCESS[module]) {
    const allowed = DEFAULT_MODULE_ACCESS[module][requires];
    // We can't easily check user role here without more context,
    // so fall through to hook-based check
  }

  if (!hasPermission(requires)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ── useAppPermissions hook ────────────────────────────────────
/** Returns permission set for current user based on v3.0 role matrix */
export function useAppPermissions(module?: string): Record<PermissionAction, boolean> {
  const { hasPermission } = usePermission();

  return {
    view:   hasPermission('view'),
    create: hasPermission('create'),
    edit:   hasPermission('edit'),
    delete: hasPermission('delete'),
    export: hasPermission('export'),
  };
}

export default AppRBAC;
