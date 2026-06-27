import cron from 'node-cron';
import { cacheLoader } from '../cache/CacheLoader.js';
import { logger } from '../config/logger.js';

export const initCacheRefreshJob = () => {
  // Jalankan setiap 15 menit
  cron.schedule('*/15 * * * *', async () => {
    logger.info('[CacheRefreshJob] Memulai penyegaran cache data master otomatis...');
    try {
      const success = await cacheLoader.loadAll();
      if (success) {
        logger.info('[CacheRefreshJob] Sinkronisasi cache RAM sukses.');
      } else {
        logger.warn('[CacheRefreshJob] Sinkronisasi cache RAM gagal.');
      }
    } catch (err) {
      logger.error(`[CacheRefreshJob] Error saat memicu pembaruan cache: ${err.message}`);
    }
  });
};
