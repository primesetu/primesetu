/* ============================================================
 * SMRITI-OS — Universal CRUD Engine
 * AppCRUD: Composes AppGrid + AppForm + Add/Edit/Delete flow
 * v3.0 Architecture: "Build engines, not modules"
 * ============================================================ */
import React, { useState, useCallback } from 'react';
import { AppGrid, AppGridColumn, AppGridPermissions } from './AppGrid';
import { AppForm, AppFormSchema } from './AppForm';
import { X } from 'lucide-react';

export interface AppCRUDProps {
  /** Unique ID */
  id: string;
  /** Display title */
  title: string;
  /** Column schema for grid view */
  gridColumns: AppGridColumn[];
  /** JSON schema for add/edit form */
  formSchema: AppFormSchema;
  /** Row data */
  data: any[];
  /** Loading state */
  loading?: boolean;
  /** Permissions */
  permissions?: AppGridPermissions;
  /** Called when new record is to be saved */
  onCreate?: (values: Record<string, any>) => Promise<void> | void;
  /** Called when a record is to be updated */
  onUpdate?: (id: any, values: Record<string, any>) => Promise<void> | void;
  /** Called when records are to be deleted */
  onDelete?: (rows: any[]) => Promise<void> | void;
  /** Called when a cell is edited inline in the grid */
  onInlineEdit?: (rowIndex: number, field: string, value: any, row: any) => void;
  /** Row ID field name (default: 'id') */
  idField?: string;
  /** Export filename */
  exportFileName?: string;
}

// ── AppCRUD Component ────────────────────────────────────────
export const AppCRUD: React.FC<AppCRUDProps> = ({
  id,
  title,
  gridColumns,
  formSchema,
  data,
  loading = false,
  permissions = { canCreate: true, canEdit: true, canDelete: true, canExport: true },
  onCreate,
  onUpdate,
  onDelete,
  onInlineEdit,
  idField = 'id',
  exportFileName,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState<Record<string, any> | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // ── Open Add Form ────────────────────────────────────────
  const handleAdd = useCallback(() => {
    setEditRow(null);
    setShowForm(true);
  }, []);

  // ── Open Edit Form on row double-click ───────────────────
  const handleRowDoubleClick = useCallback((row: any) => {
    if (!permissions.canEdit) return;
    setEditRow(row);
    setShowForm(true);
  }, [permissions.canEdit]);

  // ── Form Submit (create or update) ──────────────────────
  const handleFormSubmit = useCallback(async (values: Record<string, any>) => {
    setFormLoading(true);
    try {
      if (editRow) {
        await onUpdate?.(editRow[idField], values);
      } else {
        await onCreate?.(values);
      }
      setShowForm(false);
      setEditRow(null);
    } finally {
      setFormLoading(false);
    }
  }, [editRow, onCreate, onUpdate, idField]);

  // ── Delete handler ───────────────────────────────────────
  const handleDelete = useCallback(async (rows: any[]) => {
    await onDelete?.(rows);
  }, [onDelete]);

  return (
    <div
      id={`app-crud-${id}`}
      className="flex flex-col h-full"
      style={{ background: 'var(--background)', position: 'relative' }}
    >
      {/* ── Grid ───────────────────────────────────────── */}
      <AppGrid
        id={id}
        title={title}
        columns={gridColumns}
        data={data}
        loading={loading}
        permissions={permissions}
        onAdd={permissions.canCreate ? handleAdd : undefined}
        onDelete={permissions.canDelete ? handleDelete : undefined}
        onRowChange={onInlineEdit}
        exportFileName={exportFileName ?? title.toLowerCase().replace(/\s+/g, '-')}
      />

      {/* ── Add/Edit Drawer ─────────────────────────────── */}
      {showForm && (
        <div
          style={{
            position: 'absolute',
            top: 0, right: 0,
            width: 480,
            height: '100%',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border-default)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-default)',
              background: '#1a4a48',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {editRow ? `Edit ${title}` : `Add ${title}`}
            </span>
            <button
              id={`app-crud-close-${id}`}
              onClick={() => { setShowForm(false); setEditRow(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Form */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AppForm
              id={`crud-form-${id}`}
              schema={formSchema}
              defaultValues={editRow ?? {}}
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditRow(null); }}
              loading={formLoading}
              submitLabel={editRow ? 'Update' : 'Save'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppCRUD;
