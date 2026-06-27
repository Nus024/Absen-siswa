import { useState, useEffect } from 'react';
import { ScanFace, User, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../hooks/useTheme';
import { settingsDB } from '../lib/db/settings';

export function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  const [schoolName, setSchoolName] = useState(localStorage.getItem('school_name') || 'Absensi Siswa');
  const [schoolLogo, setSchoolLogo] = useState(localStorage.getItem('school_logo') || '');

  // Load nama & logo dari Google Sheets REST API saat pertama kali buka halaman login
  useEffect(() => {
    settingsDB.getAll().then(s => {
      if (s.school_name) setSchoolName(s.school_name);
      if (s.school_logo !== undefined) setSchoolLogo(s.school_logo || '');
    });
  }, []);


  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await onLogin(form.username, form.password);
      if (!result?.ok) {
        setError(result?.error || 'Login gagal');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: 'var(--space-6)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background var(--transition-base)'
    }}>
      {/* Background ambient gradient */}
      <div style={{
        position: 'absolute', width: '700px', height: '700px',
        background: 'radial-gradient(circle, var(--color-primary-400) 0%, transparent 70%)',
        top: '-15%', left: '-10%', filter: 'blur(120px)', opacity: theme === 'dark' ? 0.12 : 0.18, zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        background: 'radial-gradient(circle, var(--color-primary-300) 0%, transparent 70%)',
        bottom: '-15%', right: '-10%', filter: 'blur(120px)', opacity: theme === 'dark' ? 0.08 : 0.12, zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        <Card
          padding="lg"
          style={{
            borderRadius: '24px',
            boxShadow: theme === 'dark'
              ? '0 24px 48px -12px rgba(0, 0, 0, 0.45), 0 0 1px 1px var(--border-default)'
              : '0 24px 48px -12px rgba(0, 0, 0, 0.06), 0 0 1px 1px var(--border-default)',
            border: 'none',
            padding: 'var(--login-card-padding, 40px 36px)',
            background: 'var(--bg-card)',
            transition: 'background var(--transition-base), box-shadow var(--transition-base)'
          }}
        >
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: 68, height: 68, margin: '0 auto 20px',
              background: 'var(--color-primary-500)', borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 10px 25px -4px var(--color-primary-300)',
              overflow: 'hidden',
              border: '3.5px solid var(--bg-card)',
              transition: 'border-color var(--transition-base), box-shadow var(--transition-base)'
            }}>
              {schoolLogo ? (
                <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ScanFace size={36} strokeWidth={1.75} />
              )}
            </div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
              lineHeight: 1.25,
              margin: 0
            }}>
              {schoolName}
            </h1>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginTop: 6,
              fontWeight: 500
            }}>
              Silakan masuk untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--color-danger)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ flexShrink: 0 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Input
              id="login-username"
              placeholder="Username"
              icon={<User size={18} />}
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoFocus
              autoComplete="username"
            />

            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              icon={<KeyRound size={18} />}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                    outline: 'none',
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <Button
              id="login-submit"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading || !form.username || !form.password}
              style={{ marginTop: 8, height: '46px', borderRadius: '12px' }}
            >
              Masuk
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
