import express from 'express';
import pendingController from '../controllers/pendingController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas protegidas por autenticación
router.use(authenticateToken);

// Rutas para administradores
router.post('/', requireAdmin, pendingController.createPendingActivity);
router.get('/', requireAdmin, pendingController.getPendingActivities);
router.put('/:id', requireAdmin, pendingController.updatePendingActivity);
router.delete('/:id', requireAdmin, pendingController.deletePendingActivity);
router.patch('/:id/assign', requireAdmin, pendingController.assignPendingActivity);
router.get('/users/active', requireAdmin, pendingController.getActiveUsersForAssignment);
router.get('/export', requireAdmin, pendingController.exportAssignedActivities);

export default router;