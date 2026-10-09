'use client';
import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';
import type { HTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';
import { Button } from './Button';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the modal is open */
  open: boolean;
  /** Called when user clicks backdrop or presses Escape */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show close button */
  showClose?: boolean;
  /** Children (modal body) */
  children: React.ReactNode;
  /** Footer actions */
  footer?: React.ReactNode;
  /** Prevent closing on backdrop click */
  preventCloseOnBackdrop?: boolean;
  /** Prevent closing on Escape */
  preventCloseOnEscape?: boolean;
}

export const Modal = Object.assign(
  (({
    open,
    onClose,
    title,
    size = 'md',
    showClose = true,
    children,
    footer,
    preventCloseOnBackdrop = false,
    preventCloseOnEscape = false,
    className = '',
    ...props
  }: ModalProps) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !preventCloseOnEscape) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [open, preventCloseOnEscape, onClose]);

    if (!open) return null;

    const sizeClass = size === 'sm' ? styles.cardSm : size === 'lg' ? styles.cardLg : '';

    return (
      <div
        className={`${styles.backdrop} ${className}`}
        onClick={e => {
          if (e.target === e.currentTarget && !preventCloseOnBackdrop) {
            onClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        {...props}
      >
        <div
          ref={contentRef}
          className={`${styles.card} ${sizeClass} ${styles.animateIn}`}
          onClick={e => e.stopPropagation()}
        >
          {(title || showClose) && (
            <div className={styles.header}>
              {title && <h2 id="modal-title" className={styles.title}>{title}</h2>}
              {showClose && (
                <button
                  type="button"
                  className={styles.close}
                  onClick={onClose}
                  aria-label="Cerrar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    );
  }) as ForwardRefExoticComponent<ModalProps & RefAttributes<HTMLDivElement>>,
  { displayName: 'Modal' }
);

Modal.displayName = 'Modal';

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

export const ConfirmModal = Object.assign(
  (({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'primary',
    loading = false,
  }: ConfirmModalProps) => (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p style={{ color: 'var(--color-700)', lineHeight: 1.6 }}>{message}</p>
      <div slot="footer">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )) as ForwardRefExoticComponent<ConfirmModalProps & RefAttributes<HTMLDivElement>>,
  { displayName: 'ConfirmModal' }
);

ConfirmModal.displayName = 'ConfirmModal';