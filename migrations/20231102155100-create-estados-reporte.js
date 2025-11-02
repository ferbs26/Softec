'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('estados_reporte', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'en_progreso', 'resuelto', 'cerrado'),
        allowNull: false
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reporte_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'reportes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.addIndex('estados_reporte', ['reporte_id'], {
      name: 'idx_estados_reporte_reporte'
    });

    await queryInterface.addIndex('estados_reporte', ['usuario_id'], {
      name: 'idx_estados_reporte_usuario'
    });

    await queryInterface.addIndex('estados_reporte', ['estado'], {
      name: 'idx_estados_reporte_estado'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('estados_reporte');
  }
};
