const db = require('../models');
const Aula = db.aulas;
const Computadora = db.computadoras;
const Op = db.Sequelize.Op;

// Crear y guardar un nuevo aula
exports.create = async (req, res) => {
  try {
    // Validar solicitud
    if (!req.body.nombre || !req.body.piso) {
      return res.status(400).send({
        message: 'Nombre y piso son campos requeridos!'
      });
    }

    // Crear aula
    const aula = {
      nombre: req.body.nombre,
      piso: req.body.piso,
      capacidad: req.body.capacidad || null,
      descripcion: req.body.descripcion || null
    };

    // Guardar aula en la base de datos
    const data = await Aula.create(aula);
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al crear el aula.'
    });
  }
};

// Obtener todas las aulas
exports.findAll = async (req, res) => {
  try {
    const { piso } = req.query;
    const condition = piso ? { piso: piso } : null;

    const data = await Aula.findAll({
      where: condition,
      include: [
        {
          model: Computadora,
          as: 'computadoras',
          attributes: ['id', 'numero_serie', 'tipo', 'estado'],
          required: false
        }
      ],
      order: [
        ['piso', 'ASC'],
        ['nombre', 'ASC']
      ]
    });

    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error al recuperar las aulas.'
    });
  }
};

// Encontrar un aula por ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Aula.findByPk(id, {
      include: [
        {
          model: Computadora,
          as: 'computadoras',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: db.reportes,
              as: 'reportes',
              where: {
                estado_actual: {
                  [Op.notIn]: ['resuelto', 'cerrado']
                }
              },
              required: false,
              attributes: ['id', 'titulo', 'prioridad', 'estado_actual'],
              include: [
                {
                  model: db.estados_reporte,
                  as: 'estados',
                  order: [['createdAt', 'DESC']],
                  limit: 1,
                  attributes: ['estado', 'comentario', 'createdAt']
                }
              ]
            }
          ]
        }
      ]
    });

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró el aula con id=${id}.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Error al recuperar el aula con id=${id}`
    });
  }
};

// Actualizar un aula por ID
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Aula.update(req.body, {
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: 'Aula actualizada exitosamente.'
      });
    } else {
      res.status(404).send({
        message: `No se pudo actualizar el aula con id=${id}. Quizás no se encontró el aula o el cuerpo de la solicitud está vacío.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Error al actualizar el aula con id=${id}`
    });
  }
};

// Eliminar un aula por ID
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    // Verificar si hay computadoras asignadas a este aula
    const computadoras = await Computadora.count({
      where: { aula_id: id }
    });

    if (computadoras > 0) {
      return res.status(400).send({
        message: 'No se puede eliminar el aula porque tiene computadoras asignadas.'
      });
    }

    const num = await Aula.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: 'Aula eliminada exitosamente!'
      });
    } else {
      res.status(404).send({
        message: `No se pudo eliminar el aula con id=${id}. Quizás no se encontró el aula.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `No se pudo eliminar el aula con id=${id}`
    });
  }
};

// Obtener estadísticas de aulas
exports.getStats = async (req, res) => {
  try {
    // Contar aulas por piso
    const aulasPorPiso = await Aula.findAll({
      attributes: [
        'piso',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cantidad']
      ],
      group: ['piso'],
      order: [['piso', 'ASC']]
    });

    // Obtener total de aulas
    const totalAulas = await Aula.count();

    // Obtener aulas con más computadoras
    const aulasConMasComputadoras = await Aula.findAll({
      attributes: [
        'id', 'nombre', 'piso',
        [db.sequelize.fn('COUNT', db.sequelize.col('computadoras.id')), 'total_computadoras']
      ],
      include: [
        {
          model: Computadora,
          as: 'computadoras',
          attributes: [],
          required: false
        }
      ],
      group: ['Aula.id'],
      order: [[db.sequelize.literal('total_computadoras'), 'DESC']],
      limit: 5
    });

    res.send({
      totalAulas,
      aulasPorPiso,
      aulasConMasComputadoras
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error al obtener estadísticas de aulas.'
    });
  }
};

// Buscar aulas por nombre o descripción
exports.search = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).send({
      message: 'El parámetro de búsqueda es requerido.'
    });
  }

  try {
    const data = await Aula.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${q}%` } },
          { descripcion: { [Op.like]: `%${q}%` } },
          { piso: { [Op.like]: `%${q}%` } }
        ]
      },
      include: [
        {
          model: Computadora,
          as: 'computadoras',
          attributes: ['id', 'tipo', 'estado'],
          required: false
        }
      ]
    });

    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: 'Error al buscar aulas.'
    });
  }
};
