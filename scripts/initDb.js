require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: console.log
});

// Definición de modelos
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('alumno', 'docente', 'tecnico'),
    allowNull: false,
    defaultValue: 'tecnico'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

const Rol = sequelize.define('Rol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'roles',
  timestamps: true
});

const UsuarioRol = sequelize.define('UsuarioRol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  rolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  }
}, {
  tableName: 'usuario_roles',
  timestamps: true
});

// Sincronizar modelos y crear usuario administrador
async function initializeDatabase() {
  try {
    // Sincronizar todos los modelos
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada');

    // Crear rol de administrador
    const adminRole = await Rol.create({
      nombre: 'admin',
      descripcion: 'Administrador del sistema con todos los permisos'
    });
    console.log('✅ Rol de administrador creado');

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario administrador
    const adminUser = await Usuario.create({
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@softec.com',
      password: hashedPassword,
      tipo: 'tecnico',
      activo: true
    });
    console.log('✅ Usuario administrador creado');

    // Asignar rol de administrador al usuario
    await UsuarioRol.create({
      usuarioId: adminUser.id,
      rolId: adminRole.id
    });
    console.log('✅ Rol asignado al administrador');

    console.log('\n🔑 Credenciales de acceso:');
    console.log('   Email: admin@softec.com');
    console.log('   Contraseña: admin123');
    console.log('\n¡La base de datos ha sido inicializada correctamente!');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la inicialización
initializeDatabase();
