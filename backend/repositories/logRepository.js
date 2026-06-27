import { GoogleSheetsRepository } from './googleSheetsRepository.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';
import { getIsoString } from '../helpers/dateHelper.js';

const mapRowToLog = (row) => ({
  LOG_ID:      row[0] || '',
  MODULE:      row[1] || '',
  ACTION:      row[2] || '',
  USER:        row[3] || '',
  DESCRIPTION: row[4] || '',
  IP:          row[5] || '',
  DEVICE:      row[6] || '',
  CREATED_AT:  row[7] || '',
});

const mapLogToRow = (log) => [
  log.LOG_ID || '',
  log.MODULE || '',
  log.ACTION || '',
  log.USER || '',
  log.DESCRIPTION || '',
  log.IP || '',
  log.DEVICE || '',
  log.CREATED_AT || '',
];

class LogRepository extends GoogleSheetsRepository {
  async getAll() {
    const rows = await this.readAllRows(SHEET_NAMES.LOGS);
    if (rows.length <= 1) return []; // Skip header
    return rows.slice(1).map(mapRowToLog);
  }

  async create(log) {
    const row = mapLogToRow({
      ...log,
      CREATED_AT: getIsoString(),
    });
    await this.writeRow(SHEET_NAMES.LOGS, row);
    return mapRowToLog(row);
  }
}

export const logRepository = new LogRepository();
