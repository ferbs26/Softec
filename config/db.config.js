const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Usar SQLite para desarrollo local
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = sequelize;
