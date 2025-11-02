const db = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Registrar un cambio en el historial
exports.registrarCambio = async ({
  entidad,
  entidadId,
  accion,
  detalles,
  cambios,
  usuarioId,
  ip = null,
  userAgent = null,
  transaction = null
}) => {
  try {
    return await db.historial_cambios.create({
      entidad,
      entidad_id: entidadId,
      accion,
      detalles,
      cambios: cambios ? JSON.stringify(cambios) : null,
      usuario_id: usuarioId,
      ip,
      user_agent: userAgent
    }, { transaction });
  } catch (error) {
    console.error('Error al registrar cambio en el historial:', error);
    // No lanzamos el error para no interrumpir el flujo principal
    return null;
  }
};

// Obtener el historial de cambios con paginación y filtros
exports.obtenerHistorial = async (req, res) => {
  try {
    const { 
      pagina = 1, 
      porPagina = 10, 
      entidad, 
      entidadId, 
      accion, 
      usuarioId, 
      fechaDesde, 
      fechaHasta,
      busqueda
    } = req.query;
    
    const offset = (pagina - 1) * porPagina;
    const whereClause = {};
    
    // Aplicar filtros
    if (entidad) whereClause.entidad = entidad;
    if (entidadId) whereClause.entidad_id = entidadId;
    if (accion) whereClause.accion = accion;
    if (usuarioId) whereClause.usuario_id = usuarioId;
    
    // Filtrar por rango de fechas
    if (fechaDesde || fechaHasta) {
      whereClause.createdAt = {};
      if (fechaDesde) whereClause.createdAt[Op.gte] = new Date(fechaDesde);
      if (fechaHasta) {
        const fechaHastaFinDia = new Date(fechaHasta);
        fechaHastaFinDia.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = fechaHastaFinDia;
      }
    }
    
    // Búsqueda en detalles o cambios
    if (busqueda) {
      whereClause[Op.or] = [
        { detalles: { [Op.like]: `%${busqueda}%` } },
        { '$usuario.nombre$': { [Op.like]: `%${busqueda}%` } },
        { '$usuario.email$': { [Op.like]: `%${busqueda}%` } }
      ];
    }
    
    const { count, rows: registros } = await db.historial_cambios.findAndCountAll({
      where: whereClause,
      limit: parseInt(porPagina),
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.usuarios,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email'],
          required: false
        }
      ]
    });
    
    const totalPaginas = Math.ceil(count / porPagina);
    
    // Procesar los cambios para parsear el JSON
    const registrosProcesados = registros.map(registro => {
      const registroJSON = registro.toJSON();
      if (registroJSON.cambios && typeof registroJSON.cambios === 'string') {
        try {
          registroJSON.cambios = JSON.parse(registroJSON.cambios);
        } catch (e) {
          console.error('Error al parsear cambios:', e);
          registroJSON.cambios = {};
        }
      }
      return registroJSON;
    });
    
    res.status(200).json({
      total: count,
      paginas: totalPaginas,
      paginaActual: parseInt(pagina),
      porPagina: parseInt(porPagina),
      datos: registrosProcesados
    });
  } catch (error) {
    console.error('Error al obtener el historial de cambios:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener el historial de cambios', 
      error: error.message 
    });
  }
};

// Obtener estadísticas de actividad
exports.obtenerEstadisticasActividad = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    
    const whereClause = {};
    
    // Filtrar por rango de fechas
    if (fechaDesde || fechaHasta) {
      whereClause.createdAt = {};
      if (fechaDesde) whereClause.createdAt[Op.gte] = new Date(fechaDesde);
      if (fechaHasta) {
        const fechaHastaFinDia = new Date(fechaHasta);
        fechaHastaFinDia.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = fechaHastaFinDia;
      }
    }
    
    // Actividad por entidad
    const actividadPorEntidad = await db.historial_cambios.findAll({
      attributes: [
        'entidad',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total']
      ],
      where: whereClause,
      group: ['entidad'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']]
    });
    
    // Actividad por acción
    const actividadPorAccion = await db.historial_cambios.findAll({
      attributes: [
        'accion',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total']
      ],
      where: whereClause,
      group: ['accion'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']]
    });
    
    // Actividad por usuario
    const actividadPorUsuario = await db.historial_cambios.findAll({
      attributes: [
        [db.sequelize.col('usuario.id'), 'usuarioId'],
        [db.sequelize.col('usuario.nombre'), 'usuarioNombre'],
        [db.sequelize.col('usuario.email'), 'usuarioEmail'],
        [db.sequelize.fn('COUNT', db.sequelize.col('historial_cambios.id')), 'total']
      ],
      include: [
        {
          model: db.usuarios,
          as: 'usuario',
          attributes: [],
          required: true
        }
      ],
      where: whereClause,
      group: ['usuario.id', 'usuario.nombre', 'usuario.email'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('historial_cambios.id')), 'DESC']],
      limit: 10
    });
    
    // Actividad por día
    const actividadPorDia = await db.historial_cambios.findAll({
      attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'fecha'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total']
      ],
      where: whereClause,
      group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
      order: [[db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'ASC']],
      limit: 30 // Últimos 30 días
    });
    
    res.status(200).json({
      actividadPorEntidad,
      actividadPorAccion,
      actividadPorUsuario,
      actividadPorDia
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de actividad:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener las estadísticas de actividad', 
      error: error.message 
    });
  }
};

// Obtener el historial de una entidad específica
exports.obtenerHistorialEntidad = async (req, res) => {
  try {
    const { entidad, id } = req.params;
    const { pagina = 1, porPagina = 10 } = req.query;
    const offset = (pagina - 1) * porPagina;
    
    const { count, rows: registros } = await db.historial_cambios.findAndCountAll({
      where: {
        entidad,
        entidad_id: id
      },
      limit: parseInt(porPagina),
      offset: offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.usuarios,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });
    
    const totalPaginas = Math.ceil(count / porPagina);
    
    // Procesar los cambios para parsear el JSON
    const registrosProcesados = registros.map(registro => {
      const registroJSON = registro.toJSON();
      if (registroJSON.cambios && typeof registroJSON.cambios === 'string') {
        try {
          registroJSON.cambios = JSON.parse(registroJSON.cambios);
        } catch (e) {
          console.error('Error al parsear cambios:', e);
          registroJSON.cambios = {};
        }
      }
      return registroJSON;
    });
    
    res.status(200).json({
      total: count,
      paginas: totalPaginas,
      paginaActual: parseInt(pagina),
      porPagina: parseInt(porPagina),
      datos: registrosProcesados
    });
  } catch (error) {
    console.error('Error al obtener el historial de la entidad:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener el historial de la entidad', 
      error: error.message 
    });
  }
};
