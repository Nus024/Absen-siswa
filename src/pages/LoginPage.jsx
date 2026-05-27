// ============================================================
// pages/LoginPage.jsx — Premium institutional login
// ============================================================
import { useState } from 'react';

export function LoginPage({ onLogin }) {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="login-shell">
      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-icon">📷</div>
          <div>
            <h1 className="login-app-name">Absensi Siswa QR</h1>
            <p className="login-app-sub">Sistem Absensi Berbasis QR Code</p>
          </div>
        </div>

        {/* Form */}
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                className="field-input"
                placeholder="Masukkan username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="field" style={{ marginBottom: 24 }}>
              <label className="field-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="field-input"
                placeholder="Masukkan password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-xl btn-full"
              disabled={loading || !form.username || !form.password}
            >
              {loading
                ? <><span className="spinner" />&ensp;Masuk…</>
                : 'Masuk ke Sistem'
              }
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div className="login-demo">
          <strong>Akun Demo</strong><br />
          Admin: <code>admin</code> / <code>admin123</code><br />
          TU: <code>tu</code> / <code>tu123</code>&nbsp;&nbsp;
          Wali: <code>wali</code> / <code>wali123</code>
        </div>
      </div>
    </div>
  );
}
