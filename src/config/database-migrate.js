const config = {
  development: {
    username: process.env.DB_USERNAME || process.env.POSTGRES_USER || 'reportes_user',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'reportes_password_2024',
    database: process.env.DB_NAME || process.env.POSTGRES_DB || 'reportes_mtto',
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
    port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_meta'
  },
  production: {
    username: process.env.DB_USERNAME || process.env.POSTGRES_USER,
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    database: process.env.DB_NAME || process.env.POSTGRES_DB,
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'postgres',
    port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_meta'
  }
};

// Determinar entorno
const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment];