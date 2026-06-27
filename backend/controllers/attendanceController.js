import { attendanceService } from '../services/attendanceService.js';
import { responseHelper } from '../helpers/responseHelper.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import { getTodayStr } from '../helpers/dateHelper.js';

export const attendanceController = {
  async getAll(req, res, next) {
    try {
      const { date, class: classId, student: studentId, session: sessionId, status, year, month, start_date, end_date, student_ids } = req.query;
      let list = [];

      if (year && month) {
        if (studentId) {
          list = await attendanceService.getBySiswaMonth(studentId, parseInt(year, 10), parseInt(month, 10));
        } else {
          list = await attendanceService.getByMonth(parseInt(year, 10), parseInt(month, 10));
        }
      } else if (start_date && end_date) {
        if (studentId) {
          list = await attendanceService.getBySiswaDateRange(studentId, start_date, end_date);
        } else if (student_ids) {
          const ids = student_ids.split(',');
          list = await attendanceService.getBySiswaIdsDateRange(ids, start_date, end_date);
        } else {
          list = await attendanceService.getByDateRange(start_date, end_date);
        }
      } else if (date && classId) {
        list = await attendanceService.getByTanggalKelas(date, classId);
      } else if (date) {
        list = await attendanceService.getByTanggal(date);
      } else {
        list = await attendanceService.getByTanggal(getTodayStr());
      }

      if (studentId && !year && !start_date) {
        list = list.filter(a => a.siswa_id === studentId);
      }
      if (sessionId) {
        list = list.filter(a => a.sesi_id === sessionId);
      }
      if (status) {
        list = list.filter(a => a.status === status);
      }

      return responseHelper.success(res, 'Berhasil memuat daftar absensi', list);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const petugasId = req.user ? req.user.id : null;
      const data = await attendanceService.create({
        ...req.body,
        petugas_id: petugasId,
      });
      return responseHelper.success(res, 'Presensi berhasil dicatat', data, HTTP_STATUS.CREATED);
    } catch (err) {
      if (err.message.includes('sudah melakukan presensi')) {
        return responseHelper.failed(res, err.message, ERROR_CODES.ATT001, HTTP_STATUS.CONFLICT);
      }
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const data = await attendanceService.update(req.params.id, req.body);
      return responseHelper.success(res, 'Presensi berhasil diperbarui', data);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await attendanceService.delete(req.params.id);
      return responseHelper.success(res, 'Data absensi berhasil dihapus');
    } catch (err) {
      next(err);
    }
  },

  async checkDuplicate(req, res, next) {
    try {
      const { student_id, session_id, date } = req.query;
      if (!student_id || !session_id) {
        return responseHelper.failed(
          res,
          'Siswa ID dan Sesi ID wajib disertakan dalam parameter query.',
          ERROR_CODES.SYSTEM001,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const exists = await attendanceService.existsScan(student_id, session_id, date || getTodayStr());
      return responseHelper.success(res, 'Hasil verifikasi duplikasi', { exists });
    } catch (err) {
      next(err);
    }
  },

  async bulkCreate(req, res, next) {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return responseHelper.failed(
          res,
          'Daftar item absensi kosong.',
          ERROR_CODES.SYSTEM001,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const created = await attendanceService.bulkCreate(items);
      return responseHelper.success(res, `Berhasil menyimpan ${created.length} data absensi`, created, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }
};
