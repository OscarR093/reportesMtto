import { Sequelize } from 'sequelize';
import config from '../config/index.js';

// Configuración de Sequelize para PostgreSQL
const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: config.server.env === 'development' ? console.log : false,
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
    
    if (config.server.env === 'development') {
      // Solo sincronizar sin alter para evitar errores de modificación
      await sequelize.sync({ force: false, alter: false });
      console.log('🔄 Modelos sincronizados con la base de datos');
      console.log('🔗 Asociaciones de modelos configuradas');
    }
    
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
