require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de rutas
require('./routes/auth.routes')(app);
require('./routes/usuario.routes')(app);
require('./routes/aula.routes')(app);
require('./routes/computadora.routes')(app);
require('./routes/reporte.routes')(app);
require('./routes/repuesto.routes')(app);
require('./routes/historial-cambio.routes')(app);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Bienvenido a la API de Softec',
    version: '1.0.0',
    documentacion: '/api-docs',
    rutas: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      aulas: '/api/aulas',
      computadoras: '/api/computadoras',
      reportes: '/api/reportes',
      repuestos: '/api/repuestos',
      historial: '/api/historial'
    }
  });
});

// Ruta para verificar el estado de la API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'en_linea',
    fecha: new Date().toISOString(),
    entorno: process.env.NODE_ENV || 'desarrollo'
  });
});

// Ruta para verificar la conexión a la base de datos
app.get('/api/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({
      database: 'conectado',
      status: 'saludable',
      fecha: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    res.status(500).json({
      database: 'desconectado',
      status: 'error',
      mensaje: 'Error al conectar con la base de datos',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Manejador de errores 404
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    metodo: req.method,
    ruta: req.originalUrl
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Errores de validación de Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(error => ({
      campo: error.path,
      mensaje: error.message
    }));
    
    return res.status(400).json({
      error: 'Error de validación',
      detalles: errors
    });
  }

  // Error de autenticación
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido o expirado',
      mensaje: 'Por favor, inicie sesión nuevamente'
    });
  }

  // Error de permisos
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'No tiene permisos para realizar esta acción'
    });
  }

  // Error interno del servidor
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error inesperado',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Configuración del puerto
const PORT = process.env.PORT || 3001;

// Sincronizar la base de datos y luego iniciar el servidor
const iniciarServidor = async () => {
  try {
    // Sincronizar modelos con la base de datos
    // En desarrollo, usar { force: true } para recrear las tablas (cuidado en producción)
    await db.sequelize.sync({ force: false });
    
    // Iniciar el servidor
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Documentación de la API disponible en http://localhost:${PORT}/api-docs`);
      console.log(`=== Entorno: ${process.env.NODE_ENV || 'desarrollo'} ===\n`);
    });

    // Manejo de cierre del servidor
    process.on('SIGTERM', () => {
      console.log('Recibida señal SIGTERM. Cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado exitosamente.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\nRecibida interrupción. Cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado exitosamente.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
iniciarServidor();
