import { settingsRepository } from '../repositories/settingsRepository.js';
import { cacheLoader } from '../cache/CacheLoader.js';
import { logger } from '../config/logger.js';

export const settingsService = {
  async getAll() {
    const list = await settingsRepository.getAll();
    const obj = {};
    (list || []).forEach(item => {
      obj[item.KEY] = item.VALUE;
    });
    return obj;
  },

  async get(key) {
    return settingsRepository.get(key);
  },

  async set(key, value) {
    await settingsRepository.set(key, value);
    // Segarkan cache memori server setelah penulisan
    await cacheLoader.loadAll();
    logger.audit('SYSTEM', 'UPDATE_SETTINGS', `Mengubah pengaturan KEY: ${key}`);
  },

  async remove(key) {
    await settingsRepository.remove(key);
    // Segarkan cache
    await cacheLoader.loadAll();
    logger.audit('SYSTEM', 'DELETE_SETTINGS', `Menghapus pengaturan KEY: ${key}`);
  }
};
