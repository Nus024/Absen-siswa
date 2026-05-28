# 🎓 Design System — Aplikasi Absensi QR Sekolah
> React / Next.js · Tema Hijau Edu · Responsif · Modern & Clean

---

## 📦 Instalasi Font

Tambahkan di `app/layout.tsx` atau `pages/_app.tsx`:

```tsx
// app/layout.tsx
import { Plus_Jakarta_Sans, DM_Mono } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
})

const mono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

---

## 🎨 Design Tokens — `globals.css`

Tempel seluruh blok ini di `app/globals.css` atau `styles/globals.css`:

```css
/* ============================================
   DESIGN TOKENS — Absensi QR
   ============================================ */

:root {
  /* --- Font --- */
  --font-sans:    'Plus Jakarta Sans', sans-serif;
  --font-mono:    'DM Mono', monospace;

  /* --- Warna Primer (Hijau Edu) --- */
  --color-primary-50:   #f0fdf4;
  --color-primary-100:  #dcfce7;
  --color-primary-200:  #bbf7d0;
  --color-primary-300:  #86efac;
  --color-primary-400:  #4ade80;
  --color-primary-500:  #22c55e;   /* ← brand utama */
  --color-primary-600:  #16a34a;
  --color-primary-700:  #15803d;
  --color-primary-800:  #166534;
  --color-primary-900:  #14532d;

  /* --- Netral --- */
  --color-neutral-0:    #ffffff;
  --color-neutral-50:   #f8fafc;
  --color-neutral-100:  #f1f5f9;
  --color-neutral-200:  #e2e8f0;
  --color-neutral-300:  #cbd5e1;
  --color-neutral-400:  #94a3b8;
  --color-neutral-500:  #64748b;
  --color-neutral-600:  #475569;
  --color-neutral-700:  #334155;
  --color-neutral-800:  #1e293b;
  --color-neutral-900:  #0f172a;

  /* --- Status --- */
  --color-success:      #22c55e;
  --color-warning:      #f59e0b;
  --color-danger:       #ef4444;
  --color-info:         #3b82f6;

  /* --- Semantik Permukaan --- */
  --bg-page:            var(--color-neutral-50);
  --bg-card:            var(--color-neutral-0);
  --bg-sidebar:         var(--color-neutral-0);
  --bg-header:          var(--color-neutral-0);
  --border-default:     var(--color-neutral-200);
  --border-focus:       var(--color-primary-500);
  --text-primary:       var(--color-neutral-900);
  --text-secondary:     var(--color-neutral-500);
  --text-muted:         var(--color-neutral-400);
  --text-inverse:       var(--color-neutral-0);

  /* --- Tipografi --- */
  --text-xs:    0.75rem;    /* 12px */
  --text-sm:    0.875rem;   /* 14px */
  --text-base:  1rem;       /* 16px */
  --text-lg:    1.125rem;   /* 18px */
  --text-xl:    1.25rem;    /* 20px */
  --text-2xl:   1.5rem;     /* 24px */
  --text-3xl:   1.875rem;   /* 30px */
  --text-4xl:   2.25rem;    /* 36px */

  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  --leading-tight:   1.25;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  /* --- Spasi (8pt grid) --- */
  --space-1:  0.25rem;   /* 4px  */
  --space-2:  0.5rem;    /* 8px  */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  /* --- Border Radius --- */
  --radius-sm:   0.375rem;  /* 6px  */
  --radius-md:   0.5rem;    /* 8px  */
  --radius-lg:   0.75rem;   /* 12px */
  --radius-xl:   1rem;      /* 16px */
  --radius-2xl:  1.5rem;    /* 24px */
  --radius-full: 9999px;

  /* --- Shadow --- */
  --shadow-xs:  0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05);

  /* --- Layout --- */
  --header-height:      64px;
  --sidebar-width:      256px;
  --sidebar-collapsed:  72px;
  --content-max-width:  1280px;
  --content-padding:    var(--space-6);

  /* --- Transisi --- */
  --transition-fast:    150ms ease;
  --transition-base:    200ms ease;
  --transition-slow:    300ms ease;
  --transition-spring:  300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ============================================
   BASE RESET
   ============================================ */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background-color: var(--bg-page);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 🧱 Komponen Utama

