import styles from './Table.module.css';
import type { Column, TableProps, Column as ColumnType } from '../types';

export function Table<T>({
  columns,
  data,
  keyExtractor,
  hover = true,
  divide = true,
  emptyMessage = 'No hay datos',
  loading = false,
  onRowClick,
  rowClassName,
  className = '',
  ...props
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={`${styles.wrapper} ${className}`} {...props}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={styles.th} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className={styles.loading}>
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" strokeWidth="3" />
                  </svg>
                  <span>Cargando...</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`${styles.wrapper} ${className}`} {...props}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={styles.th} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${className}`} {...props}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.stickyHeader}>
            {columns.map(col => (
              <th key={col.key} className={styles.th} style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`${divide ? styles.divideY : ''} ${hover ? styles.hoverRow : ''}`}>
          {data.map((row, index) => (
            <tr
              key={keyExtractor(row)}
              className={rowClassName ? rowClassName(row) : ''}
              onClick={() => onRowClick?.(row)}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map(col => (
                <td key={col.key} className={`${styles.td} ${col.className || ''}`}>
                  {col.render ? col.render(row, index) : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.displayName = 'Table';

/** Simple cell components for common patterns */
export const Cell = {
  mono: ({ children }: { children: React.ReactNode }) => (
    <span className={styles.mono}>{children}</span>
  ),
  medium: ({ children }: { children: React.ReactNode }) => (
    <span className={styles.cellMedium}>{children}</span>
  ),
  muted: ({ children }: { children: React.ReactNode }) => (
    <span className={styles.textMuted}>{children}</span>
  ),
  actions: ({ children }: { children: React.ReactNode }) => (
    <div className={styles.actions}>{children}</div>
  ),
  badge: ({ children, variant = 'muted' }: { children: React.ReactNode; variant?: 'success' | 'muted' | 'primary' | 'danger' }) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      muted: 'bg-slate-100 text-slate-700',
      primary: 'bg-primary-light text-primary-dark',
      danger: 'bg-red-100 text-red-800',
      default: 'bg-slate-100 text-slate-700',
    };
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>{children}</span>;
  },
};