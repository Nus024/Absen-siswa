import { userRepository } from '../repositories/userRepository.js';
import { cacheLoader } from '../cache/CacheLoader.js';
import { cacheManager } from '../cache/CacheManager.js';
import { hashHelper } from '../helpers/hashHelper.js';
import { logger } from '../config/logger.js';

export const userService = {
  async getAll() {
    return cacheManager.getUsers().filter(u => u.STATUS !== 'DELETED');
  },

  async getById(id) {
    const list = await this.getAll();
    return list.find(u => u.USER_ID === id) || null;
  },

  async create(payload) {
    const list = cacheManager.getUsers();
    const hashedPassword = await hashHelper.hash(payload.password || 'admin123');
    
    const newUser = {
      USER_ID:    `USR${String(list.length + 1).padStart(6, '0')}`,
      USERNAME:   payload.username,
      PASSWORD:   hashedPassword,
      NAME:       payload.nama || payload.name || '',
      ROLE:       payload.role || 'pengawas',
      STATUS:     'ACTIVE',
    };

    const created = await userRepository.create(newUser);
    await cacheLoader.loadAll();
    logger.audit('SYSTEM', 'CREATE_USER', `User ${payload.username} berhasil dibuat`);
    return created;
  },

  async update(id, payload) {
    const updateData = { ...payload };
    if (payload.password) {
      updateData.PASSWORD = await hashHelper.hash(payload.password);
      delete updateData.password;
    }
    if (payload.nama) {
      updateData.NAME = payload.nama;
      delete updateData.nama;
    }
    if (payload.username) {
      updateData.USERNAME = payload.username;
    }
    if (payload.role) {
      updateData.ROLE = payload.role;
    }

    const updated = await userRepository.update(id, updateData);
    await cacheLoader.loadAll();
    logger.audit('SYSTEM', 'UPDATE_USER', `User ID ${id} berhasil diperbarui`);
    return updated;
  },

  async delete(id) {
    await userRepository.update(id, { STATUS: 'DELETED' });
    await cacheLoader.loadAll();
    logger.audit('SYSTEM', 'DELETE_USER', `User ID ${id} dinonaktifkan (soft-delete)`);
  }
};
