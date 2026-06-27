import app from './app.js';
import { appConfig } from './config/app.js';
import { cacheLoader } from './cache/CacheLoader.js';
import { logger } from './config/logger.js';

// Import Job schedulers
import { initBackupJob } from './jobs/backupJob.js';
import { initCacheRefreshJob } from './jobs/cacheRefreshJob.js';
import { initHealthCheckJob } from './jobs/healthCheckJob.js';

const startServer = async () => {
  logger.info('Menyalakan server Absen Digital Siswa Backend...');
  
  // 1. Pemuatan Cache Master Data dari Sheets saat startup
  try {
    await cacheLoader.loadAll();
  } catch (err) {
    logger.error('Inisialisasi cache gagal saat startup server, boot tetap dilanjutkan...', err.message);
  }

  // 2. Registrasi Tugas Latar Belakang otomatis (Cron)
  initBackupJob();
  initCacheRefreshJob();
  initHealthCheckJob();

  // 3. Menjalankan HTTP server
  app.listen(appConfig.port, () => {
    logger.info(`Server berjalan di port ${appConfig.port} dengan mode env: ${appConfig.env}`);
  });
};

startServer().catch(err => {
  logger.error(`FATAL: Gagal melakukan bootstrap server: ${err.message}`);
  process.exit(1);
});
