const db = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { getClientIp } = require('@supercharge/request-ip');
const { registrarCambio } = require('./historial-cambio.controller');

// Obtener todos los repuestos con paginación y filtros
exports.obtenerRepuestos = async (req, res) => {
  try {
    const { pagina = 1, porPagina = 10, busqueda, categoria } = req.query;
    const offset = (pagina - 1) * porPagina;
    
    const whereClause = {};
    
    // Filtrar por búsqueda
    if (busqueda) {
      whereClause[Op.or] = [
        { codigo: { [Op.like]: `%${busqueda}%` } },
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { descripcion: { [Op.like]: `%${busqueda}%` } }
      ];
    }
    
    // Filtrar por categoría
    if (categoria) {
      whereClause.categoria = categoria;
    }
    
    const { count, rows: repuestos } = await db.repuestos.findAndCountAll({
      where: whereClause,
      limit: parseInt(porPagina),
      offset: offset,
      order: [['nombre', 'ASC']],
      paranoid: false // Incluir registros eliminados lógicamente
    });
    
    const totalPaginas = Math.ceil(count / porPagina);
    
    res.status(200).json({
      total: count,
      paginas: totalPaginas,
      paginaActual: parseInt(pagina),
      porPagina: parseInt(porPagina),
      datos: repuestos
    });
  } catch (error) {
    console.error('Error al obtener repuestos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los repuestos', error: error.message });
  }
};

// Obtener un repuesto por ID
exports.obtenerRepuestoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const repuesto = await db.repuestos.findByPk(id, {
      paranoid: false
    });
    
    if (!repuesto) {
      return res.status(404).json({ mensaje: 'Repuesto no encontrado' });
    }
    
    res.status(200).json(repuesto);
  } catch (error) {
    console.error('Error al obtener repuesto:', error);
    res.status(500).json({ mensaje: 'Error al obtener el repuesto', error: error.message });
  }
};

// Crear un nuevo repuesto
exports.crearRepuesto = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { codigo, nombre, descripcion, categoria, cantidad, minimo, precio } = req.body;
    
    // Verificar si ya existe un repuesto con el mismo código
    const repuestoExistente = await db.repuestos.findOne({
      where: { codigo },
      paranoid: false,
      transaction: t
    });
    
    if (repuestoExistente) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Ya existe un repuesto con este código' });
    }
    
    // Crear el repuesto
    const nuevoRepuesto = await db.repuestos.create({
      codigo,
      nombre,
      descripcion,
      categoria,
      cantidad: parseInt(cantidad) || 0,
      minimo: parseInt(minimo) || 5,
      precio: parseFloat(precio) || 0.00
    }, { transaction: t });
    
    // Registrar el cambio en el historial
    await registrarCambio({
      entidad: 'Repuesto',
      entidadId: nuevoRepuesto.id,
      accion: 'crear',
      detalles: `Se creó el repuesto ${nuevoRepuesto.nombre} (${nuevoRepuesto.codigo})`,
      cambios: nuevoRepuesto.toJSON(),
      usuarioId: req.usuario.id,
      ip: getClientIp(req),
      userAgent: req.get('user-agent'),
      transaction: t
    });
    
    await t.commit();
    res.status(201).json({
      mensaje: 'Repuesto creado correctamente',
      repuesto: nuevoRepuesto
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al crear repuesto:', error);
    res.status(500).json({ mensaje: 'Error al crear el repuesto', error: error.message });
  }
};

