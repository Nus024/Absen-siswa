import express from 'express';
import { reportController } from '../../controllers/reportController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get('/daily', reportController.getDaily);
router.get('/monthly', reportController.getMonthly);

export default router;
