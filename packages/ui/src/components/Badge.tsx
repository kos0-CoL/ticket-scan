import styles from './Badge.module.css';
import type { BadgeProps, StatusBadgeProps } from '../types';

export function Badge({
  variant = 'muted',
  size = 'md',
  dot = false,
  dotColor,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  };

  const variantClasses = {
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger,
    primary: styles.primary,
    accent: styles.accent,
    muted: styles.muted,
    outline: styles.outline,
    info: styles.info,
  };

  return (
    <span
      className={`${styles.badge} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={styles.dot}
          style={dotColor ? { backgroundColor: dotColor } : undefined}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    active: { variant: 'success', label: label || 'Activo' },
    inactive: { variant: 'muted', label: label || 'Inactivo' },
    pending: { variant: 'warning', label: label || 'Pendiente' },
    error: { variant: 'danger', label: label || 'Error' },
    warning: { variant: 'warning', label: label || 'Advertencia' },
    success: { variant: 'success', label: label || 'Éxito' },
  };

  const config = statusConfig[status] || statusConfig.muted;

  return <Badge variant={config.variant} size={size} dot>{config.label}</Badge>;
}