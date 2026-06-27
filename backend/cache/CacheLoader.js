import { userRepository } from '../repositories/userRepository.js';
import { studentRepository } from '../repositories/studentRepository.js';
import { classRepository } from '../repositories/classRepository.js';
import { sessionRepository } from '../repositories/sessionRepository.js';
import { settingsRepository } from '../repositories/settingsRepository.js';
import { cacheManager } from './CacheManager.js';
import { memoryIndex } from './MemoryIndex.js';
import { logger } from '../config/logger.js';

export const cacheLoader = {
  async loadAll() {
    logger.info('Memulai pemuatan cache data master dari Google Sheets...');
    try {
      const [users, students, classes, sessions, settingsList] = await Promise.all([
        userRepository.getAll(),
        studentRepository.getAll(),
        classRepository.getAll(),
        sessionRepository.getAll(),
        settingsRepository.getAll(),
      ]);

      // Ubah list settings menjadi key-value object
      const settingsObj = {};
      (settingsList || []).forEach(item => {
        settingsObj[item.KEY] = item.VALUE;
      });

      // Simpan ke CacheManager
      cacheManager.setUsers(users);
      cacheManager.setStudents(students);
      cacheManager.setClasses(classes);
      cacheManager.setSessions(sessions);
      cacheManager.setSettings(settingsObj);
      cacheManager.lastLoaded = new Date();

      // Bangun ulang memory index
      memoryIndex.rebuildAll(cacheManager.store);

      logger.info(`Pemuatan cache sukses: ${users.length} Users, ${students.length} Siswa, ${classes.length} Kelas, ${sessions.length} Sesi.`);
      return true;
    } catch (err) {
      logger.error(`Gagal memuat cache dari Google Sheets: ${err.message}`);
      // Return false tanpa crash agar server tetap berjalan dengan cache kosong
      return false;
    }
  }
};
