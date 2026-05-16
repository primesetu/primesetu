import React, { ReactNode, useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import { ColDef } from 'ag-grid-community';

// AG Grid CSS and Modules handled globally in main.tsx/index.css

import { useTheme } from '@/hooks/useTheme';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

// 1. Button Primitive
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'pri' | 'sec'; // pri/sec for legacy compat
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}, ref) => {
  // Normalize legacy variants
  const normalizedVariant = variant === 'pri' ? 'primary' : variant === 'sec' ? 'secondary' : variant;
  
  return (
    <button 
      ref={ref}
      className={cn(
        'c-button',
        `c-button--${normalizedVariant}`,
        size === 'sm' && 'c-button--sm',
        size === 'lg' && 'c-button--lg',
        className
      )}
      {...props}
    />
  );
});

// 2. Input Primitive
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input 
      ref={ref}
      className={cn(
        'c-input',
        className
      )}
      {...props}
    />
  )
);

// 3. Select Primitive
export const Select = ({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select 
    className={cn(
      'c-input', // Using same base as input for uniformity
      'cursor-pointer appearance-none',
      className
    )} 
    {...props}
  >
    {children}
  </select>
);

// 4. Label
export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label 
    className={cn('u-uppercase font-bold text-[10px] text-[var(--text-tertiary)] ml-1', className)} 
    {...props} 
  />
);

// 5. Card / Container
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'outline' | 'success' | 'danger' | 'warning';
}

export const Card = ({ variant = 'elevated', className, ...props }: CardProps) => {
  return (
    <div 
      className={cn(
        'c-card', 
        variant === 'elevated' && 'c-card--elevated',
        variant === 'success' && 'c-card--success',
        variant === 'danger' && 'c-card--danger',
        variant === 'warning' && 'c-card--warning',
        className
      )} 
      {...props} 
    />
  );
};

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 space-y-1.5', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-bold leading-none tracking-tight', className)} {...props} />
);

export const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('text-lg font-bold leading-none tracking-tight', className)} {...props} />
);

// Dialog Primitives (Mocking Radix-like API for Sovereign UI)
export const Dialog = ({ children, open, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
    if (!open) return null;
    return (
        <Portal>
            <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-6 bg-[var(--background)]/60 backdrop-blur-xl">
                <div className="absolute inset-0" onClick={() => onOpenChange?.(false)} />
                <Card className="w-full max-w-2xl relative z-[var(--z-modal)] overflow-hidden">
                    {children}
                </Card>
            </div>
        </Portal>
    );
};

export const DialogContent = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cn("p-10 bg-[var(--background)]/20", className)}>{children}</div>
);

export const DialogHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cn("p-8 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40", className)}>{children}</div>
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-[var(--text-secondary)]', className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

// 6. Typography
interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'p' | 'xs' | 'sm' | 'label' | 'hint';
}

export const Text = ({ variant = 'p', className, ...props }: TextProps) => {
  const variants = {
    h1: 'text-3xl font-bold tracking-tight text-[var(--text-primary)] u-uppercase',
    h2: 'text-xl font-bold tracking-tight text-[var(--text-primary)] u-uppercase',
    h3: 'text-lg font-bold tracking-tight text-[var(--text-primary)] u-uppercase',
    p: 'text-sm font-medium text-[var(--text-secondary)] leading-relaxed',
    sm: 'text-xs font-medium text-[var(--text-secondary)]',
    hint: 'text-xs font-medium text-[var(--text-secondary)]',
    xs: 'u-uppercase font-black text-[10px] text-[var(--text-tertiary)] tracking-widest',
    label: 'u-uppercase font-black text-[10px] text-[var(--text-tertiary)] tracking-widest',
  };

  return <span className={cn(variants[variant], className)} {...props} />;
};

