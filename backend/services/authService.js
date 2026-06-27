import { memoryIndex } from '../cache/MemoryIndex.js';
import { hashHelper } from '../helpers/hashHelper.js';
import { tokenHelper } from '../helpers/tokenHelper.js';
import { logger } from '../config/logger.js';

export const authService = {
  async login(username, password) {
    const user = memoryIndex.getUserByUsername(username);
    if (!user) {
      logger.warn(`Percobaan login gagal untuk username: ${username} (User tidak ditemukan)`);
      return null;
    }

    if (user.STATUS !== 'ACTIVE') {
      logger.warn(`Percobaan login gagal untuk username: ${username} (User tidak aktif)`);
      return null;
    }

    const isValid = await hashHelper.verify(password, user.PASSWORD);
    if (!isValid) {
      logger.warn(`Percobaan login gagal untuk username: ${username} (Password salah)`);
      return null;
    }

    const payload = {
      id:       user.USER_ID,
      nama:     user.NAME,
      username: user.USERNAME,
      role:     user.ROLE,
    };
    const token = tokenHelper.generate(payload);

    logger.audit(user.USERNAME, 'LOGIN', 'Sukses login sistem');
    
    // Hilangkan field PASSWORD sebelum dikirim ke client
    const { PASSWORD: _, ...safeUser } = user;
    return { token, user: safeUser };
  }
};
