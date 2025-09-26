#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import config from '../config/index.js';

const execPromise = promisify(exec);

async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones de Sequelize...');
    
    // Preparar variables de entorno para la migración
    const env = {
      ...process.env,
      NODE_ENV: config.server.env,
      DB_HOST: config.database.host,
      DB_PORT: config.database.port,
      DB_NAME: config.database.name,
      DB_USERNAME: config.database.username,
      DB_PASSWORD: config.database.password
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