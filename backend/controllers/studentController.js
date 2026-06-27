import { studentService } from '../services/studentService.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

export const studentController = {
  async getAll(req, res, next) {
    try {
      const { class_id } = req.query;
      let list = await studentService.getAll();
      if (class_id) {
        list = list.filter(s => s.KELAS_ID === class_id);
      }
      return responseHelper.success(res, 'Berhasil mengambil daftar siswa', list);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const student = await studentService.getById(req.params.id);
      if (!student) {
        return responseHelper.failed(
          res,
          'Siswa tidak ditemukan',
          ERROR_CODES.STUDENT001,
          HTTP_STATUS.NOT_FOUND
        );
      }
      return responseHelper.success(res, 'Berhasil memuat detail siswa', student);
    } catch (err) {
      next(err);
    }
  },

  async getByNis(req, res, next) {
    try {
      const student = await studentService.getByNis(req.params.nis);
      if (!student) {
        return responseHelper.failed(
          res,
          'Siswa dengan NIS tersebut tidak ditemukan',
          ERROR_CODES.STUDENT001,
          HTTP_STATUS.NOT_FOUND
        );
      }
      return responseHelper.success(res, 'Berhasil memuat siswa berdasarkan NIS', student);
    } catch (err) {
      next(err);
    }
  },

  async getByQr(req, res, next) {
    try {
      const student = await studentService.getByQrToken(req.params.token);
      if (!student) {
        return responseHelper.failed(
          res,
          'Kartu QR tidak terdaftar atau tidak aktif',
          ERROR_CODES.QR001,
          HTTP_STATUS.NOT_FOUND
        );
      }
      return responseHelper.success(res, 'Berhasil memuat siswa berdasarkan token QR', student);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const student = await studentService.create(req.body);
      return responseHelper.success(res, 'Siswa baru berhasil didaftarkan', student, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const student = await studentService.update(req.params.id, req.body);
      return responseHelper.success(res, 'Data siswa berhasil diperbarui', student);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await studentService.delete(req.params.id);
      return responseHelper.success(res, 'Data siswa berhasil dihapus (soft-delete)');
    } catch (err) {
      next(err);
    }
  },

  async import(req, res, next) {
    try {
      const { rows } = req.body;
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return responseHelper.failed(
          res,
          'Format data impor kosong atau tidak valid.',
          ERROR_CODES.SYSTEM001,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const created = await studentService.bulkCreate(rows);
      return responseHelper.success(res, `Berhasil mengimpor ${created.length} siswa baru`, created, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async regenerateQr(req, res, next) {
    try {
      const { reason } = req.body;
      const adminName = req.user ? req.user.username : 'ADMIN';
      const student = await studentService.regenerateQr(
        req.params.id,
        adminName,
        reason || 'Permintaan manual administrator'
      );
      return responseHelper.success(res, 'Token QR berhasil diperbarui dan dicatat di riwayat', student);
    } catch (err) {
      next(err);
    }
  }
};
