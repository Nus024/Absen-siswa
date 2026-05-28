import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, QrCode, ClipboardList, Settings, LogOut } from 'lucide-react';
import styles from './Layout.module.css';

export default function Layout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [appName, setAppName] = useState(() => localStorage.getItem('school_name') || 'Absensi QR');
  const [appLogo, setAppLogo] = useState(() => localStorage.getItem('school_logo') || '');

  useEffect(() => {
    function handleUpdate() {
      setAppName(localStorage.getItem('school_name') || 'Absensi QR');
      setAppLogo(localStorage.getItem('school_logo') || '');
    }
    window.addEventListener('app_settings_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('app_settings_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const navItems = [
    { label: 'Scanner', icon: <QrCode size={20} />, path: '/scanner' },
    { label: 'Rekap Absensi', icon: <ClipboardList size={20} />, path: '/rekap' },
    { label: 'Izin / Keluar', icon: <Users size={20} />, path: '/izin-keluar' },
    { label: 'Pengaturan', icon: <Settings size={20} />, path: '/atur' },
  ];

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            {appLogo ? (
              <img src={appLogo} alt="Logo" className={styles.logoIcon} style={{ objectFit: 'cover' }} />
            ) : (
              <span className={styles.logoIcon}>
                {appName ? appName.charAt(0).toUpperCase() : 'A'}
              </span>
            )}
            <span className={styles.logoText}>{appName}</span>
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.path === '/rekap'
              ? location.pathname.startsWith('/rekap-harian') || location.pathname.startsWith('/rekap-bulanan')
              : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => navigate(item.path === '/rekap' ? '/rekap-harian' : item.path)}
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
