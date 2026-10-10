import styles from './Select.module.css';
import type { SelectProps, SelectOption } from '../types';

export function Select({ label, error, hint, options = [], placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        <select
          className={`${styles.select} ${error ? styles.error : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p id={`${props.id}-error`} className={styles.errorText} role="alert">{error}</p>}
      {hint && !error && <p id={`${props.id}-hint`} className={styles.hint}>{hint}</p>}
    </div>
  );
}