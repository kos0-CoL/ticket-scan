import styles from './Badge.module.css';
import type { HTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'accent' | 'muted' | 'outline' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show dot indicator */
  dot?: boolean;
  /** Dot color override */
  dotColor?: string;
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-3 py-0.5 text-xs',
  lg: 'px-4 py-1 text-sm',
};

export const Badge = Object.assign(
  (({
    variant = 'muted',
    size = 'md',
    dot = false,
    dotColor,
    children,
    className = '',
    ...props
  }: BadgeProps) => (
    <span
      className={`${styles.badge} ${styles[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {dot && <span className={styles.dot} style={{ backgroundColor: dotColor }} />}
      {children}
    </span>
  )) as ForwardRefExoticComponent<BadgeProps & RefAttributes<HTMLSpanElement>>,
  { displayName: 'Badge' }
);

Badge.displayName = 'Badge';

/** Status badge with semantic naming */
export const StatusBadge = Object.assign(
  (({
    status,
    label,
    size = 'md',
    className = '',
  }: { status: 'active' | 'inactive' | 'pending' | 'error' | 'warning' | 'success'; label?: string; size?: BadgeSize; className?: string }) => {
    const variants: Record<typeof status, BadgeVariant> = {
      active: 'success',
      inactive: 'muted',
      pending: 'warning',
      error: 'danger',
      warning: 'warning',
      success: 'success',
    };
    const dots: Record<typeof status, boolean> = {
      active: true,
      inactive: true,
      pending: true,
      error: true,
      warning: true,
      success: true,
    };

    return (
      <Badge variant={variants[status]} size={size} dot={dots[status]} className={className}>
        {label || status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }) as ForwardRefExoticComponent<{ status: 'active' | 'inactive' | 'pending' | 'error' | 'warning' | 'success'; label?: string; size?: BadgeSize; className?: string } & RefAttributes<HTMLSpanElement>>,
  { displayName: 'StatusBadge' }
);

StatusBadge.displayName = 'StatusBadge';