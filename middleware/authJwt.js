const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require('../models');
const Usuario = db.usuarios;

verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({
      message: 'No se proporcionó ningún token!'
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'No autorizado!'
      });
    }
    
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.userId, {
      include: [
        {
          model: db.roles,
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

    const isAdmin = usuario.roles.some(rol => rol.nombre === 'admin');
    
    if (isAdmin) {
      req.userRole = 'admin';
      return next();
    }

    res.status(403).send({
      message: 'Se requiere rol de administrador!'
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

isTecnico = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.userId, {
      include: [
        {
          model: db.roles,
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

    const isTecnico = usuario.roles.some(rol => rol.nombre === 'tecnico' || rol.nombre === 'admin');
    
    if (isTecnico) {
      req.userRole = usuario.roles.some(rol => rol.nombre === 'admin') ? 'admin' : 'tecnico';
      return next();
    }

    res.status(403).send({
      message: 'Se requiere rol de técnico o administrador!'
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

isUser = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.userId, {
      include: [
        {
          model: db.roles,
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

    // Verificar si el usuario tiene al menos un rol asignado
    if (usuario.roles && usuario.roles.length > 0) {
      // Asignar el rol más alto del usuario
      const roles = usuario.roles.map(rol => rol.nombre);
      
      if (roles.includes('admin')) {
        req.userRole = 'admin';
      } else if (roles.includes('tecnico')) {
        req.userRole = 'tecnico';
      } else {
        req.userRole = 'usuario';
      }
      
      return next();
    }

    // Si no tiene roles asignados, se considera usuario básico
    req.userRole = 'usuario';
    next();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isTecnico,
  isUser
};

module.exports = authJwt;
