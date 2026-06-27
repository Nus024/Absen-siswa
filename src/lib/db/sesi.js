import { apiClient } from '../../api/apiClient';

const mapSession = (s) => {
  if (!s) return null;
  return {
    id:          s.SESI_ID || s.id,
    nama:        s.NAMA || s.nama || '',
    jam_mulai:   s.JAM_MULAI || s.jam_mulai || '',
    jam_selesai: s.JAM_SELESAI || s.jam_selesai || '',
    urutan:      s.URUTAN !== undefined ? s.URUTAN : s.urutan,
    status:      s.STATUS || s.status || ''
  };
};

export const sesiService = {
  async getAll() {
    const list = await apiClient.get('/sessions');
    return (list || []).map(mapSession);
  },

  async getById(id) {
    const s = await apiClient.get(`/sessions/${id}`);
    return mapSession(s);
  },

  async create(payload) {
    const s = await apiClient.post('/sessions', {
      nama:        payload.nama,
      jam_mulai:   payload.jam_mulai,
      jam_selesai: payload.jam_selesai,
      urutan:      payload.urutan
    });
    return mapSession(s);
  },

  async update(id, payload) {
    const s = await apiClient.put(`/sessions/${id}`, {
      nama:        payload.nama,
      jam_mulai:   payload.jam_mulai,
      jam_selesai: payload.jam_selesai,
      urutan:      payload.urutan
    });
    return mapSession(s);
  },

  async delete(id) {
    await apiClient.delete(`/sessions/${id}`);
  }
};
