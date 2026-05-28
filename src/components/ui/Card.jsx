import React from 'react';
import styles from './Card.module.css';

export default function Card({
  children,
  padding = 'md',
  hoverable = false,
  className = '',
  style = {},
}) {
  return (
    <div
      className={[
        styles.card,
        styles[`pad-${padding}`],
        hoverable ? styles.hoverable : '',
        className,
      ].join(' ')}
      style={style}
    >
      {children}
    </div>
  );
}
