import React from 'react';
import styles from './Input.module.css';

export default function Input({ label, error, hint, icon, suffix, id, ...props }) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={styles.field}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          id={inputId}
          className={[
            styles.input,
            icon ? styles.withIcon : '',
            suffix ? styles.withSuffix : '',
            error ? styles.hasError : ''
          ].join(' ')}
          {...props}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
