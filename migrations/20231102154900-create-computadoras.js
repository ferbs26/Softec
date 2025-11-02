'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('computadoras', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero_serie: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      tipo: {
        type: Sequelize.ENUM('escritorio', 'notebook', 'netbook', 'all-in-one'),
        allowNull: false
      },
      marca: {
        type: Sequelize.STRING,
        allowNull: true
      },
      modelo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      procesador: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ram: {
        type: Sequelize.STRING,
        allowNull: true
      },
      almacenamiento: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('disponible', 'en_mantenimiento', 'dañado', 'baja'),
        defaultValue: 'disponible'
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fecha_adquisicion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      aula_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'aulas',
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
    await queryInterface.addIndex('computadoras', ['numero_serie'], {
      unique: true,
      name: 'idx_computadoras_numero_serie'
    });

    await queryInterface.addIndex('computadoras', ['tipo'], {
      name: 'idx_computadoras_tipo'
    });

    await queryInterface.addIndex('computadoras', ['estado'], {
      name: 'idx_computadoras_estado'
    });

    await queryInterface.addIndex('computadoras', ['aula_id'], {
      name: 'idx_computadoras_aula'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('computadoras');
  }
};
