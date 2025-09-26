import multer from 'multer';
import minioService from '../services/minioService.js';
import config from '../config/index.js';

// Configuración de Multer para almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtros de archivos
const evidenceFileFilter = (req, file, cb) => {
  if (minioService.isValidEvidenceFile(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no válido para evidencia. Permitidos: JPG, PNG, GIF, WEBP, PDF'), false);
  }
};

const avatarFileFilter = (req, file, cb) => {
  if (minioService.isValidAvatarFile(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no válido para avatar. Permitidos: JPG, PNG, GIF, WEBP'), false);
  }
};

// Configuraciones de Multer
const evidenceUpload = multer({
  storage: storage,
  fileFilter: evidenceFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo para evidencias
    files: 5 // Máximo 5 archivos por upload
  }
});

const avatarUpload = multer({
  storage: storage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB máximo para avatars
    files: 1 // Solo un archivo
  }
});

const documentUpload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB máximo para documentos
    files: 10 // Máximo 10 archivos
  }
});

class FileUploadController {
  /**
   * Subir evidencia de reporte
   */
  async uploadEvidence(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se encontró archivo de evidencia'
        });
      }

      const { reportId, description } = req.body;
      const user = req.user;

      const metadata = {
        'Report-Id': reportId || 'unknown',
        'Uploaded-By': user.email,
        'User-Id': user.id,
        'Description': description || ''
      };

      const result = await minioService.uploadEvidence(
        req.file.buffer,
        req.file.originalname,
        metadata
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Evidencia subida exitosamente'
      });
    } catch (error) {
      console.error('Error subiendo evidencia:', error);
      next(error);
    }
  }

  /**
   * Subir múltiples evidencias
   */
  async uploadMultipleEvidence(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No se encontraron archivos de evidencia'
        });
      }

      const { reportId, description } = req.body;
      const user = req.user;

      const uploadPromises = req.files.map(async (file, index) => {
        const metadata = {
          'Report-Id': reportId || 'unknown',
          'Uploaded-By': user.email,
          'User-Id': user.id,
          'Description': description || '',
          'File-Index': index.toString()
        };

        return await minioService.uploadEvidence(
          file.buffer,
          file.originalname,
          metadata
        );
      });

      const results = await Promise.all(uploadPromises);

      res.status(201).json({
        success: true,
        data: results,
        message: `${results.length} evidencias subidas exitosamente`
      });
    } catch (error) {
      console.error('Error subiendo evidencias múltiples:', error);
      next(error);
    }
  }

  /**
   * Subir avatar de usuario
   */
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se encontró archivo de avatar'
        });
      }

      const user = req.user;

      const result = await minioService.uploadAvatar(
        req.file.buffer,
        user.id,
        req.file.originalname
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Avatar subido exitosamente'
      });
    } catch (error) {
      console.error('Error subiendo avatar:', error);
      next(error);
    }
  }

  /**
   * Subir documento general
   */
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se encontró archivo de documento'
        });
      }

      const { category = 'general', description } = req.body;
      const user = req.user;

      const metadata = {
        'Uploaded-By': user.email,
        'User-Id': user.id,
        'Description': description || ''
      };

      const result = await minioService.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        category,
        metadata
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Documento subido exitosamente'
      });
    } catch (error) {
      console.error('Error subiendo documento:', error);
      next(error);
    }
  }

  /**
   * Obtener información de archivo
   */
  async getFileInfo(req, res, next) {
    try {
      const { bucket, fileName } = req.params;

      // Validar que el bucket sea uno de los permitidos
      const allowedBuckets = Object.values(minioService.buckets);
      if (!allowedBuckets.includes(bucket)) {
        return res.status(400).json({
          success: false,
          error: 'Bucket no válido'
        });
      }

      const result = await minioService.getFileInfo(bucket, fileName);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Archivo no encontrado'
        });
      }
      next(error);
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(req, res, next) {
    try {
      const { bucket, fileName } = req.params;
      const user = req.user;

      // Validar que el bucket sea uno de los permitidos
      const allowedBuckets = Object.values(minioService.buckets);
      if (!allowedBuckets.includes(bucket)) {
        return res.status(400).json({
          success: false,
          error: 'Bucket no válido'
        });
      }

      // Solo administradores pueden eliminar archivos de otros usuarios
      // TODO: Implementar validación de permisos más específica

      const result = await minioService.deleteFile(bucket, fileName);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Archivo no encontrado'
        });
      }
      next(error);
    }
  }

  /**
   * Listar archivos en bucket
   */
  async listFiles(req, res, next) {
    try {
      const { bucket } = req.params;
      const { prefix = '', recursive = false } = req.query;
      const user = req.user;

      // Validar que el bucket sea uno de los permitidos
      const allowedBuckets = Object.values(minioService.buckets);
      if (!allowedBuckets.includes(bucket)) {
        return res.status(400).json({
          success: false,
          error: 'Bucket no válido'
        });
      }

      // Solo administradores pueden listar todos los archivos
      // Usuarios normales solo pueden ver sus propios archivos
      let searchPrefix = prefix;
      if (user.role === 'user' && bucket === minioService.buckets.documents) {
        searchPrefix = `user_${user.id}/`;
      }

      const result = await minioService.listFiles(bucket, searchPrefix, recursive === 'true');

      res.status(200).json({
        success: true,
        data: result.files,
        total: result.files.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStorageStats(req, res, next) {
    try {
      const user = req.user;

      // Solo administradores pueden ver estadísticas completas
      if (!user.canManageUsers || !user.canManageUsers()) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver estadísticas de almacenamiento'
        });
      }

      const result = await minioService.getStorageStats();

      res.status(200).json({
        success: true,
        data: result.stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generar URL firmada para descarga
   */
  async generateDownloadUrl(req, res, next) {
    try {
      const { bucket, fileName } = req.params;
      const { expires = 3600 } = req.query; // 1 hora por defecto

      // Validar que el bucket sea uno de los permitidos
      const allowedBuckets = Object.values(minioService.buckets);
      if (!allowedBuckets.includes(bucket)) {
        return res.status(400).json({
          success: false,
          error: 'Bucket no válido'
        });
      }

      const url = await minioService.getFileUrl(bucket, fileName, parseInt(expires));

      res.status(200).json({
        success: true,
        data: {
          url: url,
          expires: parseInt(expires),
          bucket: bucket,
          fileName: fileName
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Servir archivo desde MinIO
   */
  async serveFile(req, res, next) {
    try {
      const { bucket, fileName } = req.params;

      // Validar que el bucket sea uno de los permitidos
      const allowedBuckets = Object.values(minioService.buckets);
      if (!allowedBuckets.includes(bucket)) {
        return res.status(400).json({
          success: false,
          error: 'Bucket no válido'
        });
      }

      // Verificar que el archivo exista y obtener sus metadatos
      const stat = await minioService.getFileInfo(bucket, fileName);
      
      // Establecer headers apropiados
      res.set({
        'Content-Type': stat.metadata['content-type'] || 'application/octet-stream',
        'Content-Length': stat.size,
        'Last-Modified': stat.lastModified.toUTCString(),
        'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
      });

      // Crear stream del archivo y enviarlo
      const stream = await minioService.client.getObject(bucket, fileName);
      stream.pipe(res);
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return res.status(404).json({
          success: false,
          error: 'Archivo no encontrado'
        });
      }
      console.error('Error sirviendo archivo:', error);
      next(error);
    }
  }
}

const fileUploadController = new FileUploadController();

// Exportar tanto el controlador como los middlewares de multer
export default fileUploadController;
export { evidenceUpload, avatarUpload, documentUpload };
