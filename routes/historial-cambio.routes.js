const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/historial-cambio.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Obtener historial de cambios con filtros
  app.get(
    "/api/historial-cambios",
    [authJwt.verifyToken],
    controller.obtenerHistorial
  );

  // Obtener estadísticas de actividad
  app.get(
    "/api/historial-cambios/estadisticas",
    [authJwt.verifyToken],
    controller.obtenerEstadisticasActividad
  );

  // Obtener historial de una entidad específica
  app.get(
    "/api/historial-cambios/:entidad/:id",
    [authJwt.verifyToken],
    controller.obtenerHistorialEntidad
  );
};
