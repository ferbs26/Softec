const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const Usuario = db.usuarios;
const Rol = db.roles;
const config = require('../config/auth.config');

// Iniciar sesión
exports.signin = async (req, res) => {
  try {
    // Verificar si se proporcionaron las credenciales
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ message: 'Por favor, proporcione correo electrónico y contraseña' });
    }

    // Buscar el usuario por correo electrónico
    const usuario = await Usuario.scope(null).findOne({
      where: { email: req.body.email },
      attributes: { include: ['password'] },
      include: [{
        model: Rol,
        as: 'roles',
        through: { attributes: [] },
        attributes: ['id', 'nombre']
      }]
    });

    if (!usuario) {
      return res.status(404).send({ message: 'Usuario no encontrado.' });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      usuario.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Contraseña incorrecta!'
      });
    }

    const token = jwt.sign({ id: usuario.id }, config.secret, {
      expiresIn: 86400 // 24 horas
    });

    const roles = usuario.roles.map(rol => rol.nombre.toUpperCase());
    
    res.status(200).json({
      accessToken: token,
      id: usuario.id,
      email: usuario.email,
      roles: roles,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Registrar nuevo usuario (solo administradores)
exports.signup = async (req, res) => {
  try {
    const usuario = await Usuario.create({
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      tipo: req.body.tipo || 'alumno',
      activo: true
    });

    if (req.body.roles) {
      const roles = await Rol.findAll({
        where: {
          nombre: req.body.roles
        }
      });

      await usuario.setRoles(roles);
    } else {
      // Rol por defecto: usuario
      await usuario.setRoles([1]);
    }

    res.send({ message: 'Usuario registrado exitosamente!' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Obtener perfil del usuario actual
exports.getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Rol,
          as: 'roles',
          through: {
            attributes: []
          }
        }
      ]
    });

    if (!usuario) {
      return res.status(404).send({ message: 'Usuario no encontrado.' });
    }

    res.status(200).send(usuario);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
