import { classRepository } from '../repositories/classRepository.js';
import { cacheManager } from '../cache/CacheManager.js';
import { cacheLoader } from '../cache/CacheLoader.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const classController = {
  async getAll(req, res, next) {
    try {
      const list = cacheManager.getClasses().filter(c => c.STATUS !== 'DELETED');
      return responseHelper.success(res, 'Berhasil memuat daftar kelas', list);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const cls = cacheManager.getClasses().find(c => c.KELAS_ID === req.params.id);
      if (!cls || cls.STATUS === 'DELETED') {
        return responseHelper.failed(res, 'Kelas tidak ditemukan', ERROR_CODES.SYSTEM001, HTTP_STATUS.NOT_FOUND);
      }
      return responseHelper.success(res, 'Berhasil memuat detail kelas', cls);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const list = cacheManager.getClasses();
      const newClass = {
        KELAS_ID:   `KLS${String(list.length + 1).padStart(6, '0')}`,
        TINGKAT:    req.body.tingkat || '',
        NAMA:       req.body.nama,
        WALI_KELAS: req.body.wali_kelas || '',
        STATUS:     'ACTIVE',
      };
      const created = await classRepository.create(newClass);
      await cacheLoader.loadAll();
      return responseHelper.success(res, 'Kelas baru berhasil dibuat', created, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await classRepository.update(req.params.id, req.body);
      await cacheLoader.loadAll();
      return responseHelper.success(res, 'Data kelas berhasil diperbarui', updated);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      // Soft Delete sesuai aturan database
      await classRepository.update(req.params.id, { STATUS: 'DELETED' });
      await cacheLoader.loadAll();
      return responseHelper.success(res, 'Kelas berhasil dinonaktifkan (soft-delete)');
    } catch (err) {
      next(err);
    }
  }
};
