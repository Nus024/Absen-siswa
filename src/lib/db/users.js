import { apiClient } from '../../api/apiClient';

export const usersService = {
  // Login: Verifikasi kredensial lewat POST /auth/login
  async login(username, password) {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) return null;
      const result = await response.json();
      if (!result.success) return null;
      
      // Gabungkan objek user dan token JWT agar disimpan utuh oleh Auth hook
      return {
        id:            result.user.USER_ID || result.user.id,
        nama:          result.user.NAME || result.user.nama,
        username:      result.user.USERNAME || result.user.username,
        role:          result.user.ROLE || result.user.role,
        kelas_ids:     result.user.KELAS_IDS || result.user.kelas_ids || [],
        token:         result.token,
      };
    } catch (err) {
      console.error('API login error:', err);
      return null;
    }
  },

  async getAll() {
    const list = await apiClient.get('/users');
    return (list || []).map(u => ({
      id:         u.USER_ID,
      nama:       u.NAME,
      username:   u.USERNAME,
      role:       u.ROLE,
      created_at: u.CREATED_AT
    }));
  },

  async getById(id) {
    const u = await apiClient.get(`/users/${id}`);
    return {
      id:       u.USER_ID,
      nama:     u.NAME,
      username: u.USERNAME,
      role:     u.ROLE
    };
  },

  async create(payload) {
    const u = await apiClient.post('/users', {
      username: payload.username,
      password: payload.password,
      nama:     payload.nama,
      role:     payload.role
    });
    return {
      id:       u.USER_ID,
      nama:     u.NAME,
      username: u.USERNAME,
      role:     u.ROLE
    };
  },

  async update(id, payload) {
    const u = await apiClient.put(`/users/${id}`, {
      username: payload.username,
      password: payload.password,
      nama:     payload.nama,
      role:     payload.role
    });
    return {
      id:       u.USER_ID,
      nama:     u.NAME,
      username: u.USERNAME,
      role:     u.ROLE
    };
  },

  async delete(id) {
    await apiClient.delete(`/users/${id}`);
  }
};
