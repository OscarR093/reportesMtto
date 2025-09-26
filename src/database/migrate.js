#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones de Sequelize...');
    
    // Usar DATABASE_URL para que sequelize-cli la reconozca automáticamente
    const env = {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production',
      DATABASE_URL: `postgres://${process.env.DB_USERNAME || process.env.POSTGRES_USER || 'reportes_user'}:${process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'reportes_password_2024'}@${process.env.DB_HOST || process.env.POSTGRES_HOST || 'postgres'}:${process.env.DB_PORT || process.env.POSTGRES_PORT || 5432}/${process.env.DB_NAME || process.env.POSTGRES_DB || 'reportes_mtto'}`
    };
    
    // Ejecutar las migraciones usando sequelize-cli
    const { stdout, stderr } = await execPromise('npx sequelize-cli db:migrate', {
      env: env,
      cwd: process.cwd()
    });
    
    console.log('✅ Migraciones completadas exitosamente');
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    if (error.stdout) console.error('stdout:', error.stdout);
    if (error.stderr) console.error('stderr:', error.stderr);
    process.exit(1);
  }
}

// Ejecutar las migraciones
runMigrations();