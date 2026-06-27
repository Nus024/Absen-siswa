import express from 'express';
import { logController } from '../../controllers/logController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('admin'));

router.get('/', logController.getAll);

export default router;
