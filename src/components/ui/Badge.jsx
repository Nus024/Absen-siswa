import React from 'react';
import styles from './Badge.module.css';

export default function Badge({ variant = 'default', children }) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      <span className={styles.dot} />
      {children}
    </span>
  );
}
