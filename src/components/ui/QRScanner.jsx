import React from 'react';
import styles from './QRScanner.module.css';

export default function QRScanner({ status = 'idle', message, children }) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.frame} ${styles[status]}`}>
        {/* corner brackets */}
        <span className={`${styles.corner} ${styles.tl}`} />
        <span className={`${styles.corner} ${styles.tr}`} />
        <span className={`${styles.corner} ${styles.bl}`} />
        <span className={`${styles.corner} ${styles.br}`} />

        {/* The actual video element will be rendered here by the scanner logic */}
        {children}

        {/* scan line */}
        {status === 'scanning' && <div className={styles.scanLine} />}

        {/* icon overlay untuk success/error */}
        {status === 'success' && (
          <div className={styles.overlay}>
            <span className={styles.successIcon}>✓</span>
          </div>
        )}
        {status === 'error' && (
          <div className={`${styles.overlay} ${styles.overlayError}`}>
            <span className={styles.errorIcon}>✕</span>
          </div>
        )}
      </div>

      {message && (
        <p className={`${styles.message} ${styles[`msg-${status}`]}`}>
          {message}
        </p>
      )}
    </div>
  );
}
