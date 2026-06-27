import express from 'express';
import { settingsController } from '../../controllers/settingsController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// GET / dapat diakses oleh siapa saja untuk mengambil konfigurasi publik (nama & logo sekolah)
router.get('/', settingsController.getAll);

// POST / membutuhkan token dan otorisasi admin untuk mengubah pengaturan
router.post('/', authMiddleware.verifyToken, authMiddleware.restrictTo('admin'), settingsController.set);

export default router;
