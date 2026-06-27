import { memoryIndex } from '../cache/MemoryIndex.js';
import { studentService } from './studentService.js';
import { logger } from '../config/logger.js';

export const qrService = {
  async validate(token) {
    if (!token) throw new Error('Token QR kosong');
    
    // Cari siswa menggunakan indeks memori RAM berlatensi 0ms
    const student = memoryIndex.getStudentByQrToken(token);
    if (!student || student.STATUS === 'DELETED') {
      throw new Error('Kartu QR tidak terdaftar di sistem');
    }

    if (student.QR_STATUS !== 'ACTIVE') {
      throw new Error('Kartu QR siswa berstatus tidak aktif atau diblokir');
    }

    return student;
  },

  async regenerate(studentId, adminId, reason) {
    return studentService.regenerateQr(studentId, adminId, reason);
  }
};
