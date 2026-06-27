import { apiClient } from '../../api/apiClient';

const mapClass = (c) => {
  if (!c) return null;
  return {
    id:         c.KELAS_ID || c.id,
    tingkat:    c.TINGKAT || c.tingkat || '',
    nama:       c.NAMA || c.nama || '',
    wali_kelas: c.WALI_KELAS || c.wali_kelas || '',
    status:     c.STATUS || c.status || ''
  };
};

export const kelasService = {
  async getAll() {
    const list = await apiClient.get('/classes');
    return (list || []).map(mapClass);
  },

  async getById(id) {
    const c = await apiClient.get(`/classes/${id}`);
    return mapClass(c);
  },

  async create(payload) {
    const body = typeof payload === 'string' ? { nama: payload } : payload;
    const c = await apiClient.post('/classes', body);
    return mapClass(c);
  },

  async update(id, payload) {
    const body = typeof payload === 'string' ? { nama: payload } : payload;
    const c = await apiClient.put(`/classes/${id}`, body);
    return mapClass(c);
  },

  async delete(id) {
    await apiClient.delete(`/classes/${id}`);
  }
};
