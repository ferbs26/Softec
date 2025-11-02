module.exports = (sequelize, DataTypes) => {
  const Computadora = sequelize.define('Computadora', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_serie: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    tipo: {
      type: DataTypes.ENUM('escritorio', 'notebook', 'netbook', 'all-in-one'),
      allowNull: false
    },
    marca: {
      type: DataTypes.STRING
    },
    modelo: {
      type: DataTypes.STRING
    },
    procesador: {
      type: DataTypes.STRING
    },
    ram: {
      type: DataTypes.STRING
    },
    almacenamiento: {
      type: DataTypes.STRING
    },
    estado: {
      type: DataTypes.ENUM('disponible', 'en_mantenimiento', 'dañado', 'baja'),
      defaultValue: 'disponible'
    },
    observaciones: {
      type: DataTypes.TEXT
    },
    fecha_adquisicion: {
      type: DataTypes.DATE
    },
    aula_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'aulas',
        key: 'id'
      }
    }
  }, {
    tableName: 'computadoras',
    timestamps: true
  });

  return Computadora;
};
