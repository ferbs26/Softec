'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reportes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      titulo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      prioridad: {
        type: Sequelize.ENUM('baja', 'media', 'alta', 'urgente'),
        defaultValue: 'media'
      },
      estado_actual: {
        type: Sequelize.ENUM('pendiente', 'en_progreso', 'resuelto', 'cerrado'),
        defaultValue: 'pendiente'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      computadora_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'computadoras',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tecnico_asignado_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Crear índices para búsquedas comunes
    await queryInterface.addIndex('reportes', ['estado_actual'], {
      name: 'idx_reportes_estado'
    });

    await queryInterface.addIndex('reportes', ['prioridad'], {
      name: 'idx_reportes_prioridad'
    });

    await queryInterface.addIndex('reportes', ['usuario_id'], {
      name: 'idx_reportes_usuario'
    });

    await queryInterface.addIndex('reportes', ['computadora_id'], {
      name: 'idx_reportes_computadora'
    });

    await queryInterface.addIndex('reportes', ['tecnico_asignado_id'], {
      name: 'idx_reportes_tecnico'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('reportes');
  }
};
