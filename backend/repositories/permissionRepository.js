import { GoogleSheetsRepository } from './googleSheetsRepository.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';
import { getIsoString } from '../helpers/dateHelper.js';

const mapRowToPermission = (row) => ({
  IZIN_ID:       row[0] || '',
  SISWA_ID:      row[1] || '',
  ALASAN:        row[2] || '',
  WAKTU_KELUAR:  row[3] || '',
  WAKTU_KEMBALI: row[4] || '',
  STATUS:        row[5] || '',
  PETUGAS:       row[6] || '',
  CATATAN:       row[7] || '',
});

const mapPermissionToRow = (perm) => [
  perm.IZIN_ID || '',
  perm.SISWA_ID || '',
  perm.ALASAN || '',
  perm.WAKTU_KELUAR || '',
  perm.WAKTU_KEMBALI || '',
  perm.STATUS || '',
  perm.PETUGAS || '',
  perm.CATATAN || '',
];

class PermissionRepository extends GoogleSheetsRepository {
  async getAll() {
    const rows = await this.readAllRows(SHEET_NAMES.IZIN);
    if (rows.length <= 1) return []; // Skip header row
    return rows.slice(1).map(mapRowToPermission);
  }

  async getById(id) {
    const list = await this.getAll();
    return list.find(p => p.IZIN_ID === id) || null;
  }

  async create(permission) {
    const row = mapPermissionToRow({
      ...permission,
      STATUS: permission.STATUS || 'keluar',
      WAKTU_KELUAR: permission.WAKTU_KELUAR || getIsoString(),
    });
    await this.writeRow(SHEET_NAMES.IZIN, row);
    return mapRowToPermission(row);
  }

  async update(id, updateData) {
    const list = await this.getAll();
    const existing = list.find(p => p.IZIN_ID === id);
    if (!existing) throw new Error('Izin tidak ditemukan');

    const updated = {
      ...existing,
      ...updateData,
    };

    const row = mapPermissionToRow(updated);
    // Kolom IZIN_ID di index 0
    await this.updateRow(SHEET_NAMES.IZIN, 0, id, row);
    return updated;
  }
}

export const permissionRepository = new PermissionRepository();
