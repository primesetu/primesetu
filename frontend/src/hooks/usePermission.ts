/* ============================================================
 * SMRITI-OS — usePermission Hook (v3.0 — 9 Roles)
 * Implements Sovereign RBAC with both legacy and new role support
 * ============================================================ */
import { useSession } from './useSession';

// Legacy dot-notation permissions (kept for backward compat)
export type Permission =
  | 'billing.create'
  | 'billing.void'
  | 'inventory.edit'
  | 'inventory.view'
  | 'customers.edit'
  | 'customers.view'
  | 'catalog.edit'
  | 'catalog.view'
  | 'admin.settings';

// v3.0 CRUD action permissions (used by AppRBAC + AppGrid)
export type ActionPermission = 'view' | 'create' | 'edit' | 'delete' | 'export';

// v3.0 — All 9 roles
type Role =
  | 'SUPER_ADMIN' | 'HO_ADMIN' | 'HO_MANAGER'
  | 'STORE_MANAGER' | 'CASHIER' | 'STOCK_MANAGER'
  | 'PURCHASE_MANAGER' | 'ACCOUNTANT' | 'CUSTOM'
  | 'OWNER' | 'MANAGER'; // legacy aliases

// Role → action map
const ROLE_ACTION_MAP: Record<string, ActionPermission[]> = {
  SUPER_ADMIN:      ['view', 'create', 'edit', 'delete', 'export'],
  HO_ADMIN:         ['view', 'create', 'edit', 'delete', 'export'],
  OWNER:            ['view', 'create', 'edit', 'delete', 'export'],
  HO_MANAGER:       ['view', 'export'],
  STORE_MANAGER:    ['view', 'create', 'edit', 'export'],
  MANAGER:          ['view', 'create', 'edit', 'export'],
  CASHIER:          ['view', 'create'],
  STOCK_MANAGER:    ['view', 'create', 'edit', 'export'],
  PURCHASE_MANAGER: ['view', 'create', 'edit', 'export'],
  ACCOUNTANT:       ['view', 'export'],
  CUSTOM:           ['view'],
};

export function usePermission() {
  const { session } = useSession();
  const userRole = (
    (session?.user?.user_metadata?.role as string) || 'CASHIER'
  ).toUpperCase() as Role;

  // ── v3.0 action-based permission ──────────────────────────
  const hasPermission = (permission: Permission | ActionPermission): boolean => {
    // Normalize legacy dot-notation to action
    let action = permission as string;
    if (action.includes('.')) {
      if (action.startsWith('admin.')) {
        // Only admins can access settings
        return ['SUPER_ADMIN', 'HO_ADMIN', 'OWNER'].includes(userRole);
      }
      // Map legacy permissions: *.edit → edit, *.view → view
      action = action.split('.').pop() ?? 'view';
    }

    const allowed = ROLE_ACTION_MAP[userRole] ?? ['view'];
    return allowed.includes(action as ActionPermission);
  };

  // ── Convenience checks ────────────────────────────────────
  const canView   = hasPermission('view');
  const canCreate = hasPermission('create');
  const canEdit   = hasPermission('edit');
  const canDelete = hasPermission('delete');
  const canExport = hasPermission('export');

  const isAdmin   = ['SUPER_ADMIN', 'HO_ADMIN', 'OWNER'].includes(userRole);
  const isHO      = ['SUPER_ADMIN', 'HO_ADMIN', 'HO_MANAGER'].includes(userRole);

  return {
    hasPermission,
    role: userRole,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    isAdmin,
    isHO,
  };
}