### 1. Layout Wrapper — `components/Layout.tsx`

```tsx
// components/Layout.tsx
import styles from './Layout.module.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        {/* Sidebar content */}
      </aside>
      <div className={styles.main}>
        <header className={styles.header}>
          {/* Header content */}
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
```

```css
/* components/Layout.module.css */

.root {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}

/* ---- SIDEBAR ---- */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: sticky;
  top: 0;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-4);
  overflow-y: auto;
  transition: width var(--transition-slow);
  flex-shrink: 0;
}

/* ---- MAIN AREA ---- */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* ---- HEADER ---- */
.header {
  height: var(--header-height);
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: var(--shadow-xs);
}

/* ---- CONTENT ---- */
.content {
  flex: 1;
  padding: var(--space-8) var(--space-6);
  max-width: var(--content-max-width);
  width: 100%;
  margin-inline: auto;
}

/* ============================================
   RESPONSIF
   ============================================ */

/* Tablet: sembunyikan sidebar label, hanya ikon */
@media (max-width: 1024px) {
  .sidebar {
    width: var(--sidebar-collapsed);
    padding: var(--space-6) var(--space-3);
    align-items: center;
  }
  .content {
    padding: var(--space-6) var(--space-4);
  }
}

/* Mobile: sidebar jadi bottom nav */
@media (max-width: 640px) {
  .root {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: unset;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border-right: none;
    border-top: 1px solid var(--border-default);
    z-index: 100;
    background: var(--bg-card);
  }
  .main {
    padding-bottom: 72px; /* ruang untuk bottom nav */
  }
  .header {
    padding: 0 var(--space-4);
    height: 56px;
  }
  .content {
    padding: var(--space-4);
  }
}
```

---

### 2. Header — `components/Header.tsx`

```tsx
// components/Header.tsx
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
```

```css
/* components/Header.module.css */

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
}

.left {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-normal);
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

/* Mobile */
@media (max-width: 640px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: var(--space-6);
  }
  .title {
    font-size: var(--text-xl);
  }
  .actions {
    width: 100%;
  }
  .actions > * {
    flex: 1;
  }
}
```

---

### 3. Button — `components/Button.tsx`

```tsx
// components/Button.tsx
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : icon ? (
        <span className={styles.icon}>{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  )
}
```

```css
/* components/Button.module.css */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: var(--font-semibold);
  border: 1.5px solid transparent;
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
  white-space: nowrap;
  text-decoration: none;
  outline: none;
}

.btn:focus-visible {
  box-shadow: 0 0 0 3px var(--color-primary-200);
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- Sizes --- */
.sm {
  font-size: var(--text-xs);
  padding: var(--space-2) var(--space-3);
  height: 32px;
  border-radius: var(--radius-md);
}

.md {
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-5);
  height: 40px;
}

.lg {
  font-size: var(--text-base);
  padding: var(--space-3) var(--space-6);
  height: 48px;
  border-radius: var(--radius-xl);
}

/* --- Variants --- */
.primary {
  background: var(--color-primary-500);
  color: var(--text-inverse);
  border-color: var(--color-primary-500);
}
.primary:hover:not(:disabled) {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
  box-shadow: var(--shadow-sm);
}

.secondary {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-color: var(--color-primary-200);
}
.secondary:hover:not(:disabled) {
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
}

.ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border-default);
}
.ghost:hover:not(:disabled) {
  background: var(--color-neutral-100);
  color: var(--text-primary);
}

.danger {
  background: #fef2f2;
  color: var(--color-danger);
  border-color: #fecaca;
}
.danger:hover:not(:disabled) {
  background: #fee2e2;
}

/* --- Modifiers --- */
.fullWidth {
  width: 100%;
}

/* --- Spinner --- */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon {
  display: flex;
  align-items: center;
  width: 18px;
  height: 18px;
}
```

---

### 4. Card — `components/Card.tsx`

```tsx
// components/Card.tsx
import styles from './Card.module.css'

interface CardProps {
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  className?: string
}

export default function Card({
  children,
  padding = 'md',
  hoverable = false,
  className = '',
}: CardProps) {
  return (
    <div
      className={[
        styles.card,
        styles[`pad-${padding}`],
        hoverable ? styles.hoverable : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
```

