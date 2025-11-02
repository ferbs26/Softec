const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.usuarios = require('./usuario.model')(sequelize, DataTypes);
db.roles = require('./rol.model')(sequelize, DataTypes);
db.computadoras = require('./computadora.model')(sequelize, DataTypes);
db.aulas = require('./aula.model')(sequelize, DataTypes);
db.reportes = require('./reporte.model')(sequelize, DataTypes);
db.estados_reporte = require('./estado_reporte.model')(sequelize, DataTypes);
db.repuestos = require('./repuesto.model')(sequelize, DataTypes);
db.historial_cambios = require('./historial-cambio.model')(sequelize, DataTypes);

// Importar modelo de unión
const UsuarioRol = require('./usuario_rol.model')(sequelize, DataTypes);

db.usuario_rol = UsuarioRol;

// Relaciones
// Usuario - Rol (Muchos a Muchos)
db.roles.belongsToMany(db.usuarios, {
  through: UsuarioRol,
  foreignKey: 'rol_id',
  otherKey: 'usuario_id',
  as: 'usuarios'
});

db.usuarios.belongsToMany(db.roles, {
  through: UsuarioRol,
  foreignKey: 'usuario_id',
  otherKey: 'rol_id',
  as: 'roles'
});

// Usuario - Reporte (Uno a Muchos)
db.usuarios.hasMany(db.reportes, {
  foreignKey: 'usuario_id',
  as: 'reportes'
});

db.reportes.belongsTo(db.usuarios, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Computadora - Aula (Muchos a Uno)
db.aulas.hasMany(db.computadoras, {
  foreignKey: 'aula_id',
  as: 'computadoras'
});

db.computadoras.belongsTo(db.aulas, {
  foreignKey: 'aula_id',
  as: 'aula'
});

// Reporte - Estado_Reporte (Uno a Muchos)
db.reportes.hasMany(db.estados_reporte, {
  foreignKey: 'reporte_id',
  as: 'estados'
});

db.estados_reporte.belongsTo(db.reportes, {
  foreignKey: 'reporte_id',
  as: 'reporte'
});

// Computadora - Reporte (Uno a Muchos)
db.computadoras.hasMany(db.reportes, {
  foreignKey: 'computadora_id',
  as: 'reportes'
});

db.reportes.belongsTo(db.computadoras, {
  foreignKey: 'computadora_id',
  as: 'computadora'
});

// Usuario - HistorialCambio (Uno a Muchos)
db.usuarios.hasMany(db.historial_cambios, {
  foreignKey: 'usuario_id',
  as: 'historial'
});

db.historial_cambios.belongsTo(db.usuarios, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Repuesto - HistorialCambio (Uno a Muchos)
db.repuestos.hasMany(db.historial_cambios, {
  foreignKey: 'entidad_id',
  as: 'historial',
  scope: {
    entidad: 'Repuesto'
  },
  foreignKeyConstraint: false
});

module.exports = db;
