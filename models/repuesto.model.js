'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Repuesto extends Model {
    static associate(models) {
      // Un repuesto puede estar asociado a muchos registros de historial de cambios
      this.hasMany(models.HistorialCambio, {
        foreignKey: 'entidad_id',
        constraints: false,
        scope: {
          entidad: 'Repuesto'
        }
      });
    }
  }
  
  Repuesto.init({
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El código es obligatorio' },
        len: {
          args: [1, 20],
          msg: 'El código debe tener entre 1 y 20 caracteres'
        }
      }
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre es obligatorio' },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La categoría es obligatoria' },
        isIn: {
          args: [['Almacenamiento', 'Memoria', 'Procesadores', 'Tarjetas Madre', 'Tarjetas de Video', 'Fuentes de Poder', 'Gabinetes', 'Enfriamiento', 'Periféricos', 'Redes', 'Pantallas', 'Otros']],
          msg: 'Categoría no válida'
        }
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'La cantidad debe ser un número entero' },
        min: {
          args: [0],
          msg: 'La cantidad no puede ser negativa'
        }
      }
    },
    minimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        isInt: { msg: 'El mínimo debe ser un número entero' },
        min: {
          args: [1],
          msg: 'El stock mínimo debe ser al menos 1'
        }
      }
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        isDecimal: { msg: 'El precio debe ser un número decimal' },
        min: {
          args: [0],
          msg: 'El precio no puede ser negativo'
        }
      }
    },
    estado: {
      type: DataTypes.ENUM('disponible', 'bajo', 'agotado'),
      allowNull: false,
      defaultValue: 'disponible',
      validate: {
        isIn: {
          args: [['disponible', 'bajo', 'agotado']],
          msg: 'Estado no válido'
        }
      }
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Repuesto',
    tableName: 'repuestos',
    paranoid: true,
    hooks: {
      beforeSave: (repuesto, options) => {
        // Actualizar el estado según la cantidad disponible
        if (repuesto.cantidad <= 0) {
          repuesto.estado = 'agotado';
        } else if (repuesto.cantidad <= repuesto.minimo) {
          repuesto.estado = 'bajo';
        } else {
          repuesto.estado = 'disponible';
        }
      }
    }
  });

  return Repuesto;
};
