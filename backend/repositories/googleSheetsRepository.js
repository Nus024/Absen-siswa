import { googleConfig } from '../config/google.js';
import { logger } from '../config/logger.js';

export class GoogleSheetsRepository {
  constructor() {
    this.sheets = googleConfig.sheets;
    this.spreadsheetId = googleConfig.spreadsheetId;
  }

  // Cek apakah API client siap
  checkConfig() {
    if (!this.sheets || !this.spreadsheetId) {
      throw new Error('Google Sheets API client belum diinisialisasi. Periksa kredensial .env!');
    }
  }

  // Membaca seluruh data baris (AOA - Array of Arrays) dari Sheet tertentu
  async readAllRows(sheetName) {
    this.checkConfig();
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
      });
      return response.data.values || [];
    } catch (err) {
      logger.error(`[BaseRepo] Gagal membaca sheet ${sheetName}: ${err.message}`);
      throw err;
    }
  }

  // Menulis baris baru ke Sheet (Append)
  async writeRow(sheetName, rowData) {
    this.checkConfig();
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });
      logger.info(`[BaseRepo] Sukses append baris ke sheet ${sheetName}`);
    } catch (err) {
      logger.error(`[BaseRepo] Gagal append baris ke sheet ${sheetName}: ${err.message}`);
      throw err;
    }
  }

  // Mengupdate baris tertentu berdasarkan Key Column (misal ID)
  async updateRow(sheetName, keyColumnIndex, keyValue, updateData) {
    this.checkConfig();
    try {
      const allRows = await this.readAllRows(sheetName);
      if (allRows.length === 0) throw new Error('Sheet kosong');

      // Cari baris yang berisi keyValue pada kolom keyColumnIndex
      const rowIndex = allRows.findIndex(row => row[keyColumnIndex] === keyValue);
      if (rowIndex === -1) {
        throw new Error(`Data dengan key ${keyValue} tidak ditemukan di kolom index ${keyColumnIndex}`);
      }

      // Baris di Google Sheet adalah 1-indexed. Baris 1 header, baris 2 adalah row index 1
      const sheetRowNumber = rowIndex + 1; 

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${sheetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updateData],
        },
      });
      logger.info(`[BaseRepo] Sukses update baris ${sheetRowNumber} di sheet ${sheetName}`);
    } catch (err) {
      logger.error(`[BaseRepo] Gagal update baris di sheet ${sheetName}: ${err.message}`);
      throw err;
    }
  }

  // Menulis banyak baris sekaligus (Batch Update / Append)
  async batchWriteRows(sheetName, rowsData) {
    this.checkConfig();
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: rowsData,
        },
      });
      logger.info(`[BaseRepo] Sukses batch write ${rowsData.length} baris ke sheet ${sheetName}`);
    } catch (err) {
      logger.error(`[BaseRepo] Gagal batch write ke sheet ${sheetName}: ${err.message}`);
      throw err;
    }
  }

  // Batch membaca beberapa sheets sekaligus dalam satu API call
  async batchReadSheets(sheetNames) {
    this.checkConfig();
    try {
      const ranges = sheetNames.map(name => `${name}!A:Z`);
      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId: this.spreadsheetId,
        ranges,
      });
      
      const valueRanges = response.data.valueRanges || [];
      const result = {};
      sheetNames.forEach((name, i) => {
        result[name] = valueRanges[i]?.values || [];
      });
      return result;
    } catch (err) {
      logger.error(`[BaseRepo] Gagal batch read sheets: ${err.message}`);
      throw err;
    }
  }
}
