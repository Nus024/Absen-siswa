// ============================================================
// App.jsx — root dengan layout shell premium + Supabase auth
// ============================================================
import { Component, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/ui/Layout';
import { ThemeProvider } from './hooks/useTheme';

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ScannerPage = lazy(() => import('./pages/ScannerPage').then(m => ({ default: m.ScannerPage })));
const RekapHarianPage = lazy(() => import('./pages/RekapHarianPage').then(m => ({ default: m.RekapHarianPage })));
const RekapBulananPage = lazy(() => import('./pages/RekapBulananPage').then(m => ({ default: m.RekapBulananPage })));
const IzinKeluarPage = lazy(() => import('./pages/IzinKeluarPage').then(m => ({ default: m.IzinKeluarPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const QRManagementPage = lazy(() => import('./pages/QRManagementPage').then(m => ({ default: m.QRManagementPage })));

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, i) { console.error('App Error:', e, i); }
  render() {
    if (this.state.error) return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'system-ui', padding: 32
      }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{
            background: '#FFF0EE', border: '1px solid #FFC9C5',
            borderRadius: 16, padding: '28px 28px',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#D70015', marginBottom: 8 }}>Terjadi Kesalahan</h2>
            <pre style={{
              fontSize: 12, color: '#555', whiteSpace: 'pre-wrap',
              wordBreak: 'break-word', background: '#fff',
              padding: 12, borderRadius: 8, border: '1px solid #eee',
              marginBottom: 20,
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              style={{
                background: '#007AFF', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 24px', fontSize: 14,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
    return this.props.children;
  }
}

export default function App() {
  const { user, login, logout } = useAuth();

  return (
    <ThemeProvider>
      {!user ? (
        <ErrorBoundary>
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><span className="spinner" /></div>}>
            <LoginPage onLogin={login} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <ErrorBoundary>
          <BrowserRouter>
            <Layout user={user} onLogout={logout}>
              <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><span className="spinner" /></div>}>
                <Routes>
                  <Route path="/"             element={<Navigate to="/scanner" replace />} />
                  <Route path="/login"        element={<Navigate to="/scanner" replace />} />
                  <Route path="/scanner"      element={<ScannerPage user={user} />} />
                  <Route path="/rekap-harian" element={<RekapHarianPage user={user} />} />
                  <Route path="/rekap-bulanan" element={<RekapBulananPage user={user} />} />
                  <Route path="/izin-keluar"  element={<IzinKeluarPage user={user} />} />
                  <Route path="/qr"           element={<QRManagementPage user={user} />} />
                  <Route path="/atur"         element={<AdminPage user={user} onLogout={logout} />} />
                  <Route path="*"             element={<Navigate to="/scanner" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
        </ErrorBoundary>
      )}
    </ThemeProvider>
  );
}
