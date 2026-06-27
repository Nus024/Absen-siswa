import { sessionRepository } from '../repositories/sessionRepository.js';
import { cacheLoader } from '../cache/CacheLoader.js';
import { cacheManager } from '../cache/CacheManager.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const sessionController = {
  async getAll(req, res, next) {
    try {
      const list = cacheManager.getSessions().filter(s => s.STATUS !== 'DELETED');
      return responseHelper.success(res, 'Berhasil mengambil daftar sesi', list);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const sess = cacheManager.getSessions().find(s => s.SESI_ID === req.params.id);
      if (!sess || sess.STATUS === 'DELETED') {
        return responseHelper.failed(res, 'Sesi tidak ditemukan', 'SYSTEM001', HTTP_STATUS.NOT_FOUND);
      }
      return responseHelper.success(res, 'Berhasil memuat detail sesi', sess);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const list = cacheManager.getSessions();
      const newSess = {
        SESI_ID:     `SES${String(list.length + 1).padStart(6, '0')}`,
        NAMA:        req.body.nama,
        JAM_MULAI:   req.body.jam_mulai,
        JAM_SELESAI: req.body.jam_selesai,
        URUTAN:      req.body.urutan || 1,
        STATUS:      'ACTIVE',
      };
      const created = await sessionRepository.create(newSess);
      await cacheLoader.loadAll();
      return responseHelper.success(res, 'Sesi baru berhasil dibuat', created, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await sessionRepository.update(req.params.id, req.body);
      await cacheLoader.loadAll();
      return responseHelper.success(res, 'Sesi berhasil diperbarui', updated);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await sessionRepository.update(req.params.id, { STATUS: 'DELETED' });
      await cacheLoader.loadAll();
      return responseHelper.success(res, 'Sesi berhasil dinonaktifkan (soft-delete)');
    } catch (err) {
      next(err);
    }
  }
};
