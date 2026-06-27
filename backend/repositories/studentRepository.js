import { GoogleSheetsRepository } from './googleSheetsRepository.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';
import { getIsoString } from '../helpers/dateHelper.js';

const mapRowToStudent = (row) => ({
  SISWA_ID:             row[0] || '',
  NIS:                  row[1] || '',
  NAMA:                 row[2] || '',
  KELAS_ID:             row[3] || '',
  QR_TOKEN:             row[4] || '',
  QR_VERSION:           parseInt(row[5] || '1', 10),
  QR_STATUS:            row[6] || '',
  LAST_SCAN:            row[7] || '',
  STATUS:               row[8] || '',
  CREATED_AT:           row[9] || '',
  UPDATED_AT:           row[10] || '',
});

const mapStudentToRow = (student) => [
  student.SISWA_ID || '',
  student.NIS || '',
  student.NAMA || '',
  student.KELAS_ID || '',
  student.QR_TOKEN || '',
  student.QR_VERSION !== undefined ? String(student.QR_VERSION) : '1',
  student.QR_STATUS || '',
  student.LAST_SCAN || '',
  student.STATUS || '',
  student.CREATED_AT || '',
  student.UPDATED_AT || '',
];

class StudentRepository extends GoogleSheetsRepository {
  async getAll() {
    const rows = await this.readAllRows(SHEET_NAMES.SISWA);
    if (rows.length <= 1) return []; // Skip header row
    return rows.slice(1).map(mapRowToStudent);
  }

  async getById(id) {
    const list = await this.getAll();
    return list.find(s => s.SISWA_ID === id) || null;
  }

  async getByNis(nis) {
    const list = await this.getAll();
    return list.find(s => s.NIS === nis) || null;
  }

  async getByQrToken(token) {
    const list = await this.getAll();
    return list.find(s => s.QR_TOKEN === token) || null;
  }

  async create(student) {
    const row = mapStudentToRow({
      ...student,
      QR_VERSION: student.QR_VERSION || 1,
      QR_STATUS: student.QR_STATUS || 'ACTIVE',
      STATUS: student.STATUS || 'ACTIVE',
      CREATED_AT: getIsoString(),
      UPDATED_AT: getIsoString(),
    });
    await this.writeRow(SHEET_NAMES.SISWA, row);
    return mapRowToStudent(row);
  }

  async update(id, updateData) {
    const list = await this.getAll();
    const existing = list.find(s => s.SISWA_ID === id);
    if (!existing) throw new Error('Siswa tidak ditemukan');

    const updated = {
      ...existing,
      ...updateData,
      UPDATED_AT: getIsoString(),
    };

    const row = mapStudentToRow(updated);
    // Kolom SISWA_ID di index 0
    await this.updateRow(SHEET_NAMES.SISWA, 0, id, row);
    return updated;
  }

  async bulkCreate(students) {
    const rows = students.map(s => mapStudentToRow({
      ...s,
      QR_VERSION: s.QR_VERSION || 1,
      QR_STATUS: s.QR_STATUS || 'ACTIVE',
      STATUS: s.STATUS || 'ACTIVE',
      CREATED_AT: getIsoString(),
      UPDATED_AT: getIsoString(),
    }));
    await this.batchWriteRows(SHEET_NAMES.SISWA, rows);
    return rows.map(mapRowToStudent);
  }
}

export const studentRepository = new StudentRepository();
