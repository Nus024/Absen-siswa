import { logRepository } from '../repositories/logRepository.js';
import { responseHelper } from '../helpers/responseHelper.js';

export const logController = {
  async getAll(req, res, next) {
    try {
      const logs = await logRepository.getAll();
      const sorted = (logs || []).reverse(); // Dari log paling baru
      return responseHelper.success(res, 'Berhasil memuat log aktivitas sistem', sorted);
    } catch (err) {
      next(err);
    }
  }
};
