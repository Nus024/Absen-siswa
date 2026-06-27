import { reportService } from '../services/reportService.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const reportController = {
  async getDaily(req, res, next) {
    try {
      const { date, class_id } = req.query;
      if (!date || !class_id) {
        return responseHelper.failed(
          res,
          'Parameter "date" dan "class_id" wajib dilampirkan.',
          'SYSTEM001',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const data = await reportService.getDaily(date, class_id);
      return responseHelper.success(res, 'Berhasil memuat rekap absensi harian', data);
    } catch (err) {
      next(err);
    }
  },

  async getMonthly(req, res, next) {
    try {
      const { year, month, class_id } = req.query;
      if (!year || !month || !class_id) {
        return responseHelper.failed(
          res,
          'Parameter "year", "month", dan "class_id" wajib dilampirkan.',
          'SYSTEM001',
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const data = await reportService.getMonthly(
        parseInt(year, 10),
        parseInt(month, 10),
        class_id
      );
      return responseHelper.success(res, 'Berhasil memuat rekap absensi bulanan', data);
    } catch (err) {
      next(err);
    }
  }
};
