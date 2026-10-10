import styles from './Textarea.module.css';
import type { TextareaProps } from '../types';

export function Textarea({ label, error, hint, characterCount, className = '', ...props }: TextareaProps) {
  const maxLength = typeof props.maxLength === 'number' ? props.maxLength : undefined;
  const valueLength = typeof props.value === 'string' ? props.value.length : 0;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.textareaWrapper}>
        <textarea
          className={`${styles.textarea} ${error ? styles.error : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          {...props}
        />
        {characterCount && maxLength && (
          <span className={styles.counter}>
            {valueLength}/{maxLength}
          </span>
        )}
      </div>
      {error && <p id={`${props.id}-error`} className={styles.errorText} role="alert">{error}</p>}
      {hint && !error && <p id={`${props.id}-hint`} className={styles.hint}>{hint}</p>}
    </div>
  );
}