// Actualizar un repuesto existente
exports.actualizarRepuesto = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { codigo, nombre, descripcion, categoria, cantidad, minimo, precio } = req.body;
    
    // Obtener el repuesto existente
    const repuesto = await db.repuestos.findByPk(id, { transaction: t });
    
    if (!repuesto) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Repuesto no encontrado' });
    }
    
    // Verificar si el código ya está en uso por otro repuesto
    if (codigo && codigo !== repuesto.codigo) {
      const codigoExistente = await db.repuestos.findOne({
        where: { codigo, id: { [Op.ne]: id } },
        transaction: t
      });
      
      if (codigoExistente) {
        await t.rollback();
        return res.status(400).json({ mensaje: 'Ya existe otro repuesto con este código' });
      }
    }
    
    // Guardar el estado anterior para el historial
    const estadoAnterior = { ...repuesto.toJSON() };
    
    // Actualizar el repuesto
    await repuesto.update({
      codigo: codigo || repuesto.codigo,
      nombre: nombre || repuesto.nombre,
      descripcion: descripcion !== undefined ? descripcion : repuesto.descripcion,
      categoria: categoria || repuesto.categoria,
      cantidad: cantidad !== undefined ? parseInt(cantidad) : repuesto.cantidad,
      minimo: minimo !== undefined ? parseInt(minimo) : repuesto.minimo,
      precio: precio !== undefined ? parseFloat(precio) : repuesto.precio
    }, { transaction: t });
    
    // Obtener el estado actualizado
    await repuesto.reload({ transaction: t });
    
    // Calcular los cambios realizados
    const cambios = {};
    Object.keys(repuesto.toJSON()).forEach(key => {
      if (key !== 'updatedAt' && key !== 'createdAt' && 
          JSON.stringify(estadoAnterior[key]) !== JSON.stringify(repuesto[key])) {
        cambios[key] = {
          anterior: estadoAnterior[key],
          nuevo: repuesto[key]
        };
      }
    });
    
    // Registrar el cambio en el historial si hay cambios
    if (Object.keys(cambios).length > 0) {
      await registrarCambio({
        entidad: 'Repuesto',
        entidadId: repuesto.id,
        accion: 'actualizar',
        detalles: `Se actualizó el repuesto ${repuesto.nombre} (${repuesto.codigo})`,
        cambios,
        usuarioId: req.usuario.id,
        ip: getClientIp(req),
        userAgent: req.get('user-agent'),
        transaction: t
      });
    }
    
    await t.commit();
    res.status(200).json({
      mensaje: 'Repuesto actualizado correctamente',
      repuesto
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar repuesto:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el repuesto', error: error.message });
  }
};

// Eliminar un repuesto (borrado lógico)
exports.eliminarRepuesto = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Obtener el repuesto
    const repuesto = await db.repuestos.findByPk(id, { transaction: t });
    
    if (!repuesto) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Repuesto no encontrado' });
    }
    
    // Guardar el estado antes de eliminar
    const estadoAnterior = { ...repuesto.toJSON() };
    
    // Eliminar el repuesto (borrado lógico)
    await repuesto.destroy({ transaction: t });
    
    // Registrar el cambio en el historial
    await registrarCambio({
      entidad: 'Repuesto',
      entidadId: repuesto.id,
      accion: 'eliminar',
      detalles: `Se eliminó el repuesto ${repuesto.nombre} (${repuesto.codigo})`,
      cambios: estadoAnterior,
      usuarioId: req.usuario.id,
      ip: getClientIp(req),
      userAgent: req.get('user-agent'),
      transaction: t
    });
    
    await t.commit();
    res.status(200).json({
      mensaje: 'Repuesto eliminado correctamente',
      repuestoId: id
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar repuesto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el repuesto', error: error.message });
  }
};

// Obtener estadísticas de inventario
exports.obtenerEstadisticasInventario = async (req, res) => {
  try {
    // Contar repuestos por categoría
    const repuestosPorCategoria = await db.repuestos.findAll({
      attributes: [
        'categoria',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total'],
        [db.sequelize.fn('SUM', db.sequelize.col('cantidad')), 'cantidad_total'],
        [db.sequelize.fn('SUM', db.sequelize.literal('CASE WHEN cantidad <= minimo THEN 1 ELSE 0 END')), 'bajo_stock']
      ],
      group: ['categoria'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']]
    });
    
    // Contar repuestos por estado
    const repuestosPorEstado = await db.repuestos.findAll({
      attributes: [
        'estado',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total']
      ],
      group: ['estado']
    });
    
    // Obtener repuestos con stock bajo
    const repuestosBajoStock = await db.repuestos.findAll({
      where: {
        cantidad: {
          [Op.lte]: db.sequelize.col('minimo')
        }
      },
      order: [['cantidad', 'ASC']],
      limit: 10
    });
    
    res.status(200).json({
      repuestosPorCategoria,
      repuestosPorEstado,
      repuestosBajoStock
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de inventario:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener las estadísticas de inventario', 
      error: error.message 
    });
  }
};
