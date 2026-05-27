// ============================================================
// components/BottomNav.jsx — iOS floating dock navigation
// Premium native-feel tab bar dengan Lucide icons
// ============================================================
import { NavLink } from 'react-router-dom';
import {
  ScanLine,
  TableProperties,
  CalendarDays,
  LogOut,
  QrCode,
  SlidersHorizontal,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/scanner',       Icon: ScanLine,           label: 'Scanner'  },
  { to: '/rekap-harian',  Icon: TableProperties,    label: 'Harian'   },
  { to: '/izin-keluar',   Icon: LogOut,             label: 'Izin'     },
  { to: '/qr-management', Icon: QrCode,             label: 'QR Code'  },
  { to: '/admin',         Icon: SlidersHorizontal,  label: 'Atur'     },
];

export function BottomNav() {
  return (
    <nav className="bnav-shell" aria-label="Navigasi utama">
      <div className="bnav-dock">
        {NAV_ITEMS.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bnav-tab${isActive ? ' is-active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <span className="bnav-icon-wrap">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    aria-hidden="true"
                  />
                </span>
                <span className="bnav-label">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
