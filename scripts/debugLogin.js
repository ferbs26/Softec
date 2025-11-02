require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Configuración de la base de datos SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: console.log
});

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
  timestamps: true
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

// Establecer relaciones
Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'usuarioId' });
Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'rolId' });

// Función para depurar el inicio de sesión
async function debugLogin() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Verificar si el usuario existe
    console.log('\n🔍 Buscando usuario admin@softec.com...');
    const usuario = await Usuario.findOne({
      where: { email: 'admin@softec.com' },
      include: [{ model: Rol, through: { attributes: [] } }]
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado. Creando usuario administrador...');
      
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

      // Crear rol de administrador si no existe
      const [adminRole] = await Rol.findOrCreate({
        where: { nombre: 'admin' },
        defaults: {
          descripcion: 'Administrador del sistema con todos los permisos'
        }
      });

      // Asignar rol al usuario
      await adminUser.addRol(adminRole);
      console.log('✅ Usuario administrador creado correctamente.');
      
      // Volver a buscar el usuario con los roles
      const updatedUser = await Usuario.findOne({
        where: { email: 'admin@softec.com' },
        include: [{ model: Rol, through: { attributes: [] } }]
      });
      
      console.log('\n🔍 Información del usuario:');
      console.log(JSON.stringify(updatedUser.get({ plain: true }), null, 2));
    } else {
      console.log('✅ Usuario encontrado:');
      console.log(JSON.stringify(usuario.get({ plain: true }), null, 2));
      
      // Verificar la contraseña
      console.log('\n🔑 Verificando contraseña...');
      const isPasswordValid = await bcrypt.compare('admin123', usuario.password);
      console.log(`🔑 ¿La contraseña es válida? ${isPasswordValid ? '✅ Sí' : '❌ No'}`);
      
      // Generar token JWT
      console.log('\n🔑 Generando token JWT...');
      const token = jwt.sign(
        { id: usuario.id }, 
        process.env.JWT_SECRET || 'clave-secreta-para-desarrollo',
        { expiresIn: '24h' }
      );
      console.log(`🔑 Token generado: ${token}`);
      
      // Verificar el token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-para-desarrollo');
        console.log('✅ Token verificado correctamente:');
        console.log(decoded);
      } catch (error) {
        console.error('❌ Error al verificar el token:', error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error en la depuración:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada.');
  }
}

// Ejecutar la depuración
debugLogin();
