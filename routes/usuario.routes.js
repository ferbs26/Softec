const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/usuario.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Obtener todos los usuarios (solo administradores)
  app.get(
    "/api/usuarios",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.findAll
  );

  // Obtener un usuario por ID (solo administradores o el propio usuario)
  app.get(
    "/api/usuarios/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  // Crear un nuevo usuario (solo administradores)
  app.post(
    "/api/usuarios",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.create
  );

  // Actualizar un usuario (solo administradores o el propio usuario)
  app.put(
    "/api/usuarios/:id",
    [authJwt.verifyToken],
    controller.update
  );

  // Eliminar un usuario (solo administradores)
  app.delete(
    "/api/usuarios/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );

  // Eliminar todos los usuarios (solo para desarrollo, deshabilitar en producción)
  app.delete(
    "/api/usuarios",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteAll
  );

  // Buscar usuarios por tipo (alumno, docente, tecnico)
  app.get(
    "/api/usuarios/tipo/:tipo",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.findByType
  );

  // Buscar usuarios por nombre o email
  // Nota: Implementar esta funcionalidad en el controlador si es necesario
  // app.get(
  //   "/api/usuarios/buscar/:busqueda",
  //   [authJwt.verifyToken],
  //   controller.search
  // );
};
