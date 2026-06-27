import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { googleConfig } from '../config/google.js';
import { SHEET_NAMES } from '../constants/sheetNames.js';
import { logger } from '../config/logger.js';
import { getTodayStr } from '../helpers/dateHelper.js';

export const initBackupJob = () => {
  // Jalankan setiap hari pukul 02:00 pagi
  cron.schedule('0 2 * * *', async () => {
    logger.info('[BackupJob] Memulai backup data harian otomatis...');
    try {
      if (!googleConfig.sheets || !googleConfig.spreadsheetId) {
        logger.warn('[BackupJob] Kredensial Google Sheets tidak aktif. Backup otomatis dibatalkan.');
        return;
      }

      const BACKUP_DIR = path.join(process.cwd(), 'logs', 'backups');
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }

      const sheetNamesList = Object.values(SHEET_NAMES);
      const ranges = sheetNamesList.map(name => `${name}!A:Z`);
      
      const response = await googleConfig.sheets.spreadsheets.values.batchGet({
        spreadsheetId: googleConfig.spreadsheetId,
        ranges,
      });

      const valueRanges = response.data.valueRanges || [];
      const backupData = {};
      sheetNamesList.forEach((name, i) => {
        backupData[name] = valueRanges[i]?.values || [];
      });

      const fileName = `backup_${getTodayStr()}.json`;
      fs.writeFileSync(
        path.join(BACKUP_DIR, fileName),
        JSON.stringify(backupData, null, 2)
      );

      logger.info(`[BackupJob] Sukses mencadangkan database Sheets ke ${fileName}`);
    } catch (err) {
      logger.error(`[BackupJob] Gagal mencadangkan data harian: ${err.message}`);
    }
  });
};
