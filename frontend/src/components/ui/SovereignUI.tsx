import React, { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ============================================================
   SMRITI-OS — Lead Frontend Architect UI Primitives
   Enforcing SMRITI Sentinal Governance (Audit Rule 11)
   ============================================================ */

// 1. Button Primitive
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'pri' | 'sec'; // pri/sec for legacy compat
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}: ButtonProps) => {
  // Normalize legacy variants
  const normalizedVariant = variant === 'pri' ? 'primary' : variant === 'sec' ? 'secondary' : variant;
  
  return (
    <button 
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
};

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
  variant?: 'info' | 'warn' | 'error' | 'success' | 'muted';
  className?: string;
}) => {
  const badgeMap = {
    info: 'c-badge--info',
    warn: 'c-badge--warning',
    error: 'c-badge--error',
    success: 'c-badge--success',
    muted: 'c-badge--muted',
  };

  return (
    <span className={cn('c-badge', badgeMap[variant], className)}>
      {children}
    </span>
  );
};

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

// 11. Data Table Primitive
interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function DataTable<T>({ 
  data, 
  columns, 
  onRowClick, 
  loading = false,
  emptyMessage = 'No records found'
}: { 
  data: T[]; 
  columns: Column<T>[]; 
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="c-card p-0 flex-1 flex flex-col overflow-hidden border-[var(--border-subtle)] bg-[var(--surface-elevated)]/10">
      <div className="overflow-x-auto">
        <table className="c-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={cn(
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.className
                )}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]/50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={columns.length} className="p-10">
                    <div className="h-10 bg-[var(--background)]/40 rounded-xl" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-24 text-center opacity-10 font-black u-uppercase tracking-[0.5em] text-4xl">
                  {emptyMessage}
                </td>
              </tr>
            ) : data.map((item, i) => (
              <tr 
                key={i} 
                onClick={() => onRowClick?.(item)}
                className={cn(
                  onRowClick ? 'cursor-pointer' : ''
                )}
              >
                {columns.map((col, j) => (
                  <td key={j} className={cn(
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.className
                  )}>
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
