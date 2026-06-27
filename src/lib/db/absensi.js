import { apiClient } from '../../api/apiClient';

export const absensiService = {
  async getByTanggal(tanggal) {
    return apiClient.get(`/attendance?date=${tanggal}`);
  },

  async getByTanggalSesi(tanggal, sesiId) {
    return apiClient.get(`/attendance?date=${tanggal}&session=${sesiId}`);
  },

  async getByTanggalKelas(tanggal, kelasId) {
    return apiClient.get(`/attendance?date=${tanggal}&class=${kelasId}`);
  },

  async getByMonth(year, month) {
    return apiClient.get(`/attendance?year=${year}&month=${month}`);
  },

  async getBySiswaMonth(siswaId, year, month) {
    return apiClient.get(`/attendance?student=${siswaId}&year=${year}&month=${month}`);
  },

  async getBySiswaDateRange(siswaId, startDateStr, endDateStr) {
    return apiClient.get(`/attendance?student=${siswaId}&start_date=${startDateStr}&end_date=${endDateStr}`);
  },

  async getBySiswaIdsDateRange(siswaIds, startDateStr, endDateStr) {
    const idsStr = Array.isArray(siswaIds) ? siswaIds.join(',') : siswaIds;
    return apiClient.get(`/attendance?student_ids=${idsStr}&start_date=${startDateStr}&end_date=${endDateStr}`);
  },

  async existsScan(siswaId, sesiId, tanggal) {
    const res = await apiClient.get(`/attendance/check-duplicate?student_id=${siswaId}&session_id=${sesiId}&date=${tanggal}`);
    return res?.exists || false;
  },

  async create(payload) {
    return apiClient.post('/attendance', {
      siswa_id:   payload.siswa_id,
      sesi_id:    payload.sesi_id,
      tanggal:    payload.tanggal,
      status:     payload.status,
      catatan:    payload.catatan,
      petugas_id: payload.petugas_id
    });
  },

  async update(id, payload) {
    return apiClient.put(`/attendance/${id}`, payload);
  },

  async delete(id) {
    await apiClient.delete(`/attendance/${id}`);
  },

  async bulkCreate(items) {
    const mapped = (items || []).map(it => ({
      siswa_id:   it.siswa_id,
      sesi_id:    it.sesi_id,
      tanggal:    it.tanggal,
      status:     it.status,
      catatan:    it.catatan,
      petugas_id: it.petugas_id
    }));
    return apiClient.post('/attendance/bulk', { items: mapped });
  },

  async upsert(payload) {
    // Di backend, attendanceService.upsert akan menangani logika ini
    return apiClient.post('/attendance', {
      siswa_id: payload.siswa_id,
      sesi_id:  payload.sesi_id,
      tanggal:  payload.tanggal,
      status:   payload.status || 'hadir',
      catatan:  payload.catatan || ''
    });
  },
};
