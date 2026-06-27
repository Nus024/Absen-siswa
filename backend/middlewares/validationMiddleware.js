import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const validationMiddleware = (validateFn) => {
  return (req, res, next) => {
    const result = validateFn(req.body);
    if (result && result.error) {
      return responseHelper.failed(res, result.error, 'SYSTEM001', HTTP_STATUS.BAD_REQUEST);
    }
    next();
  };
};
