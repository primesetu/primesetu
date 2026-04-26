/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useSession } from './useSession';

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

/**
 * usePermission Hook
 * Implements Sovereign RBAC. Maps user roles to functional permissions.
 */
export function usePermission() {
  const { session } = useSession();
  const userRole = (session?.user?.user_metadata?.role || 'CASHIER').toUpperCase();

  const hasPermission = (permission: Permission): boolean => {
    // OWNER has all permissions
    if (userRole === 'OWNER') return true;

    // MANAGER Permissions
    if (userRole === 'MANAGER') {
      if (permission.startsWith('admin.')) return false;
      return true;
    }

    // CASHIER Permissions
    if (userRole === 'CASHIER') {
      const allowed: Permission[] = [
        'billing.create',
        'inventory.view',
        'customers.view',
        'customers.edit',
        'catalog.view'
      ];
      return allowed.includes(permission);
    }

    return false;
  };

  return { hasPermission, role: userRole };
}
