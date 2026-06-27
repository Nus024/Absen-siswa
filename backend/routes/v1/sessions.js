import express from 'express';
import { sessionController } from '../../controllers/sessionController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get('/', sessionController.getAll);
router.get('/:id', sessionController.getById);

router.post('/', authMiddleware.restrictTo('admin'), sessionController.create);
router.put('/:id', authMiddleware.restrictTo('admin'), sessionController.update);
router.delete('/:id', authMiddleware.restrictTo('admin'), sessionController.delete);

export default router;
