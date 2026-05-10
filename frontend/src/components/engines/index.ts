/* ============================================================
 * SMRITI-OS — Engine Barrel Export
 * All 4 reusable engines from one import
 * Usage: import { AppGrid, AppForm, AppCRUD, AppRBAC } from '@/components/engines'
 * ============================================================ */

export { AppGrid } from './AppGrid';
export type { AppGridColumn, AppGridPermissions, AppGridProps } from './AppGrid';

export { AppForm } from './AppForm';
export type { AppFormField, AppFormFieldType, AppFormSchema, AppFormProps } from './AppForm';

export { AppCRUD } from './AppCRUD';
export type { AppCRUDProps } from './AppCRUD';

export { AppRBAC, useAppPermissions, ROLE_PERMISSIONS, DEFAULT_MODULE_ACCESS } from './AppRBAC';
export type { SmritiRole, LegacyRole, AnyRole, PermissionAction, ModuleAccess, AppRBACProps } from './AppRBAC';
