import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pendingController from '../controllers/pendingController.js';

const router = express.Router();

// Ruta para que los usuarios obtengan sus actividades pendientes asignadas
router.get('/my', authenticateToken, pendingController.getMyPendingActivities);

// Ruta para que los usuarios marquen sus actividades como realizadas
router.patch('/my/:id/complete', authenticateToken, pendingController.markPendingActivityAsCompleted);

export default router;