#!/usr/bin/env node

import { Sequelize } from 'sequelize';

// Configuración de Sequelize para PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.POSTGRES_DB || 'reportes_mtto',
  process.env.DB_USERNAME || process.env.POSTGRES_USER || 'reportes_user',
  process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'reportes_password_2024',
  {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'postgres',
    port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Desactivar logging en migraciones
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function runMigrations() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    
    // Autenticar la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    
    // Importar todos los modelos para que Sequelize los registre
    await import('../models/User.js');
    await import('../models/Report.js');
    await import('../models/Pending.js');
    
    // Sincronizar los modelos con la base de datos - crear tablas si no existen
    console.log('🔄 Sincronizando modelos con la base de datos...');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Modelos sincronizados exitosamente');
    
    // Cerrar la conexión
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
    
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
    process.exit(1);
  }
}

// Ejecutar la sincronización
runMigrations();