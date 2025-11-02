const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/reporte.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Obtener todos los reportes
  app.get(
    "/api/reportes",
    [authJwt.verifyToken],
    controller.findAll
  );

  // Obtener un reporte por ID
  app.get(
    "/api/reportes/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  // Crear un nuevo reporte
  app.post(
    "/api/reportes",
    [authJwt.verifyToken],
    controller.create
  );

  // Actualizar un reporte
  app.put(
    "/api/reportes/:id",
    [authJwt.verifyToken],
    controller.update
  );

  // Eliminar un reporte (solo administradores)
  app.delete(
    "/api/reportes/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );

  // Obtener estadísticas de reportes
  app.get(
    "/api/reportes/estadisticas",
    [authJwt.verifyToken],
    controller.getStats
  );

  // Agregar un comentario a un reporte
  app.post(
    "/api/reportes/:id/comentarios",
    [authJwt.verifyToken],
    controller.addComment
  );

  // Asignar un técnico a un reporte (solo administradores o técnicos)
  app.post(
    "/api/reportes/:id/asignar-tecnico",
    [authJwt.verifyToken, authJwt.isTecnico],
    controller.assignTechnician
  );
};
