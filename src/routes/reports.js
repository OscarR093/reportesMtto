import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import reportController from '../controllers/reportController.js';

const router = Router();

// Report management routes
router.get('/stats', authenticateToken, reportController.getStats);
router.get('/high-priority', authenticateToken, reportController.getHighPriorityReports);
router.get('/export', authenticateToken, reportController.exportReports);
router.get('/', authenticateToken, reportController.getReports);

// User-specific report routes
router.get('/my', authenticateToken, reportController.getMyReports);
router.get('/assigned', authenticateToken, reportController.getAssignedReports);

// Equipment-specific reports
router.get('/equipment/:areaKey', authenticateToken, reportController.getReportsByEquipment);

// Specific report routes
router.get('/:id', authenticateToken, reportController.getReportById);
router.put('/:id', authenticateToken, reportController.updateReport);
router.patch('/:id/assign', authenticateToken, reportController.assignReport);
router.patch('/:id/status', authenticateToken, reportController.changeStatus);
router.delete('/:id', authenticateToken, reportController.deleteReport);

export default router;