```css
/* components/Card.module.css */

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

.pad-sm  { padding: var(--space-4); }
.pad-md  { padding: var(--space-6); }
.pad-lg  { padding: var(--space-8); }

.hoverable {
  cursor: pointer;
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}
.hoverable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Mobile: kurangi padding */
@media (max-width: 640px) {
  .pad-lg { padding: var(--space-5); }
  .pad-md { padding: var(--space-4); }
}
```

---

### 5. Stat Card (Dashboard) — `components/StatCard.tsx`

```tsx
// components/StatCard.tsx
import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; label: string }
  color?: 'green' | 'blue' | 'amber' | 'red'
}

export default function StatCard({ label, value, icon, trend, color = 'green' }: StatCardProps) {
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
  )
}
```

```css
/* components/StatCard.module.css */

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  box-shadow: var(--shadow-xs);
  position: relative;
  overflow: hidden;
}

/* accent strip kiri */
.card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  border-radius: var(--radius-full) 0 0 var(--radius-full);
}

.green::before  { background: var(--color-primary-500); }
.blue::before   { background: var(--color-info); }
.amber::before  { background: var(--color-warning); }
.red::before    { background: var(--color-danger); }

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.iconWrap {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.green  .iconWrap { background: var(--color-primary-50);  color: var(--color-primary-600); }
.blue   .iconWrap { background: #eff6ff; color: var(--color-info); }
.amber  .iconWrap { background: #fffbeb; color: var(--color-warning); }
.red    .iconWrap { background: #fef2f2; color: var(--color-danger); }

.value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.04em;
}

.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.trend {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
}

.up   { background: var(--color-primary-50);  color: var(--color-primary-700); }
.down { background: #fef2f2; color: var(--color-danger); }

.trendLabel {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Grid responsif untuk stat cards */
.statsGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@media (max-width: 1024px) {
  .statsGrid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .statsGrid { grid-template-columns: 1fr; }
  .value { font-size: var(--text-2xl); }
}
```

---

### 6. Table — `components/Table.tsx`

```tsx
// components/Table.tsx
import styles from './Table.module.css'

interface Column<T> {
  key: keyof T | string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (row: T) => string | number
}

export default function Table<T>({
  columns,
  data,
  loading,
  emptyMessage = 'Belum ada data',
  keyExtractor,
}: TableProps<T>) {
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
              data.map((row) => (
                <tr key={keyExtractor(row)} className={styles.tr}>
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={styles.td}
                      style={{ textAlign: col.align ?? 'left' }}
                    >
                      {col.render
                        ? col.render((row as any)[col.key], row)
                        : String((row as any)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

```css
/* components/Table.module.css */

.wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
}

/* horizontal scroll di mobile tanpa merusak layout */
.scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

/* --- Thead --- */
.th {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  background: var(--color-neutral-50);
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;
  user-select: none;
}

/* --- Tbody rows --- */
.tr {
  border-bottom: 1px solid var(--color-neutral-100);
  transition: background var(--transition-fast);
}

.tr:last-child {
  border-bottom: none;
}

.tr:hover {
  background: var(--color-primary-50);
}

/* --- Cells --- */
.td {
  padding: var(--space-4) var(--space-5);
  color: var(--text-primary);
  vertical-align: middle;
  white-space: nowrap;
}

/* --- Empty state --- */
.empty {
  padding: var(--space-16) var(--space-4);
}

.emptyInner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-muted);
}

.emptyIcon {
  font-size: 2.5rem;
}

/* --- Loading skeleton --- */
.skeleton {
  height: 16px;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-neutral-100) 25%,
    var(--color-neutral-200) 50%,
    var(--color-neutral-100) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Mobile */
@media (max-width: 640px) {
  .th, .td {
    padding: var(--space-3) var(--space-4);
  }
}
```

---

### 7. Badge / Chip Status — `components/Badge.tsx`

```tsx
// components/Badge.tsx
import styles from './Badge.module.css'

type BadgeVariant = 'hadir' | 'izin' | 'sakit' | 'alpha' | 'terlambat' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
}

