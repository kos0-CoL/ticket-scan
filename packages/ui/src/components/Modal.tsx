import styles from './Modal.module.css';
import { Button } from './Button';
import type { ModalProps, ConfirmModalProps } from '../types';
import { useEffect } from 'react';

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  if (!open) return null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose, closeOnEscape]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) onClose();
  };

  const sizeClasses = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
    xl: styles.xl,
    full: styles.full,
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${sizeClasses[size]}`} role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          {showCloseButton && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} disabled={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}