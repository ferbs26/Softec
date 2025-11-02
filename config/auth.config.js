module.exports = {
  secret: process.env.JWT_SECRET || 'clave-secreta-para-desarrollo',
  jwtExpiration: 86400, // 24 horas
  jwtRefreshExpiration: 604800, // 7 días
  
  /* Configuración de roles */
  roles: {
    admin: 'admin',
    tecnico: 'tecnico',
    usuario: 'usuario'
  },
  
  /* Configuración de estados de reporte */
  estadosReporte: {
    pendiente: 'pendiente',
    en_progreso: 'en_progreso',
    resuelto: 'resuelto',
    cerrado: 'cerrado'
  },
  
  /* Configuración de prioridades de reporte */
  prioridadesReporte: {
    baja: 'baja',
    media: 'media',
    alta: 'alta',
    urgente: 'urgente'
  },
  
  /* Configuración de estados de computadora */
  estadosComputadora: {
    disponible: 'disponible',
    en_mantenimiento: 'en_mantenimiento',
    danado: 'dañado',
    baja: 'baja'
  },
  
  /* Tipos de computadora */
  tiposComputadora: {
    escritorio: 'escritorio',
    notebook: 'notebook',
    netbook: 'netbook',
    allInOne: 'all-in-one'
  },
  
  /* Configuración de paginación */
  paginacion: {
    itemsPorPagina: 10
  },
  
  /* Configuración de CORS */
  corsOptions: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    optionsSuccessStatus: 200
  }
};
