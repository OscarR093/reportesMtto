-- Script de inicialización para PostgreSQL
-- Este script se ejecuta automáticamente cuando se crea el contenedor

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Crear esquemas adicionales si es necesario
-- CREATE SCHEMA IF NOT EXISTS maintenance;
-- CREATE SCHEMA IF NOT EXISTS analytics;

-- Configurar timezone
SET timezone = 'America/Mexico_City';

-- Optimizaciones de rendimiento para desarrollo
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = 'on';
ALTER SYSTEM SET log_min_duration_statement = 100;

-- Mensaje de inicialización
SELECT 'PostgreSQL inicializado correctamente para ReportesMtto' as status;
