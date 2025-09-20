import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { userController } from '../controllers/userController.js';

const router = Router();

// User management routes (require authentication)
router.get('/pending', authenticateToken, userController.getPendingUsers);
router.get('/active', authenticateToken, userController.getActiveUsers);
router.get('/stats', authenticateToken, userController.getUserStats);

// Actions on specific users
router.post('/:userId/approve', authenticateToken, userController.approveUser);
router.post('/:userId/reject', authenticateToken, userController.rejectUser);
router.patch('/:userId/role', authenticateToken, userController.changeUserRole);
router.patch('/:userId/deactivate', authenticateToken, userController.deactivateUser);

// Current user routes
router.post('/complete-registration', authenticateToken, userController.completeRegistration);
router.patch('/profile', authenticateToken, userController.updateProfile);

export default router;