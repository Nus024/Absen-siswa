import { GoogleSheetsRepository } from './googleSheetsRepository.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';
import { getIsoString } from '../helpers/dateHelper.js';

const mapRowToUser = (row) => ({
  USER_ID:       row[0] || '',
  USERNAME:      row[1] || '',
  PASSWORD:      row[2] || '',
  NAME:          row[3] || '',
  ROLE:          row[4] || '',
  STATUS:        row[5] || '',
  LAST_LOGIN:    row[6] || '',
  CREATED_AT:    row[7] || '',
  UPDATED_AT:    row[8] || '',
});

const mapUserToRow = (user) => [
  user.USER_ID || '',
  user.USERNAME || '',
  user.PASSWORD || '',
  user.NAME || '',
  user.ROLE || '',
  user.STATUS || '',
  user.LAST_LOGIN || '',
  user.CREATED_AT || '',
  user.UPDATED_AT || '',
];

class UserRepository extends GoogleSheetsRepository {
  async getAll() {
    const rows = await this.readAllRows(SHEET_NAMES.USERS);
    if (rows.length <= 1) return []; // Skip header row
    return rows.slice(1).map(mapRowToUser);
  }

  async getById(id) {
    const users = await this.getAll();
    return users.find(u => u.USER_ID === id) || null;
  }

  async getByUsername(username) {
    const users = await this.getAll();
    return users.find(u => u.USERNAME.toLowerCase() === username.toLowerCase()) || null;
  }

  async create(user) {
    const userRow = mapUserToRow({
      ...user,
      STATUS: user.STATUS || 'ACTIVE',
      CREATED_AT: getIsoString(),
      UPDATED_AT: getIsoString(),
    });
    await this.writeRow(SHEET_NAMES.USERS, userRow);
    return mapRowToUser(userRow);
  }

  async update(id, updateData) {
    const users = await this.getAll();
    const existing = users.find(u => u.USER_ID === id);
    if (!existing) throw new Error('User tidak ditemukan');

    const updated = {
      ...existing,
      ...updateData,
      UPDATED_AT: getIsoString(),
    };

    const row = mapUserToRow(updated);
    // Kolom USER_ID di index 0
    await this.updateRow(SHEET_NAMES.USERS, 0, id, row);
    return updated;
  }
}

export const userRepository = new UserRepository();
