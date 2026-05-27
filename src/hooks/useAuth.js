// ============================================================
// hooks/useAuth.js — Authentication state management
// ============================================================
import { useState, useCallback } from 'react';
import { authDB } from '../lib/localDB';

export function useAuth() {
  const [user, setUser] = useState(() => authDB.getSession());

  const login = useCallback((username, password) => {
    const found = authDB.login(username, password);
    if (found) {
      const u = { id: found.id, nama: found.nama, username: found.username, role: found.role };
      authDB.setSession(u);
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: 'Username atau password salah' };
  }, []);

  const logout = useCallback(() => {
    authDB.clearSession();
    setUser(null);
  }, []);

  return { user, login, logout };
}
