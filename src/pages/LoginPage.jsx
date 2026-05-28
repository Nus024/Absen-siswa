import { useState } from 'react';
import { ScanFace, User, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = onLogin(form.username, form.password);
    if (!result?.ok) {
      setError(result?.error || 'Login gagal');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-neutral-50)',
      padding: 'var(--space-6)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient gradient */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        background: 'radial-gradient(circle, var(--color-primary-200) 0%, transparent 60%)',
        top: '-20%', left: '-10%', filter: 'blur(80px)', opacity: 0.5, zIndex: 0
      }} />
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, var(--color-success) 0%, transparent 70%)',
        bottom: '-10%', right: '-10%', filter: 'blur(80px)', opacity: 0.1, zIndex: 0
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <Card padding="lg" style={{ boxShadow: 'var(--shadow-xl)' }}>
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: 56, height: 56, margin: '0 auto 20px',
              background: 'var(--color-primary-500)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.24)',
              overflow: 'hidden'
            }}>
              {localStorage.getItem('school_logo') ? (
                <img src={localStorage.getItem('school_logo')} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ScanFace size={32} strokeWidth={2} />
              )}
            </div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {localStorage.getItem('school_name') || 'Absensi Siswa'}
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 6 }}>
              Silakan masuk untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="stack-5">
            {error && (
              <div style={{
                padding: '12px 16px', background: 'var(--color-danger)', color: '#fff',
                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span>⚠️</span> {error}
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
                  }}
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
              style={{ marginTop: 8 }}
            >
              Masuk
            </Button>
          </form>


        </Card>
      </div>
    </div>
  );
}
