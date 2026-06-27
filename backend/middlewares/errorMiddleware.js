import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { logger } from '../config/logger.js';

export const errorMiddleware = (err, req, res, next) => {
  logger.error(`[UnhandledError] ${err.message}`, err.stack);
  
  const status = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Terjadi kesalahan internal pada server';
  const errorCode = err.code || ERROR_CODES.SYSTEM001;

  return responseHelper.failed(res, message, errorCode, status);
};
