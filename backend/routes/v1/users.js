import express from 'express';
import { userController } from '../../controllers/userController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Semua endpoint manajemen akun memerlukan token login valid dan hak akses admin
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('admin'));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export default router;
