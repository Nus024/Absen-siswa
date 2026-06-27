import { GoogleSheetsRepository } from './googleSheetsRepository.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';
import { getIsoString } from '../helpers/dateHelper.js';

const mapRowToHistory = (row) => ({
  ID:          row[0] || '',
  SISWA_ID:    row[1] || '',
  OLD_TOKEN:   row[2] || '',
  NEW_TOKEN:   row[3] || '',
  VERSION:     parseInt(row[4] || '1', 10),
  REASON:      row[5] || '',
  UPDATED_BY:  row[6] || '',
  UPDATED_AT:  row[7] || '',
});

const mapHistoryToRow = (h) => [
  h.ID || '',
  h.SISWA_ID || '',
  h.OLD_TOKEN || '',
  h.NEW_TOKEN || '',
  h.VERSION !== undefined ? String(h.VERSION) : '1',
  h.REASON || '',
  h.UPDATED_BY || '',
  h.UPDATED_AT || '',
];

class QrHistoryRepository extends GoogleSheetsRepository {
  async getAll() {
    const rows = await this.readAllRows(SHEET_NAMES.QR_HISTORY);
    if (rows.length <= 1) return []; // Skip header
    return rows.slice(1).map(mapRowToHistory);
  }

  async create(history) {
    const row = mapHistoryToRow({
      ...history,
      UPDATED_AT: getIsoString(),
    });
    await this.writeRow(SHEET_NAMES.QR_HISTORY, row);
    return mapRowToHistory(row);
  }
}

export const qrHistoryRepository = new QrHistoryRepository();
