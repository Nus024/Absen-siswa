import { GoogleSheetsRepository } from './googleSheetsRepository.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';

const mapRowToSession = (row) => ({
  SESI_ID:     row[0] || '',
  NAMA:        row[1] || '',
  JAM_MULAI:   row[2] || '',
  JAM_SELESAI: row[3] || '',
  URUTAN:      parseInt(row[4] || '1', 10),
  STATUS:      row[5] || '',
});

const mapSessionToRow = (session) => [
  session.SESI_ID || '',
  session.NAMA || '',
  session.JAM_MULAI || '',
  session.JAM_SELESAI || '',
  session.URUTAN !== undefined ? String(session.URUTAN) : '1',
  session.STATUS || '',
];

class SessionRepository extends GoogleSheetsRepository {
  async getAll() {
    const rows = await this.readAllRows(SHEET_NAMES.SESI);
    if (rows.length <= 1) return []; // Skip header row
    return rows.slice(1).map(mapRowToSession);
  }

  async getById(id) {
    const list = await this.getAll();
    return list.find(s => s.SESI_ID === id) || null;
  }

  async create(session) {
    const row = mapSessionToRow({
      ...session,
      STATUS: session.STATUS || 'ACTIVE',
    });
    await this.writeRow(SHEET_NAMES.SESI, row);
    return mapRowToSession(row);
  }

  async update(id, updateData) {
    const list = await this.getAll();
    const existing = list.find(s => s.SESI_ID === id);
    if (!existing) throw new Error('Sesi tidak ditemukan');

    const updated = {
      ...existing,
      ...updateData,
    };

    const row = mapSessionToRow(updated);
    // Kolom SESI_ID di index 0
    await this.updateRow(SHEET_NAMES.SESI, 0, id, row);
    return updated;
  }
}

export const sessionRepository = new SessionRepository();
