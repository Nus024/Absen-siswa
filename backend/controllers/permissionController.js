import { permissionService } from '../services/permissionService.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export const permissionController = {
  async getAll(req, res, next) {
    try {
      const list = await permissionService.getAll();
      return responseHelper.success(res, 'Berhasil memuat semua data izin', list);
    } catch (err) {
      next(err);
    }
  },

  async getActive(req, res, next) {
    try {
      const list = await permissionService.getAktif();
      return responseHelper.success(res, 'Berhasil memuat daftar siswa yang sedang di luar', list);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const username = req.user ? req.user.username : 'PETUGAS';
      const created = await permissionService.create({
        ...req.body,
        petugas_id: username,
      });
      return responseHelper.success(res, 'Izin keluar siswa berhasil dicatat', created, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async kembali(req, res, next) {
    try {
      const updated = await permissionService.kembali(req.params.id);
      return responseHelper.success(res, 'Siswa dikonfirmasi telah kembali ke sekolah', updated);
    } catch (err) {
      next(err);
    }
  }
};
