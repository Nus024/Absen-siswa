import { settingsService } from '../services/settingsService.js';
import { responseHelper } from '../helpers/responseHelper.js';

export const settingsController = {
  async getAll(req, res, next) {
    try {
      const data = await settingsService.getAll();
      return responseHelper.success(res, 'Berhasil memuat pengaturan aplikasi', data);
    } catch (err) {
      next(err);
    }
  },

  async set(req, res, next) {
    try {
      const { key, value } = req.body;
      if (!key) {
        return responseHelper.failed(res, 'Parameter "key" wajib dilampirkan.');
      }
      await settingsService.set(key, value);
      return responseHelper.success(res, `Pengaturan "${key}" berhasil diperbarui`);
    } catch (err) {
      next(err);
    }
  }
};
