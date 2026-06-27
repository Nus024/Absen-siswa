import express from 'express';
import { authController } from '../../controllers/authController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { validationMiddleware } from '../../middlewares/validationMiddleware.js';
import { authValidator } from '../../validators/authValidator.js';
import { rateLimitMiddleware } from '../../middlewares/rateLimitMiddleware.js';

const router = express.Router();

// Terapkan rate limiter ketat (10 request/menit) pada endpoint login untuk mencegah brute-force
router.post(
  '/login',
  rateLimitMiddleware(10),
  validationMiddleware(authValidator.validateLogin),
  authController.login
);

router.post('/logout', authMiddleware.verifyToken, authController.logout);
router.get('/session', authMiddleware.verifyToken, authController.getSession);

export default router;
