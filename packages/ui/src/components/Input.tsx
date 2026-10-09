import styles from './Input.module.css';
import type { InputHTMLAttributes, ForwardRefExoticComponent, RefAttributes, TextareaHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Show character count */
  showCount?: boolean;
}

export const Input = Object.assign(
  (({
    label,
    error,
    hint,
    showCount,
    className = '',
    id,
    value,
    onChange,
    ...props
  }: InputProps) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <input
          id={inputId}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${errorId || ''} ${hintId || ''}`.trim() || undefined}
          value={value}
          onChange={onChange}
          {...props}
        />
        {error && <p id={errorId} className={styles.errorText} role="alert">{error}</p>}
        {hint && !error && <p id={hintId} className={styles.hintText}>{hint}</p>}
        {showCount && value && (
          <p className={styles.hintText} style={{ textAlign: 'right' }}>
            {typeof value === 'string' ? value.length : 0} caracteres
          </p>
        )}
      </div>
    );
  }) as ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>,
  { displayName: 'Input' }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
}

export const Textarea = Object.assign(
  (({
    label,
    error,
    hint,
    showCount,
    className = '',
    id,
    value,
    onChange,
    ...props
  }: TextareaProps) => {
    const inputId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
        <textarea
          id={inputId}
          className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${errorId || ''} ${hintId || ''}`.trim() || undefined}
          value={value}
          onChange={onChange}
          {...props}
        />
        {error && <p id={errorId} className={styles.errorText} role="alert">{error}</p>}
        {hint && !error && <p id={hintId} className={styles.hintText}>{hint}</p>}
        {showCount && value && (
          <p className={styles.hintText} style={{ textAlign: 'right' }}>
            {typeof value === 'string' ? value.length : 0} caracteres
          </p>
        )}
      </div>
    );
  }) as ForwardRefExoticComponent<TextareaProps & RefAttributes<HTMLTextAreaElement>>,
  { displayName: 'Textarea' }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = Object.assign(
  (({
    label,
    error,
    hint,
    options,
    placeholder,
    className = '',
    id,
    value,
    onChange,
    ...props
  }: SelectProps) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;

    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
        <select
          id={selectId}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${errorId || ''} ${hintId || ''}`.trim() || undefined}
          value={value}
          onChange={onChange}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p id={errorId} className={styles.errorText} role="alert">{error}</p>}
        {hint && !error && <p id={hintId} className={styles.hintText}>{hint}</p>}
      </div>
    );
  }) as ForwardRefExoticComponent<SelectProps & RefAttributes<HTMLSelectElement>>,
  { displayName: 'Select' }
);

Select.displayName = 'Select';