module.exports = (sequelize, DataTypes) => {
  const EstadoReporte = sequelize.define('EstadoReporte', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en_progreso', 'resuelto', 'cerrado'),
      allowNull: false
    },
    comentario: {
      type: DataTypes.TEXT
    },
    reporte_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'reportes',
        key: 'id'
      },
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      allowNull: false
    }
  }, {
    tableName: 'estados_reporte',
    timestamps: true
  });

  return EstadoReporte;
};