export default function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      <span className={styles.dot} />
      {children}
    </span>
  )
}
```

```css
/* components/Badge.module.css */

.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 3px var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  white-space: nowrap;
  line-height: 1.6;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Variant: hadir */
.hadir {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
}
.hadir .dot { background: var(--color-primary-500); }

/* Variant: izin */
.izin {
  background: #eff6ff;
  color: #1d4ed8;
}
.izin .dot { background: #3b82f6; }

/* Variant: sakit */
.sakit {
  background: #fffbeb;
  color: #92400e;
}
.sakit .dot { background: var(--color-warning); }

/* Variant: alpha */
.alpha {
  background: #fef2f2;
  color: #991b1b;
}
.alpha .dot { background: var(--color-danger); }

/* Variant: terlambat */
.terlambat {
  background: #fff7ed;
  color: #9a3412;
}
.terlambat .dot { background: #f97316; }

/* Variant: default */
.default {
  background: var(--color-neutral-100);
  color: var(--text-secondary);
}
.default .dot { background: var(--color-neutral-400); }
```

---

### 8. Input & Form Field — `components/Input.tsx`

```tsx
// components/Input.tsx
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export default function Input({ label, error, hint, icon, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={styles.field}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          id={inputId}
          className={[styles.input, icon ? styles.withIcon : '', error ? styles.hasError : ''].join(' ')}
          {...props}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
```

```css
/* components/Input.module.css */

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.inputWrap {
  position: relative;
}

.icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  pointer-events: none;
  width: 18px;
  height: 18px;
}

.input {
  width: 100%;
  height: 42px;
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background: var(--bg-card);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-lg);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input::placeholder {
  color: var(--text-muted);
}

.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.withIcon {
  padding-left: calc(var(--space-3) + 18px + var(--space-2));
}

.hasError {
  border-color: var(--color-danger);
}
.hasError:focus {
  box-shadow: 0 0 0 3px #fee2e2;
}

.error {
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
}
```

---

### 9. QR Scanner UI — `components/QRScanner.tsx`

```tsx
// components/QRScanner.tsx
import styles from './QRScanner.module.css'

interface QRScannerProps {
  onScan?: (result: string) => void
  status?: 'idle' | 'scanning' | 'success' | 'error'
  message?: string
}

export default function QRScanner({ status = 'idle', message }: QRScannerProps) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.frame} ${styles[status]}`}>
        {/* corner brackets */}
        <span className={`${styles.corner} ${styles.tl}`} />
        <span className={`${styles.corner} ${styles.tr}`} />
        <span className={`${styles.corner} ${styles.bl}`} />
        <span className={`${styles.corner} ${styles.br}`} />

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
  )
}
```

```css
/* components/QRScanner.module.css */

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

/* kotak utama scanner */
.frame {
  position: relative;
  width: min(280px, 80vw);
  aspect-ratio: 1;
  background: var(--color-neutral-900);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  transition: box-shadow var(--transition-base);
}

.frame.scanning {
  box-shadow: 0 0 0 3px var(--color-primary-400), var(--shadow-xl);
}
.frame.success {
  box-shadow: 0 0 0 3px var(--color-success), var(--shadow-xl);
}
.frame.error {
  box-shadow: 0 0 0 3px var(--color-danger), var(--shadow-xl);
}

/* corner brackets */
.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: var(--color-primary-400);
  border-style: solid;
  z-index: 2;
}

.tl { top: 16px; left: 16px;  border-width: 3px 0 0 3px; border-radius: 6px 0 0 0; }
.tr { top: 16px; right: 16px; border-width: 3px 3px 0 0; border-radius: 0 6px 0 0; }
.bl { bottom: 16px; left: 16px;  border-width: 0 0 3px 3px; border-radius: 0 0 0 6px; }
.br { bottom: 16px; right: 16px; border-width: 0 3px 3px 0; border-radius: 0 0 6px 0; }

/* scan line animasi */
.scanLine {
  position: absolute;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-primary-400) 40%,
    var(--color-primary-300) 50%,
    var(--color-primary-400) 60%,
    transparent 100%
  );
  border-radius: var(--radius-full);
  animation: scanMove 2s ease-in-out infinite;
  box-shadow: 0 0 8px var(--color-primary-400);
  z-index: 3;
}

@keyframes scanMove {
  0%   { top: 20%; }
  50%  { top: 75%; }
  100% { top: 20%; }
}

/* overlay success/error */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 163, 74, 0.2);
  backdrop-filter: blur(2px);
  animation: fadeIn 200ms ease;
  z-index: 4;
}

.overlayError {
  background: rgba(239, 68, 68, 0.2);
}

.successIcon, .errorIcon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  animation: popIn 300ms var(--transition-spring) both;
}

.successIcon {
  background: var(--color-primary-500);
  color: white;
}

.errorIcon {
  background: var(--color-danger);
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* message bawah scanner */
.message {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-align: center;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-full);
}

.msg-idle     { color: var(--text-secondary); background: var(--color-neutral-100); }
.msg-scanning { color: var(--color-primary-700); background: var(--color-primary-50); }
.msg-success  { color: var(--color-primary-700); background: var(--color-primary-50); }
.msg-error    { color: #991b1b; background: #fef2f2; }
```

---

## 📐 Grid Responsif — Utility Classes

Tambahkan di `globals.css`:

```css
/* ============================================
   GRID UTILITIES
   ============================================ */

.grid-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
  .grid-stats { grid-template-columns: repeat(2, 1fr); }
}

/* ============================================
   SPACING UTILITIES
   ============================================ */

.stack-4  { display: flex; flex-direction: column; gap: var(--space-4); }
.stack-6  { display: flex; flex-direction: column; gap: var(--space-6); }
.stack-8  { display: flex; flex-direction: column; gap: var(--space-8); }

.row-3    { display: flex; align-items: center; gap: var(--space-3); }
.row-4    { display: flex; align-items: center; gap: var(--space-4); }

.section  { margin-bottom: var(--space-10); }
```

---

## 🔤 Tipografi Hierarchy

```css
/* Tambahkan di globals.css */

h1, .h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

h2, .h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

h3, .h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

h4, .h4 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.body-sm   { font-size: var(--text-sm);  color: var(--text-primary); }
.body-xs   { font-size: var(--text-xs);  color: var(--text-secondary); }
.label-sm  { font-size: var(--text-xs);  font-weight: var(--font-semibold); text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); }
.mono      { font-family: var(--font-mono); font-size: var(--text-sm); }

@media (max-width: 640px) {
  h1, .h1 { font-size: var(--text-2xl); }
  h2, .h2 { font-size: var(--text-xl);  }
  h3, .h3 { font-size: var(--text-lg);  }
}
```

---

## ✅ Checklist Penerapan

| Item | File | Status |
|------|------|--------|
| Install font `Plus Jakarta Sans` + `DM Mono` | `app/layout.tsx` | ☐ |
| Paste semua design tokens | `globals.css` | ☐ |
| Ganti komponen Layout | `components/Layout.tsx` + `.module.css` | ☐ |
| Ganti semua tombol → `<Button>` | semua page | ☐ |
| Ganti semua tabel → `<Table>` | halaman absensi | ☐ |
| Pasang `<Badge>` untuk status hadir/izin/alpha | kolom status tabel | ☐ |
| Pasang `<StatCard>` di dashboard | `pages/dashboard.tsx` | ☐ |
| Pasang `<QRScanner>` | halaman scan | ☐ |
| Tambahkan grid & spacing utilities | `globals.css` | ☐ |
| Test di mobile 375px, tablet 768px, desktop 1280px | browser devtools | ☐ |

---

## 📱 Breakpoint Reference

| Nama | Lebar | Contoh Device |
|------|-------|---------------|
| `xs` | < 480px | HP kecil |
| `sm` | 480–640px | HP besar |
| `md` | 640–768px | Tablet kecil |
| `lg` | 768–1024px | Tablet / laptop kecil |
| `xl` | 1024–1280px | Laptop |
| `2xl` | > 1280px | Desktop |

```css
/* Cara pakai di CSS Module */
@media (max-width: 640px)  { /* mobile  */ }
@media (max-width: 1024px) { /* tablet  */ }
@media (min-width: 1280px) { /* desktop */ }
```

---

*Design System v1.0 — Aplikasi Absensi QR Sekolah*