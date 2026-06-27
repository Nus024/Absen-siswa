import { HTTP_STATUS } from '../constants/httpStatus.js';

export const responseHelper = {
  success(res, message = 'Success', data = {}, status = HTTP_STATUS.OK) {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  },
  failed(res, message = 'Error', errorCode = 'SYSTEM001', status = HTTP_STATUS.BAD_REQUEST) {
    return res.status(status).json({
      success: false,
      message,
      error_code: errorCode,
    });
  }
};
