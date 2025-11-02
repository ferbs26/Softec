'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HistorialCambio extends Model {
    static associate(models) {
      // Un registro de historial pertenece a un usuario
      this.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
        as: 'usuario'
      });
    }

    // Método estático para registrar un cambio
    static async registrarCambio({
      entidad,
      entidadId,
      accion,
      detalles,
      cambios,
      usuarioId,
      ip = null,
      userAgent = null,
      transaction = null
    }) {
      return this.create({
        entidad,
        entidad_id: entidadId,
        accion,
        detalles,
        cambios: cambios ? JSON.stringify(cambios) : null,
        usuario_id: usuarioId,
        ip,
        user_agent: userAgent
      }, { transaction });
    }
  }
  
  HistorialCambio.init({
    entidad: {
      type: DataTypes.ENUM('Usuario', 'Computadora', 'Aula', 'Reporte', 'Repuesto', 'Otro'),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La entidad es obligatoria' },
        isIn: {
          args: [['Usuario', 'Computadora', 'Aula', 'Reporte', 'Repuesto', 'Otro']],
          msg: 'Entidad no válida'
        }
      }
    },
    entidad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'El ID de la entidad debe ser un número entero' },
        min: { args: [1], msg: 'El ID de la entidad debe ser mayor a 0' }
      }
    },
    accion: {
      type: DataTypes.ENUM('crear', 'actualizar', 'eliminar', 'cambiar_estado'),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La acción es obligatoria' },
        isIn: {
          args: [['crear', 'actualizar', 'eliminar', 'cambiar_estado']],
          msg: 'Acción no válida'
        }
      }
    },
    detalles: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cambios: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('cambios');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('cambios', value ? JSON.stringify(value) : null);
      }
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        isInt: { msg: 'El ID del usuario debe ser un número entero' },
        min: { args: [1], msg: 'El ID del usuario debe ser mayor a 0' }
      }
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
      validate: {
        isIP: { msg: 'Dirección IP no válida' }
      }
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'HistorialCambio',
    tableName: 'historial_cambios',
    timestamps: false,
    indexes: [
      {
        name: 'idx_entidad_entidad_id',
        fields: ['entidad', 'entidad_id']
      },
      {
        name: 'idx_usuario_id',
        fields: ['usuario_id']
      }
    ]
  });

  return HistorialCambio;
};
