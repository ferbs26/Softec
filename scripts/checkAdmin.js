require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la conexión a la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'softec',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: true
  }
);

// Función para verificar la conexión y el usuario administrador
async function checkAdminUser() {
  try {
    // Verificar la conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Verificar si la base de datos existe
    const [results] = await sequelize.query("SHOW DATABASES LIKE '" + (process.env.DB_NAME || 'softec') + "'");
    if (results.length === 0) {
      console.log('❌ La base de datos no existe. Creando...');
      await sequelize.query('CREATE DATABASE IF NOT EXISTS ' + (process.env.DB_NAME || 'softec'));
      console.log('✅ Base de datos creada correctamente.');
    }

    // Usar la base de datos
    await sequelize.query('USE ' + (process.env.DB_NAME || 'softec'));

    // Verificar si la tabla de usuarios existe
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'usuarios'");
    if (tables.length === 0) {
      console.log('❌ La tabla de usuarios no existe. Ejecutando migraciones...');
      // Aquí deberías ejecutar tus migraciones
      console.log('⚠️ Por favor, ejecuta las migraciones manualmente.');
      return;
    }

    // Verificar si el usuario administrador existe
    const [users] = await sequelize.query("SELECT * FROM usuarios WHERE email = 'admin@softec.com'");
    
    if (users.length === 0) {
      console.log('❌ El usuario administrador no existe. Creando...');
      
      // Crear el usuario administrador
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await sequelize.query(`
        INSERT INTO usuarios (nombre, apellido, email, password, tipo, activo, created_at, updated_at)
        VALUES ('Administrador', 'Sistema', 'admin@softec.com', '${hashedPassword}', 'tecnico', 1, NOW(), NOW())
      `);
      
      console.log('✅ Usuario administrador creado correctamente.');
      console.log('\n🔑 Credenciales de acceso:');
      console.log('   Email: admin@softec.com');
      console.log('   Contraseña: admin123');
    } else {
      console.log('✅ El usuario administrador ya existe en la base de datos.');
      console.log('\n🔑 Credenciales de acceso:');
      console.log('   Email: admin@softec.com');
      console.log('   Contraseña: admin123');
    }

  } catch (error) {
    console.error('❌ Error al verificar el usuario administrador:', error.message);
    console.error('Detalles:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada.');
  }
}

// Ejecutar la función principal
checkAdminUser();
