const db = require('../models');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    // Sincronizar todos los modelos
    await db.sequelize.sync({ force: true });
    console.log('Base de datos sincronizada');

    // Crear roles iniciales
    const roles = await db.roles.bulkCreate([
      { nombre: 'admin', descripcion: 'Administrador del sistema' },
      { nombre: 'tecnico', descripcion: 'Técnico de soporte' },
      { nombre: 'docente', descripcion: 'Docente' },
      { nombre: 'alumno', descripcion: 'Estudiante' }
    ]);
    console.log('Roles creados con éxito');

    // Crear usuario administrador
    const adminRole = roles.find(role => role.nombre === 'admin');
    const hashedPassword = await bcrypt.hash('admin123', 8);
    
    const adminUser = await db.usuarios.create({
      nombre: 'Admin',
      apellido: 'Sistema',
      email: 'admin@softec.com',
      password: hashedPassword,
      tipo: 'tecnico',
      activo: true
    });

    // Asignar rol de administrador al usuario
    await adminUser.addRole(adminRole);
    
    console.log('Usuario administrador creado con éxito');
    console.log('Email: admin@softec.com');
    console.log('Contraseña: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();
