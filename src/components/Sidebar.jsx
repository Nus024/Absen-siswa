// ============================================================
// components/Sidebar.jsx — Premium frosted sidebar
// Lucide icons — konsisten dengan BottomNav
// ============================================================
import { NavLink } from 'react-router-dom';
import {
  ScanLine,
  LogOut as LogOutIcon,
  TableProperties,
  CalendarDays,
  QrCode,
  SlidersHorizontal,
  Wifi,
  WifiOff,
  TriangleAlert,
  LogOut as ExitIcon,
} from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

const NAV_GROUPS = [
  {
    label: 'Operasional',
    items: [
      { to: '/scanner',     Icon: ScanLine,    label: 'Scanner QR'   },
      { to: '/izin-keluar', Icon: LogOutIcon,  label: 'Izin Keluar'  },
    ],
  },
  {
    label: 'Laporan',
    items: [
      { to: '/rekap-harian',  Icon: TableProperties, label: 'Rekap Harian'  },
      { to: '/rekap-bulanan', Icon: CalendarDays,    label: 'Rekap Bulanan' },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { to: '/qr-management', Icon: QrCode,           label: 'Manajemen QR' },
      { to: '/admin',         Icon: SlidersHorizontal, label: 'Pengaturan'   },
    ],
  },
];

function Avatar({ name }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div style={{
      width: 32, height: 32,
      borderRadius: '50%',
      background: 'rgba(0,122,255,0.12)',
      border: '1.5px solid rgba(0,122,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, color: 'var(--blue)',
      flexShrink: 0, letterSpacing: 0,
    }}>
      {initials}
    </div>
  );
}

export function Sidebar({ user, onLogout }) {
  const { isOnline, queueCount } = useOfflineSync();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <ScanLine size={18} color="#fff" strokeWidth={2} />
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">Absensi QR</div>
          <div className="sidebar-brand-sub">Sistem Absensi Sekolah</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="nav-section-label">{group.label}</div>
            {group.items.map(({ to, Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <span className="nav-icon">
                      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Offline queue warning */}
        {queueCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            margin: '0 0 8px',
            padding: '8px 10px',
            background: 'rgba(255,159,10,0.08)',
            border: '1px solid rgba(255,159,10,0.18)',
            borderRadius: 8,
            fontSize: 12, fontWeight: 500, color: '#B25000',
          }}>
            <TriangleAlert size={13} strokeWidth={2} />
            {queueCount} scan dalam antrian
          </div>
        )}

        {/* User row */}
        <div className="sidebar-user">
          <Avatar name={user?.nama} />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.nama || 'User'}</div>
            <div className="sidebar-user-role">
              {user?.role?.replace(/_/g, ' ')}
            </div>
          </div>
          <div
            className={`sidebar-status-dot ${isOnline ? 'online' : 'offline'}`}
            title={isOnline ? 'Online' : 'Offline'}
          />
        </div>

        {/* Logout */}
        <button className="sidebar-logout" onClick={onLogout}>
          <ExitIcon size={13} strokeWidth={2} />
          Keluar dari Akun
        </button>
      </div>
    </aside>
  );
}
