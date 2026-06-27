import { studentRepository } from '../repositories/studentRepository.js';
import { qrHistoryRepository } from '../repositories/qrHistoryRepository.js';
import { cacheManager } from '../cache/CacheManager.js';
import { memoryIndex } from '../cache/MemoryIndex.js';
import { cacheLoader } from '../cache/CacheLoader.js';
import crypto from 'crypto';
import { logger } from '../config/logger.js';

export const studentService = {
  async getAll() {
    // Saring siswa yang tidak bertanda DELETED
    return cacheManager.getStudents().filter(s => s.STATUS !== 'DELETED');
  },

  async getById(id) {
    const list = await this.getAll();
    return list.find(s => s.SISWA_ID === id) || null;
  },

  async getByNis(nis) {
    const student = memoryIndex.getStudentByNis(nis);
    if (!student || student.STATUS === 'DELETED') return null;
    return student;
  },

  async getByQrToken(token) {
    const student = memoryIndex.getStudentByQrToken(token);
    if (!student || student.STATUS === 'DELETED') return null;
    return student;
  },

  async create(payload) {
    const list = cacheManager.getStudents();
    const newStudent = {
      SISWA_ID: `STD${String(list.length + 1).padStart(6, '0')}`,
      NIS:      String(payload.nis),
      NAMA:     payload.nama,
      KELAS_ID: payload.kelas_id,
      QR_TOKEN: crypto.randomUUID(),
      QR_VERSION: 1,
      QR_STATUS: 'ACTIVE',
      STATUS:   'ACTIVE',
    };

    const created = await studentRepository.create(newStudent);
    
    // Perbarui cache RAM
    await cacheLoader.loadAll();
    logger.audit('SYSTEM', 'CREATE_STUDENT', `Siswa ${payload.nama} (NIS: ${payload.nis}) berhasil dibuat`);
    return created;
  },

  async update(id, payload) {
    const updated = await studentRepository.update(id, payload);
    
    // Perbarui cache RAM
    await cacheLoader.loadAll();
    logger.audit('SYSTEM', 'UPDATE_STUDENT', `Siswa ID ${id} berhasil diperbarui`);
    return updated;
  },

  async delete(id) {
    // Terapkan Soft Delete sesuai aturan database 02-GOOGLE_SHEETS_DATABASE.md
    await studentRepository.update(id, { STATUS: 'DELETED' });
    
    await cacheLoader.loadAll();
    logger.audit('SYSTEM', 'DELETE_STUDENT', `Siswa ID ${id} di-softdelete`);
  },

  async regenerateQr(id, updatedBy = 'ADMIN', reason = 'Manual request') {
    const student = await this.getById(id);
    if (!student) throw new Error('Siswa tidak ditemukan');

    const oldToken = student.QR_TOKEN;
    const newToken = crypto.randomUUID();
    const newVersion = (student.QR_VERSION || 1) + 1;

    // Catat riwayat di Sheet QR_HISTORY
    await qrHistoryRepository.create({
      ID:         crypto.randomUUID(),
      SISWA_ID:   id,
      OLD_TOKEN:  oldToken,
      NEW_TOKEN:  newToken,
      VERSION:    newVersion,
      REASON:     reason,
      UPDATED_BY: updatedBy,
    });

    // Update siswa
    const updated = await studentRepository.update(id, {
      QR_TOKEN:   newToken,
      QR_VERSION: newVersion,
    });

    await cacheLoader.loadAll();
    logger.audit(updatedBy, 'REGENERATE_QR', `Regenerasi QR Siswa ${student.NAMA} (Ver: ${newVersion})`);
    return updated;
  },

  async updateLastScan(id) {
    const updated = await studentRepository.update(id, {
      LAST_SCAN: new Date().toISOString(),
    });
    // Refresh cache secara background
    cacheLoader.loadAll();
    return updated;
  },

  async bulkCreate(rows) {
    const list = cacheManager.getStudents();
    let currentIdx = list.length + 1;
    
    const formatted = rows.map(r => ({
      SISWA_ID:   `STD${String(currentIdx++).padStart(6, '0')}`,
      NIS:        String(r.nis || r.NIS),
      NAMA:       r.nama || r.NAMA,
      KELAS_ID:   r.kelas_id || r.KELAS_ID,
      QR_TOKEN:   crypto.randomUUID(),
      QR_VERSION: 1,
      QR_STATUS:  'ACTIVE',
      STATUS:     'ACTIVE',
    }));

    const created = await studentRepository.bulkCreate(formatted);
    await cacheLoader.loadAll();
    logger.audit('SYSTEM', 'BULK_IMPORT_STUDENTS', `Bulk import ${rows.length} siswa`);
    return created;
  }
};
