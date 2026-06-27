import express from 'express';
import { classController } from '../../controllers/classController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { validationMiddleware } from '../../middlewares/validationMiddleware.js';
import { classValidator } from '../../validators/classValidator.js';

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get('/', classController.getAll);
router.get('/:id', classController.getById);

router.post(
  '/',
  authMiddleware.restrictTo('admin'),
  validationMiddleware(classValidator.validateCreate),
  classController.create
);
router.put('/:id', authMiddleware.restrictTo('admin'), classController.update);
router.delete('/:id', authMiddleware.restrictTo('admin'), classController.delete);

export default router;
