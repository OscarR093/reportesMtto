import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import equipmentController from '../controllers/equipmentController.js';

const router = Router();

// Equipment hierarchy routes
router.get('/hierarchy', authenticateToken, equipmentController.getHierarchy);
router.get('/areas', authenticateToken, equipmentController.getAreas);
router.get('/metadata', authenticateToken, equipmentController.getMetadata);
router.get('/stats', authenticateToken, equipmentController.getStats);
router.get('/search', authenticateToken, equipmentController.searchEquipment);

// Equipment by hierarchy
router.get('/:areaKey/machines', authenticateToken, equipmentController.getMachinesByArea);
router.get('/:areaKey/:machineKey/elements', authenticateToken, equipmentController.getElementsByMachine);
router.get('/:areaKey/:machineKey/:elementKey/components', authenticateToken, equipmentController.getComponentsByElement);
router.get('/:areaKey/path', authenticateToken, equipmentController.getEquipmentPath);
router.get('/:areaKey/validate', authenticateToken, equipmentController.validatePath);

export default router;