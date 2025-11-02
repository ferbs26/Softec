const db = require('../models');
const Reporte = db.reportes;
const EstadoReporte = db.estados_reporte;
const Usuario = db.usuarios;
const Computadora = db.computadoras;
const Aula = db.aulas;
const Op = db.Sequelize.Op;

// Crear y guardar un nuevo reporte
exports.create = async (req, res) => {
  try {
    // Validar solicitud
    if (!req.body.titulo || !req.body.descripcion || !req.body.computadora_id) {
      return res.status(400).send({
        message: 'Título, descripción y computadora son campos requeridos!'
      });
    }

    // Verificar si la computadora existe
    const computadora = await Computadora.findByPk(req.body.computadora_id);
    if (!computadora) {
      return res.status(404).send({
        message: `Computadora con id=${req.body.computadora_id} no encontrada.`
      });
    }

    // Crear reporte
    const reporte = {
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      prioridad: req.body.prioridad || 'media',
      estado_actual: 'pendiente',
      usuario_id: req.userId, // ID del usuario autenticado
      computadora_id: req.body.computadora_id,
      tecnico_asignado_id: req.body.tecnico_asignado_id || null
    };

    // Guardar reporte en la base de datos
    const data = await Reporte.create(reporte, {
      include: [
        {
          model: EstadoReporte,
          as: 'estados'
        }
      ]
    });

    // Crear el estado inicial del reporte
    await EstadoReporte.create({
      estado: 'pendiente',
      comentario: 'Reporte creado',
      reporte_id: data.id,
      usuario_id: req.userId
    });

    res.status(201).send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al crear el reporte.'
    });
  }
};

// Obtener todos los reportes
exports.findAll = async (req, res) => {
  try {
    const { estado, prioridad, usuario_id, computadora_id, tecnico_id } = req.query;
    const condition = {};

    if (estado) condition.estado_actual = estado;
    if (prioridad) condition.prioridad = prioridad;
    if (usuario_id) condition.usuario_id = usuario_id;
    if (computadora_id) condition.computadora_id = computadora_id;
    if (tecnico_id) condition.tecnico_asignado_id = tecnico_id;

    // Si el usuario no es administrador o técnico, solo puede ver sus propios reportes
    if (req.userRole === 'usuario') {
      condition.usuario_id = req.userId;
    }

    const data = await Reporte.findAll({
      where: condition,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'tecnico',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Computadora,
          as: 'computadora',
          include: [
            {
              model: Aula,
              as: 'aula',
              attributes: ['id', 'nombre', 'piso']
            }
          ]
        },
        {
          model: EstadoReporte,
          as: 'estados',
          order: [['createdAt', 'DESC']],
          limit: 1
        }
      ],
      order: [
        [
          db.sequelize.literal(
            "CASE " +
            "WHEN prioridad = 'urgente' THEN 1 " +
            "WHEN prioridad = 'alta' THEN 2 " +
            "WHEN prioridad = 'media' THEN 3 " +
            "ELSE 4 " +
            "END"
          ),
          'ASC'
        ],
        ['createdAt', 'DESC']
      ]
    });

    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error al recuperar los reportes.'
    });
  }
};

