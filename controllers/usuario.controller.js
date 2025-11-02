const db = require('../models');
const Usuario = db.usuarios;
const Rol = db.roles;
const Op = db.Sequelize.Op;

// Crear y guardar un nuevo usuario
exports.create = async (req, res) => {
  try {
    // Validar solicitud
    if (!req.body.nombre || !req.body.email || !req.body.password) {
      return res.status(400).send({
        message: 'Nombre, email y contraseña son campos requeridos!'
      });
    }

    // Crear usuario
    const usuario = {
      nombre: req.body.nombre,
      apellido: req.body.apellido || '',
      email: req.body.email,
      password: req.body.password, // Se encriptará en el modelo
      tipo: req.body.tipo || 'alumno',
      activo: req.body.activo !== undefined ? req.body.activo : true
    };

    // Guardar usuario en la base de datos
    const data = await Usuario.create(usuario);
    
    // Asignar roles si se especifican
    if (req.body.roles) {
      const roles = await Rol.findAll({
        where: {
          nombre: {
            [Op.or]: req.body.roles
          }
        }
      });
      await data.setRoles(roles);
    } else {
      // Rol por defecto: usuario
      await data.setRoles([1]);
    }

    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al crear el usuario.'
    });
  }
};

// Obtener todos los usuarios
// (Solo para administradores)
exports.findAll = async (req, res) => {
  try {
    const data = await Usuario.findAll({
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
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error al recuperar los usuarios.'
    });
  }
};

// Encontrar un usuario por ID
// (Solo para administradores o el propio usuario)
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Usuario.findByPk(id, {
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

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró el usuario con id=${id}.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Error al recuperar el usuario con id=${id}`
    });
  }
};

// Actualizar un usuario por ID
// (Solo para administradores o el propio usuario)
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).send({
        message: `No se encontró el usuario con id=${id}.`
      });
    }

    // Actualizar datos del usuario
    const updatedUser = {
      nombre: req.body.nombre || usuario.nombre,
      apellido: req.body.apellido || usuario.apellido,
      email: req.body.email || usuario.email,
      tipo: req.body.tipo || usuario.tipo,
      activo: req.body.activo !== undefined ? req.body.activo : usuario.activo
    };

    // Si se proporciona una nueva contraseña, encriptarla
    if (req.body.password) {
      updatedUser.password = req.body.password;
    }

    // Actualizar roles si se especifican
    if (req.body.roles) {
      const roles = await Rol.findAll({
        where: {
          nombre: {
            [Op.or]: req.body.roles
          }
        }
      });
      await usuario.setRoles(roles);
    }

    // Guardar cambios
    await Usuario.update(updatedUser, {
      where: { id: id },
      individualHooks: true // Para que se ejecuten los hooks como beforeUpdate
    });

    res.send({
      message: 'Usuario actualizado exitosamente.'
    });
  } catch (error) {
    res.status(500).send({
      message: `Error al actualizar el usuario con id=${id}`
    });
  }
};

// Eliminar un usuario por ID
// (Solo para administradores)
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Usuario.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: 'Usuario eliminado exitosamente!'
      });
    } else {
      res.status(404).send({
        message: `No se pudo eliminar el usuario con id=${id}. Quizás no se encontró el usuario.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `No se pudo eliminar el usuario con id=${id}`
    });
  }
};

// Eliminar todos los usuarios
// (Solo para administradores)
exports.deleteAll = async (req, res) => {
  try {
    const nums = await Usuario.destroy({
      where: {},
      truncate: false
    });

    res.send({ message: `${nums} usuarios fueron eliminados exitosamente!` });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al eliminar todos los usuarios.'
    });
  }
};

// Buscar usuarios por tipo
exports.findByType = async (req, res) => {
  const tipo = req.params.tipo;

  try {
    const data = await Usuario.findAll({
      where: { tipo: tipo },
      attributes: { exclude: ['password'] }
    });

    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: `Error al recuperar usuarios de tipo ${tipo}`
    });
  }
};
