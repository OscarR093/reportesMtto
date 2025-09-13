import express from 'express';
import ProfileController from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Obtener perfil del usuario autenticado
router.get('/', authenticateToken, ProfileController.getProfile);

// Completar perfil por primera vez
router.post('/complete', authenticateToken, ProfileController.completeProfile);

// Actualizar perfil del usuario
router.put('/', authenticateToken, ProfileController.updateProfile);

export default router;
