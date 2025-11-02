const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/aula.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Crear un nuevo aula (solo administradores)
  app.post(
    "/api/aulas",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.create
  );

  // Obtener todas las aulas
  app.get(
    "/api/aulas",
    [authJwt.verifyToken],
    controller.findAll
  );

  // Obtener un aula por ID
  app.get(
    "/api/aulas/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  // Crear una nueva aula (solo administradores)
  app.post(
    "/api/aulas",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.create
  );

  // Actualizar un aula (solo administradores)
  app.put(
    "/api/aulas/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.update
  );

  // Eliminar un aula (solo administradores)
  app.delete(
    "/api/aulas/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );

  // Obtener estadísticas de aulas
  app.get(
    "/api/aulas/estadisticas",
    [authJwt.verifyToken],
    controller.getStats
  );

  // Buscar aulas por nombre o piso
  app.get(
    "/api/aulas/buscar/:busqueda",
    [authJwt.verifyToken],
    controller.search
  );

  // Nota: La ruta para obtener computadoras de un aula específica se ha eliminado
  // ya que el método getComputadoras no está implementado en el controlador.
};
