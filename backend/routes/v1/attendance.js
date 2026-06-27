import express from 'express';
import { attendanceController } from '../../controllers/attendanceController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { validationMiddleware } from '../../middlewares/validationMiddleware.js';
import { attendanceValidator } from '../../validators/attendanceValidator.js';

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get('/', attendanceController.getAll);
router.get('/check-duplicate', attendanceController.checkDuplicate);
router.post(
  '/',
  validationMiddleware(attendanceValidator.validateCreate),
  attendanceController.create
);
router.put('/:id', authMiddleware.restrictTo('admin'), attendanceController.update);
router.delete('/:id', authMiddleware.restrictTo('admin'), attendanceController.delete);
router.post('/bulk', attendanceController.bulkCreate);

export default router;
