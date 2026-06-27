import cron from 'node-cron';
import { googleConfig } from '../config/google.js';
import { logger } from '../config/logger.js';

export const initHealthCheckJob = () => {
  // Jalankan setiap 5 menit
  cron.schedule('*/5 * * * *', async () => {
    logger.info('[HealthCheckJob] Memulai pengawasan status koneksi Google API...');
    try {
      if (!googleConfig.sheets || !googleConfig.spreadsheetId) {
        logger.warn('[HealthCheckJob] Client Google Sheets API tidak aktif. Periksa kredensial.');
        return;
      }

      // Kueri metadata sheet ringan untuk tes koneksi ping
      await googleConfig.sheets.spreadsheets.get({
        spreadsheetId: googleConfig.spreadsheetId,
      });

      logger.info('[HealthCheckJob] Koneksi ke Google Sheets API terpantau sehat.');
    } catch (err) {
      logger.error(`[HealthCheckJob] API Google Sheets tidak dapat dihubungi: ${err.message}`);
    }
  });
};
