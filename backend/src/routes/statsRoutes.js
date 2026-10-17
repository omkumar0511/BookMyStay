import express from 'express';
import { getAdminStats, getManagerStats } from '../controllers/statsController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/admin', authorizeRoles('admin'), getAdminStats);
router.get('/manager', authorizeRoles('manager', 'admin'), getManagerStats);

export default router;
