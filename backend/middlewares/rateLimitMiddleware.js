import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const rateLimitStore = new Map();

// Bersihkan pencatat rate limit setiap 60 detik secara berkala
setInterval(() => {
  rateLimitStore.clear();
}, 60 * 1000);

export const rateLimitMiddleware = (limit = 60) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    if (!rateLimitStore.has(ip)) {
      rateLimitStore.set(ip, 0);
    }

    const currentCount = rateLimitStore.get(ip) + 1;
    rateLimitStore.set(ip, currentCount);

    if (currentCount > limit) {
      return responseHelper.failed(
        res,
        'Terlalu banyak request. Silakan coba beberapa saat lagi.',
        ERROR_CODES.SYSTEM001, // rate-limiting error
        HTTP_STATUS.TOO_MANY_REQUESTS
      );
    }

    next();
  };
};
