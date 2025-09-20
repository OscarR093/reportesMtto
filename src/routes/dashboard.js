import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import dashboardController from '../controllers/dashboardController.js';

const router = Router();

// Dashboard routes
router.get('/', authenticateToken, dashboardController.getDashboardData);

export default router;