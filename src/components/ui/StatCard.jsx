import React from 'react';
import styles from './StatCard.module.css';

export default function StatCard({ label, value, icon, trend, color = 'green' }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.top}>
        <div className={styles.iconWrap}>{icon}</div>
        {trend && (
          <span className={`${styles.trend} ${trend.value >= 0 ? styles.up : styles.down}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {trend && <div className={styles.trendLabel}>{trend.label}</div>}
    </div>
  );
}
