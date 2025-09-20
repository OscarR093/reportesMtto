import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';

import config from './config/index.js';
import setupPassport from './config/passport.js';
import { connectDatabase } from './database/connection.js';
import minioService from './services/minioService.js';
import { authenticateToken } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import profileController from './controllers/profileController.js';

// Import all routes
import { 
  authRoutes,
  usersRoutes,
  equipmentRoutes,
  reportsRoutes,
  filesRoutes,
  dashboardRoutes,
  profileRoutes
} from './routes/index.js';

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupPassport();
    this.setupApiRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // CORS configured for React
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Session for OAuth
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
            connected: true // TODO: Add real DB verification
          }
        }
      });
    });

    // Register all API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', usersRoutes);
    this.app.use('/api/equipment', equipmentRoutes);
    this.app.use('/api/reports', reportsRoutes);
    this.app.use('/api/files', filesRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);
    this.app.use('/api/profile', profileRoutes);

    // Root API endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'ReportesMtto API - Backend para React',
        data: {
          version: '1.0.0',
          documentation: '/api/health'
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
    
    // Connect to database
    const dbConnected = await connectDatabase();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Initialize MinIO
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