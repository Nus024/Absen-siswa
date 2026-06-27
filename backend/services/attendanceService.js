import { attendanceRepository } from '../repositories/attendanceRepository.js';
import { cacheManager } from '../cache/CacheManager.js';
import { getTodayStr, getIsoString } from '../helpers/dateHelper.js';
import { logger } from '../config/logger.js';
import crypto from 'crypto';

// Helper untuk join data siswa dan sesi ke data absensi
const joinAttendanceDetails = (item) => {
  const students = cacheManager.getStudents();
  const sessions = cacheManager.getSessions();
  const classes = cacheManager.getClasses();

  const studentObj = students.find(s => s.SISWA_ID === item.SISWA_ID);
  let studentData = null;
  if (studentObj) {
    const classObj = classes.find(c => c.KELAS_ID === studentObj.KELAS_ID);
    studentData = {
      id:       studentObj.SISWA_ID,
      nis:      studentObj.NIS,
      nama:     studentObj.NAMA,
      kelas_id: studentObj.KELAS_ID,
      kelas:    classObj ? { id: classObj.KELAS_ID, nama: classObj.NAMA } : null,
    };
  }

  const sessionObj = sessions.find(s => s.SESI_ID === item.SESI_ID);
  const sessionData = sessionObj ? {
    id:          sessionObj.SESI_ID,
    nama:        sessionObj.NAMA,
    jam_mulai:   sessionObj.JAM_MULAI,
    jam_selesai: sessionObj.JAM_SELESAI,
    urutan:      sessionObj.URUTAN,
  } : null;

  return {
    id:          item.ABSENSI_ID,
    siswa_id:    item.SISWA_ID,
    sesi_id:     item.SESI_ID,
    tanggal:     item.TANGGAL,
    status:      item.STATUS,
    waktu_scan:  item.WAKTU_SCAN,
    petugas_id:  item.PETUGAS,
    device:      item.DEVICE,
    sync_status: item.SYNC_STATUS,
    catatan:     item.CATATAN,
    created_at:  item.CREATED_AT,
    siswa:       studentData,
    sesi:        sessionData,
  };
};

