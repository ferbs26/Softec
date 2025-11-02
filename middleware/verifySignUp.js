const db = require("../models");
const Usuario = db.usuarios;

// Verificar si el correo electrónico ya está en uso
const checkDuplicateEmail = (req, res, next) => {
  // Verificar si el correo electrónico ya existe
  Usuario.findOne({
    where: {
      email: req.body.email
    }
  }).then(usuario => {
    if (usuario) {
      res.status(400).send({
        message: "Error. El correo electrónico ya está en uso."
      });
      return;
    }
    next();
  });
};

// Verificar si los roles proporcionados existen
const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    const rolesPermitidos = ['admin', 'tecnico', 'docente', 'alumno'];
    
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!rolesPermitidos.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Error. El rol ${req.body.roles[i]} no existe.`
        });
        return;
      }
    }
  }
  
  next();
};

// Verificar si el usuario está intentando registrarse con un rol no permitido
const checkRegistrationRole = (req, res, next) => {
  // Si el usuario no es administrador, no puede asignar roles
  if (req.body.roles && !req.user) {
    // Si es un registro público, eliminar cualquier rol
    delete req.body.roles;
  }
  next();
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  checkRolesExisted: checkRolesExisted,
  checkRegistrationRole: checkRegistrationRole
};

module.exports = verifySignUp;
