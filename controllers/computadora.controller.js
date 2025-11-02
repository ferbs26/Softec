const db = require('../models');
const Computadora = db.computadoras;
const Aula = db.aulas;
const Op = db.Sequelize.Op;

// Crear y guardar una nueva computadora
exports.create = async (req, res) => {
  try {
    // Validar solicitud
    if (!req.body.numero_serie || !req.body.tipo) {
      return res.status(400).send({
        message: 'Número de serie y tipo son campos requeridos!'
      });
    }

    // Verificar si el aula existe
    if (req.body.aula_id) {
      const aula = await Aula.findByPk(req.body.aula_id);
      if (!aula) {
        return res.status(404).send({
          message: `Aula con id=${req.body.aula_id} no encontrada.`
        });
      }
    }

    // Crear computadora
    const computadora = {
      numero_serie: req.body.numero_serie,
      tipo: req.body.tipo,
      marca: req.body.marca,
      modelo: req.body.modelo,
      procesador: req.body.procesador,
      ram: req.body.ram,
      almacenamiento: req.body.almacenamiento,
      estado: req.body.estado || 'disponible',
      observaciones: req.body.observaciones,
      fecha_adquisicion: req.body.fecha_adquisicion,
      aula_id: req.body.aula_id || null
    };

    // Guardar computadora en la base de datos
    const data = await Computadora.create(computadora);
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al crear la computadora.'
    });
  }
};

// Obtener todas las computadoras
exports.findAll = async (req, res) => {
  try {
    const { aula_id, estado, tipo } = req.query;
    const condition = {};

    if (aula_id) condition.aula_id = aula_id;
    if (estado) condition.estado = estado;
    if (tipo) condition.tipo = tipo;

    const data = await Computadora.findAll({
      where: condition,
      include: [
        {
          model: Aula,
          as: 'aula',
          attributes: ['id', 'nombre', 'piso']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error al recuperar las computadoras.'
    });
  }
};

// Encontrar una computadora por ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Computadora.findByPk(id, {
      include: [
        {
          model: Aula,
          as: 'aula',
          attributes: ['id', 'nombre', 'piso']
        },
        {
          model: db.reportes,
          as: 'reportes',
          include: [
            {
              model: db.usuarios,
              as: 'usuario',
              attributes: ['id', 'nombre', 'apellido', 'email']
            },
            {
              model: db.estados_reporte,
              as: 'estados',
              order: [['createdAt', 'DESC']],
              limit: 1
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró la computadora con id=${id}.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `Error al recuperar la computadora con id=${id}`
    });
  }
};

// Actualizar una computadora por ID
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const computadora = await Computadora.findByPk(id);
    
    if (!computadora) {
      return res.status(404).send({
        message: `No se encontró la computadora con id=${id}.`
      });
    }

    // Si se está cambiando el aula, verificar que exista
    if (req.body.aula_id && req.body.aula_id !== computadora.aula_id) {
      const aula = await Aula.findByPk(req.body.aula_id);
      if (!aula) {
        return res.status(404).send({
          message: `Aula con id=${req.body.aula_id} no encontrada.`
        });
      }
    }

    // Actualizar datos de la computadora
    const updatedComputer = {
      numero_serie: req.body.numero_serie || computadora.numero_serie,
      tipo: req.body.tipo || computadora.tipo,
      marca: req.body.marca !== undefined ? req.body.marca : computadora.marca,
      modelo: req.body.modelo !== undefined ? req.body.modelo : computadora.modelo,
      procesador: req.body.procesador !== undefined ? req.body.procesador : computadora.procesador,
      ram: req.body.ram !== undefined ? req.body.ram : computadora.ram,
      almacenamiento: req.body.almacenamiento !== undefined ? req.body.almacenamiento : computadora.almacenamiento,
      estado: req.body.estado || computadora.estado,
      observaciones: req.body.observaciones !== undefined ? req.body.observaciones : computadora.observaciones,
      fecha_adquisicion: req.body.fecha_adquisicion !== undefined ? req.body.fecha_adquisicion : computadora.fecha_adquisicion,
      aula_id: req.body.aula_id !== undefined ? req.body.aula_id : computadora.aula_id
    };

    // Guardar cambios
    await Computadora.update(updatedComputer, {
      where: { id: id }
    });

    res.send({
      message: 'Computadora actualizada exitosamente.'
    });
  } catch (error) {
    res.status(500).send({
      message: `Error al actualizar la computadora con id=${id}`
    });
  }
};

// Eliminar una computadora por ID
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Computadora.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
        message: 'Computadora eliminada exitosamente!'
      });
    } else {
      res.status(404).send({
        message: `No se pudo eliminar la computadora con id=${id}. Quizás no se encontró la computadora.`
      });
    }
  } catch (error) {
    res.status(500).send({
      message: `No se pudo eliminar la computadora con id=${id}`
    });
  }
};

// Obtener estadísticas de computadoras
exports.getStats = async (req, res) => {
  try {
    const total = await Computadora.count();
    const disponibles = await Computadora.count({ where: { estado: 'disponible' } });
    const enMantenimiento = await Computadora.count({ where: { estado: 'en_mantenimiento' } });
    const danadas = await Computadora.count({ where: { estado: 'dañado' } });
    const baja = await Computadora.count({ where: { estado: 'baja' } });

    const porTipo = await Computadora.findAll({
      attributes: [
        'tipo',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cantidad']
      ],
      group: ['tipo']
    });

    res.send({
      total,
      disponibles,
      enMantenimiento,
      danadas,
      baja,
      porTipo
    });
  } catch (error) {
    res.status(500).send({
      message: 'Error al obtener estadísticas de computadoras.'
    });
  }
};

// Buscar computadoras por número de serie o características
exports.search = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).send({
      message: 'El parámetro de búsqueda es requerido.'
    });
  }

  try {
    const data = await Computadora.findAll({
      where: {
        [Op.or]: [
          { numero_serie: { [Op.like]: `%${q}%` } },
          { marca: { [Op.like]: `%${q}%` } },
          { modelo: { [Op.like]: `%${q}%` } },
          { procesador: { [Op.like]: `%${q}%` } },
          { observaciones: { [Op.like]: `%${q}%` } }
        ]
      },
      include: [
        {
          model: Aula,
          as: 'aula',
          attributes: ['id', 'nombre', 'piso']
        }
      ]
    });

    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: 'Error al buscar computadoras.'
    });
  }
};
