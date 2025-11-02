require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la conexión a la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'softec',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

// Definición del modelo de Usuario
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
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password'] }
  }
});

// Definición del modelo de Rol
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

// Definición del modelo de UsuarioRol
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

// Función para crear un usuario administrador
async function createAdminUser() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Sincronizar los modelos con la base de datos
    await sequelize.sync();
    console.log('Modelos sincronizados correctamente.');

    // Verificar si el rol de administrador existe, si no, crearlo
    const [rolAdmin, created] = await Rol.findOrCreate({
      where: { nombre: 'admin' },
      defaults: {
        nombre: 'admin',
        descripcion: 'Administrador del sistema con todos los permisos'
      }
    });

    if (created) {
      console.log('Rol de administrador creado exitosamente.');
    } else {
      console.log('El rol de administrador ya existe.');
    }

    // Verificar si ya existe un usuario con el correo de administrador
    const existingAdmin = await Usuario.findOne({
      where: { email: 'admin@softec.com' }
    });

    if (existingAdmin) {
      console.log('El usuario administrador ya existe.');
      return;
    }

    // Crear el usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await Usuario.create({
      nombre: 'Administrador',
      apellido: 'Sistema',
      email: 'admin@softec.com',
      password: hashedPassword,
      tipo: 'tecnico',
      activo: true
    });

    console.log('Usuario administrador creado exitosamente.');

    // Asignar el rol de administrador al usuario
    await UsuarioRol.create({
      usuarioId: adminUser.id,
      rolId: rolAdmin.id
    });

    console.log('Rol de administrador asignado al usuario.');
    console.log('\nCredenciales de acceso:');
    console.log('---------------------');
    console.log('Email: admin@softec.com');
    console.log('Contraseña: admin123');
    console.log('\n¡Importante! Cambia la contraseña después del primer inicio de sesión.');

  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
    console.log('\nConexión a la base de datos cerrada.');
  }
}

// Ejecutar la función principal
createAdminUser();
