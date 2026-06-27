import { cacheLoader } from '../cache/CacheLoader.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { googleConfig } from '../config/google.js';

export const systemController = {
  async health(req, res) {
    const googleStatus = googleConfig.sheets ? 'CONNECTED' : 'DISCONNECTED';
    return responseHelper.success(res, 'Sistem berjalan normal', {
      status:    'UP',
      timestamp: new Date().toISOString(),
      google_api: googleStatus,
    });
  },

  async reloadCache(req, res, next) {
    try {
      const success = await cacheLoader.loadAll();
      if (!success) {
        return responseHelper.failed(res, 'Gagal menyegarkan cache data master dari Google Sheets');
      }
      return responseHelper.success(res, 'Cache data master berhasil diperbarui di RAM');
    } catch (err) {
      next(err);
    }
  }
};
