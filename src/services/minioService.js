import { Client } from 'minio';
import config from '../config/index.js';
import crypto from 'crypto';
import path from 'path';
import sharp from 'sharp';

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

      // Validar y optimizar la imagen si es necesario
      let processedBuffer = fileBuffer;
      const extension = path.extname(originalName).toLowerCase();
      const isImage = originalName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
      
      console.log(`📥 Subiendo evidencia - Archivo: ${originalName}, Extensión: ${extension}, Tamaño original: ${fileBuffer.length} bytes`);
      
      if (isImage) {
        const needsOptimization = !this.isImageOptimized(fileBuffer, originalName);
        
        if (needsOptimization) {
          console.log(`🔄 La imagen requiere optimización - Archivo: ${originalName}`);
          processedBuffer = await this.optimizeImage(fileBuffer, 'evidence');
          
          // Validar que el buffer optimizado no sea nulo o inválido
          if (!processedBuffer || processedBuffer.length === 0) {
            console.error('⚠️ La optimización devolvió un buffer inválido, usando archivo original');
            processedBuffer = fileBuffer;
          }
        } else {
          console.log(`✅ La imagen ya está optimizada - Archivo: ${originalName}`);
        }
      }

      const fileName = this.generateUniqueFileName(originalName);
      const bucketName = this.buckets.evidencias;
      
      // Preparar metadatos
      const fileMetadata = {
        'Content-Type': this.getContentType(originalName),
        'Upload-Date': new Date().toISOString(),
        'Original-Name': originalName,
        'Original-Size': fileBuffer.length.toString(),
        'Optimized': (processedBuffer.length !== fileBuffer.length).toString(),
        ...metadata
      };

      // Validar que processedBuffer es válido antes de subir
      if (!processedBuffer || processedBuffer.length === 0) {
        throw new Error('El buffer de imagen está vacío o inválido');
      }

      // Subir archivo
      const result = await this.client.putObject(
        bucketName,
        fileName,
        processedBuffer,
        processedBuffer.length,
        fileMetadata
      );

      // Generar URL de acceso
      const fileUrl = await this.getFileUrl(bucketName, fileName);

      console.log(`📤 Evidencia subida - Archivo: ${originalName}, Tamaño original: ${fileBuffer.length} bytes, Tamaño final: ${processedBuffer.length} bytes, Optimizado: ${processedBuffer.length !== fileBuffer.length}`);

      return {
        success: true,
        etag: result.etag,
        fileName: fileName,
        originalName: originalName,
        url: fileUrl,
        bucket: bucketName,
        size: processedBuffer.length,
        originalSize: fileBuffer.length,
        isOptimized: processedBuffer.length !== fileBuffer.length,
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

      // Validar y optimizar la imagen si es necesario
      let processedBuffer = fileBuffer;
      const extension = path.extname(originalName).toLowerCase();
      const isImage = originalName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
      
      console.log(`📥 Subiendo avatar - Usuario: ${userId}, Archivo: ${originalName}, Extensión: ${extension}, Tamaño original: ${fileBuffer.length} bytes`);
      
      if (isImage) {
        const needsOptimization = !this.isImageOptimized(fileBuffer, originalName);
        
        if (needsOptimization) {
          console.log(`🔄 El avatar requiere optimización - Usuario: ${userId}, Archivo: ${originalName}`);
          processedBuffer = await this.optimizeImage(fileBuffer, 'avatar');
          
          // Validar que el buffer optimizado no sea nulo o inválido
          if (!processedBuffer || processedBuffer.length === 0) {
            console.error('⚠️ La optimización devolvió un buffer inválido, usando archivo original');
            processedBuffer = fileBuffer;
          }
        } else {
          console.log(`✅ El avatar ya está optimizado - Usuario: ${userId}, Archivo: ${originalName}`);
        }
      }

      const fileName = `avatar_${userId}_${this.generateUniqueFileName(originalName)}`;
      const bucketName = this.buckets.avatars;
      
      const fileMetadata = {
        'Content-Type': this.getContentType(originalName),
        'Upload-Date': new Date().toISOString(),
        'User-Id': userId,
        'Original-Name': originalName,
        'Original-Size': fileBuffer.length.toString(),
        'Optimized': (processedBuffer.length !== fileBuffer.length).toString()
      };

      // Validar que processedBuffer es válido antes de subir
      if (!processedBuffer || processedBuffer.length === 0) {
        throw new Error('El buffer de imagen está vacío o inválido');
      }

      const result = await this.client.putObject(
        bucketName,
        fileName,
        processedBuffer,
        processedBuffer.length,
        fileMetadata
      );

      const fileUrl = await this.getFileUrl(bucketName, fileName);

      console.log(`📤 Avatar subido - Usuario: ${userId}, Archivo: ${originalName}, Tamaño original: ${fileBuffer.length} bytes, Tamaño final: ${processedBuffer.length} bytes, Optimizado: ${processedBuffer.length !== fileBuffer.length}`);

      return {
        success: true,
        etag: result.etag,
        fileName: fileName,
        originalName: originalName,
        url: fileUrl,
        bucket: bucketName,
        size: processedBuffer.length,
        originalSize: fileBuffer.length,
        isOptimized: processedBuffer.length !== fileBuffer.length
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

      // Validar y optimizar la imagen si es un archivo de imagen
      let processedBuffer = fileBuffer;
      const extension = path.extname(originalName).toLowerCase();
      const isImage = originalName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
      
      console.log(`📥 Subiendo documento - Categoría: ${category}, Archivo: ${originalName}, Extensión: ${extension}, Tamaño original: ${fileBuffer.length} bytes`);
      
      if (isImage) {
        const needsOptimization = !this.isImageOptimized(fileBuffer, originalName);
        
        if (needsOptimization) {
          console.log(`🔄 El documento requiere optimización - Categoría: ${category}, Archivo: ${originalName}`);
          processedBuffer = await this.optimizeImage(fileBuffer, 'document');
          
          // Validar que el buffer optimizado no sea nulo o inválido
          if (!processedBuffer || processedBuffer.length === 0) {
            console.error('⚠️ La optimización devolvió un buffer inválido, usando archivo original');
            processedBuffer = fileBuffer;
          }
        } else {
          console.log(`✅ El documento ya está optimizado - Categoría: ${category}, Archivo: ${originalName}`);
        }
      }

      const fileName = `${category}/${this.generateUniqueFileName(originalName)}`;
      const bucketName = this.buckets.documents;
      
      const fileMetadata = {
        'Content-Type': this.getContentType(originalName),
        'Upload-Date': new Date().toISOString(),
        'Category': category,
        'Original-Name': originalName,
        'Original-Size': fileBuffer.length.toString(),
        'Optimized': (processedBuffer.length !== fileBuffer.length).toString(),
        ...metadata
      };

      // Validar que processedBuffer es válido antes de subir
      if (!processedBuffer || processedBuffer.length === 0) {
        throw new Error('El buffer de imagen está vacío o inválido');
      }

      const result = await this.client.putObject(
        bucketName,
        fileName,
        processedBuffer,
        processedBuffer.length,
        fileMetadata
      );

      const fileUrl = await this.getFileUrl(bucketName, fileName);

      console.log(`📤 Documento subido - Categoría: ${category}, Archivo: ${originalName}, Tamaño original: ${fileBuffer.length} bytes, Tamaño final: ${processedBuffer.length} bytes, Optimizado: ${processedBuffer.length !== fileBuffer.length}`);

      return {
        success: true,
        etag: result.etag,
        fileName: fileName,
        originalName: originalName,
        url: fileUrl,
        bucket: bucketName,
        category: category,
        size: processedBuffer.length,
        originalSize: fileBuffer.length,
        isOptimized: processedBuffer.length !== fileBuffer.length
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
      // Para buckets públicos (como evidencias), generar URL que pase por el backend
      if (bucketName === this.buckets.evidencias) {
        // Esta URL permitirá al frontend acceder a archivos públicos
        return `/api/files/public/${bucketName}/${fileName}`;
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
   * Comprimir y optimizar imagen
   */
  async optimizeImage(buffer, type = 'evidence') {
    try {
      let maxWidth, maxHeight, quality;
      
      switch(type) {
        case 'evidence':
          maxWidth = 1920;
          maxHeight = 1080;
          quality = 80;
          break;
        case 'avatar':
          maxWidth = 800;
          maxHeight = 800;
          quality = 80;
          break;
        case 'document':
        default:
          maxWidth = 1920;
          maxHeight = 1080;
          quality = 85;
          break;
      }
      
      console.log(`🔄 Optimizando imagen - Tipo: ${type}, Tamaño original: ${buffer.length} bytes`);
      
      // Verificar que el buffer no sea nulo o vacío
      if (!buffer || buffer.length === 0) {
        console.warn('⚠️ Buffer vacío recibido para optimización');
        return buffer;
      }
      
      const resultBuffer = await sharp(buffer)
        .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: quality, progressive: true, chromaSubsampling: '4:2:0' })
        .toBuffer();
        
      // Verificar que el resultado no sea nulo o vacío
      if (!resultBuffer || resultBuffer.length === 0) {
        console.error('⚠️ Optimización devolvió buffer vacío, usando original');
        return buffer;
      }
        
      console.log(`✅ Imagen optimizada - Tamaño original: ${buffer.length} bytes, Tamaño final: ${resultBuffer.length} bytes, Reducción: ${((buffer.length - resultBuffer.length) / buffer.length * 100).toFixed(2)}%`);
      
      return resultBuffer;
    } catch (error) {
      console.error('❌ Error optimizando imagen:', error);
      // Si falla la optimización, devolver el buffer original
      return buffer;
    }
  }

  /**
   * Validar si una imagen ya está optimizada
   */
  isImageOptimized(buffer, fileName) {
    const extension = path.extname(fileName).toLowerCase();
    const isWebP = extension === '.webp';
    const isSmallFile = buffer.length < 3 * 1024 * 1024; // Menos de 3MB
    
    console.log(`📊 Validando imagen optimizada - Archivo: ${fileName}, Extensión: ${extension}, Tamaño: ${buffer.length} bytes, Es WebP: ${isWebP}, Es pequeño (<3MB): ${isSmallFile}`);
    
    return isSmallFile && isWebP;
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
