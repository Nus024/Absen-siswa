import { GoogleSheetsRepository } from './googleSheetsRepository.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';
import { getIsoString, getTodayStr } from '../helpers/dateHelper.js';

const mapRowToAttendance = (row) => ({
  ABSENSI_ID:  row[0] || '',
  TANGGAL:     row[1] || '',
  SISWA_ID:    row[2] || '',
  SESI_ID:     row[3] || '',
  STATUS:      row[4] || '',
  WAKTU_SCAN:  row[5] || '',
  PETUGAS:     row[6] || '',
  DEVICE:      row[7] || '',
  SYNC_STATUS: row[8] || '',
  CATATAN:     row[9] || '',
  CREATED_AT:  row[10] || '',
});

const mapAttendanceToRow = (att) => [
  att.ABSENSI_ID || '',
  att.TANGGAL || '',
  att.SISWA_ID || '',
  att.SESI_ID || '',
  att.STATUS || '',
  att.WAKTU_SCAN || '',
  att.PETUGAS || '',
  att.DEVICE || '',
  att.SYNC_STATUS || '',
  att.CATATAN || '',
  att.CREATED_AT || '',
];

class AttendanceRepository extends GoogleSheetsRepository {
  async getAll() {
    const rows = await this.readAllRows(SHEET_NAMES.ABSENSI);
    if (rows.length <= 1) return []; // Skip header row
    return rows.slice(1).map(mapRowToAttendance);
  }

  async getById(id) {
    const list = await this.getAll();
    return list.find(a => a.ABSENSI_ID === id) || null;
  }

  async create(attendance) {
    const row = mapAttendanceToRow({
      ...attendance,
      TANGGAL: attendance.TANGGAL || getTodayStr(),
      WAKTU_SCAN: attendance.WAKTU_SCAN || getIsoString(),
      CREATED_AT: getIsoString(),
    });
    await this.writeRow(SHEET_NAMES.ABSENSI, row);
    return mapRowToAttendance(row);
  }

  async update(id, updateData) {
    const list = await this.getAll();
    const existing = list.find(a => a.ABSENSI_ID === id);
    if (!existing) throw new Error('Data absensi tidak ditemukan');

    const updated = {
      ...existing,
      ...updateData,
    };

    const row = mapAttendanceToRow(updated);
    // Kolom ABSENSI_ID di index 0
    await this.updateRow(SHEET_NAMES.ABSENSI, 0, id, row);
    return updated;
  }

  async exists(studentId, sessionId, date) {
    const list = await this.getAll();
    return list.some(a => a.SISWA_ID === studentId && a.SESI_ID === sessionId && a.TANGGAL === date);
  }

  async bulkCreate(items) {
    const rows = items.map(item => mapAttendanceToRow({
      ...item,
      TANGGAL: item.TANGGAL || getTodayStr(),
      WAKTU_SCAN: item.WAKTU_SCAN || getIsoString(),
      CREATED_AT: getIsoString(),
    }));
    await this.batchWriteRows(SHEET_NAMES.ABSENSI, rows);
    return rows.map(mapRowToAttendance);
  }
}

export const attendanceRepository = new AttendanceRepository();
