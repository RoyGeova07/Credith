const db = require('../models')
const { Cais } = require('../models/entities/cai')
const { CaiRanges } = require('../models/entities/caiRange')

// Crear CAI con rango
const createCai = async (req, res) => {
  try {
    const { governmentId, expirationDate, range } = req.body

    if (!governmentId || governmentId.trim() === '') {
      return res.status(400).json({ message: 'El numero de CAI es requerido' })
    }

    if (!expirationDate || expirationDate.trim() === '') {
      return res.status(400).json({ message: 'La fecha de expiracion del CAI es requerida' })
    }

    if (!range) {
      return res.status(400).json({ message: 'El rango del CAI es requerido' })
    }

    const { minRange, maxRange, expirationDate: rangeExpirationDate } = range

    if (minRange === undefined || minRange === null) {
      return res.status(400).json({ message: 'El rango inicial es requerido' })
    }

    if (maxRange === undefined || maxRange === null) {
      return res.status(400).json({ message: 'El rango final es requerido' })
    }

    if (!rangeExpirationDate || rangeExpirationDate.trim() === '') {
      return res.status(400).json({ message: 'La fecha de expiracion del rango es requerida' })
    }

    if (Number(minRange) > Number(maxRange)) {
      return res.status(400).json({ message: 'El rango inicial no puede ser mayor al rango final' })
    }

    const existingCai = await Cais.findOne({ where: { governmentId } })

    if (existingCai) {
      return res.status(400).json({ message: 'Ya existe un CAI con ese numero' })
    }

    const cai = await db.sequelize.transaction(async (transaction) => {
      await Cais.update(
        { isActive: false },
        {
          where: { isActive: true },
          transaction
        }
      )

      return await Cais.create(
        {
          governmentId,
          expirationDate,
          isActive: true,
          caiRanges: [
            {
              minRange,
              maxRange,
              expirationDate: rangeExpirationDate,
              isActive: true
            }
          ]
        },
        {
          include: [
            {
              model: CaiRanges,
              as: 'caiRanges'
            }
          ],
          transaction
        }
      )
    })

    res.status(201).json({
      message: 'CAI creado correctamente',
      cai
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Listado paginado
const getCais = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const cais = await Cais.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: CaiRanges,
          as: 'caiRanges'
        }
      ]
    })

    res.json({
      total: cais.count,
      cais: cais.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Eliminar CAI
const deleteCai = async (req, res) => {
  try {
    const { id } = req.params

    const cai = await Cais.findByPk(id)

    if (!cai) {
      return res.status(404).json({ message: 'CAI no encontrado' })
    }

    await cai.destroy()

    res.json({ message: 'CAI eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createCai,
  getCais,
  deleteCai
}