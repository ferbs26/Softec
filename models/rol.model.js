module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Rol;
};
