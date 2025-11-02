'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: true
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

    // Insertar roles por defecto
    return queryInterface.bulkInsert('roles', [
      { nombre: 'admin', descripcion: 'Administrador del sistema' },
      { nombre: 'tecnico', descripcion: 'Técnico de mantenimiento' },
      { nombre: 'usuario', descripcion: 'Usuario estándar' }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('roles');
  }
};
