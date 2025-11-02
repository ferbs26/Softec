const verifySignUp = require("../middleware/verifySignUp");
const authJwt = require("../middleware/authJwt");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Ruta para registro de usuarios (solo administradores pueden registrar nuevos usuarios)
  app.post(
    "/api/auth/signup",
    [
      authJwt.verifyToken,
      authJwt.isAdmin,
      verifySignUp.checkDuplicateEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  // Ruta para inicio de sesión
  app.post("/api/auth/signin", controller.signin);

  // Ruta para obtener el perfil del usuario actual
  app.get("/api/auth/me", 
    [authJwt.verifyToken], 
    controller.getProfile
  );

  // Ruta para verificar el token
  app.get("/api/auth/verify-token", 
    [authJwt.verifyToken],
    (req, res) => {
      res.status(200).send({ message: 'Token válido' });
    }
  );
};
