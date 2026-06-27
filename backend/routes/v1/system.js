import express from 'express';
import { systemController } from '../../controllers/systemController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/health', systemController.health);
router.post(
  '/cache/reload',
  authMiddleware.verifyToken,
  authMiddleware.restrictTo('admin'),
  systemController.reloadCache
);

export default router;
