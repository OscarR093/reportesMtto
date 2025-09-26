import { Sequelize } from 'sequelize';
import config from '../config/index.js';

// Configuración de Sequelize para PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.POSTGRES_DB || 'reportes_mtto',
  process.env.DB_USERNAME || process.env.POSTGRES_USER || 'reportes_user',
  process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'reportes_password_2024',
  {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'postgres',
    port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
);

// Función para conectar a la base de datos
export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    // Importar modelos para asegurar que las asociaciones se configuren
    const { initializeAssociations } = await import('../models/index.js');
    
    // Inicializar MinIO
    const minioService = await import('../services/minioService.js');
    await minioService.default.initialize();
    
    // Sincronizar modelos con la base de datos - crear tablas si no existen
    console.log('🔄 Sincronizando modelos con la base de datos...');
    await sequelize.sync({ force: false, alter: false });
    console.log('🔄 Modelos sincronizados con la base de datos');
    console.log('🔗 Asociaciones de modelos configuradas');
    
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    return false;
  }
};

// Función para cerrar la conexión
export const disconnectDatabase = async () => {
  try {
    await sequelize.close();
    console.log('🔌 Conexión a PostgreSQL cerrada');
  } catch (error) {
    console.error('❌ Error cerrando conexión:', error);
  }
};

export default sequelize;
