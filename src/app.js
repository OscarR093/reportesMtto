import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';

import config from './config/index.js';
import setupPassport from './config/passport.js';
import { connectDatabase } from './database/connection.js';
import minioService from './services/minioService.js';
import { authController } from './controllers/authController.js';
import { userController } from './controllers/userController.js';
import dashboardController from './controllers/dashboardController.js';
import profileController from './controllers/profileController.js';
import equipmentController from './controllers/equipmentController.js';
import reportController from './controllers/reportController.js';
import fileUploadController, { evidenceUpload, avatarUpload, documentUpload } from './controllers/fileUploadController.js';
import { authenticateToken, optionalAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupPassport();
    this.setupApiRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // CORS configurado para React
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Session para OAuth
    this.app.use(session({
      secret: config.session.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.session.secure,
        httpOnly: true,
        maxAge: config.session.maxAge
      }
    }));

    // Passport
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupPassport() {
    setupPassport();
  }

  setupApiRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'ReportesMtto API funcionando correctamente',
        data: {
          timestamp: new Date().toISOString(),
          environment: config.server.env,
          version: '1.0.0',
          oauth: {
            configured: !!config.oauth.google.clientId
          },
          database: {
            connected: true // TODO: Agregar verificación real de DB
          }
        }
      });
    });

    // ===== RUTAS DE AUTENTICACIÓN =====
    this.app.get('/api/auth/google',
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

    this.app.get('/api/auth/google/callback',
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

    this.app.post('/api/auth/verify', authController.verifyToken);
    this.app.post('/api/auth/verify-token', authController.verifyToken);
    this.app.post('/api/auth/login', authController.login);
    this.app.post('/api/auth/logout', authController.logout);
    this.app.post('/api/auth/refresh', authController.refreshToken);
    this.app.get('/api/auth/status', authController.authStatus);
    this.app.get('/api/auth/profile', authenticateToken, authController.getProfile);
    this.app.put('/api/auth/profile', authenticateToken, authController.updateProfile);
    this.app.put('/api/auth/change-password', authenticateToken, authController.changePassword);
    this.app.post('/api/auth/upload-photo', authenticateToken, avatarUpload.single('photo'), authController.uploadPhoto);
    this.app.get('/api/auth/error', authController.oauthError);

    // ===== RUTAS DE DASHBOARD =====
    this.app.get('/api/dashboard', authenticateToken, dashboardController.getDashboardData);

    // ===== RUTAS DE PERFIL =====
    this.app.get('/api/profile', authenticateToken, profileController.getProfile);
    this.app.post('/api/profile/complete', authenticateToken, profileController.completeProfile);
    this.app.put('/api/profile', authenticateToken, profileController.updateProfile);

    // ===== RUTAS DE USUARIOS =====
    // Rutas para gestión de usuarios (requieren autenticación)
    this.app.get('/api/users/pending', authenticateToken, userController.getPendingUsers);
    this.app.get('/api/users/active', authenticateToken, userController.getActiveUsers);
    this.app.get('/api/users/stats', authenticateToken, userController.getUserStats);
    
    // Rutas para acciones sobre usuarios específicos
    this.app.post('/api/users/:userId/approve', authenticateToken, userController.approveUser);
    this.app.post('/api/users/:userId/reject', authenticateToken, userController.rejectUser);
    this.app.patch('/api/users/:userId/role', authenticateToken, userController.changeUserRole);
    this.app.patch('/api/users/:userId/deactivate', authenticateToken, userController.deactivateUser);
    
    // Rutas para el usuario actual
    this.app.post('/api/users/complete-registration', authenticateToken, userController.completeRegistration);
    this.app.patch('/api/users/profile', authenticateToken, userController.updateProfile);

    // ===== RUTAS DE EQUIPOS =====
    // Rutas públicas (requieren autenticación básica)
    this.app.get('/api/equipment/hierarchy', authenticateToken, equipmentController.getHierarchy);
    this.app.get('/api/equipment/areas', authenticateToken, equipmentController.getAreas);
    this.app.get('/api/equipment/metadata', authenticateToken, equipmentController.getMetadata);
    this.app.get('/api/equipment/stats', authenticateToken, equipmentController.getStats);
    this.app.get('/api/equipment/search', authenticateToken, equipmentController.searchEquipment);
    
    // Rutas específicas por jerarquía
    this.app.get('/api/equipment/:areaKey/machines', authenticateToken, equipmentController.getMachinesByArea);
    this.app.get('/api/equipment/:areaKey/:machineKey/elements', authenticateToken, equipmentController.getElementsByMachine);
    this.app.get('/api/equipment/:areaKey/:machineKey/:elementKey/components', authenticateToken, equipmentController.getComponentsByElement);
    this.app.get('/api/equipment/:areaKey/path', authenticateToken, equipmentController.getEquipmentPath);
    this.app.get('/api/equipment/:areaKey/validate', authenticateToken, equipmentController.validatePath);

    // ===== RUTAS DE REPORTES =====
    // Rutas principales de reportes
    this.app.get('/api/reports', authenticateToken, reportController.getReports);
    this.app.post('/api/reports', authenticateToken, reportController.createReport);
    this.app.get('/api/reports/stats', authenticateToken, reportController.getStats);
    this.app.get('/api/reports/high-priority', authenticateToken, reportController.getHighPriorityReports);
    
    // Rutas personales del usuario
    this.app.get('/api/reports/my', authenticateToken, reportController.getMyReports);
    this.app.get('/api/reports/assigned', authenticateToken, reportController.getAssignedReports);
    
    // Rutas por equipo
    this.app.get('/api/reports/equipment/:areaKey', authenticateToken, reportController.getReportsByEquipment);
    
    // Rutas específicas de reporte
    this.app.get('/api/reports/:id', authenticateToken, reportController.getReportById);
    this.app.put('/api/reports/:id', authenticateToken, reportController.updateReport);
    this.app.patch('/api/reports/:id/assign', authenticateToken, reportController.assignReport);
    this.app.patch('/api/reports/:id/status', authenticateToken, reportController.changeStatus);
    this.app.delete('/api/reports/:id', authenticateToken, reportController.deleteReport);

    // ===== RUTAS DE ARCHIVO/UPLOADS =====
    // Upload de evidencias (fotos de reportes)
    this.app.post('/api/files/evidence', 
      authenticateToken, 
      evidenceUpload.single('evidence'), 
      fileUploadController.uploadEvidence
    );
    
    this.app.post('/api/files/evidence/multiple', 
      authenticateToken, 
      evidenceUpload.array('evidences', 5), 
      fileUploadController.uploadMultipleEvidence
    );
    
    // Upload de avatars
    this.app.post('/api/files/avatar', 
      authenticateToken, 
      avatarUpload.single('avatar'), 
      fileUploadController.uploadAvatar
    );
    
    // Upload de documentos generales
    this.app.post('/api/files/document', 
      authenticateToken, 
      documentUpload.single('document'), 
      fileUploadController.uploadDocument
    );
    
    // Gestión de archivos
    this.app.get('/api/files/:bucket/:fileName/info', authenticateToken, fileUploadController.getFileInfo);
    this.app.get('/api/files/:bucket/:fileName/download', authenticateToken, fileUploadController.generateDownloadUrl);
    this.app.get('/api/files/:bucket/list', authenticateToken, fileUploadController.listFiles);
    this.app.delete('/api/files/:bucket/:fileName', authenticateToken, fileUploadController.deleteFile);
    this.app.get('/api/files/storage/stats', authenticateToken, fileUploadController.getStorageStats);

    // Root API endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'ReportesMtto API - Backend para React',
        data: {
          version: '1.0.0',
          documentation: '/api/health',
          endpoints: {
            auth: {
              google: 'GET /api/auth/google',
              verify: 'POST /api/auth/verify',
              logout: 'POST /api/auth/logout',
              profile: 'GET /api/auth/profile',
              status: 'GET /api/auth/status',
              refresh: 'POST /api/auth/refresh'
            },
            users: {
              pending: 'GET /api/users/pending',
              active: 'GET /api/users/active',
              stats: 'GET /api/users/stats',
              approve: 'POST /api/users/:userId/approve',
              reject: 'POST /api/users/:userId/reject',
              changeRole: 'PATCH /api/users/:userId/role',
              deactivate: 'PATCH /api/users/:userId/deactivate',
              completeRegistration: 'POST /api/users/complete-registration',
              updateProfile: 'PATCH /api/users/profile'
            },
            equipment: {
              hierarchy: 'GET /api/equipment/hierarchy',
              areas: 'GET /api/equipment/areas',
              machines: 'GET /api/equipment/:areaKey/machines',
              elements: 'GET /api/equipment/:areaKey/:machineKey/elements',
              components: 'GET /api/equipment/:areaKey/:machineKey/:elementKey/components',
              search: 'GET /api/equipment/search',
              metadata: 'GET /api/equipment/metadata',
              stats: 'GET /api/equipment/stats'
            },
            reports: {
              all: 'GET /api/reports',
              create: 'POST /api/reports',
              byId: 'GET /api/reports/:id',
              update: 'PUT /api/reports/:id',
              assign: 'PATCH /api/reports/:id/assign',
              status: 'PATCH /api/reports/:id/status',
              delete: 'DELETE /api/reports/:id',
              my: 'GET /api/reports/my',
              assigned: 'GET /api/reports/assigned',
              byEquipment: 'GET /api/reports/equipment/:areaKey',
              stats: 'GET /api/reports/stats',
              highPriority: 'GET /api/reports/high-priority'
            },
            files: {
              uploadEvidence: 'POST /api/files/evidence',
              uploadMultipleEvidence: 'POST /api/files/evidence/multiple',
              uploadAvatar: 'POST /api/files/avatar',
              uploadDocument: 'POST /api/files/document',
              fileInfo: 'GET /api/files/:bucket/:fileName/info',
              downloadUrl: 'GET /api/files/:bucket/:fileName/download',
              listFiles: 'GET /api/files/:bucket/list',
              deleteFile: 'DELETE /api/files/:bucket/:fileName',
              storageStats: 'GET /api/files/storage/stats'
            },
            health: 'GET /api/health'
          }
        }
      });
    });

    // Root endpoint - redirect to API
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'ReportesMtto Backend API',
        redirectTo: '/api'
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFound);
    
    // Error handler
    this.app.use(errorHandler);
  }

  async start() {
    const port = config.server.port;
    
    // Conectar a la base de datos
    const dbConnected = await connectDatabase();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Inicializar MinIO
    console.log('🔧 Inicializando MinIO...');
    const minioInitialized = await minioService.initialize();
    
    if (!minioInitialized) {
      console.warn('⚠️  MinIO no se pudo inicializar, pero el servidor continuará');
    }

    this.app.listen(port, () => {
      console.log(`🚀 Servidor API corriendo en http://localhost:${port}`);
      console.log(`📚 Environment: ${config.server.env}`);
      console.log(`🔐 OAuth configurado: ${config.oauth.google.clientId ? '✅' : '❌'}`);
      console.log(`🗄️  PostgreSQL conectado: ✅`);
      console.log(`🗂️  MinIO inicializado: ${minioInitialized ? '✅' : '⚠️'}`);
      console.log(`👑 SuperAdmin: ${config.superAdmin.email}`);
      console.log(`🎯 API Base: http://localhost:${port}/api`);
      console.log(`⚛️  Configurado para React en puertos: 3001, 5173`);
    });
  }

  getApp() {
    return this.app;
  }
}

export default App;
