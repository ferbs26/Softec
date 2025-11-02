'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('historial_cambios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      entidad: {
        type: Sequelize.ENUM('Usuario', 'Computadora', 'Aula', 'Reporte', 'Repuesto', 'Otro'),
        allowNull: false
      },
      entidad_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      accion: {
        type: Sequelize.ENUM('crear', 'actualizar', 'eliminar', 'cambiar_estado'),
        allowNull: false
      },
      detalles: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cambios: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON con los cambios realizados'
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
      ip: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Agregar índices para mejorar el rendimiento de las consultas
    await queryInterface.addIndex('historial_cambios', ['entidad', 'entidad_id']);
    await queryInterface.addIndex('historial_cambios', ['usuario_id']);
    await queryInterface.addIndex('historial_cambios', ['createdAt']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('historial_cambios');
  }
};
