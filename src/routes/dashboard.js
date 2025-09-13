import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /dashboard
 * @desc    Obtener datos del dashboard (estadísticas y reportes recientes)
 * @access  Private
 */
router.get('/', authenticateToken, dashboardController.getDashboardData);

export default router;
