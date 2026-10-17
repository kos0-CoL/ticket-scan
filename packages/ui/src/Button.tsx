import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "float";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children?: ReactNode;
};

type TextButtonProps = BaseProps & { size?: "sm" | "md" | "lg" };
type IconButtonProps = BaseProps & { size: "icon"; "aria-label": string };

export type ButtonProps = TextButtonProps | IconButtonProps;

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  startIcon,
  endIcon,
  className,
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth ? "true" : undefined}
      aria-busy={loading ? "true" : undefined}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        startIcon
      )}
      <span className={styles.label}>{children}</span>
      {endIcon}
    </button>
  );
}