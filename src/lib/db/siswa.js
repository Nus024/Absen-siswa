import { apiClient } from '../../api/apiClient';
import { kelasService } from './kelas';

const mapStudent = (s, classes = []) => {
  if (!s) return null;
  const clsId = s.KELAS_ID || s.kelas_id;
  const cls = classes.find(c => c.id === clsId || c.KELAS_ID === clsId);
  return {
    id:           s.SISWA_ID || s.id,
    nis:          s.NIS || s.nis,
    nama:         s.NAMA || s.nama,
    kelas_id:     clsId,
    qr_token:     s.QR_TOKEN || s.qr_token,
    qr_version:   s.QR_VERSION !== undefined ? s.QR_VERSION : s.qr_version,
    qr_status:    s.QR_STATUS || s.qr_status,
    last_scan_at: s.LAST_SCAN || s.last_scan_at,
    status:       s.STATUS || s.status,
    kelas:        cls ? { id: cls.id, nama: cls.nama } : null,
  };
};

export const siswaService = {
  async getAll() {
    const [students, classes] = await Promise.all([
      apiClient.get('/students'),
      kelasService.getAll()
    ]);
    return (students || []).map(s => mapStudent(s, classes));
  },

  async getByKelas(kelasId) {
    const [students, classes] = await Promise.all([
      apiClient.get(`/students?class_id=${kelasId}`),
      kelasService.getAll()
    ]);
    return (students || []).map(s => mapStudent(s, classes));
  },

  async getById(id) {
    const [s, classes] = await Promise.all([
      apiClient.get(`/students/${id}`),
      kelasService.getAll()
    ]);
    return mapStudent(s, classes);
  },

  async getByQrToken(token) {
    try {
      const [s, classes] = await Promise.all([
        apiClient.get(`/students/qr/${token}`),
        kelasService.getAll()
      ]);
      return mapStudent(s, classes);
    } catch {
      return null;
    }
  },

  async getByNis(nis) {
    try {
      const [s, classes] = await Promise.all([
        apiClient.get(`/students/nis/${nis}`),
        kelasService.getAll()
      ]);
      return mapStudent(s, classes);
    } catch {
      return null;
    }
  },

  async create(payload) {
    const s = await apiClient.post('/students', {
      nis:      payload.nis,
      nama:     payload.nama,
      kelas_id: payload.kelas_id
    });
    const classes = await kelasService.getAll();
    return mapStudent(s, classes);
  },

  async update(id, payload) {
    const formattedPayload = {};
    if (payload.nis !== undefined) formattedPayload.NIS = payload.nis;
    if (payload.nama !== undefined) formattedPayload.NAMA = payload.nama;
    if (payload.kelas_id !== undefined) formattedPayload.KELAS_ID = payload.kelas_id;
    if (payload.qr_token !== undefined) formattedPayload.QR_TOKEN = payload.qr_token;
    if (payload.qr_version !== undefined) formattedPayload.QR_VERSION = payload.qr_version;
    if (payload.qr_status !== undefined) formattedPayload.QR_STATUS = payload.qr_status;
    if (payload.last_scan_at !== undefined) formattedPayload.LAST_SCAN = payload.last_scan_at;
    if (payload.status !== undefined) formattedPayload.STATUS = payload.status;

    const s = await apiClient.put(`/students/${id}`, formattedPayload);
    const classes = await kelasService.getAll();
    return mapStudent(s, classes);
  },

  async delete(id) {
    await apiClient.delete(`/students/${id}`);
  },

  async regenerateQr(id, changedBy = null, reason = 'Regenerate manual oleh administrator') {
    const s = await apiClient.post(`/students/${id}/regenerate-qr`, { reason });
    const classes = await kelasService.getAll();
    return mapStudent(s, classes);
  },

  async updateLastScan(id) {
    await apiClient.put(`/students/${id}`, { LAST_SCAN: new Date().toISOString() });
  },

  async bulkCreate(rows) {
    const mapped = rows.map(r => ({
      nis:      String(r.nis || r.NIS),
      nama:     r.nama || r.NAMA,
      kelas_id: r.kelas_id || r.KELAS_ID
    }));
    const s = await apiClient.post('/students/import', { rows: mapped });
    const classes = await kelasService.getAll();
    return (s || []).map(item => mapStudent(item, classes));
  }
};
