const config = {
  development: {
    username: process.env.POSTGRES_USER || 'reportes_user',
    password: process.env.POSTGRES_PASSWORD || 'reportes_pass',
    database: process.env.POSTGRES_DB || 'reportes_mtto',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_meta'
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    migrationStorageTableName: 'sequelize_meta'
  }
};

module.exports = config;
