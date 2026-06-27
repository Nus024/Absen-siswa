import { apiClient } from '../../api/apiClient';

const LS_KEYS = {
  school_name: 'school_name',
  school_logo: 'school_logo',
};

export const settingsService = {
  async getAll() {
    try {
      const data = await apiClient.get('/settings');
      
      // Sinkronisasi ke localStorage sebagai cache local
      Object.entries(LS_KEYS).forEach(([key]) => {
        if (data[key] !== undefined) {
          if (data[key]) {
            localStorage.setItem(key, data[key]);
          } else {
            localStorage.removeItem(key);
          }
        }
      });

      return {
        school_name: data.school_name || '',
        school_logo: data.school_logo || '',
      };
    } catch (err) {
      console.warn('[settings] Gagal membaca pengaturan dari API, memakai cache lokal:', err.message);
      return {
        school_name: localStorage.getItem('school_name') || '',
        school_logo: localStorage.getItem('school_logo') || '',
      };
    }
  },

  async get(key) {
    try {
      const data = await apiClient.get('/settings');
      const val = data[key] ?? null;
      if (val) localStorage.setItem(key, val);
      else localStorage.removeItem(key);
      return val;
    } catch (err) {
      console.warn('[settings] Gagal memuat dari API, memakai cache lokal:', err.message);
      return localStorage.getItem(key) || null;
    }
  },

  async set(key, value) {
    try {
      await apiClient.post('/settings', { key, value });
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch (err) {
      console.warn('[settings] Gagal menyimpan ke API, menyimpan di lokal saja:', err.message);
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    }
  },

  async remove(key) {
    try {
      // Mengosongkan value key lewat endpoint POST /settings
      await apiClient.post('/settings', { key, value: '' });
      localStorage.removeItem(key);
    } catch (err) {
      console.warn('[settings] Gagal menghapus dari API:', err.message);
      localStorage.removeItem(key);
    }
  },
};

export const settingsDB = settingsService;
