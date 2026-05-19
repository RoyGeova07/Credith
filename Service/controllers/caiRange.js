const db = require('../models')
const { CaiRanges } = require('../models/entities/caiRange')
const { Cais } = require('../models/entities/cai')

// Crear rango de CAI
const createCaiRange = async (req, res) => {
  try {
    const { minRange, maxRange, expirationDate, caiId } = req.body

    if (minRange === undefined || minRange === null) {
      return res.status(400).json({ message: 'El rango inicial es requerido' })
    }

    if (maxRange === undefined || maxRange === null) {
      return res.status(400).json({ message: 'El rango final es requerido' })
    }

    if (Number(minRange) > Number(maxRange)) {
      return res.status(400).json({ message: 'El rango inicial no puede ser mayor al rango final' })
    }

    if (!expirationDate || expirationDate.trim() === '') {
      return res.status(400).json({ message: 'La fecha de expiracion es requerida' })
    }

    if (!caiId || caiId.trim() === '') {
      return res.status(400).json({ message: 'El id del CAI es requerido' })
    }

    const cai = await Cais.findByPk(caiId)

    if (!cai) {
      return res.status(404).json({ message: 'CAI no encontrado' })
    }

    if (!cai.isActive) {
      return res.status(400).json({ message: 'El CAI debe estar activo para asociar un rango' })
    }

    const caiRange = await db.sequelize.transaction(async (transaction) => {
      await CaiRanges.update(
        { isActive: false },
        {
          where: {
            caiId,
            isActive: true
          },
          transaction
        }
      )

      return await CaiRanges.create(
        {
          minRange,
          maxRange,
          expirationDate,
          caiId,
          isActive: true
        },
        { transaction }
      )
    })

    res.status(201).json({
      message: 'Rango de CAI creado correctamente',
      caiRange
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener rangos paginados
const getCaiRanges = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const caiRanges = await CaiRanges.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Cais,
          as: 'Cai'
        }
      ]
    })

    res.json({
      total: caiRanges.count,
      caiRanges: caiRanges.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener rangos paginados por CAI
const getCaiRangesByCai = async (req, res) => {
  try {
    const { caiId } = req.params
    const limit = parseInt(req.query.limit) || 10
    const offset = parseInt(req.query.offset) || 0

    const cai = await Cais.findByPk(caiId)

    if (!cai) {
      return res.status(404).json({ message: 'CAI no encontrado' })
    }

    const caiRanges = await CaiRanges.findAndCountAll({
      where: { caiId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Cais,
          as: 'Cai'
        }
      ]
    })

    res.json({
      total: caiRanges.count,
      caiRanges: caiRanges.rows
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Obtener rango por id
const getCaiRangeById = async (req, res) => {
  try {
    const { id } = req.params

    const caiRange = await CaiRanges.findByPk(id, {
      include: [
        {
          model: Cais,
          as: 'Cai'
        }
      ]
    })

    if (!caiRange) {
      return res.status(404).json({ message: 'Rango de CAI no encontrado' })
    }

    res.json(caiRange)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Actualizar rango
const updateCaiRange = async (req, res) => {
  try {
    const { id } = req.params
    const { minRange, maxRange, expirationDate } = req.body

    const caiRange = await CaiRanges.findByPk(id)

    if (!caiRange) {
      return res.status(404).json({ message: 'Rango de CAI no encontrado' })
    }

    const dataToUpdate = {}

    if (minRange !== undefined) {
      dataToUpdate.minRange = minRange
    }

    if (maxRange !== undefined) {
      dataToUpdate.maxRange = maxRange
    }

    const newMinRange = dataToUpdate.minRange ?? caiRange.minRange
    const newMaxRange = dataToUpdate.maxRange ?? caiRange.maxRange

    if (Number(newMinRange) > Number(newMaxRange)) {
      return res.status(400).json({ message: 'El rango inicial no puede ser mayor al rango final' })
    }

    if (expirationDate !== undefined) {
      if (!expirationDate || expirationDate.trim() === '') {
        return res.status(400).json({ message: 'La fecha de expiracion no puede estar vacia' })
      }

      dataToUpdate.expirationDate = expirationDate
    }

    await caiRange.update(dataToUpdate)

    res.json({
      message: 'Rango de CAI actualizado correctamente',
      caiRange
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Eliminar rango
const deleteCaiRange = async (req, res) => {
  try {
    const { id } = req.params

    const caiRange = await CaiRanges.findByPk(id)

    if (!caiRange) {
      return res.status(404).json({ message: 'Rango de CAI no encontrado' })
    }

    await caiRange.destroy()

    res.json({ message: 'Rango de CAI eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createCaiRange,
  getCaiRanges,
  getCaiRangesByCai,
  getCaiRangeById,
  updateCaiRange,
  deleteCaiRange
}