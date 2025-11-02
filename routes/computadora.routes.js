const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/computadora.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Obtener todas las computadoras
  app.get(
    "/api/computadoras",
    [authJwt.verifyToken],
    controller.findAll
  );

  // Obtener una computadora por ID
  app.get(
    "/api/computadoras/:id",
    [authJwt.verifyToken],
    controller.findOne
  );

  // Crear una nueva computadora (solo administradores o técnicos)
  app.post(
    "/api/computadoras",
    [authJwt.verifyToken, authJwt.isTecnico],
    controller.create
  );

  // Actualizar una computadora (solo administradores o técnicos)
  app.put(
    "/api/computadoras/:id",
    [authJwt.verifyToken, authJwt.isTecnico],
    controller.update
  );

  // Eliminar una computadora (solo administradores)
  app.delete(
    "/api/computadoras/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.delete
  );

  // Obtener estadísticas de computadoras
  app.get(
    "/api/computadoras/estadisticas",
    [authJwt.verifyToken],
    controller.getStats
  );

  // Buscar computadoras por número de serie o características
  app.get(
    "/api/computadoras/buscar/:busqueda",
    [authJwt.verifyToken],
    controller.search
  );

  // Nota: Las siguientes rutas han sido comentadas porque sus métodos no están implementados en el controlador
  // Descomentar cuando se implementen los métodos correspondientes
  
  // Obtener reportes de una computadora específica
  // app.get(
  //   "/api/computadoras/:id/reportes",
  //   [authJwt.verifyToken],
  //   controller.getReportes
  // );

  // Cambiar el estado de una computadora (disponible, en_mantenimiento, dañado, baja)
  // app.put(
  //   "/api/computadoras/:id/estado",
  //   [authJwt.verifyToken, authJwt.isTecnico],
  //   controller.cambiarEstado
  // );

  // Mover una computadora a otra aula
  // app.put(
  //   "/api/computadoras/:id/mover-aula",
  //   [authJwt.verifyToken, authJwt.isTecnico],
  //   controller.moverAula
  // );
};
