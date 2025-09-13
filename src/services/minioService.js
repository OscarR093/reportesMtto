import { Client } from 'minio';
import config from '../config/index.js';
import crypto from 'crypto';
import path from 'path';

class MinIOService {
  constructor() {
    this.client = new Client({
      endPoint: config.minio.endpoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey
    });
    
    this.buckets = config.minio.buckets;
    this.initialized = false;
  }

  /**
   * Inicializar MinIO y crear buckets necesarios
   */
  async initialize() {
    try {
      // Verificar conexión
      await this.client.listBuckets();
      console.log('✅ Conexión a MinIO establecida correctamente');

      // Crear buckets si no existen
      for (const [bucketName, bucketConfig] of Object.entries(this.buckets)) {
        const exists = await this.client.bucketExists(bucketConfig);
        
        if (!exists) {
          await this.client.makeBucket(bucketConfig, 'us-east-1');
          console.log(`🗂️  Bucket '${bucketConfig}' creado exitosamente`);
          
          // Configurar política pública para bucket de evidencias (solo lectura)
          if (bucketName === 'evidencias') {
            await this.setBucketPolicy(bucketConfig, 'read-only');
          }
        } else {
          console.log(`🗂️  Bucket '${bucketConfig}' ya existe`);
        }
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Error inicializando MinIO:', error);
      return false;
    }
  }

  /**
   * Configurar política de bucket
   */
  async setBucketPolicy(bucketName, policy = 'read-only') {
    try {
      const policyConfig = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: policy === 'read-only' ? ['s3:GetObject'] : ['s3:GetObject', 's3:PutObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };

      await this.client.setBucketPolicy(bucketName, JSON.stringify(policyConfig));
      console.log(`🔒 Política '${policy}' configurada para bucket '${bucketName}'`);
    } catch (error) {
      console.error(`❌ Error configurando política para bucket '${bucketName}':`, error);
    }
  }

  /**
   * Generar nombre único para archivo
   */
  generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    // Limpiar el nombre del archivo
    const cleanBaseName = baseName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    
    return `${timestamp}_${randomHash}_${cleanBaseName}${extension}`;
  }

  /**
   * Subir archivo de evidencia
   */
  async uploadEvidence(fileBuffer, originalName, metadata = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const fileName = this.generateUniqueFileName(originalName);
      const bucketName = this.buckets.evidencias;
      
      // Preparar metadatos
      const fileMetadata = {
        'Content-Type': this.getContentType(originalName),
        'Upload-Date': new Date().toISOString(),
        'Original-Name': originalName,
        ...metadata
      };

      // Subir archivo
      const result = await this.client.putObject(
        bucketName,
        fileName,
        fileBuffer,
        fileBuffer.length,
        fileMetadata
      );

      // Generar URL de acceso
      const fileUrl = await this.getFileUrl(bucketName, fileName);

      return {
        success: true,
        etag: result.etag,
        fileName: fileName,
        originalName: originalName,
        url: fileUrl,
        bucket: bucketName,
        size: fileBuffer.length,
        uploadDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error subiendo evidencia:', error);
      throw new Error(`Error al subir evidencia: ${error.message}`);
    }
  }

  /**
   * Subir avatar de usuario
   */
  async uploadAvatar(fileBuffer, userId, originalName) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const fileName = `avatar_${userId}_${this.generateUniqueFileName(originalName)}`;
      const bucketName = this.buckets.avatars;
      
      const fileMetadata = {
        'Content-Type': this.getContentType(originalName),
        'Upload-Date': new Date().toISOString(),
        'User-Id': userId,
        'Original-Name': originalName
      };

      const result = await this.client.putObject(
        bucketName,
        fileName,
        fileBuffer,
        fileBuffer.length,
        fileMetadata
      );

      const fileUrl = await this.getFileUrl(bucketName, fileName);

      return {
        success: true,
        etag: result.etag,
        fileName: fileName,
        originalName: originalName,
        url: fileUrl,
        bucket: bucketName,
        size: fileBuffer.length
      };
    } catch (error) {
      console.error('❌ Error subiendo avatar:', error);
      throw new Error(`Error al subir avatar: ${error.message}`);
    }
  }

  /**
   * Subir documento general
   */
  async uploadDocument(fileBuffer, originalName, category = 'general', metadata = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const fileName = `${category}/${this.generateUniqueFileName(originalName)}`;
      const bucketName = this.buckets.documents;
      
      const fileMetadata = {
        'Content-Type': this.getContentType(originalName),
        'Upload-Date': new Date().toISOString(),
        'Category': category,
        'Original-Name': originalName,
        ...metadata
      };

      const result = await this.client.putObject(
        bucketName,
        fileName,
        fileBuffer,
        fileBuffer.length,
        fileMetadata
      );

      const fileUrl = await this.getFileUrl(bucketName, fileName);

      return {
        success: true,
        etag: result.etag,
        fileName: fileName,
        originalName: originalName,
        url: fileUrl,
        bucket: bucketName,
        category: category,
        size: fileBuffer.length
      };
    } catch (error) {
      console.error('❌ Error subiendo documento:', error);
      throw new Error(`Error al subir documento: ${error.message}`);
    }
  }

  /**
   * Obtener URL de archivo
   */
  async getFileUrl(bucketName, fileName, expires = 24 * 60 * 60) {
    try {
      // Para buckets públicos, generar URL directa
      if (bucketName === this.buckets.evidencias) {
        return `http://${config.minio.endpoint}:${config.minio.port}/${bucketName}/${fileName}`;
      }
      
      // Para buckets privados, generar URL firmada
      return await this.client.presignedGetObject(bucketName, fileName, expires);
    } catch (error) {
      console.error('❌ Error generando URL de archivo:', error);
      throw new Error(`Error al generar URL: ${error.message}`);
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(bucketName, fileName) {
    try {
      await this.client.removeObject(bucketName, fileName);
      return { success: true, message: 'Archivo eliminado exitosamente' };
    } catch (error) {
      console.error('❌ Error eliminando archivo:', error);
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }

  /**
   * Obtener información de archivo
   */
  async getFileInfo(bucketName, fileName) {
    try {
      const stat = await this.client.statObject(bucketName, fileName);
      return {
        success: true,
        fileName: fileName,
        size: stat.size,
        lastModified: stat.lastModified,
        etag: stat.etag,
        metadata: stat.metaData
      };
    } catch (error) {
      console.error('❌ Error obteniendo información de archivo:', error);
      throw new Error(`Error al obtener información: ${error.message}`);
    }
  }

  /**
   * Listar archivos en bucket
   */
  async listFiles(bucketName, prefix = '', recursive = false) {
    try {
      const files = [];
      const stream = this.client.listObjects(bucketName, prefix, recursive);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          files.push({
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            etag: obj.etag
          });
        });
        
        stream.on('end', () => {
          resolve({ success: true, files });
        });
        
        stream.on('error', (error) => {
          reject(new Error(`Error listando archivos: ${error.message}`));
        });
      });
    } catch (error) {
      console.error('❌ Error listando archivos:', error);
      throw new Error(`Error al listar archivos: ${error.message}`);
    }
  }

  /**
   * Obtener tipo de contenido basado en extensión
   */
  getContentType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.json': 'application/json'
    };
    
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Validar tipo de archivo para evidencias
   */
  isValidEvidenceFile(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
    return allowedExtensions.includes(ext);
  }

  /**
   * Validar tipo de archivo para avatars
   */
  isValidAvatarFile(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return allowedExtensions.includes(ext);
  }

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStorageStats() {
    try {
      const stats = {};
      
      for (const [bucketKey, bucketName] of Object.entries(this.buckets)) {
        const bucketExists = await this.client.bucketExists(bucketName);
        
        if (bucketExists) {
          const { files } = await this.listFiles(bucketName, '', true);
          const totalSize = files.reduce((sum, file) => sum + file.size, 0);
          
          stats[bucketKey] = {
            name: bucketName,
            fileCount: files.length,
            totalSize: totalSize,
            totalSizeFormatted: this.formatBytes(totalSize)
          };
        } else {
          stats[bucketKey] = {
            name: bucketName,
            fileCount: 0,
            totalSize: 0,
            totalSizeFormatted: '0 B'
          };
        }
      }
      
      return { success: true, stats };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Formatear bytes a formato legible
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

export default new MinIOService();
