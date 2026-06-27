import { apiClient } from '../../api/apiClient';

export const izinService = {
  async getAll() {
    return apiClient.get('/permissions');
  },

  async getAktif() {
    return apiClient.get('/permissions/active');
  },

  async getByTanggal(tanggal) {
    return apiClient.get(`/permissions?date=${tanggal}`);
  },

  async create(payload) {
    return apiClient.post('/permissions', {
      siswa_id:   payload.siswa_id,
      alasan:     payload.alasan,
      petugas_id: payload.petugas_id
    });
  },

  async kembali(id) {
    return apiClient.put(`/permissions/${id}/kembali`);
  },
};