// Encontrar un reporte por ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Reporte.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'tecnico',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Computadora,
          as: 'computadora',
          include: [
            {
              model: Aula,
              as: 'aula',
              attributes: ['id', 'nombre', 'piso']
            }
          ]
        },
        {
          model: EstadoReporte,
          as: 'estados',
          include: [
            {
              model: Usuario,
              attributes: ['id', 'nombre', 'apellido']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (data) {
      // Verificar permisos (solo el creador, un técnico o administrador puede ver el reporte)
      if (req.userRole === 'usuario' && data.usuario_id !== req.userId) {
        return res.status(403).send({
          message: 'No tienes permiso para ver este reporte.'
        });
      }

      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró el reporte con id=${id}.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Error al recuperar el reporte con id=${id}`
    });
  }
};

// Actualizar un reporte por ID
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const reporte = await Reporte.findByPk(id);
    
    if (!reporte) {
      return res.status(404).send({
        message: `No se encontró el reporte con id=${id}.`
      });
    }

    // Verificar permisos (solo el creador, un técnico o administrador puede actualizar el reporte)
    if (req.userRole === 'usuario' && reporte.usuario_id !== req.userId) {
      return res.status(403).send({
        message: 'No tienes permiso para actualizar este reporte.'
      });
    }

    // Actualizar datos del reporte
    const updatedReport = {
      titulo: req.body.titulo || reporte.titulo,
      descripcion: req.body.descripcion || reporte.descripcion,
      prioridad: req.body.prioridad || reporte.prioridad,
      tecnico_asignado_id: req.body.tecnico_asignado_id !== undefined 
        ? req.body.tecnico_asignado_id 
        : reporte.tecnico_asignado_id
    };

    // Si se está cambiando el estado, crear un nuevo registro en estados_reporte
    if (req.body.estado_actual && req.body.estado_actual !== reporte.estado_actual) {
      await EstadoReporte.create({
        estado: req.body.estado_actual,
        comentario: req.body.comentario || `Estado cambiado a ${req.body.estado_actual}`,
        reporte_id: id,
        usuario_id: req.userId
      });

      // Actualizar el estado actual del reporte
      updatedReport.estado_actual = req.body.estado_actual;
    }

    // Guardar cambios
    await Reporte.update(updatedReport, {
      where: { id: id }
    });

    res.send({
      message: 'Reporte actualizado exitosamente.'
    });
  } catch (error) {
    res.status(500).send({
      message: `Error al actualizar el reporte con id=${id}`
    });
  }
};

// Eliminar un reporte por ID
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const reporte = await Reporte.findByPk(id);
    
    if (!reporte) {
      return res.status(404).send({
        message: `No se encontró el reporte con id=${id}.`
      });
    }

    // Solo el administrador puede eliminar reportes
    if (req.userRole !== 'administrador') {
      return res.status(403).send({
        message: 'No tienes permiso para eliminar este reporte.'
      });
    }

    // Eliminar estados del reporte primero
    await EstadoReporte.destroy({
      where: { reporte_id: id }
    });

    // Luego eliminar el reporte
    await Reporte.destroy({
      where: { id: id }
    });

    res.send({
      message: 'Reporte eliminado exitosamente!'
    });
  } catch (error) {
    res.status(500).send({
      message: `No se pudo eliminar el reporte con id=${id}`
    });
  }
};

// Obtener estadísticas de reportes
exports.getStats = async (req, res) => {
  try {
    const total = await Reporte.count();
    const pendientes = await Reporte.count({ where: { estado_actual: 'pendiente' } });
    const enProgreso = await Reporte.count({ where: { estado_actual: 'en_progreso' } });
    const resueltos = await Reporte.count({ where: { estado_actual: 'resuelto' } });
    const cerrados = await Reporte.count({ where: { estado_actual: 'cerrado' } });

    // Reportes por prioridad
    const porPrioridad = await Reporte.findAll({
      attributes: [
        'prioridad',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cantidad']
      ],
      group: ['prioridad']
    });

    // Reportes por estado
    const porEstado = await Reporte.findAll({
      attributes: [
        'estado_actual',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cantidad']
      ],
      group: ['estado_actual']
    });

    // Últimos reportes
    const ultimosReportes = await Reporte.findAll({
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre', 'apellido']
        },
        {
          model: Computadora,
          as: 'computadora',
          attributes: ['numero_serie'],
          include: [
            {
              model: Aula,
              as: 'aula',
              attributes: ['nombre']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.send({
      total,
      pendientes,
      enProgreso,
      resueltos,
      cerrados,
      porPrioridad,
      porEstado,
      ultimosReportes
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error al obtener estadísticas de reportes.'
    });
  }
};

// Agregar un comentario a un reporte
exports.addComment = async (req, res) => {
  const id = req.params.id;
  
  try {
    const reporte = await Reporte.findByPk(id);
    
    if (!reporte) {
      return res.status(404).send({
        message: `No se encontró el reporte con id=${id}.`
      });
    }

    // Verificar permisos (solo usuarios involucrados pueden comentar)
    if (req.userRole === 'usuario' && reporte.usuario_id !== req.userId) {
      return res.status(403).send({
        message: 'No tienes permiso para comentar en este reporte.'
      });
    }

    // Crear un nuevo estado con el comentario
    const estado = await EstadoReporte.create({
      estado: reporte.estado_actual,
      comentario: req.body.comentario,
      reporte_id: id,
      usuario_id: req.userId
    });

    res.status(201).send(estado);
  } catch (error) {
    res.status(500).send({
      message: `Error al agregar comentario al reporte con id=${id}`
    });
  }
};

// Asignar un técnico a un reporte
exports.assignTechnician = async (req, res) => {
  const id = req.params.id;
  const { tecnico_id } = req.body;

  try {
    // Verificar que el reporte existe
    const reporte = await Reporte.findByPk(id);
    if (!reporte) {
      return res.status(404).send({
        message: `No se encontró el reporte con id=${id}.`
      });
    }

    // Verificar que el usuario es un técnico
    const tecnico = await Usuario.findOne({
      where: {
        id: tecnico_id,
        tipo: 'tecnico'
      }
    });

    if (!tecnico) {
      return res.status(404).send({
        message: 'El ID proporcionado no corresponde a un técnico válido.'
      });
    }

    // Actualizar el reporte
    await Reporte.update(
      { tecnico_asignado_id: tecnico_id },
      { where: { id: id } }
    );

    // Crear un registro del cambio de estado
    await EstadoReporte.create({
      estado: reporte.estado_actual,
      comentario: `Técnico asignado: ${tecnico.nombre} ${tecnico.apellido}`,
      reporte_id: id,
      usuario_id: req.userId
    });

    res.send({
      message: 'Técnico asignado exitosamente al reporte.'
    });
  } catch (error) {
    res.status(500).send({
      message: `Error al asignar técnico al reporte con id=${id}`
    });
  }
};
