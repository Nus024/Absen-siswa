import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, QrCode, ClipboardList, Settings, LogOut } from 'lucide-react';
import styles from './Layout.module.css';

export default function Layout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Scanner', icon: <QrCode size={20} />, path: '/scanner' },
    { label: 'Rekap Harian', icon: <ClipboardList size={20} />, path: '/rekap-harian' },
    { label: 'Rekap Bulanan', icon: <ClipboardList size={20} />, path: '/rekap-bulanan' },
    { label: 'Izin / Keluar', icon: <Users size={20} />, path: '/izin-keluar' },
    { label: 'Pengaturan', icon: <Settings size={20} />, path: '/atur' },
  ];

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>A</span>
            <span className={styles.logoText}>Absensi QR</span>
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
      <div className={styles.main}>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
