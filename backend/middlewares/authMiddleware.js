import { tokenHelper } from '../helpers/tokenHelper.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const authMiddleware = {
  verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return responseHelper.failed(
        res,
        'Akses ditolak. Sesi tidak ditemukan atau token tidak disediakan.',
        ERROR_CODES.AUTH002,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = tokenHelper.verify(token);
    if (!decoded) {
      return responseHelper.failed(
        res,
        'Token keamanan tidak valid atau telah kadaluwarsa.',
        ERROR_CODES.AUTH002,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    req.user = decoded;
    next();
  },

  restrictTo(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return responseHelper.failed(
          res,
          'Akses ditolak. Anda tidak memiliki wewenang untuk aksi ini.',
          ERROR_CODES.AUTH002,
          HTTP_STATUS.FORBIDDEN
        );
      }
      next();
    };
  }
};
