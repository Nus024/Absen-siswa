import { GoogleSheetsRepository } from './googleSheetsRepository.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';
import { getIsoString } from '../helpers/dateHelper.js';

const mapRowToClass = (row) => ({
  KELAS_ID:   row[0] || '',
  TINGKAT:    row[1] || '',
  NAMA:       row[2] || '',
  WALI_KELAS: row[3] || '',
  STATUS:     row[4] || '',
  CREATED_AT: row[5] || '',
  UPDATED_AT: row[6] || '',
});

const mapClassToRow = (cls) => [
  cls.KELAS_ID || '',
  cls.TINGKAT || '',
  cls.NAMA || '',
  cls.WALI_KELAS || '',
  cls.STATUS || '',
  cls.CREATED_AT || '',
  cls.UPDATED_AT || '',
];

class ClassRepository extends GoogleSheetsRepository {
  async getAll() {
    const rows = await this.readAllRows(SHEET_NAMES.KELAS);
    if (rows.length <= 1) return []; // Skip header row
    return rows.slice(1).map(mapRowToClass);
  }

  async getById(id) {
    const list = await this.getAll();
    return list.find(c => c.KELAS_ID === id) || null;
  }

  async create(cls) {
    const row = mapClassToRow({
      ...cls,
      STATUS: cls.STATUS || 'ACTIVE',
      CREATED_AT: getIsoString(),
      UPDATED_AT: getIsoString(),
    });
    await this.writeRow(SHEET_NAMES.KELAS, row);
    return mapRowToClass(row);
  }

  async update(id, updateData) {
    const list = await this.getAll();
    const existing = list.find(c => c.KELAS_ID === id);
    if (!existing) throw new Error('Kelas tidak ditemukan');

    const updated = {
      ...existing,
      ...updateData,
      UPDATED_AT: getIsoString(),
    };

    const row = mapClassToRow(updated);
    // Kolom KELAS_ID di index 0
    await this.updateRow(SHEET_NAMES.KELAS, 0, id, row);
    return updated;
  }
}

export const classRepository = new ClassRepository();
