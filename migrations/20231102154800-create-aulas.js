'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('aulas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      piso: {
        type: Sequelize.STRING,
        allowNull: false
      },
      capacidad: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      descripcion: {
        type: Sequelize.TEXT,
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

    // Crear índice para búsquedas por piso
    await queryInterface.addIndex('aulas', ['piso'], {
      name: 'idx_aulas_piso'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('aulas');
  }
};
