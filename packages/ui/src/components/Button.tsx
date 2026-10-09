import styles from './Button.module.css';
import type { ButtonHTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'float';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size */
  size?: ButtonSize;
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon to show before text */
  startIcon?: React.ReactNode;
  /** Icon to show after text */
  endIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
  float: styles.float,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  icon: styles.icon,
};

export const Button = Object.assign(
  (({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    startIcon,
    endIcon,
    children,
    disabled,
    className = '',
    ...props
  }: ButtonProps) => (
    <button
      className={`${styles.btn} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
      )}
      {!loading && startIcon && <span aria-hidden="true">{startIcon}</span>}
      <span>{children}</span>
      {!loading && endIcon && <span aria-hidden="true">{endIcon}</span>}
    </button>
  )) as ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>,
  { displayName: 'Button' }
);

Button.displayName = 'Button';