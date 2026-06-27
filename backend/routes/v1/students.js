import express from 'express';
import { studentController } from '../../controllers/studentController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { validationMiddleware } from '../../middlewares/validationMiddleware.js';
import { studentValidator } from '../../validators/studentValidator.js';

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get('/', studentController.getAll);
router.get('/:id', studentController.getById);
router.get('/nis/:nis', studentController.getByNis);
router.get('/qr/:token', studentController.getByQr);

// Hanya admin yang diizinkan untuk mengubah data siswa
router.post(
  '/',
  authMiddleware.restrictTo('admin'),
  validationMiddleware(studentValidator.validateCreate),
  studentController.create
);
router.put('/:id', authMiddleware.restrictTo('admin'), studentController.update);
router.delete('/:id', authMiddleware.restrictTo('admin'), studentController.delete);
router.post('/import', authMiddleware.restrictTo('admin'), studentController.import);
router.post('/:id/regenerate-qr', authMiddleware.restrictTo('admin'), studentController.regenerateQr);

export default router;
