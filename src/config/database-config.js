const config = {
  development: {
    username: process.env.POSTGRES_USER || 'reportes_user',
    password: process.env.POSTGRES_PASSWORD || 'reportes_pass',
    database: process.env.POSTGRES_DB || 'reportes_mtto',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_meta',
    timezone: '-05:00' // America/Mexico_City
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_meta',
    timezone: '-05:00' // America/Mexico_City
  }
};

module.exports = config;
