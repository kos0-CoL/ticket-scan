import type { ButtonHTMLAttributes, ForwardRefExoticComponent, RefAttributes, HTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'float';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  characterCount?: boolean;
};

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
  characterCount?: boolean;
};

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
};

export type CardVariant = 'default' | 'elevated' | 'outlined';
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padded?: boolean;
  elevated?: boolean;
  noHover?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'accent' | 'muted' | 'outline' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotColor?: string;
}

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'warning' | 'success';
  label?: string;
  size?: BadgeSize;
}

export type TabItem = {
  href: string;
  label: string;
  icon?: string;
  badge?: string | number;
};

export interface TabBarProps {
  items: TabItem[];
  pathname: string;
  hideOnPaths?: string[];
  className?: string;
}

export interface TabBarSpacerProps {
  className?: string;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface TableProps<T> extends HTMLAttributes<HTMLTableElement> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  hover?: boolean;
  divide?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

export interface Model {
  id: string;
  name: string;
  context_length: number;
  pricing: { input: number; output: number };
}

export interface ModelPickerProps {
  providerName: string;
  value: string;
  onChange: (modelId: string) => void;
  placeholder?: string;
  className?: string;
  showFreeOnly?: boolean;
  onError?: (error: Error) => void;
  onLoad?: (models: Model[]) => void;
  disabled?: boolean;
}