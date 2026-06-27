import { authService } from '../services/authService.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      
      if (!result) {
        return responseHelper.failed(
          res,
          'Username atau password salah',
          ERROR_CODES.AUTH001,
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      // Format response sesuai dengan spesifikasi 03-REST_API_SPEC.md Section 7
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        token:   result.token,
        user:    result.user,
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res) {
    return responseHelper.success(res, 'Berhasil logout dari sistem');
  },

  async getSession(req, res) {
    if (!req.user) {
      return responseHelper.failed(
        res,
        'Sesi tidak valid atau telah kadaluwarsa',
        ERROR_CODES.AUTH002,
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    return responseHelper.success(res, 'Sesi aktif terotentikasi', { user: req.user });
  }
};