export const attendanceService = {
  async getByTanggal(tanggal) {
    const list = await attendanceRepository.getAll();
    return list
      .filter(a => a.TANGGAL === tanggal)
      .map(joinAttendanceDetails);
  },

  async getByTanggalSesi(tanggal, sesiId) {
    const list = await attendanceRepository.getAll();
    return list
      .filter(a => a.TANGGAL === tanggal && a.SESI_ID === sesiId)
      .map(joinAttendanceDetails);
  },

  async getByTanggalKelas(tanggal, kelasId) {
    const list = await attendanceRepository.getAll();
    const students = cacheManager.getStudents().filter(s => s.KELAS_ID === kelasId);
    const studentIds = students.map(s => s.SISWA_ID);

    return list
      .filter(a => a.TANGGAL === tanggal && studentIds.includes(a.SISWA_ID))
      .map(joinAttendanceDetails);
  },

  async getByMonth(year, month) {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to   = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const list = await attendanceRepository.getAll();
    return list
      .filter(a => a.TANGGAL >= from && a.TANGGAL <= to)
      .map(joinAttendanceDetails);
  },

  async getBySiswaMonth(siswaId, year, month) {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to   = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const list = await attendanceRepository.getAll();
    return list
      .filter(a => a.SISWA_ID === siswaId && a.TANGGAL >= from && a.TANGGAL <= to)
      .map(joinAttendanceDetails);
  },

  async getBySiswaDateRange(siswaId, startDateStr, endDateStr) {
    const list = await attendanceRepository.getAll();
    return list
      .filter(a => a.SISWA_ID === siswaId && a.TANGGAL >= startDateStr && a.TANGGAL <= endDateStr)
      .map(joinAttendanceDetails);
  },

  async getBySiswaIdsDateRange(siswaIds, startDateStr, endDateStr) {
    const list = await attendanceRepository.getAll();
    return list
      .filter(a => siswaIds.includes(a.SISWA_ID) && a.TANGGAL >= startDateStr && a.TANGGAL <= endDateStr)
      .map(joinAttendanceDetails);
  },

  async getByDateRange(startDateStr, endDateStr) {
    const list = await attendanceRepository.getAll();
    return list
      .filter(a => a.TANGGAL >= startDateStr && a.TANGGAL <= endDateStr)
      .map(joinAttendanceDetails);
  },

  async existsScan(siswaId, sesiId, tanggal) {
    return attendanceRepository.exists(siswaId, sesiId, tanggal);
  },

  async create(payload) {
    const tanggal = payload.tanggal || getTodayStr();
    const exists = await this.existsScan(payload.siswa_id, payload.sesi_id, tanggal);
    if (exists) {
      throw new Error('Siswa sudah melakukan presensi pada sesi ini.');
    }

    const list = await attendanceRepository.getAll();
    const newAtt = {
      ABSENSI_ID:  `ABS${String(list.length + 1).padStart(6, '0')}`,
      TANGGAL:     tanggal,
      SISWA_ID:    payload.siswa_id,
      SESI_ID:     payload.sesi_id,
      STATUS:      payload.status || 'hadir',
      WAKTU_SCAN:  payload.waktu_scan || getIsoString(),
      PETUGAS:     payload.petugas_id || '',
      DEVICE:      payload.device || '',
      SYNC_STATUS: 'SYNCED',
      CATATAN:     payload.catatan || '',
    };

    const created = await attendanceRepository.create(newAtt);
    logger.info(`Absensi berhasil dibuat untuk siswa ID: ${payload.siswa_id}`);
    return joinAttendanceDetails(created);
  },

  async update(id, payload) {
    const updated = await attendanceRepository.update(id, payload);
    logger.info(`Absensi ID: ${id} berhasil diperbarui`);
    return joinAttendanceDetails(updated);
  },

  async delete(id) {
    // Pada Google Sheets, untuk pencatatan transaksi absensi kita bisa gunakan soft delete / hapus baris
    // Karena tidak ada kaskade otomatis, kita gunakan update status menjadi DELETED / hapus baris.
    // Demi keamanan data audit log, kita set status = 'DELETED'
    const updated = await attendanceRepository.update(id, { STATUS: 'DELETED' });
    logger.audit('SYSTEM', 'DELETE_ATTENDANCE', `Menghapus data absensi ID ${id}`);
    return updated;
  },

  async bulkCreate(items) {
    const list = await attendanceRepository.getAll();
    let currentIdx = list.length + 1;

    const formatted = items.map(it => ({
      ABSENSI_ID:  `ABS${String(currentIdx++).padStart(6, '0')}`,
      TANGGAL:     it.tanggal || getTodayStr(),
      SISWA_ID:    it.siswa_id,
      SESI_ID:     it.sesi_id,
      STATUS:      it.status || 'hadir',
      WAKTU_SCAN:  it.waktu_scan || getIsoString(),
      PETUGAS:     it.petugas_id || '',
      DEVICE:      it.device || '',
      SYNC_STATUS: 'SYNCED',
      CATATAN:     it.catatan || '',
    }));

    const created = await attendanceRepository.bulkCreate(formatted);
    logger.audit('SYSTEM', 'BULK_CREATE_ATTENDANCE', `Bulk upload ${items.length} data absensi`);
    return created.map(joinAttendanceDetails);
  },

  async upsert(payload) {
    const list = await attendanceRepository.getAll();
    const existing = list.find(a =>
      a.SISWA_ID === payload.siswa_id &&
      a.SESI_ID === payload.sesi_id &&
      a.TANGGAL === payload.tanggal
    );

    if (existing) {
      const updated = await this.update(existing.ABSENSI_ID, {
        STATUS:  payload.status || 'hadir',
        CATATAN: payload.catatan || '',
      });
      return updated;
    } else {
      const newAtt = {
        ABSENSI_ID:  `ABS${String(list.length + 1).padStart(6, '0')}`,
        TANGGAL:     payload.tanggal,
        SISWA_ID:    payload.siswa_id,
        SESI_ID:     payload.sesi_id,
        STATUS:      payload.status || 'hadir',
        WAKTU_SCAN:  getIsoString(),
        PETUGAS:     payload.petugas_id || '',
        CATATAN:     payload.catatan || '',
      };
      const created = await attendanceRepository.create(newAtt);
      return joinAttendanceDetails(created);
    }
  }
};