// 7. Badge
export const Badge = ({ 
  children, 
  variant = 'info', 
  className 
}: { 
  children: ReactNode; 
  variant?: 'info' | 'warn' | 'warning' | 'error' | 'danger' | 'success' | 'muted';
  className?: string;
}) => {
  const badgeMap: Record<string, string> = {
    info: 'c-badge--info',
    warn: 'c-badge--warning',
    warning: 'c-badge--warning',
    error: 'c-badge--error',
    danger: 'c-badge--error',
    success: 'c-badge--success',
    muted: 'c-badge--muted',
  };

  return (
    <span className={cn('c-badge', badgeMap[variant], className)}>
      {children}
    </span>
  );
};

// 7.5 Switch & Progress
export const Switch = ({ checked, onCheckedChange, className }: { checked?: boolean; onCheckedChange?: (val: boolean) => void; className?: string }) => (
  <button 
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-[var(--primary)]" : "bg-slate-700",
      className
    )}
  >
    <span className={cn(
      "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
      checked ? "translate-x-5" : "translate-x-0"
    )} />
  </button>
);

export const Progress = ({ value = 0, className }: { value?: number; className?: string }) => (
  <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-800", className)}>
    <div 
      className="h-full w-full flex-1 bg-[var(--primary)] transition-all" 
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }} 
    />
  </div>
);

// 8. Portal System
import { createPortal } from 'react-dom';

export const Portal = ({ children, containerId = 'smriti-overlay-root' }: { children: ReactNode, containerId?: string }) => {
  const container = document.getElementById(containerId);
  if (!container) return <>{children}</>;
  return createPortal(children, container);
};

// 9. Modal Overlay
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  icon?: ReactNode;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer, 
  maxWidth = 'max-w-5xl',
  icon
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-6 bg-[var(--background)]/60 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="absolute inset-0" onClick={onClose} />
        <Card className={cn("w-full h-fit max-h-[90vh] flex flex-col overflow-hidden c-card--elevated relative z-[var(--z-modal)]", maxWidth)}>
          {/* Modal Header */}
          <div className="p-8 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-elevated)]/40">
            <div className="flex items-center gap-6">
                {icon && (
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)]">
                    {icon}
                  </div>
                )}
                <div>
                  <Text variant="h2" className="leading-none">{title}</Text>
                  {subtitle && <Text variant="xs" className="mt-1.5 block">{subtitle}</Text>}
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 rounded-lg">
                <X size={18} />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-10 bg-[var(--background)]/20">
            {children}
          </div>

          {/* Modal Footer */}
          {footer && (
            <div className="p-8 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40 flex items-center justify-between">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </Portal>
  );
};

