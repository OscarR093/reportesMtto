import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { avatarUpload } from '../controllers/fileUploadController.js';

const router = Router();

// OAuth routes
router.get('/google',
  (req, res, next) => {
    console.log('🚀 Iniciando OAuth con Google...');
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('📩 Callback de Google recibido');
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/error',
    session: true
  }),
  authController.oauthCallback
);

// JWT authentication routes
router.post('/verify', authController.verifyToken);
router.post('/verify-token', authController.verifyToken);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

// User profile routes
router.get('/status', authController.authStatus);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.post('/upload-photo', authenticateToken, avatarUpload.single('photo'), authController.uploadPhoto);

// Error route
router.get('/error', authController.oauthError);

export default router;