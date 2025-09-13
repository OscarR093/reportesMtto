import sequelize from '../config/database.js';
import User from './User.js';
import Report from './Report.js';

// Importar todos los modelos aquí
const models = {
  User,
  Report
};

// Configurar asociaciones entre modelos
const initializeAssociations = () => {
  // Un reporte pertenece a un usuario (creador)
  Report.belongsTo(User, {
    as: 'Creator',
    foreignKey: 'user_id'
  });
  
  // Un reporte puede estar asignado a un técnico
  Report.belongsTo(User, {
    as: 'AssignedTechnician',
    foreignKey: 'assigned_to'
  });
  
  // Un reporte puede ser revisado por un supervisor
  Report.belongsTo(User, {
    as: 'Reviewer',
    foreignKey: 'reviewed_by'
  });
  
  // Un usuario puede crear muchos reportes
  User.hasMany(Report, {
    as: 'CreatedReports',
    foreignKey: 'user_id'
  });
  
  // Un usuario puede tener muchos reportes asignados
  User.hasMany(Report, {
    as: 'AssignedReports',
    foreignKey: 'assigned_to'
  });
  
  // Un usuario puede revisar muchos reportes
  User.hasMany(Report, {
    as: 'ReviewedReports',
    foreignKey: 'reviewed_by'
  });
};

// Configurar asociaciones automáticas (si existen)
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Inicializar asociaciones manuales
initializeAssociations();

// Exportar sequelize y modelos
export { sequelize, initializeAssociations };
export default models;
