import React from 'react';
import styles from './Table.module.css';

export default function Table({
  columns,
  data,
  loading,
  emptyMessage = 'Belum ada data',
  keyExtractor,
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={styles.th}
                  style={{ width: col.width, textAlign: col.align ?? 'left' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.tr}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className={styles.td}>
                      <div className={styles.skeleton} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  <div className={styles.emptyInner}>
                    <span className={styles.emptyIcon}>📋</span>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={keyExtractor(row)} className={styles.tr}>
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={styles.td}
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {col.render
                        ? col.render(row[col.key], row, rowIndex)
                        : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
