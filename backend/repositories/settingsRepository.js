import { GoogleSheetsRepository } from './googleSheetsRepository.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';

const mapRowToSetting = (row) => ({
  KEY:   row[0] || '',
  VALUE: row[1] || '',
});

class SettingsRepository extends GoogleSheetsRepository {
  async getAll() {
    const rows = await this.readAllRows(SHEET_NAMES.SETTINGS);
    if (rows.length <= 1) return []; // Skip header row
    return rows.slice(1).map(mapRowToSetting);
  }

  async get(key) {
    const list = await this.getAll();
    const found = list.find(s => s.KEY === key);
    return found ? found.VALUE : null;
  }

  async set(key, value) {
    const list = await this.getAll();
    const exists = list.some(s => s.KEY === key);
    
    const row = [key, value ?? ''];

    if (exists) {
      // Key ada di index 0
      await this.updateRow(SHEET_NAMES.SETTINGS, 0, key, row);
    } else {
      await this.writeRow(SHEET_NAMES.SETTINGS, row);
    }
  }

  async remove(key) {
    const row = [key, ''];
    // Gunakan updateRow dengan value kosong untuk reset value key
    await this.updateRow(SHEET_NAMES.SETTINGS, 0, key, row);
  }
}

export const settingsRepository = new SettingsRepository();
