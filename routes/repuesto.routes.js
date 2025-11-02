const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/repuesto.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Obtener todos los repuestos con paginación y filtros
  app.get(
    "/api/repuestos",
    [authJwt.verifyToken],
    controller.obtenerRepuestos
  );

  // Obtener un repuesto por ID
  app.get(
    "/api/repuestos/:id",
    [authJwt.verifyToken],
    controller.obtenerRepuestoPorId
  );

  // Crear un nuevo repuesto (solo administradores)
  app.post(
    "/api/repuestos",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.crearRepuesto
  );

  // Actualizar un repuesto (solo administradores)
  app.put(
    "/api/repuestos/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.actualizarRepuesto
  );

  // Eliminar un repuesto (solo administradores)
  app.delete(
    "/api/repuestos/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.eliminarRepuesto
  );

  // Obtener estadísticas de inventario
  app.get(
    "/api/repuestos/estadisticas/inventario",
    [authJwt.verifyToken],
    controller.obtenerEstadisticasInventario
  );
};
