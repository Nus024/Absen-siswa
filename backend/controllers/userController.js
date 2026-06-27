import { userService } from '../services/userService.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const userController = {
  async getAll(req, res, next) {
    try {
      const list = await userService.getAll();
      return responseHelper.success(res, 'Berhasil memuat daftar user', list);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);
      if (!user) {
        return responseHelper.failed(res, 'User tidak ditemukan', 'USER001', HTTP_STATUS.NOT_FOUND);
      }
      return responseHelper.success(res, 'Berhasil memuat detail user', user);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);
      return responseHelper.success(res, 'User berhasil dibuat', user, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body);
      return responseHelper.success(res, 'User berhasil diperbarui', user);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id);
      return responseHelper.success(res, 'User berhasil dinonaktifkan');
    } catch (err) {
      next(err);
    }
  }
};