// 9. Layout Primitives
export const Flex = ({ 
  children, 
  className, 
  col = false, 
  between = false, 
  center = false,
  itemsCenter = true,
  gap = 4,
  ...props 
}: { 
  children: ReactNode; 
  className?: string; 
  col?: boolean; 
  between?: boolean; 
  center?: boolean;
  itemsCenter?: boolean;
  gap?: number;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      'flex',
      col ? 'flex-col' : 'flex-row',
      between && 'justify-between',
      center && 'justify-center items-center',
      itemsCenter && !center && 'items-center',
      `gap-${gap}`,
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

export const Grid = ({ 
  children, 
  className, 
  cols = 1,
  gap = 6,
  ...props 
}: { 
  children: ReactNode; 
  className?: string; 
  cols?: number | string;
  gap?: number;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn('grid', `grid-cols-${cols}`, `gap-${gap}`, className)} 
    {...props}
  >
    {children}
  </div>
);

export const Container = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-8 animate-in fade-in duration-500', className)} {...props} />
);

// 10. Divider
export const Divider = ({ className, vertical = false }: { className?: string; vertical?: boolean }) => (
  <div className={cn(
    vertical ? 'w-px h-full bg-[var(--border-subtle)]' : 'h-px w-full bg-[var(--border-subtle)]',
    className
  )} />
);

// 11. Data Table Primitive (AI Data Grid Standard)
export interface Column<T> {
  header: string;
  accessor: string | ((data: T, index: number) => React.ReactNode) | ((data: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  className?: string;
  editable?: boolean;
  width?: number;
  flex?: number;
  pinned?: 'left' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  onCellValueChanged?: (params: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  pinnedBottomRowData?: any[];
  singleClickEdit?: boolean;
  overlayNoRowsTemplate?: string;
  rowHeight?: number;
  headerHeight?: number;
  onRowDoubleClicked?: (params: any) => void;
  pagination?: boolean;
  paginationPageSize?: number;
  cellSelection?: boolean;
  className?: string;
  pinnedTopRowData?: any[];
}

export function DataTable<T>({ 
  data, 
  columns, 
  onRowClick,
  onCellValueChanged,
  loading = false,
  emptyMessage = 'No records found',
  pinnedBottomRowData,
  pinnedTopRowData,
  singleClickEdit = false,
  overlayNoRowsTemplate,
  rowHeight = 45,
  headerHeight = 38,
  onRowDoubleClicked,
  className,
  pagination = false,
  paginationPageSize = 20,
  cellSelection = false
}: DataTableProps<T>) {
  const { isInstitutional } = useTheme();
  
  const agColumns: ColDef[] = React.useMemo(() => {
    return columns.map((col: any) => {
      const isStringAccessor = typeof col.accessor === 'string';
      const isFnAccessor = typeof col.accessor === 'function';
      return {
        headerName: col.header,
        field: col.field || (isStringAccessor ? col.accessor : undefined),
        cellRenderer: isFnAccessor ? (params: any) => {
          if (!params.data) return null;
          return col.accessor(params.data, params.node.rowIndex);
        } : undefined,
        // Only use valueGetter when there's NO string field — avoids AG Grid v33 conflict
        valueGetter: undefined,
        editable: col.editable,
        width: col.width,
        sortable: true,
        filter: true,
        resizable: true,
        flex: col.flex || (col.width ? undefined : 1),
        pinned: col.pinned,
        cellClass: cn(
          'font-medium text-[13px]',
          col.align === 'center' && 'text-center',
          col.align === 'right' && 'text-right',
          col.className
        ),
        headerClass: cn(
          'font-black text-[10px] uppercase tracking-widest',
          col.align === 'center' && 'text-center',
          col.align === 'right' && 'text-right'
        )
      };
    });
  }, [columns]);

  const defaultColDef = useMemo(() => ({
    suppressMovable: true,
    cellClass: 'flex items-center'
  }), []);

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface)] shadow-inner", className)}>
      <div className={cn("w-full h-full min-h-[300px]", isInstitutional ? "ag-theme-quartz" : "ag-theme-quartz-dark")} >
        <AgGridReact
          theme={themeQuartz}
          rowData={loading ? [] : data}
          columnDefs={agColumns}
          defaultColDef={defaultColDef}
          rowHeight={rowHeight}
          headerHeight={headerHeight}
          onRowClicked={(params) => onRowClick?.(params.data)}
          onRowDoubleClicked={onRowDoubleClicked}
          onCellValueChanged={onCellValueChanged}
          pinnedBottomRowData={pinnedBottomRowData}
          pinnedTopRowData={pinnedTopRowData}
          singleClickEdit={singleClickEdit}
          overlayNoRowsTemplate={overlayNoRowsTemplate || `<div class="p-8 text-center opacity-30 font-black uppercase tracking-[0.4em]">${emptyMessage}</div>`}
          suppressCellFocus={false}
          animateRows={true}
          rowSelection={{ mode: 'singleRow' }}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          cellSelection={cellSelection}
        />
      </div>
    </div>
  );
}

// 12. KPI Component
export const KPI = ({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  className 
}: { 
  label: string; 
  value: string | number; 
  icon?: any; 
  trend?: 'up' | 'down'; 
  trendValue?: string;
  className?: string;
}) => (
  <Card className={cn("p-8 relative overflow-hidden group", className)}>
    <Flex between className="mb-6">
      {Icon && (
        <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center">
          <Icon size={24} />
        </div>
      )}
      {trend && (
        <Badge variant={trend === 'up' ? 'success' : 'error'}>
          {trendValue}
        </Badge>
      )}
    </Flex>
    <div>
      <Text variant="h1" className="text-4xl">{value}</Text>
      <Text variant="xs" className="mt-2 block font-black opacity-40">{label}</Text>
    </div>
  </Card>
);
