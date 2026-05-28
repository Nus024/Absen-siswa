// ============================================================
// hooks/useAuth.js — Custom auth via Supabase (Opsi B)
// Username + password, diverifikasi dengan pgcrypto RPC
// ============================================================
import { useState, useCallback, useEffect } from 'react';
import { usersService } from '../lib/db/users';

const SESSION_KEY = 'absensi_session_v2';

function getStoredSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function storeSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearStoredSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function useAuth() {
  const [user, setUser]       = useState(() => getStoredSession());
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(true);

  // Login via Supabase custom auth (username + password hashed dengan pgcrypto)
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const found = await usersService.login(username, password);
      if (found) {
        const u = {
          id:            found.id,
          nama:          found.nama,
          username:      found.username,
          role:          found.role,
          kelas_ids:     found.kelas_ids     ?? [],
          tingkat_akses: found.tingkat_akses ?? [],
        };
        storeSession(u);
        setUser(u);
        return { ok: true };
      }
      return { ok: false, error: 'Username atau password salah' };
    } catch (err) {
      console.error('Login error:', err);
      return { ok: false, error: 'Gagal terhubung ke server. Periksa koneksi internet.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setUser(null);
  }, []);

  return { user, login, logout, loading, authReady };
}
