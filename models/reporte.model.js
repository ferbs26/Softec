module.exports = (sequelize, DataTypes) => {
  const Reporte = sequelize.define('Reporte', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
      defaultValue: 'media'
    },
    estado_actual: {
      type: DataTypes.ENUM('pendiente', 'en_progreso', 'resuelto', 'cerrado'),
      defaultValue: 'pendiente'
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      allowNull: false
    },
    computadora_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'computadoras',
        key: 'id'
      },
      allowNull: false
    },
    tecnico_asignado_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'reportes',
    timestamps: true
  });

  return Reporte;
};
