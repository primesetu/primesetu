import React, { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ... existing code ...

// 1. Button Primitive
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'pri' | 'sec' | 'ghost' | 'danger' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ 
  variant = 'pri', 
  size = 'md', 
  className, 
  ...props 
}: ButtonProps) => {
  const variants = {
    pri: 'bg-accent text-bg-base hover:bg-accent-hover shadow-lg shadow-accent/10',
    primary: 'bg-accent text-bg-base hover:bg-accent-hover shadow-lg shadow-accent/10', // Alias for pri
    sec: 'bg-bg-elevated border border-border-subtle text-text-primary hover:border-accent/40',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg-float hover:text-text-primary',
    danger: 'bg-status-red/10 text-status-red hover:bg-status-red/20 border border-status-red/20',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-10 py-4 text-sm',
  };

  return (
    <button 
      className={cn(
        'rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
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
        'w-full bg-bg-input border border-border-subtle rounded-xl px-5 py-3 text-sm font-medium text-text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-text-disabled',
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
      'w-full bg-bg-input border border-border-subtle rounded-xl px-5 py-3 text-sm font-bold text-text-primary outline-none focus:border-accent transition-all cursor-pointer appearance-none',
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
    className={cn('text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1', className)} 
    {...props} 
  />
);

// 5. Card / Container
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'outline';
  level?: number; // Legacy compatibility
}

export const Card = ({ variant = 'elevated', level, className, ...props }: CardProps) => {
  const variants = {
    elevated: 'bg-bg-elevated border border-border-subtle shadow-xl',
    flat: 'bg-bg-float/40 border border-border-subtle',
    outline: 'bg-transparent border border-border-subtle',
  };

  return (
    <div className={cn('rounded-[2rem]', variants[variant], className)} {...props} />
  );
};

// 6. Typography
interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'p' | 'xs' | 'sm' | 'label' | 'hint';
}

export const Text = ({ variant = 'p', className, ...props }: TextProps) => {
  const variants = {
    h1: 'text-3xl font-serif font-black tracking-tight text-text-primary uppercase',
    h2: 'text-xl font-serif font-black tracking-tight text-text-primary uppercase',
    h3: 'text-lg font-bold tracking-tight text-text-primary uppercase',
    p: 'text-sm font-medium text-text-secondary leading-relaxed',
    sm: 'text-xs font-medium text-text-secondary',
    hint: 'text-xs font-medium text-text-secondary', // Alias for sm
    xs: 'text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary',
    label: 'text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary', // Alias for xs
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
  const variants = {
    info: 'bg-accent/10 text-accent border-accent/20',
    warn: 'bg-status-amber/10 text-status-amber border-status-amber/20',
    error: 'bg-status-red/10 text-status-red border-status-red/20',
    success: 'bg-status-green/10 text-status-green border-status-green/20',
    muted: 'bg-bg-float text-text-tertiary border-border-subtle',
  };

  return (
    <span className={cn('px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border', variants[variant], className)}>
      {children}
    </span>
  );
};

// 8. Modal Overlay
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-bg-base/60 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className={cn("w-full h-fit max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-border-subtle", maxWidth)}>
        {/* Modal Header */}
        <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-bg-elevated/40">
           <div className="flex items-center gap-6">
              {icon && (
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
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
        <div className="flex-1 overflow-y-auto p-10 bg-bg-base/20">
           {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="p-8 border-t border-border-subtle bg-bg-elevated/40 flex items-center justify-between">
             {footer}
          </div>
        )}
      </Card>
    </div>
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
    vertical ? 'w-px h-full bg-border-subtle' : 'h-px w-full bg-border-subtle',
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
    <Card className="flex-1 flex flex-col overflow-hidden border-border-subtle bg-bg-elevated/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-bg-elevated/95 backdrop-blur-md z-10 border-b border-border-subtle">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={cn(
                  'px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.className
                )}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={columns.length} className="p-10">
                    <div className="h-10 bg-bg-float/40 rounded-xl" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-24 text-center opacity-10 font-black uppercase tracking-[0.5em] text-4xl">
                  {emptyMessage}
                </td>
              </tr>
            ) : data.map((item, i) => (
              <tr 
                key={i} 
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'group transition-all',
                  onRowClick ? 'cursor-pointer hover:bg-bg-float/20' : ''
                )}
              >
                {columns.map((col, j) => (
                  <td key={j} className={cn(
                    'px-8 py-6 text-sm font-medium text-text-secondary',
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
    </Card>
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
        <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
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
