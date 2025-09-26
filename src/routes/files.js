import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import fileUploadController, { evidenceUpload, avatarUpload, documentUpload } from '../controllers/fileUploadController.js';

const router = Router();

// File upload routes
router.post('/evidence', 
  authenticateToken, 
  evidenceUpload.single('evidence'), 
  fileUploadController.uploadEvidence
);

router.post('/evidence/multiple', 
  authenticateToken, 
  evidenceUpload.array('evidences', 5), 
  fileUploadController.uploadMultipleEvidence
);

router.post('/avatar', 
  authenticateToken, 
  avatarUpload.single('avatar'), 
  fileUploadController.uploadAvatar
);

router.post('/document', 
  authenticateToken, 
  documentUpload.single('document'), 
  fileUploadController.uploadDocument
);

// File serving routes (public for evidencias bucket)
router.get('/public/:bucket/:fileName', fileUploadController.serveFile);

// File management routes
router.get('/:bucket/:fileName/info', authenticateToken, fileUploadController.getFileInfo);
router.get('/:bucket/:fileName/download', authenticateToken, fileUploadController.generateDownloadUrl);
router.get('/:bucket/list', authenticateToken, fileUploadController.listFiles);
router.delete('/:bucket/:fileName', authenticateToken, fileUploadController.deleteFile);
router.get('/storage/stats', authenticateToken, fileUploadController.getStorageStats);

export default router;