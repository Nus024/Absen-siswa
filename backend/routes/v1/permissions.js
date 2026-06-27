import express from 'express';
import { permissionController } from '../../controllers/permissionController.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get('/', permissionController.getAll);
router.get('/active', permissionController.getActive);
router.post('/', permissionController.create);
router.put('/:id/kembali', permissionController.kembali);

export default router;
