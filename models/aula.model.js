module.exports = (sequelize, DataTypes) => {
  const Aula = sequelize.define('Aula', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    piso: {
      type: DataTypes.STRING,
      allowNull: false
    },
    capacidad: {
      type: DataTypes.INTEGER
    },
    descripcion: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'aulas',
    timestamps: true
  });

  return Aula;
};
