/* ============================================================
 * SMRITI-OS — Universal Form Engine
 * AppForm: JSON schema → auto-rendered form
 * v3.0 Architecture: "Build engines, not modules"
 * ============================================================ */
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

// ── Field Schema Types ───────────────────────────────────────
export type AppFormFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'boolean'
  | 'textarea'
  | 'select'
  | 'lookup';

export interface AppFormField {
  name: string;
  label: string;
  type: AppFormFieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  readOnly?: boolean;
  hidden?: boolean;
  /** For select/lookup: options list */
  options?: { label: string; value: string | number }[];
  /** For lookup: fetch options from API */
  optionsSource?: string;
  /** Validation: min/max for number, minLength/maxLength for text */
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  /** Grid span: 1 = full width, 2 = half (default: 1) */
  span?: 1 | 2;
  /** Section header to group fields visually */
  sectionHeader?: string;
}

export interface AppFormSchema {
  fields: AppFormField[];
  /** Number of columns in grid layout (default: 2) */
  columns?: 1 | 2 | 3;
}

export interface AppFormProps {
  /** Unique form ID */
  id: string;
  /** JSON schema defining the form fields */
  schema: AppFormSchema;
  /** Initial values for the form */
  defaultValues?: Record<string, any>;
  /** Called when form is submitted with valid data */
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  /** Called when Cancel is clicked */
  onCancel?: () => void;
  /** Whether form is in loading state */
  loading?: boolean;
  /** Submit button label */
  submitLabel?: string;
  /** Whether to render action buttons */
  showActions?: boolean;
}

// ── Single Field Renderer ────────────────────────────────────
const FieldRenderer: React.FC<{
  field: AppFormField;
  control: any;
  errors: any;
  register: any;
}> = ({ field, control, errors, register }) => {
  if (field.hidden) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 36,
    padding: '0 10px',
    fontSize: 13,
    fontFamily: field.type === 'number' ? 'var(--font-mono)' : 'var(--font-primary)',
    background: field.readOnly ? 'var(--surface-muted)' : 'var(--surface)',
    color: 'var(--text-primary)',
    border: `1px solid ${errors[field.name] ? 'var(--danger)' : 'var(--border-default)'}`,
    borderRadius: 0,
    outline: 'none',
    cursor: field.readOnly ? 'default' : 'text',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-secondary)',
    marginBottom: 4,
    display: 'block',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--danger)',
    marginTop: 3,
  };

  const renderInput = () => {
    const commonProps = {
      ...register(field.name, {
        required: field.required ? `${field.label} is required` : false,
        minLength: field.minLength
          ? { value: field.minLength, message: `Min ${field.minLength} chars` }
          : undefined,
        maxLength: field.maxLength
          ? { value: field.maxLength, message: `Max ${field.maxLength} chars` }
          : undefined,
        min: field.min !== undefined
          ? { value: field.min, message: `Min value: ${field.min}` }
          : undefined,
        max: field.max !== undefined
          ? { value: field.max, message: `Max value: ${field.max}` }
          : undefined,
      }),
      disabled: field.readOnly,
      id: `form-field-${field.name}`,
      placeholder: field.placeholder ?? '',
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={3}
            style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical' }}
          />
        );

      case 'boolean':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              {...commonProps}
              id={`form-field-${field.name}`}
              style={{ width: 16, height: 16, cursor: field.readOnly ? 'default' : 'pointer' }}
            />
            <label
              htmlFor={`form-field-${field.name}`}
              style={{ fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              {field.label}
            </label>
          </div>
        );

      case 'select':
      case 'lookup':
        return (
          <select
            {...commonProps}
            style={{ ...inputStyle, cursor: field.readOnly ? 'default' : 'pointer' }}
          >
            <option value="">— Select {field.label} —</option>
            {(field.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            {...commonProps}
            style={{ ...inputStyle, textAlign: 'right' }}
          />
        );

      case 'date':
        return <input type="date" {...commonProps} style={inputStyle} />;

      case 'email':
        return <input type="email" {...commonProps} style={inputStyle} />;

      case 'phone':
        return <input type="tel" {...commonProps} style={inputStyle} />;

      default:
        return <input type="text" {...commonProps} style={inputStyle} />;
    }
  };

  return (
    <div>
      {field.type !== 'boolean' && (
        <label htmlFor={`form-field-${field.name}`} style={labelStyle}>
          {field.label}
          {field.required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {renderInput()}
      {errors[field.name] && (
        <span style={errorStyle}>{errors[field.name]?.message}</span>
      )}
    </div>
  );
};

// ── AppForm Component ────────────────────────────────────────
export const AppForm: React.FC<AppFormProps> = ({
  id,
  schema,
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Save',
  showActions = true,
}) => {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues,
  });

  // Reset when defaultValues changes (for edit mode)
  useEffect(() => {
    reset(defaultValues);
  }, [JSON.stringify(defaultValues)]);

  const cols = schema.columns ?? 2;
  const gridTemplate = `repeat(${cols}, 1fr)`;

  return (
    <form
      id={`app-form-${id}`}
      onSubmit={handleSubmit(onSubmit)}
      style={{ fontFamily: 'var(--font-primary)' }}
      noValidate
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          gap: '16px 24px',
          padding: 20,
        }}
      >
        {schema.fields.map((field) => {
          if (field.hidden) return null;

          // Section header
          if (field.sectionHeader) {
            return (
              <div
                key={`section-${field.name}`}
                style={{
                  gridColumn: `1 / -1`,
                  borderBottom: '1px solid var(--border-default)',
                  paddingBottom: 6,
                  marginTop: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--primary)',
                }}
              >
                {field.sectionHeader}
              </div>
            );
          }

          return (
            <div
              key={field.name}
              style={{
                gridColumn: field.span === 1 ? 'span 1' : `span ${cols}`,
              }}
            >
              <FieldRenderer
                field={field}
                control={control}
                errors={errors}
                register={register}
              />
            </div>
          );
        })}
      </div>

      {showActions && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '12px 20px',
            borderTop: '1px solid var(--border-default)',
            background: 'var(--surface-muted)',
          }}
        >
          {onCancel && (
            <button
              id={`app-form-cancel-${id}`}
              type="button"
              onClick={onCancel}
              style={{
                padding: '8px 20px', fontSize: 13, cursor: 'pointer',
                background: 'var(--surface)', color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)', borderRadius: 0,
              }}
            >
              Cancel
            </button>
          )}
          <button
            id={`app-form-submit-${id}`}
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 24px', fontSize: 13, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'var(--text-tertiary)' : 'var(--primary)',
              color: '#fff', border: 'none', borderRadius: 0,
              minWidth: 100,
            }}
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
};

export default AppForm;
